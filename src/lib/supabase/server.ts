import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

import { Database } from '@/types/supabase'

export const createSupabaseServer = async () => {
  const cookieStore = await cookies()

  return createServerClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      async getAll() {
        return cookieStore.getAll()
      },
      async setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch (error) {
          // The `set` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
