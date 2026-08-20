<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { chatLogs, archiveChatLog } = useAdmin()

const { t } = useI18n()

const SESSION_LIMIT = 7

const logs = ref<any[]>([])
const loading = ref(false)
const archiving = ref(false)
const error = ref<string | null>(null)
const selectedId = ref<string | null>(null)
const tab = ref<'active' | 'archive'>('active')
const chatOpen = ref(true)

const fetchLogs = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await chatLogs()
    logs.value = data
    if (data.length && !selectedId.value) selectedId.value = data[0].id
  } catch (e: any) {
    error.value = e?.response?.data?.statusMessage ?? e?.message ?? 'Gagal memuat log'
  } finally {
    loading.value = false
  }
}

onMounted(fetchLogs)

const sessions = computed(() => {
  const map = new Map<string, any[]>()
  for (const log of logs.value) {
    const key = log.session_id || 'anonymous'
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(log)
  }
  const arr = Array.from(map.entries()).map(([key, items]) => {
    const sorted = items.sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
    const last = sorted[sorted.length - 1]
    const userIdRaw = last?.user_id ?? null
    const archived = sorted.some((l) => l.is_archived)
    return {
      key,
      userId: userIdRaw,
      items: sorted,
      label: key === 'anonymous' ? t('admin.anonUser') : `Session · ${key.slice(0, 8)}`,
      userLabel: userIdRaw ? `User · ${userIdRaw.slice(0, 8)}` : t('admin.anonUser'),
      lastQuestion: last?.question ?? '',
      lastTime: last?.created_at,
      active: !archived,
      archived,
      reachedLimit: sorted.length >= SESSION_LIMIT,
    }
  })
  return arr.sort((a, b) => String(b.lastTime).localeCompare(String(a.lastTime)))
})

const filteredSessions = computed(() => {
  return tab.value === 'archive' ? sessions.value.filter((s) => s.archived) : sessions.value.filter((s) => !s.archived)
})

const selected = computed(() => {
  const list = filteredSessions.value
  const found = list.find((s) => s.key === selectedId.value) ?? list[0]
  if (found) return found
  const other = tab.value === 'archive' ? sessions.value.filter((s) => !s.archived) : sessions.value.filter((s) => s.archived)
  return other[0] ?? null
})

const toggleArchive = async (s?: any) => {
  const session = s ?? selected.value
  if (!session || archiving.value) return
  const next = !session.archived
  archiving.value = true
  error.value = null
  try {
    await archiveChatLog(session.key, next)
    session.archived = next
    session.active = !next
    if (session.key === selectedId.value && !filteredSessions.value.some((x) => x.key === session.key)) {
      selectedId.value = filteredSessions.value[0]?.key ?? null
    }
  } catch (e: any) {
    error.value = e?.response?.data?.statusMessage ?? e?.message ?? 'Gagal mengarsipkan chat'
  } finally {
    archiving.value = false
  }
}

const formatTime = (iso?: string) => formatWibTime(iso)

const formatDate = (iso?: string) => formatWibDate(iso)

const formatRelative = (iso?: string) => formatWibRelative(iso, t)

const scoreLabel = (s?: number) => (typeof s === 'number' ? `${Math.round(s * 100)}%` : '—')

const lastAnswered = computed(() => {
  if (!selected.value) return null
  return [...selected.value.items].reverse().find((l) => l.was_answered) ?? null
})

const dummyMessages = computed(() => {
  if (!selected.value) return []
  return selected.value.items.flatMap((l) => {
    const row = [
      { role: 'user', text: l.question, time: formatTime(l.created_at) },
    ]
    if (l.answer) row.push({ role: 'assistant', text: l.answer, time: formatTime(l.created_at) })
    return row
  })
})

const selectSession = (key: string) => {
  selectedId.value = key
}
</script>

<template>
  <div class="flex flex-col gap-6 w-full h-full min-h-0">
    <div class="flex flex-col gap-2 flex-shrink-0">
      <h1 class="headline-lg text-on-surface">{{ t('admin.chatTitle') }}</h1>
      <p class="body-md text-on-surface-variant">{{ t('admin.chatLogsSubtitle') }}</p>
    </div>

    <p v-if="error" class="body-md text-error">{{ error }}</p>

    <div class="flex flex-1 gap-4 min-h-0">
      <!-- Left: Percakapan -->
      <aside class="w-64 flex flex-col gap-4 overflow-y-auto pr-1 flex-shrink-0 min-h-0 max-lg:hidden">
        <div class="neu-raised p-4 rounded-[18px] flex flex-col gap-3">
          <div class="flex items-center justify-between mb-1">
            <h3 class="title-md text-[15px] text-on-surface">{{ t('admin.conversations') }}</h3>
            <div class="flex gap-1">
              <button
                class="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors"
                :class="tab === 'active' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-variant'"
                @click="tab = 'active'"
              >
                {{ t('admin.active') }}
              </button>
              <button
                class="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors"
                :class="tab === 'archive' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-variant'"
                @click="tab = 'archive'"
              >
                {{ t('admin.archive') }}
              </button>
            </div>
          </div>

          <!-- Skeleton -->
          <template v-if="loading">
            <div v-for="i in 4" :key="i" class="border-2 border-dashed border-outline-variant/40 rounded-xl p-3 flex flex-col gap-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full border-2 border-dashed border-outline-variant/50 flex items-center justify-center">
                  <Icon name="ph:user-bold" class="text-outline/50" />
                </div>
                <div class="flex flex-col gap-2 flex-1">
                  <div class="h-3 w-24 rounded-full bg-surface-variant/60" />
                  <div class="h-2 w-16 rounded-full bg-surface-variant/40" />
                </div>
              </div>
            </div>
          </template>

          <!-- Empty -->
          <template v-else-if="filteredSessions.length === 0">
            <div class="border-2 border-dashed border-outline-variant/40 rounded-xl p-4 flex flex-col gap-3 items-center text-center py-8">
              <span class="w-10 h-10 rounded-full border-2 border-dashed border-outline-variant/50 flex items-center justify-center text-outline/50">
                <Icon name="ph:chat-circle-bold" class="text-lg" />
              </span>
              <p class="body-md text-on-surface-variant text-[14px]">{{ t('admin.emptyLogs') }}</p>
            </div>
          </template>

          <!-- Sessions -->
          <template v-else>
            <div
              v-for="s in filteredSessions"
              :key="s.key"
              class="p-3 rounded-xl flex items-center gap-2.5 cursor-pointer transition-all duration-300"
              :class="selected?.key === s.key ? 'neu-pressed' : 'neu-raised hover:neu-pressed'"
              @click="selectSession(s.key)"
            >
              <span class="w-8 h-8 rounded-full neu-raised flex items-center justify-center text-primary flex-shrink-0">
                <Icon name="ph:user-bold" class="text-base" />
              </span>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center gap-2">
                  <span class="font-medium text-on-surface text-[13px] truncate">{{ s.userLabel }}</span>
                  <span class="text-[10px] text-outline flex-shrink-0">
                    {{ s.archived ? t('admin.archived') : (s.active ? t('admin.active') : t('admin.closed')) }}
                  </span>
                </div>
                <div class="flex justify-between items-center gap-2">
                  <p class="text-[11px] text-on-surface-variant truncate">{{ s.lastQuestion }}</p>
                  <Icon
                    v-if="s.reachedLimit"
                    name="ph:shield-check-bold"
                    class="text-[12px] text-primary flex-shrink-0"
                    :title="`${s.items.length}/${SESSION_LIMIT}`"
                  />
                </div>
                <p class="text-[10px] text-on-surface-variant mt-0.5">{{ formatRelative(s.lastTime) }} · {{ s.items.length }} msg</p>
              </div>
            </div>
          </template>
        </div>
      </aside>

      <!-- Chat + Right region (kolom chat bisa diciutkan, panel kanan melebar) -->
      <div
        class="flex-1 min-w-0 grid relative transition-[grid-template-columns] duration-500 ease-in-out"
        :class="chatOpen ? 'grid-cols-[minmax(0,1fr)_260px]' : 'grid-cols-[0px_1fr]'"
      >
      <!-- Main Chat Area -->
      <main class="min-w-0 flex flex-col neu-raised rounded-[18px] overflow-hidden min-h-0">
        <!-- Chat Header -->
        <header class="h-14 border-b border-surface-variant/30 flex items-center justify-between px-5 flex-shrink-0">
          <div class="flex items-center gap-3 min-w-0">
            <span class="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-primary flex-shrink-0">
              <Icon name="ph:user-bold" class="text-lg" />
            </span>
            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-2">
                <span class="title-md text-[15px] text-on-surface truncate">{{ selected?.userLabel ?? t('admin.noSession') }}</span>
                <span
                  class="px-2 py-0.5 rounded-md text-[10px] font-medium flex-shrink-0"
                  :class="selected?.active ? 'bg-surface-variant text-primary' : 'bg-surface-variant text-on-surface-variant'"
                >
                  {{ selected?.active ? t('admin.active') : t('admin.closed') }}
                </span>
              </div>
              <span class="text-[11px] text-on-surface-variant truncate">{{ selected?.lastQuestion?.slice(0, 60) || '—' }}</span>
            </div>
          </div>
          <div class="flex items-center gap-2.5">
            <div v-if="selected && !selected.active" class="hidden sm:flex items-center gap-2 text-outline">
              <Icon :name="selected.reachedLimit ? 'ph:check-circle-bold' : 'ph:archive-bold'" class="text-lg" />
              <span class="text-[12px]">{{ selected.reachedLimit ? t('admin.sessionEnded') : t('admin.archived') }}</span>
            </div>
            <button
              class="w-9 h-9 rounded-full neu-raised flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :class="selected?.archived ? 'text-primary' : 'text-on-surface-variant hover:text-primary'"
              :aria-label="selected?.archived ? t('admin.unarchive') : t('admin.archiveSession')"
              :disabled="archiving || !selected"
              :title="selected?.archived ? t('admin.unarchive') : t('admin.archiveSession')"
              @click="toggleArchive()"
            >
              <Icon
                :name="selected?.archived ? 'ph:play-circle-bold' : 'ph:pause-circle-bold'"
                class="text-lg"
                :class="archiving ? 'animate-spin' : ''"
              />
            </button>
            <button class="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-on-surface-variant hover:text-error transition-colors" :aria-label="t('admin.handoff')">
              <Icon name="ph:hand-bold" class="text-lg" />
            </button>
            <button
              class="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
              :aria-label="t('admin.closeChat')"
              :title="t('admin.closeChat')"
              @click="chatOpen = false"
            >
              <Icon name="ph:x-bold" class="text-lg" />
            </button>
          </div>
        </header>

        <!-- Message History -->
        <div class="flex-1 min-h-0 overflow-y-auto p-5 flex flex-col gap-5">
          <template v-if="dummyMessages.length">
            <div v-for="(m, i) in dummyMessages" :key="i" class="flex flex-col w-full" :class="m.role === 'user' ? 'items-start' : 'items-end'">
              <div
                class="max-w-[70%] p-3 rounded-2xl"
                :class="
                  m.role === 'user'
                    ? 'neu-raised rounded-tl-sm bg-surface-container-lowest'
                    : 'bg-primary rounded-tr-sm text-on-primary shadow-lg'
                "
              >
                <p class="body-md">{{ m.text }}</p>
              </div>
              <div
                class="flex items-center gap-1 mt-1.5"
                :class="m.role === 'user' ? '' : 'flex-row-reverse'"
              >
                <span class="text-[10px] text-on-surface-variant">{{ m.time }}</span>
                <Icon v-if="m.role === 'assistant'" name="ph:check-double-bold" class="text-[14px] text-primary" />
              </div>
            </div>
          </template>

          <!-- Skeleton bubbles when loading -->
          <template v-else-if="loading">
            <div v-for="i in 4" :key="i" class="flex w-full" :class="i % 2 ? 'justify-end' : 'justify-start'">
              <div class="max-w-[70%] border-2 border-dashed border-outline-variant/40 rounded-2xl p-4 flex flex-col gap-3 w-full">
                <div class="h-3 w-full rounded-full bg-surface-variant/50" />
                <div class="h-3 w-2/3 rounded-full bg-surface-variant/50" />
                <div class="h-3 w-1/2 rounded-full bg-surface-variant/40" />
              </div>
            </div>
          </template>

          <!-- Empty state -->
          <template v-else>
            <div class="flex flex-col items-center justify-center gap-4 text-center h-full py-12">
              <span class="w-16 h-16 rounded-full border-2 border-dashed border-outline-variant/50 flex items-center justify-center text-outline/50">
                <Icon name="ph:chat-circle-bold" class="text-3xl" />
              </span>
              <p class="body-md text-on-surface-variant">{{ t('admin.emptyLogs') }}</p>
            </div>
          </template>

          <!-- AI Typing Indicator -->
          <div v-if="selected?.active" class="flex flex-col items-start w-full">
            <div class="neu-raised px-4 py-2.5 rounded-full rounded-tl-sm bg-surface-container flex gap-1 items-center h-[38px]">
              <span class="w-2 h-2 rounded-full bg-primary animate-bounce" style="animation-delay: 0s" />
              <span class="w-2 h-2 rounded-full bg-primary animate-bounce" style="animation-delay: 0.2s" />
              <span class="w-2 h-2 rounded-full bg-primary animate-bounce" style="animation-delay: 0.4s" />
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="p-4 bg-surface flex flex-col gap-3 flex-shrink-0">
          <div class="flex gap-3 items-center">
            <button class="w-10 h-10 rounded-full flex-shrink-0 neu-raised flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors" :aria-label="t('admin.attach')" :disabled="!selected">
              <Icon name="ph:paperclip-bold" class="text-lg" />
            </button>
            <div class="flex-1 neu-pressed rounded-full h-10 flex items-center px-5">
              <input
                type="text"
                class="w-full bg-transparent border-none outline-none body-md text-on-surface placeholder:text-on-surface-variant/50"
                :placeholder="selected?.active ? t('admin.chatPlaceholder') : t('admin.sessionEndedPlaceholder')"
                :disabled="!selected || !selected.active"
              />
            </div>
            <button
              class="w-10 h-10 rounded-full flex-shrink-0 neu-raised bg-surface-container flex items-center justify-center text-primary hover:scale-105 transition-transform"
              :class="selected?.active ? '' : 'opacity-50'"
              :aria-label="t('admin.send')"
              :disabled="!selected || !selected.active"
            >
              <Icon name="ph:paper-plane-right-fill" class="text-lg" />
            </button>
          </div>
          <div v-if="selected && !selected.active" class="flex items-center justify-center gap-2 text-outline text-[12px] py-1">
            <Icon name="ph:lock-bold" class="text-[16px]" />
            <span>{{ t('admin.readOnly') }}</span>
          </div>
        </div>
      </main>

      <!-- Right Sidebar: Context & AI Reasoning -->
      <aside class="min-w-0 flex flex-col gap-4 overflow-y-auto pl-1 min-h-0 max-lg:hidden">
        <!-- Session Info Card -->
        <div class="neu-raised p-4 rounded-[18px] flex flex-col gap-3">
          <h3 class="label-caps text-on-surface-variant uppercase tracking-widest border-b border-surface-variant pb-1.5">
            {{ t('admin.sessionInfo') }}
          </h3>
          <div class="flex items-start gap-3">
            <Icon name="ph:user-bold" class="text-outline text-lg mt-0.5" />
            <div class="flex flex-col min-w-0">
              <span class="body-md text-[13px] text-on-surface truncate">{{ selected?.userId ? `User · ${selected.userId.slice(0, 8)}` : (selected?.key === 'anonymous' ? t('admin.anonUser') : selected?.key) }}</span>
              <span class="text-[11px] text-on-surface-variant">{{ t('admin.userId') }}</span>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <Icon name="ph:hash-bold" class="text-outline text-lg mt-0.5" />
            <div class="flex flex-col min-w-0">
              <span class="body-md text-[13px] text-on-surface truncate">{{ selected?.key === 'anonymous' ? t('admin.anonUser') : selected?.key }}</span>
              <span class="text-[11px] text-on-surface-variant">{{ t('admin.sessionId') }}</span>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <Icon name="ph:chat-circle-bold" class="text-outline text-lg mt-0.5" />
            <div class="flex flex-col">
              <span class="body-md text-[13px] text-on-surface">{{ selected?.items.length ?? '—' }}</span>
              <span class="text-[11px] text-on-surface-variant">{{ t('admin.messages') }}</span>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <Icon name="ph:calendar-bold" class="text-outline text-lg mt-0.5" />
            <div class="flex flex-col">
              <span class="body-md text-[13px] text-on-surface">{{ selected?.lastTime ? formatDate(selected.lastTime) : '—' }}</span>
              <span class="text-[11px] text-on-surface-variant">{{ t('admin.lastActivity') }}</span>
            </div>
          </div>
        </div>

        <!-- AI Logic Card -->
        <div class="neu-raised p-4 rounded-[18px] flex flex-col gap-3 flex-1 min-h-[240px] min-w-0">
          <div class="flex items-center justify-between border-b border-surface-variant pb-1.5">
            <h3 class="label-caps text-on-surface-variant uppercase tracking-widest">{{ t('admin.aiLogic') }}</h3>
            <Icon name="ph:brain-bold" class="text-primary text-lg" />
          </div>
          <div class="flex flex-col gap-1.5">
            <div class="flex justify-between items-end">
              <span class="text-[11px] text-on-surface-variant">{{ t('admin.confidence') }}</span>
              <span class="title-md text-[14px] text-primary">{{ scoreLabel(lastAnswered?.top_similarity_score) }}</span>
            </div>
            <div class="w-full h-1.5 neu-pressed rounded-full overflow-hidden">
              <div
                class="h-full bg-primary rounded-full transition-all duration-500"
                :style="{ width: `${Math.round((lastAnswered?.top_similarity_score ?? 0) * 100)}%` }"
              />
            </div>
          </div>
          <div class="flex flex-col gap-1.5 mt-1">
            <span class="text-[11px] text-on-surface-variant font-medium">{{ t('admin.intent') }}</span>
            <span class="inline-block bg-surface-variant text-on-surface-variant px-2.5 py-0.5 rounded-md text-[11px] w-fit font-mono">
              {{ selected?.lastQuestion?.slice(0, 32) || '—' }}
            </span>
          </div>
          <div class="flex flex-col gap-1.5 mt-1 flex-1 min-h-0">
            <span class="text-[11px] text-on-surface-variant font-medium">{{ t('admin.ragContext') }}</span>
            <div class="neu-pressed p-2.5 rounded-lg flex-1 min-h-0 overflow-y-auto">
              <p class="body-md text-[12px] leading-relaxed text-on-surface opacity-80 font-mono">
                {{ lastAnswered?.answer?.slice(0, 200) ?? '—' }}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Tombol buka kembali saat chat ditutup -->
      <button
        v-if="!chatOpen"
        class="absolute top-0 right-0 z-10 w-10 h-10 rounded-full neu-accent flex items-center justify-center text-on-primary shadow-lg hover:scale-110 transition-transform"
        :aria-label="t('admin.openChat')"
        :title="t('admin.openChat')"
        @click="chatOpen = true"
      >
        <Icon name="ph:chat-circle-bold" class="text-lg" />
      </button>
      </div>
    </div>
  </div>
</template>