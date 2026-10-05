<script setup lang="ts">
import { motion } from 'motion-v'

export interface StackItem {
  id?: string
  name: string
  icon_url: string | null
  gemini?: boolean
  sort_order?: number
  category?: string
}

const props = defineProps<{
  stacks: StackItem[]
}>()

const { t } = useI18n()

const broken = ref<Set<string>>(new Set())
const onImgError = (name: string) => {
  broken.value = new Set(broken.value).add(name)
}

// Categorization helper with category field support and fallback detection
const isAi = (name: string) => /\b(ai|rag|gemini|openai|claude|langchain|vector|llamaindex|machine learning|llm|gpt)\b/i.test(name)
const isFrontend = (name: string) => /\b(vue|nuxt|react|next|tailwind|css|html|typescript|javascript|js|ts|gsap|svelte|angular|vite|sass|figma|ui|ux|redux|pinia|bootstrap|web)\b/i.test(name)
const isBackend = (name: string) => /\b(nitro|python|go|golang|node|express|nest|fastapi|django|laravel|php|java|spring|ruby|rails|graphql|rest|api|c#|\.net|flask|gin|grpc)\b/i.test(name)
const isDevops = (name: string) => /\b(supabase|neon|docker|vercel|mysql|postgres|postgresql|mongo|mongodb|redis|git|github|ci\/cd|aws|cloudflare|linux|kubernetes|nginx|prisma|wordpress|database|sql)\b/i.test(name)

const getPillar = (item: StackItem): 'frontend' | 'backend' | 'devops' | 'rag' | 'llm' => {
  if (item.category) return item.category as any
  if (item.gemini) return 'llm'
  const name = item.name || ''
  if (isAi(name)) return 'rag'
  if (isFrontend(name)) return 'frontend'
  if (isBackend(name)) return 'backend'
  if (isDevops(name)) return 'devops'
  return 'frontend'
}

// Stacks categorized dynamically from database
const frontendStacks = computed(() => (props.stacks ?? []).filter((s) => getPillar(s) === 'frontend'))
const backendStacks = computed(() => (props.stacks ?? []).filter((s) => getPillar(s) === 'backend'))
const devopsStacks = computed(() => (props.stacks ?? []).filter((s) => getPillar(s) === 'devops'))
const ragStacks = computed(() => (props.stacks ?? []).filter((s) => getPillar(s) === 'rag'))
const llmStacks = computed(() => (props.stacks ?? []).filter((s) => getPillar(s) === 'llm'))

// 4 Primary podium items (top sort_order)
const frontendDisplayStacks = computed(() => frontendStacks.value.slice(0, 4))
const backendDisplayStacks = computed(() => backendStacks.value.slice(0, 4))
const devopsDisplayStacks = computed(() => devopsStacks.value.slice(0, 4))

// Remaining items as tags
const frontendTags = computed(() => frontendStacks.value.slice(4).map((s) => s.name))
const backendTags = computed(() => backendStacks.value.slice(4).map((s) => s.name))
const devopsTags = computed(() => devopsStacks.value.slice(4).map((s) => s.name))

// Clean up display names for compact podium pills
const formatDisplayName = (name: string) => {
  if (!name) return ''
  if (name.toLowerCase() === 'tailwind css') return 'Tailwind'
  return name
}
</script>

<template>
  <motion.section
    id="stack"
    class="w-full flex flex-col gap-8 relative z-10 scroll-mt-24 select-none"
    :initial="{ opacity: 0, y: 40 }"
    :while-in-view="{ opacity: 1, y: 0 }"
    :viewport="{ once: true, margin: '-80px' }"
    :transition="{ duration: 0.7 }"
  >
    <!-- Section Heading (Dipertahankan Sesuai Format Semula) -->
    <div class="flex flex-col gap-3">
      <SectionHeading :eyebrow="t('stack.pretitle')">
        {{ t('stack.title') }}
      </SectionHeading>
      <div class="flex flex-wrap items-center justify-between gap-4">
        <p class="body-lg text-on-surface-variant max-w-2xl">{{ t('stack.subtitle') }}</p>
        <span class="neu-pressed px-3.5 py-1 rounded-full label-caps text-on-surface-variant text-[10px] inline-flex items-center gap-1.5 self-start sm:self-auto">
          <span class="w-1.5 h-1.5 rounded-full bg-[#0EA5E9] animate-pulse" />
          {{ t('stack.masteredCount', { n: (stacks ?? []).length }) }}
        </span>
      </div>
    </div>

    <!-- MAIN BENTO CONTENT GRID (Sesuai Desain new ui techstack section.html) -->
    <div class="space-y-8 md:space-y-10 w-full" data-purpose="content-grid-wrapper">
      <!-- 1. CategoryCardsSection (Frontend, Backend, Data/DevOps 3-Pillar Overview) -->
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8" data-purpose="three-pillar-overview">
        <!-- Frontend Column -->
        <article class="neu-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between" data-category="frontend">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold text-on-surface tracking-tight">{{ t('stack.frontendTitle') }}</h3>
              <span class="text-xs font-semibold px-3 py-1 rounded-full text-on-surface-variant neu-inset">
                {{ t('stack.techCount', { n: frontendStacks.length }) }}
              </span>
            </div>
            <p class="text-xs sm:text-sm text-on-surface-variant mb-6 leading-relaxed">
              {{ t('stack.frontendDesc') }}
            </p>

            <!-- Interactive Icon Mini-Grid -->
            <div class="grid grid-cols-4 gap-2.5 sm:gap-3 mb-6" data-purpose="frontend-icon-showcase">
              <div
                v-for="s in frontendDisplayStacks"
                :key="s.name"
                class="neu-pill py-2 px-1 sm:py-2.5 sm:px-1.5 rounded-2xl flex flex-col items-center justify-center hover:scale-105 transition-transform group/pill cursor-pointer select-none"
                :title="s.name"
              >
                <!-- Icon Circle Podium -->
                <div class="w-9 h-9 rounded-full neu-icon-circle flex items-center justify-center mb-1 group-hover/pill:neu-inset transition-all">
                  <GeminiIcon v-if="s.gemini" class="w-5 h-5 text-sky-500" />
                  <img
                    v-else-if="s.icon_url && !broken.has(s.name)"
                    :src="s.icon_url"
                    :alt="s.name"
                    class="w-5 h-5 object-contain"
                    loading="lazy"
                    @error="onImgError(s.name)"
                  />
                  <span v-else class="text-xs font-bold text-primary">{{ s.name?.charAt(0) }}</span>
                </div>
                <span class="text-[9.5px] sm:text-[10px] font-bold text-on-surface text-center tracking-tight truncate w-full px-0.5">{{ formatDisplayName(s.name) }}</span>
              </div>
            </div>
          </div>

          <!-- Tags List -->
          <div class="flex flex-wrap gap-2 pt-3 border-t border-outline-variant/30">
            <span
              v-for="tag in frontendTags"
              :key="tag"
              class="px-2.5 py-1 text-xs font-medium rounded-lg neu-pill text-on-surface-variant"
            >
              {{ tag }}
            </span>
          </div>
        </article>

        <!-- Backend Column -->
        <article class="neu-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between" data-category="backend">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold text-on-surface tracking-tight">{{ t('stack.backendTitle') }}</h3>
              <span class="text-xs font-semibold px-3 py-1 rounded-full text-on-surface-variant neu-inset">
                {{ t('stack.techCount', { n: backendStacks.length }) }}
              </span>
            </div>
            <p class="text-xs sm:text-sm text-on-surface-variant mb-6 leading-relaxed">
              {{ t('stack.backendDesc') }}
            </p>

            <!-- Interactive Icon Mini-Grid -->
            <div class="grid grid-cols-4 gap-2.5 sm:gap-3 mb-6" data-purpose="backend-icon-showcase">
              <div
                v-for="s in backendDisplayStacks"
                :key="s.name"
                class="neu-pill py-2 px-1 sm:py-2.5 sm:px-1.5 rounded-2xl flex flex-col items-center justify-center hover:scale-105 transition-transform group/pill cursor-pointer select-none"
                :title="s.name"
              >
                <!-- Icon Circle Podium -->
                <div class="w-9 h-9 rounded-full neu-icon-circle flex items-center justify-center mb-1 group-hover/pill:neu-inset transition-all">
                  <GeminiIcon v-if="s.gemini" class="w-5 h-5 text-sky-500" />
                  <img
                    v-else-if="s.icon_url && !broken.has(s.name)"
                    :src="s.icon_url"
                    :alt="s.name"
                    class="w-5 h-5 object-contain"
                    loading="lazy"
                    @error="onImgError(s.name)"
                  />
                  <span v-else class="text-xs font-bold text-primary">{{ s.name?.charAt(0) }}</span>
                </div>
                <span class="text-[9.5px] sm:text-[10px] font-bold text-on-surface text-center tracking-tight truncate w-full px-0.5">{{ formatDisplayName(s.name) }}</span>
              </div>
            </div>
          </div>

          <!-- Tags List -->
          <div class="flex flex-wrap gap-2 pt-3 border-t border-outline-variant/30">
            <span
              v-for="tag in backendTags"
              :key="tag"
              class="px-2.5 py-1 text-xs font-medium rounded-lg neu-pill text-on-surface-variant"
            >
              {{ tag }}
            </span>
          </div>
        </article>

        <!-- Data & DevOps Column -->
        <article class="neu-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between" data-category="devops">
          <div>
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-xl font-bold text-on-surface tracking-tight">{{ t('stack.devopsTitle') }}</h3>
              <span class="text-xs font-semibold px-3 py-1 rounded-full text-on-surface-variant neu-inset">
                {{ t('stack.techCount', { n: devopsStacks.length }) }}
              </span>
            </div>
            <p class="text-xs sm:text-sm text-on-surface-variant mb-6 leading-relaxed">
              {{ t('stack.devopsDesc') }}
            </p>

            <!-- Interactive Icon Mini-Grid -->
            <div class="grid grid-cols-4 gap-2.5 sm:gap-3 mb-6" data-purpose="devops-icon-showcase">
              <div
                v-for="s in devopsDisplayStacks"
                :key="s.name"
                class="neu-pill py-2 px-1 sm:py-2.5 sm:px-1.5 rounded-2xl flex flex-col items-center justify-center hover:scale-105 transition-transform group/pill cursor-pointer select-none"
                :title="s.name"
              >
                <!-- Icon Circle Podium -->
                <div class="w-9 h-9 rounded-full neu-icon-circle flex items-center justify-center mb-1 group-hover/pill:neu-inset transition-all">
                  <GeminiIcon v-if="s.gemini" class="w-5 h-5 text-sky-500" />
                  <img
                    v-else-if="s.icon_url && !broken.has(s.name)"
                    :src="s.icon_url"
                    :alt="s.name"
                    class="w-5 h-5 object-contain"
                    loading="lazy"
                    @error="onImgError(s.name)"
                  />
                  <span v-else class="text-xs font-bold text-primary">{{ s.name?.charAt(0) }}</span>
                </div>
                <span class="text-[9.5px] sm:text-[10px] font-bold text-on-surface text-center tracking-tight truncate w-full px-0.5">{{ formatDisplayName(s.name) }}</span>
              </div>
            </div>
          </div>

          <!-- Tags List -->
          <div class="flex flex-wrap gap-2 pt-3 border-t border-outline-variant/30">
            <span
              v-for="tag in devopsTags"
              :key="tag"
              class="px-2.5 py-1 text-xs font-medium rounded-lg neu-pill text-on-surface-variant"
            >
              {{ tag }}
            </span>
          </div>
        </article>
      </section>

      <!-- 2. WideBentoAiSection (High Impact Neumorphic AI Cards) -->
      <section class="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8" data-category="ai" data-purpose="ai-rag-showcase">
        <!-- Card 1: RAG Architecture -->
        <article class="neu-card rounded-3xl p-7 sm:p-9 relative overflow-hidden" data-purpose="rag-architecture-card">
          <!-- Subtle Top Accent Indicator -->
          <div class="flex items-center gap-3 mb-5">
            <div class="w-12 h-12 rounded-2xl neu-icon-circle flex items-center justify-center text-sky-600 dark:text-sky-400">
              <!-- RAG / Vector search pin icon -->
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <span class="text-xs tracking-wider uppercase font-bold text-sky-800 dark:text-sky-300 px-3 py-1 rounded-full neu-pill">
              {{ t('stack.ragBadge') }}
            </span>
          </div>

          <h3 class="text-2xl font-bold text-on-surface tracking-tight mb-3">
            {{ t('stack.ragTitle') }}
          </h3>
          <p class="text-on-surface-variant text-sm sm:text-base leading-relaxed mb-6">
            {{ t('stack.ragDesc') }}
          </p>

          <!-- Vector Stack Badges -->
          <div class="flex flex-wrap gap-2.5">
            <span
              v-for="s in ragStacks"
              :key="s.id || s.name"
              class="px-3.5 py-1.5 rounded-xl neu-pill text-xs font-semibold text-sky-900/90 dark:text-sky-200 bg-sky-500/10 hover:scale-105 transition-transform cursor-default select-none"
            >
              {{ s.name }}
            </span>
          </div>
        </article>

        <!-- Card 2: LLM Integration & Automation -->
        <article class="neu-card rounded-3xl p-7 sm:p-9 relative overflow-hidden" data-purpose="llm-integration-card">
          <!-- Subtle Top Accent Indicator -->
          <div class="flex items-center gap-3 mb-5">
            <div class="w-12 h-12 rounded-2xl neu-icon-circle flex items-center justify-center text-sky-600 dark:text-sky-400">
              <!-- AI neural spark icon -->
              <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" />
              </svg>
            </div>
            <span class="text-xs tracking-wider uppercase font-bold text-sky-800 dark:text-sky-300 px-3 py-1 rounded-full neu-pill">
              {{ t('stack.llmBadge') }}
            </span>
          </div>

          <h3 class="text-2xl font-bold text-on-surface tracking-tight mb-3">
            {{ t('stack.llmTitle') }}
          </h3>
          <p class="text-on-surface-variant text-sm sm:text-base leading-relaxed mb-6">
            {{ t('stack.llmDesc') }}
          </p>

          <!-- LLM Stack Badges -->
          <div class="flex flex-wrap gap-2.5">
            <span
              v-for="s in llmStacks"
              :key="s.id || s.name"
              class="px-3.5 py-1.5 rounded-xl neu-pill text-xs font-semibold text-sky-900/90 dark:text-sky-200 bg-sky-500/10 hover:scale-105 transition-transform cursor-default select-none"
            >
              {{ s.name }}
            </span>
          </div>
        </article>
      </section>
    </div>
  </motion.section>
</template>

<style scoped>
/* ========================================================
   NEUMORPHIC BENTO SYSTEM (new ui techstack section.html)
   ======================================================== */

.neu-card {
  background: var(--surface-card);
  box-shadow: 10px 10px 24px rgba(166, 180, 200, 0.48), 
             -10px -10px 24px rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.65);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.neu-card:hover {
  box-shadow: 6px 6px 16px rgba(166, 180, 200, 0.4), 
             -6px -6px 16px rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
}

.neu-pill {
  background: var(--surface-card);
  box-shadow: 4px 4px 10px rgba(166, 180, 200, 0.38), 
             -4px -4px 10px rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.55);
}

.neu-inset {
  background: var(--surface-card);
  box-shadow: inset 3px 3px 7px rgba(166, 180, 200, 0.4), 
              inset -3px -3px 7px rgba(255, 255, 255, 0.85);
}

.neu-icon-circle {
  background: var(--surface-card);
  box-shadow: 5px 5px 12px rgba(166, 180, 200, 0.45), 
             -5px -5px 12px rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.7);
}

/* Dark mode adaptability */
:global(.dark) .neu-card {
  background: #182234;
  box-shadow: 8px 8px 20px rgba(0, 0, 0, 0.45), 
             -6px -6px 16px rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

:global(.dark) .neu-pill {
  background: #182234;
  box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.4), 
             -3px -3px 8px rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

:global(.dark) .neu-inset {
  background: #141c2c;
  box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.5), 
              inset -2px -2px 5px rgba(255, 255, 255, 0.05);
}

:global(.dark) .neu-icon-circle {
  background: #182234;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.45), 
             -4px -4px 10px rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
</style>