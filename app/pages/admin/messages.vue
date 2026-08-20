<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { listMessages, updateMessage, deleteMessage } = useAdmin()
const { t } = useI18n()

const messages = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const selectedId = ref<string | null>(null)

const fetchMessages = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await listMessages()
    messages.value = data
    if (data.length && !selectedId.value) selectedId.value = data[0].id
  } catch (e: any) {
    error.value = e?.response?.data?.statusMessage ?? e?.message ?? 'Gagal memuat pesan'
  } finally {
    loading.value = false
  }
}

onMounted(fetchMessages)

const selected = computed(() => messages.value.find((m) => m.id === selectedId.value) ?? messages.value[0] ?? null)

const unreadCount = computed(() => messages.value.filter((m) => !m.is_read).length)

const selectMessage = (id: string) => {
  selectedId.value = id
  const msg = messages.value.find((m) => m.id === id)
  if (msg && !msg.is_read) {
    msg.is_read = true
    updateMessage(id, true).catch(() => {})
  }
}

const toggleRead = async (m: any) => {
  const next = !m.is_read
  m.is_read = next
  try {
    await updateMessage(m.id, next)
  } catch (e: any) {
    m.is_read = !next
    error.value = e?.response?.data?.statusMessage ?? e?.message ?? 'Gagal memperbarui pesan'
  }
}

const removeMessage = async (m: any) => {
  if (!window.confirm(t('admin.messagesDeleteConfirm'))) return
  try {
    await deleteMessage(m.id)
    messages.value = messages.value.filter((x) => x.id !== m.id)
    if (selectedId.value === m.id) selectedId.value = messages.value[0]?.id ?? null
  } catch (e: any) {
    error.value = e?.response?.data?.statusMessage ?? e?.message ?? 'Gagal menghapus pesan'
  }
}

const formatDate = (iso?: string) => formatWibDate(iso)

const formatTime = (iso?: string) => formatWibTime(iso)

const formatRelative = (iso?: string) => formatWibRelative(iso, t)
</script>

<template>
  <div class="flex flex-col gap-6 w-full h-full min-h-0">
    <div class="flex flex-col gap-2 flex-shrink-0">
      <h1 class="headline-lg text-on-surface">{{ t('admin.messagesTitle') }}</h1>
      <p class="body-md text-on-surface-variant">{{ t('admin.messagesSubtitle') }}</p>
    </div>

    <p v-if="error" class="body-md text-error">{{ error }}</p>

    <div class="flex flex-1 gap-4 min-h-0">
      <!-- Left: Inbox -->
      <aside class="w-64 flex flex-col gap-4 overflow-y-auto pr-1 flex-shrink-0 min-h-0 max-lg:hidden">
        <div class="neu-raised p-4 rounded-[18px] flex flex-col gap-3">
          <div class="flex items-center justify-between mb-1">
            <h3 class="title-md text-[15px] text-on-surface">{{ t('admin.inbox') }}</h3>
            <span
              class="px-2.5 py-0.5 rounded-md text-[11px] font-medium"
              :class="unreadCount > 0 ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'"
            >
              {{ unreadCount }}
            </span>
          </div>

          <!-- Skeleton -->
          <template v-if="loading">
            <div v-for="i in 5" :key="i" class="border-2 border-dashed border-outline-variant/40 rounded-xl p-3 flex flex-col gap-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full border-2 border-dashed border-outline-variant/50 flex items-center justify-center">
                  <Icon name="ph:envelope-bold" class="text-outline/50" />
                </div>
                <div class="flex flex-col gap-2 flex-1">
                  <div class="h-3 w-24 rounded-full bg-surface-variant/60" />
                  <div class="h-2 w-16 rounded-full bg-surface-variant/40" />
                </div>
              </div>
            </div>
          </template>

          <!-- Empty -->
          <template v-else-if="messages.length === 0">
            <div class="border-2 border-dashed border-outline-variant/40 rounded-xl p-4 flex flex-col gap-3 items-center text-center py-10">
              <span class="w-10 h-10 rounded-full border-2 border-dashed border-outline-variant/50 flex items-center justify-center text-outline/50">
                <Icon name="ph:envelope-simple-bold" class="text-lg" />
              </span>
              <p class="body-md text-on-surface-variant text-[14px]">{{ t('admin.messagesEmpty') }}</p>
            </div>
          </template>

          <!-- Messages -->
          <template v-else>
            <div
              v-for="m in messages"
              :key="m.id"
              class="p-3 rounded-xl flex items-center gap-2.5 cursor-pointer transition-all duration-300"
              :class="selected?.id === m.id ? 'neu-pressed' : 'neu-raised hover:neu-pressed'"
              @click="selectMessage(m.id)"
            >
              <span
                class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                :class="m.is_read ? 'neu-raised text-outline' : 'bg-primary text-on-primary'"
              >
                <Icon name="ph:user-bold" class="text-base" />
              </span>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center gap-2">
                  <span class="font-medium text-on-surface text-[13px] truncate" :class="!m.is_read ? 'font-bold' : ''">{{ m.name || t('admin.anonUser') }}</span>
                  <span class="text-[10px] text-outline flex-shrink-0">{{ formatRelative(m.created_at) }}</span>
                </div>
                <div class="flex justify-between items-center gap-2">
                  <p class="text-[11px] text-on-surface-variant truncate">{{ m.message }}</p>
                  <span
                    v-if="!m.is_read"
                    class="w-2 h-2 rounded-full bg-primary flex-shrink-0"
                  />
                </div>
                <p class="text-[10px] text-on-surface-variant mt-0.5 truncate">{{ m.email }}</p>
              </div>
            </div>
          </template>
        </div>
      </aside>

      <!-- Main: Message Detail -->
      <main class="flex-1 flex flex-col neu-raised rounded-[18px] overflow-hidden min-w-0 min-h-0">
        <template v-if="selected">
          <header class="h-14 border-b border-surface-variant/30 flex items-center justify-between px-5 flex-shrink-0">
            <div class="flex items-center gap-3 min-w-0">
              <span
                class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                :class="selected.is_read ? 'neu-raised text-outline' : 'bg-primary text-on-primary'"
              >
                <Icon name="ph:user-bold" class="text-lg" />
              </span>
              <div class="flex flex-col min-w-0">
                <div class="flex items-center gap-2">
                  <span class="title-md text-[15px] text-on-surface truncate">{{ selected.name || t('admin.anonUser') }}</span>
                  <span
                    class="px-2 py-0.5 rounded-md text-[10px] font-medium flex-shrink-0"
                    :class="selected.is_read ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary text-on-primary'"
                  >
                    {{ selected.is_read ? t('admin.read') : t('admin.unread') }}
                  </span>
                </div>
                <span class="text-[11px] text-on-surface-variant truncate">{{ selected.email }}</span>
              </div>
            </div>
            <div class="flex items-center gap-2.5">
              <a
                :href="`mailto:${selected.email}`"
                class="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                :aria-label="t('admin.reply')"
              >
                <Icon name="ph:paper-plane-tilt-bold" class="text-lg" />
              </a>
              <button
                class="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                :aria-label="t('admin.messagesToggleRead')"
                @click="toggleRead(selected)"
              >
                <Icon :name="selected.is_read ? 'ph:envelope-bold' : 'ph:envelope-open-bold'" class="text-lg" />
              </button>
              <button
                class="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
                :aria-label="t('admin.delete')"
                @click="removeMessage(selected)"
              >
                <Icon name="ph:trash-bold" class="text-lg" />
              </button>
            </div>
          </header>

          <div class="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-3">
            <div class="flex items-center gap-2.5 text-outline">
              <Icon name="ph:calendar-bold" class="text-lg" />
              <span class="text-[13px]">{{ formatDate(selected.created_at) }} · {{ formatTime(selected.created_at) }}</span>
            </div>
            <div class="neu-pressed rounded-[18px] p-5">
              <p class="body-lg leading-relaxed whitespace-pre-wrap text-on-surface">{{ selected.message }}</p>
            </div>
          </div>
        </template>

        <!-- Empty state -->
        <div v-else class="flex-1 flex flex-col items-center justify-center gap-4 text-center py-12">
          <span class="w-16 h-16 rounded-full border-2 border-dashed border-outline-variant/50 flex items-center justify-center text-outline/50">
            <Icon name="ph:envelope-simple-bold" class="text-3xl" />
          </span>
          <p class="body-md text-on-surface-variant">{{ t('admin.messagesEmpty') }}</p>
        </div>
      </main>
    </div>
  </div>
</template>