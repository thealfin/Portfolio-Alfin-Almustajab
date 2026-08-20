export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const supabase = useSupabaseServer()

  const { data, error } = await supabase
    .from('projects')
    .select('*, project_media(*)')
    .eq('slug', slug)
    .single()

  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Project tidak ditemukan' })
  return data
})
