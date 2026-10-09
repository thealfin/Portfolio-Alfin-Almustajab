export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  setHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=180, stale-while-revalidate=600')

  const thought = await fetchWithCache(`thought-slug-${slug}`, 60, async () => {
    const supabase = useSupabaseServer()
    const { data, error } = await supabase
      .from('thoughts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Tulisan tidak ditemukan' })
    return data
  })

  // Jangan tambahkan views jika pengakses adalah localhost / development
  if (!isLocalhostRequest(event)) {
    const supabase = useSupabaseServer()
    supabase.rpc('increment_thought_views', { p_slug: slug }).then(() => {}).catch(() => {})
  }

  return thought
})