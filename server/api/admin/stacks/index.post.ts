export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const supabase = useSupabaseServerAsUser(event)

  const { data, error } = await supabase
    .from('tech_stacks')
    .insert({
      name: String(body?.name ?? '').trim(),
      icon_url: String(body?.icon_url ?? '').trim() || null,
      gemini: Boolean(body?.gemini),
      sort_order: Number(body?.sort_order ?? 0),
      is_active: body?.is_active ?? true,
      category: String(body?.category ?? 'frontend').trim(),
    })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})