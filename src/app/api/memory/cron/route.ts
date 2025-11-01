// src/app/api/memory/cron/route.ts - Scheduled generation for all users (Service Role)
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatDateToYYYYMMDD } from '@/lib/utils/dateUtils'

function buildDayRangeISO(dateISO: string): { startISO: string; endISO: string } {
  const d = new Date(dateISO)
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
  return { startISO: start.toISOString(), endISO: end.toISOString() }
}

async function generateContentForUser(
  supabaseAdmin: ReturnType<typeof createAdminClient>,
  userId: string,
  dateISO: string
): Promise<string> {
  const { startISO, endISO } = buildDayRangeISO(dateISO)

  // New tasks
  const { data: createdTasks } = await supabaseAdmin
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('userId', userId)
    .gte('createdAt', startISO)
    .lt('createdAt', endISO)

  const createdCount = (createdTasks as unknown as null) === null ? 0 : (createdTasks?.length ?? 0)

  // Completed tasks
  const { data: completedTasks } = await supabaseAdmin
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('userId', userId)
    .eq('completed', true)
    .gte('updatedAt', startISO)
    .lt('updatedAt', endISO)

  const completedCount = (completedTasks as unknown as null) === null ? 0 : (completedTasks?.length ?? 0)

  // Simple focus detection by category touched
  const { data: touched } = await supabaseAdmin
    .from('tasks')
    .select('category, createdAt, updatedAt')
    .eq('userId', userId)
    .or(`createdAt.gte.${startISO},updatedAt.gte.${startISO}`)
    .lt('updatedAt', endISO)

  const categoryCount = new Map<string, number>()
  ;(touched || []).forEach((t: { category?: string | null }) => {
    const key = (t.category || '').trim() || 'Allgemein'
    categoryCount.set(key, (categoryCount.get(key) || 0) + 1)
  })
  const focusCategory = Array.from(categoryCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || '—'

  const content = [
    `## Memory für ${formatDateToYYYYMMDD(new Date(new Date(dateISO).getTime() + 24 * 60 * 60 * 1000))}`,
    '',
    `### Gestern (${formatDateToYYYYMMDD(new Date(dateISO))})`,
    `- ${createdCount} neue Tasks, ${completedCount} erledigt`,
    `- Fokus: ${focusCategory}`,
  ].join('\n')

  return content
}

function getTodayInTzYYYYMMDD(tz: string): string {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' })
  return fmt.format(new Date())
}

function getYesterdayInTzYYYYMMDD(tz: string): string {
  // Take today in tz, then subtract one day by constructing a Date from that string and minus 1 day
  const todayStr = getTodayInTzYYYYMMDD(tz) // YYYY-MM-DD
  const [y, m, d] = todayStr.split('-').map(n => parseInt(n, 10))
  const localDate = new Date(y, m - 1, d)
  localDate.setDate(localDate.getDate() - 1)
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' })
  return fmt.format(localDate)
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url)
  const querySecret = url.searchParams.get('secret')
  let bodySecret: string | undefined
  try {
    const body = await request.json()
    bodySecret = typeof body?.secret === 'string' ? body.secret : undefined
  } catch {
    bodySecret = undefined
  }

  const headerSecret = request.headers.get('x-cron-secret') || request.headers.get('X-Cron-Secret') || undefined
  // Support Vercel's Authorization header pattern: "Bearer <CRON_SECRET>"
  const authHeader = request.headers.get('authorization') || request.headers.get('Authorization') || ''
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined

  const secret = querySecret || bodySecret || headerSecret || bearerToken
  const expected = process.env.CRON_SECRET
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAdmin = createAdminClient()

  // Default: yesterday (in server local time)
  const tz = process.env.MEMORY_TZ || 'UTC'
  const dateISO = getYesterdayInTzYYYYMMDD(tz)

  let processed = 0
  let failures: Array<{ userId: string; error: string }> = []

  // Paginate users
  let page = 1
  const perPage = 1000
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage })
    if (error) {
      return NextResponse.json({ error: 'Failed to list users', details: error.message }, { status: 500 })
    }

    const users = data?.users || []
    if (users.length === 0) break

    for (const u of users) {
      try {
        const content = await generateContentForUser(supabaseAdmin, u.id, dateISO)
        const { error: upsertErr } = await supabaseAdmin
          .from('daily_memories')
          .upsert({ userId: u.id, date: dateISO, contentMd: content })
          .select()
          .single()
        if (upsertErr) throw upsertErr
        processed += 1
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Unknown error'
        failures.push({ userId: u.id, error: msg })
      }
    }

    if (!data?.nextPage) break
    page = data.nextPage
  }

  return NextResponse.json({ ok: true, date: dateISO, processed, failures })
}


