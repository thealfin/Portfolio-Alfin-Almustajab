export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { id } = getRouterParams(event)
  const supabase = useSupabaseServerAsUser(event)

  const { error } = await supabase.from('thoughts').delete().eq('id', id)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { success: true }
})