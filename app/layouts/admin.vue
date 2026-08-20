<script setup lang="ts">
const route = useRoute()
const { signOut } = useAuth()
const router = useRouter()

const { t } = useI18n()

const items = computed(() => [
  { label: t('admin.dashboard'), to: '/admin/dashboard', icon: 'ph:gauge-bold' },
  { label: t('admin.analyticsMenu'), to: '/admin/analytics', icon: 'ph:chart-bar-bold' },
  { label: t('admin.portfolio'), to: '/admin/projects', icon: 'ph:squares-four-bold' },
  { label: t('admin.thoughtsMenu'), to: '/admin/thoughts', icon: 'ph:notebook-bold' },
  { label: t('admin.stacksMenu'), to: '/admin/stacks', icon: 'ph:stack-bold' },
  { label: t('admin.testimonialsMenu'), to: '/admin/testimonials', icon: 'ph:star-bold' },
  { label: t('admin.chatLogs'), to: '/admin/chat-logs', icon: 'ph:chat-circle-bold' },
  { label: t('admin.messagesMenu'), to: '/admin/messages', icon: 'ph:envelope-bold' },
  { label: t('admin.knowledge'), to: '/admin/knowledge', icon: 'ph:book-open-bold' },
  { label: t('admin.securityMenu'), to: '/admin/security', icon: 'ph:shield-check-bold' },
])

const isActive = (to: string) => route.path === to

const logout = async () => {
  await signOut()
  router.push('/login')
}
</script>

<template>
  <div class="flex h-screen bg-surface-base text-on-surface">
    <aside
      class="w-16 lg:w-56 flex-shrink-0 h-full p-3 flex flex-col gap-3 max-lg:items-center"
    >
      <NuxtLink
        to="/admin/dashboard"
        class="neu-raised rounded-[18px] p-3 lg:px-4 lg:py-4 flex items-center gap-3 hover:scale-[1.01] transition-transform"
      >
        <span class="w-9 h-9 rounded-full neu-accent flex items-center justify-center overflow-hidden p-1 shrink-0">
          <img src="/logo.webp" alt="Alfin Almustajab" class="w-full h-full object-contain" />
        </span>
        <span class="hidden lg:flex flex-col">
          <span class="title-md text-on-surface leading-none">Admin Panel</span>
          <span class="label-caps text-on-surface-variant mt-1.5">Alfin Almustajab</span>
        </span>
      </NuxtLink>

      <nav class="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 p-1">
        <NuxtLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-full px-5 py-3.5 my-0.5 transition-all duration-300"
          :class="isActive(item.to) ? 'neu-pressed text-primary font-bold' : 'neu-raised text-on-surface-variant hover:text-on-surface'"
          :aria-current="isActive(item.to) ? 'page' : undefined"
        >
          <Icon :name="item.icon" class="text-lg shrink-0" />
          <span class="hidden lg:inline body-md font-bold">{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <button
        class="neu-raised rounded-full px-5 py-3.5 flex items-center gap-3 text-error hover:neu-pressed transition-all duration-300"
        @click="logout"
      >
        <Icon name="ph:sign-out-bold" class="text-lg shrink-0" />
        <span class="hidden lg:inline body-md font-bold">{{ t('admin.logout') }}</span>
      </button>
    </aside>

    <main class="flex-1 min-w-0 min-h-0 flex flex-col p-4 lg:p-5 gap-4 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>