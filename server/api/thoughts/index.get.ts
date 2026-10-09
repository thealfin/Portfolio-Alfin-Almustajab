export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  setHeader(event, 'Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600')

  const cacheKey = `thoughts-list-${query.category ?? 'all'}`
  return fetchWithCache(cacheKey, 60, async () => {
    const supabase = useSupabaseServer()
    let builder = supabase
      .from('thoughts')
      .select('id, slug, title_id, title_en, category, cover_image_url, image_alt_text, read_time_minutes, views_count, created_at, updated_at')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (query.category) builder = builder.contains('category', [String(query.category)])

    const { data, error } = await builder
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return data
  })
})