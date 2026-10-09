export default defineEventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  setHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')

  return fetchWithCache(`project-slug-${slug}`, 60, async () => {
    const supabase = useSupabaseServer()
    const { data, error } = await supabase
      .from('projects')
      .select('*, project_media(*)')
      .eq('slug', slug)
      .single()

    if (error || !data) throw createError({ statusCode: 404, statusMessage: 'Project tidak ditemukan' })
    return data
  })
})
