<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { getSecurity, changePassword } = useAdmin()
const { signOut } = useAuth()
const router = useRouter()

const { t } = useI18n()

const admins = ref<any[]>([])
const activities = ref<any[]>([])
const currentAdmin = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const fetchSecurity = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await getSecurity()
    admins.value = data?.admins ?? []
    activities.value = data?.activities ?? []
    currentAdmin.value = data?.currentAdmin ?? null
  } catch (e: any) {
    error.value = e?.response?.data?.statusMessage ?? e?.message ?? 'Gagal memuat data keamanan'
  } finally {
    loading.value = false
  }
}

onMounted(fetchSecurity)

// Modal ganti kata sandi (3 tahap)
const showPasswordModal = ref(false)
const passwordStep = ref(1)
const savingPassword = ref(false)
const passwordForm = ref({ currentPassword: '', newPassword: '', confirmPassword: '' })
const passwordError = ref<string | null>(null)
const passwordSuccess = ref<string | null>(null)

const openPasswordModal = () => {
  passwordStep.value = 1
  passwordForm.value = { currentPassword: '', newPassword: '', confirmPassword: '' }
  passwordError.value = null
  passwordSuccess.value = null
  showPasswordModal.value = true
}

const closePasswordModal = () => {
  if (savingPassword.value) return
  showPasswordModal.value = false
}

const nextStep = () => {
  passwordError.value = null
  if (passwordStep.value === 1 && !passwordForm.value.currentPassword) {
    passwordError.value = t('admin.secCurrentPasswordRequired')
    return
  }
  if (passwordStep.value === 2 && passwordForm.value.newPassword.length < 8) {
    passwordError.value = t('admin.secNewPasswordMin')
    return
  }
  if (passwordStep.value === 3) {
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
      passwordError.value = t('admin.secConfirmMismatch')
      return
    }
    submitPassword()
    return
  }
  passwordStep.value++
}

const prevStep = () => {
  if (passwordStep.value > 1) passwordStep.value--
}

const submitPassword = async () => {
  savingPassword.value = true
  passwordError.value = null
  passwordSuccess.value = null
  try {
    await changePassword(passwordForm.value)
    passwordSuccess.value = t('admin.secPasswordSuccess')
    // Auto logout setelah kata sandi diperbarui -> wajib login ulang dengan kata sandi baru.
    setTimeout(async () => {
      await signOut()
      router.push('/login')
    }, 1500)
  } catch (e: any) {
    passwordError.value = e?.response?.data?.statusMessage ?? e?.message ?? 'Gagal mengganti kata sandi'
  } finally {
    savingPassword.value = false
  }
}

const stepLabels = computed(() => [
  t('admin.secStepCurrent'),
  t('admin.secStepNew'),
  t('admin.secStepConfirm'),
])

const actionLabel = (action: string) => {
  switch (action) {
    case 'password_changed':
      return t('admin.secActionPasswordChanged')
    default:
      return action
  }
}

const actionIcon = (action: string) => {
  switch (action) {
    case 'password_changed':
      return 'ph:lock-key-bold'
    default:
      return 'ph:fingerprint-bold'
  }
}

const formatDate = (iso?: string) => formatWibDate(iso)

const formatTime = (iso?: string) => formatWibTime(iso)

const formatRelative = (iso?: string) => formatWibRelative(iso, t)
</script>

<template>
  <div class="flex flex-col gap-6 w-full">
    <div class="flex flex-col gap-2">
      <h1 class="headline-lg text-on-surface">{{ t('admin.securityTitle') }}</h1>
      <p class="body-md text-on-surface-variant max-w-2xl">{{ t('admin.securitySubtitle') }}</p>
    </div>

    <p v-if="error" class="body-md text-error">{{ error }}</p>
    <p v-if="loading" class="body-md text-on-surface-variant">{{ t('admin.loading') }}</p>

    <!-- Manajemen Admin -->
    <section class="neu-raised rounded-[18px] p-5 flex flex-col w-full min-w-0">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div class="flex items-center gap-3">
          <span class="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-primary">
            <Icon name="ph:users-three-bold" class="text-lg" />
          </span>
          <div class="flex flex-col">
            <span class="title-md text-on-surface">{{ t('admin.secAdminManagement') }}</span>
            <span class="text-[11px] text-on-surface-variant">{{ t('admin.secAdminManagementHint') }}</span>
          </div>
        </div>
        <span class="neu-pressed px-3 py-1.5 rounded-full text-[12px] font-medium text-on-surface-variant w-fit">
          {{ admins.length }} {{ t('admin.secAdmins') }}
        </span>
      </div>

      <template v-if="admins.length">
        <!-- Table Header -->
        <div class="grid grid-cols-12 gap-3 px-2 pb-4 text-on-surface-variant label-caps uppercase tracking-wider border-b border-surface-variant/60">
          <div class="col-span-3">Admin</div>
          <div class="col-span-3">Kredensial</div>
          <div class="col-span-2">Bergabung</div>
          <div class="col-span-2">Status</div>
          <div class="col-span-2 text-right">Aksi</div>
        </div>

        <!-- Data Rows -->
        <div class="flex flex-col">
          <div
            v-for="a in admins"
            :key="a.id"
            class="grid grid-cols-12 gap-3 items-center px-2 py-3.5 rounded-[16px] hover:bg-surface-container transition-colors group"
          >
            <div class="col-span-3 flex items-center gap-2.5 min-w-0">
              <span class="w-9 h-9 neu-accent rounded-full flex items-center justify-center text-on-primary font-bold text-sm shrink-0">
                {{ (a.display_name || 'Admin').slice(0, 2).toUpperCase() }}
              </span>
              <div class="flex flex-col min-w-0">
                <span class="body-md text-on-surface truncate">{{ a.display_name || 'Admin' }}</span>
                <span class="text-[11px] text-on-surface-variant truncate">{{ a.id === currentAdmin?.id ? t('admin.secCurrentAdmin') : t('admin.secAdminRole') }}</span>
              </div>
            </div>
            <div class="col-span-3 min-w-0">
              <div class="flex items-center gap-2 text-on-surface-variant min-w-0">
                <Icon name="ph:envelope-simple-bold" class="text-sm shrink-0" />
                <span class="body-md text-[13px] text-on-surface truncate">{{ a.email || '—' }}</span>
              </div>
            </div>
            <div class="col-span-2">
              <span class="body-md text-on-surface text-[13px]">{{ formatDate(a.created_at) }}</span>
            </div>
            <div class="col-span-2">
              <div class="neu-pressed px-3 py-1.5 rounded-full flex items-center gap-1.5 w-fit">
                <span class="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                <span class="body-md text-on-surface text-[12px]">{{ t('admin.secActive') }}</span>
              </div>
            </div>
            <div class="col-span-2 flex items-center justify-end gap-2">
              <button
                class="neu-raised rounded-full px-3.5 py-2 flex items-center gap-2 text-[13px] font-bold text-primary hover:neu-pressed active:scale-95 transition-all duration-300"
                :aria-label="t('admin.secChangePassword')"
                @click="openPasswordModal"
              >
                <Icon name="ph:lock-bold" class="text-base" />
                {{ t('admin.secChangePassword') }}
              </button>
            </div>
          </div>
        </div>
      </template>

      <div v-else-if="!loading" class="flex flex-col items-center justify-center gap-4 text-center py-12">
        <span class="w-12 h-12 rounded-full border-2 border-dashed border-outline-variant/50 flex items-center justify-center text-outline/50">
          <Icon name="ph:users-three-bold" class="text-2xl" />
        </span>
        <p class="body-md text-on-surface-variant">{{ t('admin.secNoAdmins') }}</p>
      </div>
    </section>

    <!-- Log Aktivitas Admin -->
    <section class="neu-raised rounded-[18px] p-5 flex flex-col w-full min-w-0">
      <div class="flex items-center gap-3 mb-4">
        <span class="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-[#8B5CF6]">
          <Icon name="ph:fingerprint-bold" class="text-lg" />
        </span>
        <div class="flex flex-col">
          <span class="title-md text-on-surface">{{ t('admin.secActivityLog') }}</span>
          <span class="text-[11px] text-on-surface-variant">{{ t('admin.secActivityLogHint') }}</span>
        </div>
      </div>

      <template v-if="activities.length">
        <div class="flex flex-col">
          <div
            v-for="act in activities"
            :key="act.id"
            class="flex items-center gap-3.5 px-2 py-3 rounded-[16px] hover:bg-surface-container transition-colors border-b border-surface-variant/40 last:border-0"
          >
            <span class="w-9 h-9 neu-raised rounded-full flex items-center justify-center text-[#8B5CF6] shrink-0">
              <Icon :name="actionIcon(act.action)" class="text-base" />
            </span>
            <div class="flex flex-col min-w-0 flex-1">
              <span class="body-md text-on-surface text-[14px]">{{ actionLabel(act.action) }}</span>
              <span class="text-[11px] text-on-surface-variant truncate">
                {{ act.detail?.changed_by ?? t('admin.secSystem') }} · {{ act.admin_id === currentAdmin?.id ? t('admin.secCurrentAdmin') : t('admin.secAdminRole') }}
              </span>
            </div>
            <div class="flex flex-col items-end shrink-0">
              <span class="body-md text-on-surface text-[13px]">{{ formatDate(act.created_at) }}</span>
              <span class="text-[11px] text-on-surface-variant">{{ formatTime(act.created_at) }} · {{ formatRelative(act.created_at) }}</span>
            </div>
          </div>
        </div>
      </template>

      <div v-else-if="!loading" class="flex flex-col items-center justify-center gap-4 text-center py-12">
        <span class="w-12 h-12 rounded-full border-2 border-dashed border-outline-variant/50 flex items-center justify-center text-outline/50">
          <Icon name="ph:fingerprint-bold" class="text-2xl" />
        </span>
        <p class="body-md text-on-surface-variant">{{ t('admin.secNoActivities') }}</p>
      </div>
    </section>

    <!-- Modal Ganti Kata Sandi (3 Tahap) -->
    <div
      v-if="showPasswordModal"
      class="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="closePasswordModal"
    >
      <div class="w-full max-w-md neu-raised bg-surface rounded-[24px] p-6 flex flex-col gap-5 shadow-2xl">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-full neu-raised flex items-center justify-center text-primary">
              <Icon name="ph:lock-bold" class="text-lg" />
            </span>
            <div class="flex flex-col">
              <h3 class="title-md text-on-surface">{{ t('admin.secChangePassword') }}</h3>
              <span class="text-[11px] text-on-surface-variant">{{ t('admin.secChangePasswordHint') }}</span>
            </div>
          </div>
          <button
            class="w-10 h-10 neu-raised rounded-full flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
            :aria-label="t('admin.cancel')"
            @click="closePasswordModal"
          >
            <Icon name="ph:x-bold" class="text-lg" />
          </button>
        </div>

        <!-- Step indicator -->
        <div class="flex items-center gap-2">
          <template v-for="(label, i) in stepLabels" :key="i">
            <div class="flex items-center gap-2 flex-1">
              <div class="flex flex-col items-center gap-1.5 flex-1">
                <span
                  class="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold transition-all duration-300"
                  :class="passwordStep > i + 1 ? 'bg-primary text-on-primary' : passwordStep === i + 1 ? 'neu-pressed text-primary' : 'neu-raised text-on-surface-variant'"
                >
                  <Icon v-if="passwordStep > i + 1" name="ph:check-bold" class="text-sm" />
                  <span v-else>{{ i + 1 }}</span>
                </span>
                <span class="text-[10px] text-on-surface-variant text-center leading-tight">{{ label }}</span>
              </div>
              <div v-if="i < stepLabels.length - 1" class="h-px flex-1 bg-surface-variant mb-5" :class="passwordStep > i + 1 ? 'bg-primary' : ''" />
            </div>
          </template>
        </div>

        <p v-if="passwordSuccess" class="body-md text-[#10B981] flex items-center gap-2">
          <Icon name="ph:check-circle-bold" class="text-lg" />
          {{ passwordSuccess }}
        </p>
        <p v-if="passwordSuccess" class="text-[12px] text-on-surface-variant flex items-center gap-1.5">
          <Icon name="ph:sign-out-bold" class="text-base" />
          {{ t('admin.secLogoutHint') }}
        </p>

        <div class="flex flex-col gap-4">
          <!-- Tahap 1: Password saat ini -->
          <template v-if="passwordStep === 1">
            <div class="flex flex-col gap-2">
              <label class="label-caps text-on-surface-variant uppercase tracking-wider">{{ t('admin.secCurrentPassword') }}</label>
              <div class="relative w-full neu-pressed rounded-[16px] flex items-center px-5 transition-shadow focus-within:ring-1 focus-within:ring-primary/30">
                <Icon name="ph:lock-key-bold" class="text-on-surface-variant text-lg mr-3" />
                <input
                  v-model="passwordForm.currentPassword"
                  type="password"
                  autocomplete="current-password"
                  class="w-full bg-transparent py-3.5 body-md text-on-surface outline-none placeholder:text-on-surface-variant/50"
                  :placeholder="t('admin.secCurrentPasswordPlaceholder')"
                  @keyup.enter="nextStep"
                />
              </div>
            </div>
          </template>

          <!-- Tahap 2: Password baru -->
          <template v-else-if="passwordStep === 2">
            <div class="flex flex-col gap-2">
              <label class="label-caps text-on-surface-variant uppercase tracking-wider">{{ t('admin.secNewPassword') }}</label>
              <div class="relative w-full neu-pressed rounded-[16px] flex items-center px-5 transition-shadow focus-within:ring-1 focus-within:ring-primary/30">
                <Icon name="ph:password-bold" class="text-on-surface-variant text-lg mr-3" />
                <input
                  v-model="passwordForm.newPassword"
                  type="password"
                  autocomplete="new-password"
                  class="w-full bg-transparent py-3.5 body-md text-on-surface outline-none placeholder:text-on-surface-variant/50"
                  :placeholder="t('admin.secNewPasswordPlaceholder')"
                  @keyup.enter="nextStep"
                />
              </div>
              <p class="text-[11px] text-on-surface-variant flex items-center gap-1.5">
                <Icon name="ph:info-bold" class="text-sm" />
                {{ t('admin.secNewPasswordHint') }}
              </p>
            </div>
          </template>

          <!-- Tahap 3: Konfirmasi kata sandi baru -->
          <template v-else>
            <div class="flex flex-col gap-2">
              <label class="label-caps text-on-surface-variant uppercase tracking-wider">{{ t('admin.secConfirmPassword') }}</label>
              <div class="relative w-full neu-pressed rounded-[16px] flex items-center px-5 transition-shadow focus-within:ring-1 focus-within:ring-primary/30">
                <Icon name="ph:shield-check-bold" class="text-on-surface-variant text-lg mr-3" />
                <input
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  autocomplete="new-password"
                  class="w-full bg-transparent py-3.5 body-md text-on-surface outline-none placeholder:text-on-surface-variant/50"
                  :placeholder="t('admin.secConfirmPasswordPlaceholder')"
                  @keyup.enter="nextStep"
                />
              </div>
            </div>
          </template>

          <p v-if="passwordError" class="body-md text-error flex items-center gap-2">
            <Icon name="ph:warning-circle-bold" class="text-lg" />
            {{ passwordError }}
          </p>
        </div>

        <div class="flex justify-between items-center gap-4 mt-1">
          <button
            v-if="passwordStep > 1"
            class="body-md text-on-surface-variant hover:text-on-surface transition-colors px-4 py-2 flex items-center gap-2"
            :disabled="savingPassword"
            @click="prevStep"
          >
            <Icon name="ph:arrow-left-bold" class="text-base" />
            {{ t('admin.secBack') }}
          </button>
          <button
            v-else
            class="body-md text-on-surface-variant hover:text-on-surface transition-colors px-4 py-2"
            @click="closePasswordModal"
          >
            {{ t('admin.cancel') }}
          </button>
          <button
            class="body-md font-bold px-6 py-2.5 rounded-full bg-primary text-on-primary shadow-lg hover:scale-95 active:scale-95 transition-all flex items-center gap-2"
            :disabled="savingPassword"
            @click="nextStep"
          >
            <Icon v-if="savingPassword" name="ph:circle-notch-bold" class="text-lg animate-spin" />
            <Icon v-else :name="passwordStep === 3 ? 'ph:lock-key-bold' : 'ph:arrow-right-bold'" class="text-lg" />
            {{ passwordStep === 3 ? t('admin.secSavePassword') : t('admin.secNext') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>