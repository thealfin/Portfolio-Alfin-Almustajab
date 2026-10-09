export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  setHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')

  const cacheKey = `projects-list-${query.featured ?? 'all'}-${query.category ?? 'all'}`
  return fetchWithCache(cacheKey, 60, async () => {
    const supabase = useSupabaseServer()
    let builder = supabase
      .from('projects')
      .select('id, slug, title, client, status, category, summary_id, summary_en, tech_stack, cover_image_url, year, is_featured, sort_order')
      .order('sort_order')

    if (query.featured === 'true') builder = builder.eq('is_featured', true)
    if (query.category) builder = builder.contains('category', [String(query.category)])

    const { data, error } = await builder
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return data
  })
})
