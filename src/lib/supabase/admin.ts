import { createClient } from '@supabase/supabase-js'

import { Database } from '@/types/supabase'

// import { Database } from '@/types/supabase'

export const createSupabaseServerAdmin = () => {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
