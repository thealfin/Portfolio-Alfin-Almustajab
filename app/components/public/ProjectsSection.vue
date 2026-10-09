<script setup lang="ts">
import { motion } from 'motion-v'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getTechIcon } from '~/utils/techIcons'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps<{
  projects: any
  stacks?: any[]
}>()
const { t } = useI18n()
const { pick } = useLocale()

const stackMap = computed(() => {
  const map = new Map<string, any>()
  for (const s of (props.stacks ?? [])) {
    if (s?.name) {
      map.set(s.name.toLowerCase().trim(), s)
    }
  }
  return map
})

const getStackData = (techName: string) => {
  if (!techName) return null
  return stackMap.value.get(techName.toLowerCase().trim()) ?? null
}

const all = computed(() => props.projects ?? [])
const activeCategory = ref('all')
const detail = ref<any>(null)
const detailLoading = ref(false)
const detailOpen = ref(false)

// 2-Button Filter System State
const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

onClickOutside(dropdownRef, () => {
  dropdownOpen.value = false
})

const categoryList = computed(() => {
  const set = new Set<string>()
  for (const p of all.value) {
    for (const c of (p.category ?? [])) {
      if (c) set.add(c)
    }
  }
  return Array.from(set).sort().map((c) => ({
    label: c,
    value: c,
    count: all.value.filter((p) => (p.category ?? []).includes(c)).length,
  }))
})

const filtered = computed(() => {
  if (activeCategory.value === 'all') return all.value
  return all.value.filter((p) => (p.category ?? []).includes(activeCategory.value))
})

const cardRefs = ref<HTMLElement[]>([])

const openDetail = async (p: any) => {
  detailLoading.value = true
  detailOpen.value = true
  document.body.style.overflow = 'hidden'
  try {
    const { api } = useApi()
    const { data } = await api.get(`/projects/${p.slug}`)
    detail.value = data
  } catch {
    detail.value = p
  } finally {
    detailLoading.value = false
  }
}

const closeDetail = () => {
  detailOpen.value = false
  detail.value = null
  document.body.style.overflow = ''
}

const statusClass = (status?: string) => {
  const map: Record<string, string> = {
    Completed: 'text-[#10B981] bg-[#10B981]/10',
    'In Progress': 'text-[#0EA5E9] bg-[#0EA5E9]/10',
    'On Hold': 'text-[#F59E0B] bg-[#F59E0B]/10',
    Archived: 'text-on-surface-variant bg-on-surface-variant/10',
  }
  return map[status ?? ''] ?? 'text-primary bg-primary/10'
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    if (dropdownOpen.value) dropdownOpen.value = false
    else if (detailOpen.value) closeDetail()
  }
}

// GSAP Ticker & Scroll Interpolation for Card Stacking
const updateCardScales = () => {
  const cards = cardRefs.value.filter(Boolean)
  if (!cards.length) return
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    cards.forEach((c) => { c.style.transform = '' })
    return
  }

  const isMobile = window.innerWidth < 768
  const baseOffset = isMobile ? 74 : 88
  const step = isMobile ? 18 : 22
  const range = Math.max(160, 0.25 * window.innerHeight)

  cards.forEach((card, idx) => {
    const nextCard = cards[idx + 1]
    if (!nextCard) {
      card.style.transform = 'scale(1)'
      return
    }

    const stackTop = baseOffset + idx * step
    const nextRectTop = nextCard.getBoundingClientRect().top
    const progress = Math.max(0, Math.min(1, (stackTop + range - nextRectTop) / range))
    const total = cards.length
    const depthRatio = total > 1 ? (total - 1 - idx) / (total - 1) : 1
    const scale = 1 - progress * (0.12 * depthRatio)
    card.style.transform = `scale(${scale.toFixed(4)})`
  })
}

const initScrollStack = () => {
  gsap.ticker.remove(updateCardScales)
  if (typeof window === 'undefined') return

  const cards = cardRefs.value.filter(Boolean)
  if (!cards.length) return

  cards.forEach((c) => {
    c.style.transform = 'scale(1)'
  })

  gsap.ticker.add(updateCardScales)
  window.addEventListener('scroll', updateCardScales, { passive: true })
  window.addEventListener('resize', updateCardScales, { passive: true })
  updateCardScales()
}

watch(filtered, async () => {
  cardRefs.value = []
  await nextTick()
  initScrollStack()
})

onMounted(() => {
  document.addEventListener('keydown', onKeydown)
  nextTick(() => {
    setTimeout(initScrollStack, 150)
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
  gsap.ticker.remove(updateCardScales)
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', updateCardScales)
    window.removeEventListener('resize', updateCardScales)
  }
})
</script>

<template>
  <section
    id="projects"
    class="w-full flex flex-col gap-8 relative z-10 scroll-mt-24"
  >
    <!-- Heading with entry motion -->
    <motion.div
      class="flex flex-col gap-3"
      :initial="{ opacity: 0, y: 30 }"
      :while-in-view="{ opacity: 1, y: 0 }"
      :viewport="{ once: true, margin: '-60px' }"
      :transition="{ duration: 0.6 }"
    >
      <SectionHeading :eyebrow="t('featured.pretitle')">
        {{ t('featured.title') }}
      </SectionHeading>
      <p class="body-lg text-on-surface-variant max-w-2xl">{{ t('projects.subtitle') }}</p>
    </motion.div>

    <!-- 2 BUTTONS FILTER SYSTEM: 1. All/Semua & 2. Dropdown Option Button -->
    <div class="flex items-center gap-3 relative z-30" role="tablist">
      <!-- Button 1: Semua -->
      <button
        type="button"
        :aria-selected="activeCategory === 'all'"
        class="px-5 py-2.5 rounded-full body-md transition-all duration-300 flex items-center gap-2 cursor-pointer"
        :class="activeCategory === 'all'
          ? 'neu-pressed text-primary font-bold shadow-inner'
          : 'neu-raised text-on-surface-variant hover:text-on-surface hover:scale-105 active:scale-95'"
        @click="activeCategory = 'all'; dropdownOpen = false"
      >
        <span>{{ t('projects.all') }}</span>
        <span
          class="neu-pressed px-2 py-0.5 rounded-full text-[11px] font-bold"
          :class="activeCategory === 'all' ? 'text-primary' : 'text-on-surface-variant'"
        >
          {{ all.length }}
        </span>
      </button>

      <!-- Button 2: Option Dropdown Filter Tag -->
      <div ref="dropdownRef" class="relative">
        <button
          type="button"
          class="px-5 py-2.5 rounded-full body-md transition-all duration-300 flex items-center gap-2.5 cursor-pointer"
          :class="activeCategory !== 'all'
            ? 'neu-pressed text-primary font-bold shadow-inner'
            : 'neu-raised text-on-surface-variant hover:text-on-surface hover:scale-105 active:scale-95'"
          @click="dropdownOpen = !dropdownOpen"
        >
          <Icon name="ph:funnel-bold" class="text-base" />
          <span v-if="activeCategory === 'all'">Filter Kategori</span>
          <span v-else class="flex items-center gap-1.5 font-bold">
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>{{ activeCategory }}</span>
          </span>
          <Icon
            name="ph:caret-down-bold"
            class="text-xs transition-transform duration-300"
            :class="dropdownOpen ? 'rotate-180' : ''"
          />
        </button>

        <!-- Floating Dropdown Popover -->
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 translate-y-2 scale-95"
          enter-to-class="opacity-100 translate-y-0 scale-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 translate-y-0 scale-100"
          leave-to-class="opacity-0 translate-y-2 scale-95"
        >
          <div
            v-if="dropdownOpen"
            class="absolute left-0 mt-2 w-64 max-h-72 overflow-y-auto neu-island bg-surface-card rounded-2xl p-2 shadow-2xl border border-outline-variant/30 flex flex-col gap-1 z-50 backdrop-blur-xl"
          >
            <button
              v-for="cat in categoryList"
              :key="cat.value"
              type="button"
              class="w-full px-3.5 py-2 rounded-xl text-left body-sm flex items-center justify-between transition-all duration-200 cursor-pointer"
              :class="activeCategory === cat.value
                ? 'neu-pressed text-primary font-bold'
                : 'hover:neu-pressed text-on-surface-variant hover:text-on-surface'"
              @click="activeCategory = cat.value; dropdownOpen = false"
            >
              <span class="truncate">{{ cat.label }}</span>
              <div class="flex items-center gap-2 shrink-0">
                <span class="neu-pressed px-2 py-0.5 rounded-full text-[10px] font-bold text-on-surface-variant">
                  {{ cat.count }}
                </span>
                <Icon v-if="activeCategory === cat.value" name="ph:check-bold" class="text-xs text-primary" />
              </div>
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <!-- Scroll Stack Container -->
    <div class="relative w-full flex flex-col">
      <NuxtLink
        v-for="(p, i) in filtered"
        :key="p.slug"
        :to="'/projects/' + p.slug"
        :ref="(el) => { if (el) cardRefs[i] = ((el as any).$el || el) as HTMLElement }"
        class="scroll-stack-card sticky origin-top transform-gpu will-change-transform group relative w-full flex flex-col md:flex-row items-center gap-6 sm:gap-8 md:gap-10 p-5 sm:p-7 md:p-9 rounded-[28px] sm:rounded-[32px] neu-raised hover:shadow-2xl transition-[box-shadow] duration-500 cursor-pointer"
        :class="[
          i % 2 === 1 ? 'md:flex-row-reverse' : '',
          i === filtered.length - 1 ? 'mb-0' : 'mb-20 sm:mb-24'
        ]"
        :style="{
          top: `${88 + i * 22}px`,
          zIndex: i + 1,
        }"
      >
        <!-- Project Info Column -->
        <div
          class="w-full md:w-1/2 flex flex-col gap-4 sm:gap-5 relative z-10"
          :class="i % 2 === 1 ? 'pr-0 md:pr-4 text-left md:text-right' : 'pl-0 md:pl-4'"
        >
          <!-- Top Tags & Status -->
          <div class="flex flex-wrap items-center gap-2" :class="i % 2 === 1 ? 'justify-start md:justify-end' : ''">
            <span
              v-if="p.status"
              class="px-3 py-1 rounded-full label-caps text-[10px] font-bold"
              :class="statusClass(p.status)"
            >
              {{ p.status }}
            </span>
            <span
              v-for="cat in (p.category ?? []).slice(0, 2)"
              :key="cat"
              class="neu-pressed px-3.5 py-1.5 rounded-full label-caps text-on-surface text-[10px]"
            >
              {{ cat }}
            </span>
            <span class="label-caps text-on-surface-variant flex items-center font-bold px-1">{{ p.year }}</span>
          </div>

          <!-- Title & Summary -->
          <h3 class="title-md text-[24px] sm:text-[28px] md:text-[32px] leading-tight text-on-surface group-hover:text-primary transition-colors font-extrabold">
            {{ p.title }}
          </h3>
          <p class="body-md text-on-surface-variant line-clamp-3 sm:line-clamp-none leading-relaxed">
            {{ pick(p, 'summary') }}
          </p>

          <!-- Squircle Tech Stack Badges -->
          <div class="flex flex-wrap items-center gap-2 pt-1" :class="i % 2 === 1 ? 'justify-start md:justify-end' : ''">
            <div
              v-for="tech in (p.tech_stack ?? []).slice(0, 6)"
              :key="tech"
              class="group/tech relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl neu-pressed flex items-center justify-center hover:-translate-y-1 hover:shadow-md transition-all duration-200 cursor-pointer p-1.5"
              :title="tech"
              @click.stop
            >
              <img
                v-if="getStackData(tech)?.icon_url"
                :src="getStackData(tech).icon_url"
                :alt="tech"
                class="w-5 h-5 object-contain group-hover/tech:scale-110 transition-transform"
                loading="lazy"
              />
              <GeminiIcon
                v-else-if="getStackData(tech)?.gemini"
                class="w-5 h-5 text-sky-500 group-hover/tech:scale-110 transition-transform"
              />
              <Icon
                v-else
                :name="getTechIcon(tech)"
                class="text-lg sm:text-xl text-on-surface group-hover/tech:scale-110 transition-transform"
              />
              <!-- Tooltip -->
              <span class="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-[10px] font-bold bg-surface-card border border-outline-variant/30 text-on-surface opacity-0 group-hover/tech:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-sm z-30">
                {{ tech }}
              </span>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="pt-2 flex items-center gap-3" :class="i % 2 === 1 ? 'md:justify-end' : ''">
            <span class="neu-raised px-5 py-2.5 rounded-full body-md text-on-surface font-bold group-hover:text-primary transition-colors flex items-center gap-2">
              {{ t('projects.viewDetail') }}
              <Icon name="ph:arrow-right-bold" class="text-base group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>

        <!-- Project Visual Column -->
        <div class="w-full md:w-1/2 aspect-[16/10] sm:aspect-video md:aspect-[16/10] neu-pressed p-2 sm:p-3 rounded-[22px] sm:rounded-[26px] relative overflow-hidden group/visual">
          <div class="w-full h-full rounded-[16px] sm:rounded-[20px] overflow-hidden bg-surface-container flex items-center justify-center relative">
            <!-- Small Project Number Badge in Top Corner (Opposite Tags) -->
            <div
              class="absolute top-2.5 sm:top-3.5 z-20 px-3 py-1 rounded-full neu-island bg-surface-card/90 text-primary font-bold text-[10px] sm:text-[11px] tracking-wider select-none flex items-center gap-1.5 backdrop-blur-md"
              :class="i % 2 === 1 ? 'left-2.5 sm:left-3.5' : 'right-2.5 sm:right-3.5'"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span>PROJECT {{ String(i + 1).padStart(2, '0') }} / {{ String(filtered.length).padStart(2, '0') }}</span>
            </div>

            <!-- Floating View Live Button (if available) -->
            <div v-if="p.live_url" class="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-20" @click.stop>
              <a
                :href="p.live_url"
                target="_blank"
                rel="noopener"
                class="neu-accent px-3 py-1.5 rounded-full text-xs font-bold text-on-primary flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-transform shadow-md"
                title="View Live"
              >
                <span>View live</span>
                <Icon name="ph:arrow-up-right-bold" class="text-xs" />
              </a>
            </div>

            <!-- Image preview with object-contain/object-cover balance -->
            <img
              v-if="p.cover_image_url"
              :src="p.cover_image_url"
              :alt="p.title"
              loading="lazy"
              class="w-full h-full object-contain sm:object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <span v-else class="text-6xl text-primary/15 font-extrabold select-none">{{ p.title?.charAt(0) }}</span>
          </div>
        </div>
      </NuxtLink>

      <!-- Bottom spacer so last card has comfortable scroll settling room -->
      <div class="h-[12vh] min-h-[90px]" aria-hidden="true" />
    </div>
  </section>

  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="detailOpen" class="fixed inset-0 z-[120]" role="dialog" aria-modal="true">
        <div class="absolute inset-0 bg-surface-base/70 backdrop-blur-xl backdrop-saturate-150" @click="closeDetail" />

        <div class="absolute inset-2 sm:inset-4 md:inset-[20px] neu-raised rounded-[20px] overflow-hidden flex flex-col bg-surface-card">
          <div class="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-outline-variant/50 bg-surface-card shrink-0">
            <div class="flex items-center gap-3 min-w-0">
              <button
                class="w-10 h-10 rounded-full neu-pressed flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors shrink-0"
                :aria-label="t('projects.backToProjects')"
                @click="closeDetail"
              >
                <Icon name="ph:x-bold" class="text-xl" />
              </button>
              <h2 class="title-md text-on-surface truncate">{{ detail?.title ?? '' }}</h2>
            </div>
          </div>

          <div class="flex-1 min-h-0 overflow-y-auto">
            <div v-if="detailLoading" class="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12">
              <div class="lg:col-span-8 flex flex-col gap-6">
                <div class="neu-pressed rounded-card p-3 aspect-[16/10] sm:aspect-video animate-pulse" />
                <div v-for="i in 3" :key="i" class="neu-raised rounded-card p-6 h-24 animate-pulse" />
              </div>
              <div class="lg:col-span-4 neu-raised rounded-card p-8 h-96 animate-pulse" />
            </div>

            <div v-else-if="detail" class="w-full max-w-7xl mx-auto flex flex-col gap-8 sm:gap-12 px-4 sm:px-6 md:px-10 py-6 sm:py-8 pb-16">
              <div class="flex flex-col gap-4 sm:gap-5 w-full max-w-4xl">
                <h1 class="display-lg text-on-surface">{{ detail.title }}</h1>
                <div class="flex flex-wrap gap-2.5 sm:gap-4">
                  <span
                    v-for="cat in (detail.category ?? [])"
                    :key="cat"
                    class="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full neu-pressed text-primary label-caps"
                  >
                    {{ cat }}
                  </span>
                  <span v-if="detail.year" class="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-full neu-pressed text-on-surface-variant label-caps">
                    {{ detail.year }}
                  </span>
                </div>
              </div>

              <!-- Main Project Image: Responsive Landscape & 100% Fit (No Border Cropping) -->
              <div class="w-full aspect-[16/10] sm:aspect-video md:aspect-[16/9] max-h-[540px] neu-raised rounded-[20px] sm:rounded-card p-2 sm:p-3 md:p-4 relative overflow-hidden group">
                <div class="w-full h-full rounded-[14px] sm:rounded-[18px] overflow-hidden bg-surface-container relative flex items-center justify-center">
                  <!-- Ambient soft blur layer to blend edge padding naturally -->
                  <img
                    v-if="detail.cover_image_url"
                    :src="detail.cover_image_url"
                    :alt="detail.title"
                    class="absolute inset-0 w-full h-full object-cover blur-2xl opacity-20 scale-110 pointer-events-none"
                    aria-hidden="true"
                  />
                  <!-- 100% visible, complete screenshot without any edge cropping -->
                  <img
                    v-if="detail.cover_image_url"
                    :src="detail.cover_image_url"
                    :alt="detail.title"
                    class="relative z-10 w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.01]"
                  />
                  <span v-else class="text-7xl text-primary/15 font-extrabold select-none">{{ detail.title?.charAt(0) }}</span>
                </div>
              </div>

              <div class="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 relative items-start">
                <div class="lg:col-span-8 flex flex-col gap-8 sm:gap-12">
                  <div class="flex flex-col gap-4 relative">
                    <h2 class="title-md text-on-surface">{{ t('projectDetail.challenge') }}</h2>
                    <p class="body-lg text-on-surface-variant leading-relaxed">{{ pick(detail, 'challenge') }}</p>
                  </div>

                  <div class="flex flex-col gap-4 relative">
                    <h2 class="title-md text-on-surface">{{ t('projectDetail.role') }}</h2>
                    <p class="body-lg text-on-surface-variant leading-relaxed">{{ pick(detail, 'role_description') }}</p>
                  </div>

                  <div class="flex flex-col gap-4 relative">
                    <h2 class="title-md text-on-surface">{{ t('projectDetail.techStack') }}</h2>
                    <div class="flex flex-wrap gap-3 mt-2">
                      <div
                        v-for="tech in (detail.tech_stack ?? [])"
                        :key="tech"
                        class="neu-raised px-4 py-3 rounded-[16px] flex items-center gap-3 hover:-translate-y-0.5 transition-transform"
                      >
                        <div class="w-8 h-8 rounded-lg neu-pressed flex items-center justify-center p-1">
                          <img
                            v-if="getStackData(tech)?.icon_url"
                            :src="getStackData(tech).icon_url"
                            :alt="tech"
                            class="w-5 h-5 object-contain"
                            loading="lazy"
                          />
                          <GeminiIcon
                            v-else-if="getStackData(tech)?.gemini"
                            class="w-5 h-5 text-sky-500"
                          />
                          <Icon
                            v-else
                            :name="getTechIcon(tech)"
                            class="text-lg text-primary"
                          />
                        </div>
                        <span class="body-md text-on-surface font-bold">{{ tech }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="lg:col-span-4 lg:sticky lg:top-8 flex flex-col gap-8 neu-raised p-6 sm:p-8 rounded-card">
                  <h3 class="title-md text-on-surface pb-4 relative">
                    {{ t('projectDetail.details') }}
                    <span class="absolute bottom-0 left-0 w-12 h-1 bg-primary rounded-full" />
                  </h3>
                  <div class="flex flex-col gap-4">
                    <div class="flex justify-between items-center py-2">
                      <span class="label-caps text-on-surface-variant">{{ t('projectDetail.client') }}</span>
                      <span class="body-md text-on-surface font-bold text-right">{{ detail.client || '—' }}</span>
                    </div>
                    <div class="flex justify-between items-center py-2">
                      <span class="label-caps text-on-surface-variant">{{ t('projectDetail.year') }}</span>
                      <span class="body-md text-on-surface font-bold">{{ detail.year }}</span>
                    </div>
                    <div class="flex justify-between items-center py-2">
                      <span class="label-caps text-on-surface-variant">{{ t('projectDetail.status') }}</span>
                      <span
                        class="body-md font-bold px-3 py-1 rounded-full flex items-center gap-1.5"
                        :class="statusClass(detail.status)"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-current" />
                        {{ detail.status || t('projectDetail.unknownStatus') }}
                      </span>
                    </div>
                  </div>
                  <div class="flex flex-col gap-4 mt-2">
                    <a
                      v-if="detail.live_url"
                      :href="detail.live_url"
                      target="_blank"
                      rel="noopener"
                      class="w-full py-4 rounded-full neu-accent flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-transform group"
                    >
                      <span class="body-md font-bold text-on-primary">{{ t('projectDetail.viewLive') }}</span>
                      <Icon name="ph:arrow-right-bold" class="text-on-primary text-xl group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a
                      v-if="detail.repo_url"
                      :href="detail.repo_url"
                      target="_blank"
                      rel="noopener"
                      class="w-full py-4 rounded-full neu-raised flex items-center justify-center gap-2 hover:text-primary transition-colors"
                    >
                      <span class="body-md font-bold">{{ t('projectDetail.githubRepo') }}</span>
                      <Icon name="ph:arrow-square-out-bold" class="text-xl" />
                    </a>
                  </div>
                </div>
              </div>

              <!-- Project Media Gallery with Responsive Fit -->
              <div v-if="(detail.project_media ?? []).length" class="w-full flex flex-col gap-8 mt-8">
                <h2 class="title-md text-on-surface">{{ t('projectDetail.gallery') }}</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div
                    v-for="m in detail.project_media"
                    :key="m.id"
                    class="neu-raised rounded-[20px] sm:rounded-card p-2 sm:p-3 aspect-[16/10] sm:aspect-square group cursor-pointer"
                  >
                    <div class="w-full h-full rounded-[14px] sm:rounded-[16px] overflow-hidden bg-surface-container relative flex items-center justify-center">
                      <img
                        :src="m.image_url"
                        :alt="m.caption ?? detail.title"
                        loading="lazy"
                        class="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>