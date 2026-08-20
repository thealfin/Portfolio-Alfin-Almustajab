export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const supabase = useSupabaseServerAsUser(event)

  const { data, error } = await supabase
    .from('tech_stacks')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})