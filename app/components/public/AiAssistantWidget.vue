<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCookie } from '#app'
import { useAiWidget } from '~/composables/useAiWidget'
import { useApi } from '~/composables/useApi'
import { useAiUserId } from '~/composables/useAiUserId'
import { renderChatMessage } from '~/composables/renderChatMessage'

const { t } = useI18n()
const { open, closeChat } = useAiWidget()
const { api } = useApi()
const { userId } = useAiUserId()

const SESSION_LIMIT = 7

const messages = ref<{ role: 'user' | 'assistant'; content: string }[]>([])
const input = ref('')
const loading = ref(false)
const sessionEnded = ref(false)
const questionsUsed = ref(0)

const remaining = computed(() => Math.max(0, SESSION_LIMIT - questionsUsed.value))

const scrollRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollRef.value) scrollRef.value.scrollTop = scrollRef.value.scrollHeight
  })
}

const getSessionId = () => {
  const sessionId = useCookie('ai_session_id').value ?? crypto.randomUUID()
  useCookie('ai_session_id').value = sessionId
  return sessionId
}

const send = async (text?: string) => {
  const value = (text ?? input.value).trim()
  if (!value || loading.value || sessionEnded.value) return
  input.value = ''
  messages.value.push({ role: 'user', content: value })
  loading.value = true
  scrollToBottom()
  try {
    const { data } = await api.post('/chat', { message: value, sessionId: getSessionId(), userId: userId() })
    messages.value.push({ role: 'assistant', content: data.answer })
    questionsUsed.value = data.questionsUsed ?? 0
    if (data.sessionEnded) sessionEnded.value = true
  } catch {
    messages.value.push({ role: 'assistant', content: t('ai.error') })
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

const quickQuestions = computed(() => [
  t('ai.quickWho'),
  t('ai.quickStack'),
  t('ai.quickProjects'),
  t('ai.quickWorks'),
  t('ai.quickContact'),
])

const hasConversation = computed(() => messages.value.length > 0)

watch(open, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
  if (val) {
    nextTick(() => inputRef.value?.focus())
  }
})

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && open.value) closeChat()
}

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  document.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <!-- Floating trigger -->
    <button
      class="fixed bottom-6 right-6 z-[110] neu-accent h-12 px-5 rounded-full flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-transform"
      :aria-label="t('nav.askAI')"
      @click="open = !open"
    >
      <GeminiIcon class="w-5 h-5 text-on-primary" />
      <span class="text-on-primary font-bold text-sm">{{ t('nav.askAI') }}</span>
    </button>

    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-8"
        role="dialog"
        aria-modal="true"
      >
        <!-- Blurred backdrop -->
        <div class="absolute inset-0 bg-surface-base/70 backdrop-blur-xl backdrop-saturate-150" @click="closeChat" />

        <!-- Modal -->
        <div
          class="relative w-full max-w-lg h-[92vh] max-h-[860px] sm:h-[86vh] flex flex-col overflow-hidden rounded-[28px] neu-raised text-on-surface"
        >
          <!-- Header -->
          <div class="flex items-center justify-between gap-3 px-5 py-4 border-b border-outline-variant/50 bg-surface-card">
            <div class="flex items-center gap-3">
              <span class="relative w-10 h-10 rounded-full neu-accent flex items-center justify-center">
                <GeminiIcon class="w-5 h-5 text-on-primary" />
                <span class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-surface-card" />
              </span>
              <div>
                <p class="text-[15px] font-bold leading-tight">{{ t('ai.title') }}</p>
                <p class="text-[11px] text-on-surface-variant">{{ t('ai.subtitle') }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <span
                v-if="questionsUsed > 0"
                class="text-[10px] font-semibold px-2.5 py-1 rounded-full neu-pressed"
                :class="sessionEnded ? 'text-outline' : 'text-primary'"
              >
                {{ sessionEnded ? t('ai.closed') : `${questionsUsed}/${SESSION_LIMIT}` }}
              </span>
              <button
                class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/60 transition-colors"
                aria-label="Tutup"
                @click="closeChat"
              >
                <Icon name="ph:x-bold" class="text-lg" />
              </button>
            </div>
          </div>

          <!-- Body -->
          <div ref="scrollRef" class="flex-1 min-h-0 overflow-y-auto px-5 py-5 flex flex-col gap-3.5">
            <!-- Welcome / greeting with quick pills -->
            <div v-if="!hasConversation" class="flex flex-col gap-5">
              <div class="flex gap-3">
                <span class="w-9 h-9 rounded-full neu-accent flex items-center justify-center shrink-0">
                  <GeminiIcon class="w-4 h-4 text-on-primary" />
                </span>
                <p class="text-[13.5px] leading-relaxed neu-raised rounded-2xl rounded-tl-sm border-l-2 border-primary bg-surface-container px-4 py-3">
                  {{ t('ai.greeting') }}
                </p>
              </div>
              <div class="flex flex-wrap gap-2 pl-12">
                <button
                  v-for="q in quickQuestions"
                  :key="q"
                  class="px-3.5 py-2 rounded-full text-[12px] font-medium neu-pressed hover:text-primary hover:scale-[1.03] active:scale-95 transition-all"
                  @click="send(q)"
                >
                  {{ q }}
                </button>
              </div>
            </div>

            <!-- Conversation -->
            <div
              v-for="(m, i) in messages"
              :key="i"
              class="flex w-full"
              :class="m.role === 'user' ? 'justify-end' : 'justify-start'"
            >
              <div
                class="max-w-[85%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed"
                :class="
                  m.role === 'user'
                    ? 'neu-accent rounded-tr-sm'
                    : 'neu-raised bg-surface-container border-l-2 border-primary rounded-tl-sm'
                "
              >
                <!-- eslint-disable-next-line vue/no-v-html -->
                <span v-html="renderChatMessage(m.content)" />
              </div>
            </div>

            <div v-if="loading" class="flex justify-start">
              <div class="neu-raised px-4 py-3 rounded-full rounded-tl-sm bg-surface-container flex gap-1.5">
                <span class="w-2 h-2 rounded-full bg-primary animate-bounce" style="animation-delay: 0s" />
                <span class="w-2 h-2 rounded-full bg-primary animate-bounce" style="animation-delay: 0.15s" />
                <span class="w-2 h-2 rounded-full bg-primary animate-bounce" style="animation-delay: 0.3s" />
              </div>
            </div>

            <div
              v-if="sessionEnded"
              class="flex items-center justify-center gap-2 text-xs text-on-surface-variant neu-pressed rounded-full px-4 py-2"
            >
              <Icon name="ph:lock-bold" class="text-sm" />
              <span>{{ t('ai.sessionLimitReached') }}</span>
            </div>
          </div>

          <!-- Footer / input -->
          <div class="px-5 py-4 border-t border-outline-variant/50 bg-surface-card">
            <form v-if="!sessionEnded" class="flex gap-2.5 items-center" @submit.prevent="send()">
              <div class="flex-1 flex items-center gap-2 neu-pressed rounded-full px-4 h-11">
                <Icon name="ph:chat-circle-text-bold" class="text-primary/60 text-base shrink-0" />
                <input
                  ref="inputRef"
                  v-model="input"
                  type="text"
                  class="w-full bg-transparent outline-none text-sm font-medium text-on-surface placeholder:text-on-surface-variant/50"
                  :placeholder="t('ai.placeholder')"
                  :disabled="loading"
                />
              </div>
              <button
                type="submit"
                class="h-11 px-5 rounded-full neu-accent flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-95 transition-all disabled:opacity-50"
                aria-label="Kirim"
                :disabled="loading"
              >
                <span
                  class="flex items-center gap-1 text-[10px] font-bold text-on-primary"
                  :class="remaining <= 2 ? 'text-amber-300' : ''"
                  :title="t('ai.creditHint')"
                >
                  <Icon name="ph:gauge-bold" class="text-xs" />
                  {{ remaining }}/{{ SESSION_LIMIT }}
                </span>
                <span class="w-px h-4 bg-on-primary/30" />
                <Icon name="ph:paper-plane-right-fill" class="text-lg" />
              </button>
            </form>

            <div v-else class="flex flex-col gap-2 items-center">
              <p class="text-xs text-on-surface-variant text-center">{{ t('ai.sessionEndedHint') }}</p>
            </div>
            <p class="text-[10px] text-on-surface-variant/70 mt-2.5 text-center">
              {{ t('ai.disclaimer') }} · <kbd class="text-on-surface-variant border border-outline/40 rounded px-1">ESC</kbd>
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Tautan yang dirender via v-html mengikuti warna primary situs */
:deep(.ai-link) {
  color: var(--primary);
}
:deep(.ai-link:hover) {
  color: var(--primary-strong);
}
</style>
