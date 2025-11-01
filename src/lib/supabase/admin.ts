// src/lib/supabase/admin.ts - Service Role Supabase client (server-only)
import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js'

export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase admin env vars')
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false },
    global: { headers: { 'X-Client-Info': 'daily-memory-cron' } },
  })
}


