export default defineEventHandler(async (event) => {
  let body: any
  try {
    body = await readBody(event)
    if (typeof body === 'string') {
      body = JSON.parse(body)
    }
  } catch {
    body = {}
  }

  const supabase = useSupabaseServer()

  const sessionId = String(body?.session_id ?? '').slice(0, 100).trim()
  if (!sessionId) {
    return { success: false, message: 'session_id wajib diisi' }
  }

  const duration = Math.max(0, Math.min(60 * 60 * 24 * 7, Math.round(Number(body?.duration) || 0)))
  const lastActive = body?.last_active_at && !Number.isNaN(Date.parse(body.last_active_at))
    ? new Date(body.last_active_at).toISOString()
    : new Date().toISOString()

  const { error } = await supabase
    .from('visitor_analytics')
    .update({
      duration_seconds: duration,
      last_active_at: lastActive,
    })
    .eq('session_id', sessionId)

  if (error) {
    console.error('[analytics/heartbeat] Supabase update error:', error.message)
    return { success: false, error: error.message }
  }

  return { success: true }
})