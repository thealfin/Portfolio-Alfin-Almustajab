export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')

  const supabase = useSupabaseServerAsUser(event)
  const { data, error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', id)
    .select('id')
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})