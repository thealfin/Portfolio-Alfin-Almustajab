export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const supabase = useSupabaseServerAsUser(event)
  const { data, error } = await supabase
    .from('contact_messages')
    .update({ is_read: Boolean(body?.is_read) })
    .eq('id', id)
    .select('id, is_read')
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})