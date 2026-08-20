export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { id } = getRouterParams(event)
  const body = await readBody(event)
  const supabase = useSupabaseServerAsUser(event)

  const { data, error } = await supabase
    .from('thoughts')
    .update({
      slug: String(body?.slug ?? '').trim(),
      title_id: String(body?.title_id ?? '').trim(),
      title_en: body?.title_en ?? null,
      content_id: String(body?.content_id ?? '').trim(),
      content_en: body?.content_en ?? null,
      category: Array.isArray(body?.category) ? body.category.map((c: any) => String(c).trim()).filter(Boolean) : [],
      cover_image_url: body?.cover_image_url ?? null,
      image_alt_text: body?.image_alt_text ?? null,
      is_published: body?.is_published ?? true,
      read_time_minutes: Number(body?.read_time_minutes ?? 1),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})