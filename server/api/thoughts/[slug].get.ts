export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const supabase = useSupabaseServer()

  const { data, error } = await supabase
    .from('thoughts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Tulisan tidak ditemukan' })

  const { data: views, error: countError } = await supabase.rpc('increment_thought_views', { p_slug: slug })
  if (!countError && typeof views === 'number') data.views_count = views

  return data
})