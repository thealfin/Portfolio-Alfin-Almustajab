import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const body = await readBody(event)

  const currentPassword = String(body?.currentPassword ?? '')
  const newPassword = String(body?.newPassword ?? '')
  const confirmPassword = String(body?.confirmPassword ?? '')

  if (!currentPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Password saat ini wajib diisi' })
  }
  if (newPassword.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Password baru minimal 8 karakter' })
  }
  if (newPassword !== confirmPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Konfirmasi kata sandi tidak cocok' })
  }
  if (newPassword === currentPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Password baru tidak boleh sama dengan password saat ini' })
  }

  const config = useRuntimeConfig()
  const email = admin.email ?? ''

  // Tahap 1: verifikasi password saat ini + dapatkan session segar
  const client = createClient(config.supabaseUrl!, config.public.supabaseKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: signIn, error: signInError } = await client.auth.signInWithPassword({ email, password: currentPassword })
  if (signInError || !signIn.session) {
    throw createError({ statusCode: 400, statusMessage: 'Password saat ini salah' })
  }

  await client.auth.setSession({
    access_token: signIn.session.access_token,
    refresh_token: signIn.session.refresh_token,
  })

  // Tahap 2 & 3: ganti password dengan session yang baru terautentikasi
  const { error: updateError } = await client.auth.updateUser({
    password: newPassword,
  })
  if (updateError) throw createError({ statusCode: 500, statusMessage: updateError.message })

  // Catat riwayat pergantian kata sandi ke admin_activity_logs
  const supabase = useSupabaseServerAsUser(event)

  const { data: existing } = await supabase
    .from('admin_profiles')
    .select('id')
    .eq('id', admin.id)
    .maybeSingle()

  if (!existing) {
    await supabase.from('admin_profiles').insert({ id: admin.id, email, display_name: 'Admin' })
  }

  const { error: logError } = await supabase.from('admin_activity_logs').insert({
    admin_id: admin.id,
    action: 'password_changed',
    detail: {
      changed_by: email,
      changed_at: new Date().toISOString(),
    },
  })
  if (logError) throw createError({ statusCode: 500, statusMessage: logError.message })

  // Auto logout: cabut session admin yang sedang aktif setelah kata sandi diubah,
  // sehingga admin wajib login ulang dengan kata sandi baru.
  const adminToken = event.context.adminToken
  if (adminToken) {
    try {
      await fetch(`${config.supabaseUrl}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          apikey: config.public.supabaseKey,
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
      })
    } catch {
      // Abaikan jika revoke gagal; sesi klien tetap dibersihkan lewat signOut di frontend.
    }
  }

  return { ok: true, message: 'Password berhasil diubah', loggedOut: true }
})
