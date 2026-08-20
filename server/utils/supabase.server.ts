import { createClient } from '@supabase/supabase-js'

export function useSupabaseServer() {
  const config = useRuntimeConfig()
  const key = config.supabaseServiceRoleKey || config.public.supabaseKey
  return createClient(config.supabaseUrl!, key!, {
    auth: { persistSession: false },
  })
}

// Klien dengan identitas admin (JWT) sehingga RLS melihat role `authenticated`.
export function useSupabaseServerAsUser(event: any) {
  const config = useRuntimeConfig()
  const token = event.context.adminToken
  return createClient(config.supabaseUrl!, config.public.supabaseKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
}