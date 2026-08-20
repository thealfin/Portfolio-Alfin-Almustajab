export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const { project_media = [], ...projectData } = body
  const supabase = useSupabaseServerAsUser(event)

  const { data, error } = await supabase
    .from('projects')
    .insert({ ...projectData })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  if (Array.isArray(project_media) && project_media.length) {
    const rows = project_media.map((m: any) => ({
      project_id: data.id,
      image_url: String(m?.image_url ?? '').trim(),
      caption: m?.caption ?? null,
      sort_order: Number(m?.sort_order ?? 0),
    })).filter((r: any) => r.image_url)
    if (rows.length) {
      const { error: mediaError } = await supabase.from('project_media').insert(rows)
      if (mediaError) throw createError({ statusCode: 500, statusMessage: mediaError.message })
    }
  }

  return data
})