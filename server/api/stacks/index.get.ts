export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=1200')

  return fetchWithCache('stacks-list-active', 300, async () => {
    const supabase = useSupabaseServer()
    const { data, error } = await supabase
      .from('tech_stacks')
      .select('id, name, icon_url, gemini, category, sort_order')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return data
  })
})