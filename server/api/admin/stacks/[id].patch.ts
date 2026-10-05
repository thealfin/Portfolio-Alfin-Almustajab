export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { id } = getRouterParams(event)
  const body = await readBody(event)
  const supabase = useSupabaseServerAsUser(event)

  const { data, error } = await supabase
    .from('tech_stacks')
    .update({
      name: String(body?.name ?? '').trim(),
      icon_url: String(body?.icon_url ?? '').trim() || null,
      gemini: Boolean(body?.gemini),
      sort_order: Number(body?.sort_order ?? 0),
      is_active: body?.is_active ?? true,
      category: String(body?.category ?? 'frontend').trim(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})