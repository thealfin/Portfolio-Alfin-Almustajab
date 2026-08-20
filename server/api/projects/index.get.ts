export default defineEventHandler(async (event) => {
  const query = getQuery(event)
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
