export default defineEventHandler(async () => {
  const supabase = useSupabaseServer()
  const { data, error } = await supabase.from('certifications').select('*').order('sort_order')
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
