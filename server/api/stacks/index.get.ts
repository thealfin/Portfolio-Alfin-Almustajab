export default defineEventHandler(async () => {
  const supabase = useSupabaseServer()

  const { data, error } = await supabase
    .from('tech_stacks')
    .select('id, name, icon_url, gemini')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})