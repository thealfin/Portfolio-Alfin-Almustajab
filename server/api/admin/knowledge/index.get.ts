export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const supabase = useSupabaseServerAsUser(event)
  const { data, error } = await supabase
    .from('ai_knowledge_chunks')
    .select('id, source, content, created_at')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})