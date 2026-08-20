export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { id } = getRouterParams(event)
  const body = await readBody(event)
  const supabase = useSupabaseServerAsUser(event)

  const rating = Number(body?.rating)
  const { data, error } = await supabase
    .from('testimonials')
    .update({
      author_name: String(body?.author_name ?? '').trim(),
      author_role: String(body?.author_role ?? '').trim() || null,
      author_company: String(body?.author_company ?? '').trim() || null,
      relationship_type: String(body?.relationship_type ?? 'Client').trim() || 'Client',
      quote_id: String(body?.quote_id ?? '').trim(),
      quote_en: String(body?.quote_en ?? '').trim() || null,
      rating: Number.isFinite(rating) && rating >= 1 && rating <= 5 ? rating : 5,
      avatar_url: String(body?.avatar_url ?? '').trim() || null,
      sort_order: Number(body?.sort_order ?? 0),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})