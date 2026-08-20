export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)

  const persona = String(body?.persona ?? '').trim()
  const instructions = String(body?.instructions ?? '').trim()
  const memory_enabled = body?.memory_enabled !== false

  if (!persona && !instructions) {
    throw createError({ statusCode: 400, statusMessage: 'Persona dan petunjuk menjawab tidak boleh kosong' })
  }
  if (persona.length > 8000 || instructions.length > 8000) {
    throw createError({ statusCode: 400, statusMessage: 'Teks terlalu panjang (maks 8000 karakter)' })
  }

  const supabase = useSupabaseServerAsUser(event)
  const { data: existing } = await supabase.from('ai_settings').select('id').limit(1)

  let result
  if (existing?.[0]) {
    const { data, error } = await supabase
      .from('ai_settings')
      .update({ persona, instructions, memory_enabled, updated_at: new Date().toISOString() })
      .eq('id', existing[0].id)
      .select('id, persona, instructions, memory_enabled, updated_at')
      .single()
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    result = data
  } else {
    const { data, error } = await supabase
      .from('ai_settings')
      .insert({ persona, instructions, memory_enabled })
      .select('id, persona, instructions, memory_enabled, updated_at')
      .single()
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    result = data
  }
  return result
})