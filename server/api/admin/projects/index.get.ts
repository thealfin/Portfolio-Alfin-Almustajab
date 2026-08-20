export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const supabase = useSupabaseServerAsUser(event)
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_media(*)')
    .order('sort_order')
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
