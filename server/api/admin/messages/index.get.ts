export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const supabase = useSupabaseServerAsUser(event)
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})