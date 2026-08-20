export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const supabase = useSupabaseServerAsUser(event)
  const { data, error } = await supabase
    .from('ai_settings')
    .select('id, persona, instructions, memory_enabled, updated_at')
    .limit(1)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data?.[0] ?? null
})