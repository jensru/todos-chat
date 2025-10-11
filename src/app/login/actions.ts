'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // IMPORTANT: Verify session is actually established before returning success
  // This ensures cookies are properly set
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { error: 'Session could not be established. Please try again.' }
  }

  // Revalidate to refresh server components with new session
  revalidatePath('/', 'layout')

  // Return success - let client handle redirect to ensure cookies are set
  return { success: true }
}

export async function signUpAction(formData: FormData): Promise<{ error?: string; success?: boolean; message?: string }> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    }
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: 'Check your email for the confirmation link!' }
}
