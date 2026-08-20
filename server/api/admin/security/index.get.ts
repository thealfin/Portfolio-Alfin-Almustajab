export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const supabase = useSupabaseServerAsUser(event)

  // Pastikan profil admin yang sedang login tersedia (untuk FK admin_activity_logs)
  const { data: existing } = await supabase
    .from('admin_profiles')
    .select('id')
    .eq('id', admin.id)
    .maybeSingle()

  if (!existing) {
    const { error: profileInsertError } = await supabase.from('admin_profiles').insert({
      id: admin.id,
      email: admin.email ?? '',
      display_name: 'Admin',
    })
    if (profileInsertError) throw createError({ statusCode: 500, statusMessage: profileInsertError.message })
  }

  const { data: admins, error: profileError } = await supabase
    .from('admin_profiles')
    .select('*')
    .order('created_at', { ascending: true })

  if (profileError) throw createError({ statusCode: 500, statusMessage: profileError.message })

  const { data: activities, error: activityError } = await supabase
    .from('admin_activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (activityError) throw createError({ statusCode: 500, statusMessage: activityError.message })

  return { admins, activities, currentAdmin: { id: admin.id, email: admin.email ?? '' } }
})
