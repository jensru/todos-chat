// src/app/api/chat-messages/route.ts - List/Create daily chat messages
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date') || ''
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, role, content, createdAt')
    .eq('userId', user.id)
    .eq('date', date)
    .order('createdAt', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ messages: data || [] })
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const date = typeof body?.dateISO === 'string' ? body.dateISO : ''
  const role = body?.role
  const content = body?.content

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  }
  if (role !== 'user' && role !== 'bot') {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }
  if (typeof content !== 'string' || content.trim() === '') {
    return NextResponse.json({ error: 'Invalid content' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({ userId: user.id, date, role, content, createdAt: now })
    .select('id, role, content, createdAt')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ message: data })
}


