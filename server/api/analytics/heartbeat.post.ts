export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const supabase = useSupabaseServer()

  const sessionId = String(body?.session_id ?? '').slice(0, 100)
  if (!sessionId) throw createError({ statusCode: 400, statusMessage: 'session_id wajib diisi' })

  const duration = Math.max(0, Math.min(60 * 60 * 24 * 7, Math.round(Number(body?.duration) || 0)))

  const { error } = await supabase
    .from('visitor_analytics')
    .update({ duration_seconds: duration, last_active_at: new Date().toISOString() })
    .eq('session_id', sessionId)

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { success: true }
})