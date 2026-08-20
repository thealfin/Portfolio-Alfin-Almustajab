export default defineEventHandler(async () => {
  const supabase = useSupabaseServer()
  const { data, error } = await supabase.from('profile').select('*').limit(1).single()
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})
