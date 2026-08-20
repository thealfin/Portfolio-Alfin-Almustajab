export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').trim()
  const message = String(body.message ?? '').trim()

  if (!name || !email || !message) {
    throw createError({ statusCode: 400, statusMessage: 'Semua kolom wajib diisi' })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Email tidak valid' })
  }

  const supabase = useSupabaseServer()
  const { error } = await supabase.from('contact_messages').insert({ name, email, message })
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  return { success: true }
})
