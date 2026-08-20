export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const sessionId = getRouterParam(event, 'sessionId')
  const body = await readBody(event)

  const archived = Boolean(body?.archived)

  const supabase = useSupabaseServerAsUser(event)
  const { data, error } = await supabase
    .from('ai_chat_logs')
    .update({ is_archived: archived })
    .eq('session_id', sessionId)
    .select('id, session_id, is_archived')

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { ok: true, sessionId, archived, count: data?.length ?? 0 }
})
