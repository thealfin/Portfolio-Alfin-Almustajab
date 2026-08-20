const SESSION_LIMIT = 7

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const supabase = useSupabaseServerAsUser(event)

  const fetchLogs = () =>
    supabase.from('ai_chat_logs').select('*').order('created_at', { ascending: false }).limit(100)

  const { data: logs, error } = await fetchLogs()
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  // Arsip otomatis: sesi yang sudah melewati batas 7 percakapan ditandai arsip.
  const counts = new Map<string, number>()
  for (const log of logs ?? []) {
    counts.set(log.session_id, (counts.get(log.session_id) ?? 0) + 1)
  }
  const expiredSessions = [...counts.entries()]
    .filter(([, n]) => n >= SESSION_LIMIT)
    .map(([sid]) => sid)

  for (const sid of expiredSessions) {
    const { error: updateError } = await supabase
      .from('ai_chat_logs')
      .update({ is_archived: true })
      .eq('session_id', sid)
    if (updateError) throw createError({ statusCode: 500, statusMessage: updateError.message })
  }

  if (expiredSessions.length) {
    const { data: updated, error: refreshError } = await fetchLogs()
    if (refreshError) throw createError({ statusCode: 500, statusMessage: refreshError.message })
    return updated
  }

  return logs
})
