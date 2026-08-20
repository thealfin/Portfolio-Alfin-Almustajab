<script setup lang="ts">
definePageMeta({ layout: false })

const { $supabase } = useNuxtApp()
const { session, refreshSession, signIn } = useAuth()
const router = useRouter()

const { t } = useI18n()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const remember = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  await refreshSession()
  if (session.value) router.replace('/admin/dashboard')
  const saved = localStorage.getItem('aa-remember-email')
  if (saved) {
    email.value = saved
    remember.value = true
  }
})

const submit = async () => {
  loading.value = true
  error.value = null
  try {
    if (remember.value) localStorage.setItem('aa-remember-email', email.value)
    else localStorage.removeItem('aa-remember-email')
    await signIn(email.value, password.value)
    router.push('/admin/dashboard')
  } catch (e: any) {
    error.value = e?.message ?? 'Login gagal'
  } finally {
    loading.value = false
  }
}

const forgotPassword = async () => {
  error.value = null
  if (!email.value) {
    error.value = t('admin.forgotPasswordEmailHint')
    return
  }
  loading.value = true
  try {
    const { error: err } = await $supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: window.location.origin + '/login',
    })
    if (err) throw err
    error.value = t('admin.forgotPasswordSent')
  } catch (e: any) {
    error.value = e?.message ?? 'Gagal mengirim reset password'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center p-6">
    <div class="w-full max-w-[480px] bg-surface-card rounded-[24px] p-[48px] neu-raised flex flex-col gap-6">
      <div class="flex flex-col items-center gap-6">
        <span
          class="w-16 h-16 rounded-full bg-surface-card neu-raised flex items-center justify-center overflow-hidden p-2"
        >
          <img src="/logo.webp" alt="Alfin Almustajab" class="w-full h-full object-contain" />
        </span>
        <div class="text-center flex flex-col gap-2">
          <h1 class="headline-lg text-on-surface">Admin Login</h1>
          <p class="body-md text-on-surface-variant">{{ t('admin.loginHint') }}</p>
        </div>
      </div>

      <form class="flex flex-col gap-6" @submit.prevent="submit">
        <div class="flex flex-col gap-3">
          <label class="label-caps text-on-surface-variant" for="email">{{ t('admin.email') }}</label>
          <div class="relative w-full h-14 rounded-full neu-pressed overflow-hidden transition-shadow focus-within:ring-1 focus-within:ring-primary/30">
            <input
              id="email"
              v-model="email"
              type="email"
              required
              autocomplete="email"
              placeholder="masukan email"
              class="w-full h-full bg-transparent px-6 py-4 body-md text-on-surface placeholder:text-outline outline-none"
            />
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <label class="label-caps text-on-surface-variant" for="password">{{ t('admin.password') }}</label>
          <div class="relative w-full h-14 rounded-full neu-pressed overflow-hidden transition-shadow focus-within:ring-1 focus-within:ring-primary/30">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full h-full bg-transparent pl-6 pr-14 py-4 body-md text-on-surface placeholder:text-outline outline-none"
            />
            <button
              type="button"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors flex items-center justify-center p-1"
              :aria-label="showPassword ? 'Sembunyikan password' : 'Tampilkan password'"
              @click="showPassword = !showPassword"
            >
              <Icon :name="showPassword ? 'ph:eye-slash-bold' : 'ph:eye-bold'" class="text-xl" />
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between mt-2">
          <label class="flex items-center gap-3 cursor-pointer group">
            <div class="relative w-6 h-6 rounded-md neu-pressed flex items-center justify-center overflow-hidden">
              <input v-model="remember" type="checkbox" class="absolute inset-0 opacity-0 cursor-pointer peer" />
              <div class="absolute inset-0 bg-primary opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                <Icon name="ph:check-bold" class="text-sm text-on-primary" />
              </div>
            </div>
            <span class="body-md text-on-surface-variant group-hover:text-on-surface transition-colors">{{ t('admin.rememberMe') }}</span>
          </label>
          <button type="button" class="body-md text-primary hover:text-primary-strong transition-colors" @click="forgotPassword">
            {{ t('admin.forgotPassword') }}
          </button>
        </div>

        <p v-if="error" class="body-md text-error">{{ error }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full h-14 mt-4 rounded-full bg-primary text-on-primary body-md font-bold hover:bg-primary-strong active:scale-[0.98] transition-all shadow-[-10px_-10px_20px_rgba(255,255,255,0.8),10px_10px_20px_rgba(191,201,212,0.8)] active:shadow-[inset_-5px_-5px_10px_rgba(255,255,255,0.2),inset_5px_5px_10px_rgba(0,0,0,0.2)] disabled:opacity-70"
        >
          {{ loading ? '...' : t('admin.login') }}
        </button>
      </form>
    </div>
  </div>
</template>