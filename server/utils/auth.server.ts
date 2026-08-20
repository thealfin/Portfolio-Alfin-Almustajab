import { createClient } from '@supabase/supabase-js'

export async function requireAdmin(event: any) {
  const config = useRuntimeConfig()
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const token = authHeader.replace('Bearer ', '')
  const supabase = createClient(config.supabaseUrl!, config.public.supabaseKey!)
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  event.context.adminToken = token
  event.context.adminUser = data.user
  return data.user
}
