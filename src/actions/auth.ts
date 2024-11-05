'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { createSupabaseServerAdmin } from '@/lib/supabase/admin'
import { createSupabaseServer } from '@/lib/supabase/server'
import { encodedRedirect } from '@/lib/utils'

export const signUpAction = async (formData: FormData) => {
  const email = formData.get('email')?.toString()
  const password = formData.get('password')?.toString()
  const supabase = await createSupabaseServer()
  const head = await headers()
  const origin = head.get('origin')

  if (!email || !password) {
    return encodedRedirect('error', '/signup', 'Email and password are required')
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error(error.code + ' ' + error.message)
    return encodedRedirect('error', '/signup', error.message)
  } else {
    return encodedRedirect('success', '/signup', 'Thanks for signing up! Please check your email for a verification link.')
  }
}

export const signInAction = async (formData: FormData) => {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createSupabaseServer()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return encodedRedirect('error', '/login', error.message)
  }

  return redirect('/protected')
}

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get('email')?.toString()
  const supabase = await createSupabaseServer()
  const head = await headers()
  const origin = head.get('origin')
  const callbackUrl = formData.get('callbackUrl')?.toString()

  if (!email) {
    return encodedRedirect('error', '/forgot-password', 'Email is required')
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  })

  if (error) {
    console.error(error.message)
    return encodedRedirect('error', '/forgot-password', 'Could not reset password')
  }

  if (callbackUrl) {
    return redirect(callbackUrl)
  }

  return encodedRedirect('success', '/forgot-password', 'Check your email for a link to reset your password.')
}

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createSupabaseServer()

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    encodedRedirect('error', '/protected/reset-password', 'Password and confirm password are required')
  }

  if (password !== confirmPassword) {
    encodedRedirect('error', '/protected/reset-password', 'Passwords do not match')
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    encodedRedirect('error', '/protected/reset-password', 'Password update failed')
  }

  encodedRedirect('success', '/protected/reset-password', 'Password updated')
}

export const signOutAction = async ({ redirectTo }: { redirectTo?: string }) => {
  const supabase = await createSupabaseServer()
  await supabase.auth.signOut()
  redirect(redirectTo || '/login')
}

export const localHostAccess = async () => {
  const supabase = await createSupabaseServer()

  const { error } = await supabase.auth.signInWithPassword({
    email: 'dev@localhost.com',
    password: '12345678',
  })

  if (error) {
    const supabaseAdmin = createSupabaseServerAdmin()
    const { data: d2, error: e2 } = await supabaseAdmin.auth.admin.createUser({
      email: 'dev@localhost.com',
      password: '12345678',
      user_metadata: {
        full_name: 'Localhost Admin',
      },
      email_confirm: true,
    })
    console.log('1) localhost access:', { data: d2, error: e2 })

    const { error } = await supabase.auth.signInWithPassword({
      email: 'dev@localhost.com',
      password: '12345678',
    })

    console.log('2) localhost access:', { error })
    console.log('🔴 Restart the database if login does not work')
  }
  redirect('/')
}
