<script setup lang="ts">
import { motion } from 'motion-v'

const props = defineProps<{
  thoughts: any
}>()
const { t, locale } = useI18n()

const all = computed(() => props.thoughts ?? [])
const activeCategory = ref('all')

// 2-Button Filter System State
const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

onClickOutside(dropdownRef, () => {
  dropdownOpen.value = false
})

const categoryList = computed(() => {
  const set = new Set<string>()
  for (const th of all.value) {
    for (const c of (th.category ?? [])) {
      if (c) set.add(c)
    }
  }
  return Array.from(set).sort().map((c) => ({
    label: c,
    value: c,
    count: all.value.filter((th) => (th.category ?? []).includes(c)).length,
  }))
})

const filtered = computed(() => {
  if (activeCategory.value === 'all') return all.value
  return all.value.filter((th) => (th.category ?? []).includes(activeCategory.value))
})

const formatDate = (iso: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : 'id-ID', {
    month: 'short',
    year: 'numeric',
  }).format(d)
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && dropdownOpen.value) {
    dropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <motion.section
    id="thoughts"
    class="w-full flex flex-col gap-8 relative z-10 scroll-mt-24"
    :initial="{ opacity: 0, y: 40 }"
    :while-in-view="{ opacity: 1, y: 0 }"
    :viewport="{ once: true, margin: '-80px' }"
    :transition="{ duration: 0.7 }"
  >
    <div class="flex flex-col gap-3">
      <SectionHeading :eyebrow="t('thoughts.pretitle')">
        {{ t('thoughts.title') }}
      </SectionHeading>
      <p class="body-lg text-on-surface-variant max-w-2xl">{{ t('thoughts.subtitle') }}</p>
    </div>

    <!-- 2-Button Filter System (Public Monolog) -->
    <div class="flex items-center gap-3 flex-wrap">
      <!-- Button 1: Semua (All) -->
      <button
        type="button"
        class="px-5 py-2.5 rounded-full body-md transition-all duration-300 flex items-center gap-2.5 cursor-pointer"
        :class="activeCategory === 'all'
          ? 'neu-pressed text-primary font-bold shadow-inner'
          : 'neu-raised text-on-surface-variant hover:text-on-surface hover:scale-105 active:scale-95'"
        @click="activeCategory === 'all'; dropdownOpen = false"
      >
        <span>{{ t('thoughts.all') }}</span>
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

    <div v-if="!filtered.length" class="neu-raised rounded-card p-10 text-center">
      <p class="body-md text-on-surface-variant">{{ t('thoughts.empty') }}</p>
    </div>

    <div v-else class="flex flex-col gap-5">
      <NuxtLink
        v-for="th in filtered"
        :key="th.slug"
        :to="'/thoughts/' + th.slug"
        class="group w-full text-left neu-raised rounded-card p-6 md:p-7 flex flex-col gap-3 hover:scale-[1.01] transition-transform duration-300 cursor-pointer"
      >
        <div class="flex flex-wrap items-center gap-3">
          <span
            v-for="cat in (th.category ?? []).slice(0, 2)"
            :key="cat"
            class="px-3 py-1 rounded-full neu-pressed label-caps text-primary text-[10px]"
          >
            {{ cat }}
          </span>
          <span class="w-1 h-1 rounded-full bg-on-surface-variant/40" />
          <span class="label-caps text-on-surface-variant text-[11px]">
            {{ t('thoughts.readTime', { n: th.read_time_minutes ?? 1 }) }}
          </span>
          <span class="w-1 h-1 rounded-full bg-on-surface-variant/40" />
          <span class="label-caps text-on-surface-variant text-[11px]">{{ formatDate(th.created_at) }}</span>
          <span class="w-1 h-1 rounded-full bg-on-surface-variant/40" />
          <span class="label-caps text-on-surface-variant text-[11px] flex items-center gap-1">
            <Icon name="ph:eye-bold" class="text-xs" />
            {{ t('thoughts.views', { n: th.views_count ?? 0 }) }}
          </span>
        </div>
        <h3 class="headline-lg text-on-surface group-hover:text-primary transition-colors leading-snug">
          {{ locale === 'en' ? th.title_en || th.title_id : th.title_id }}
        </h3>
        <div class="flex items-center gap-2 mt-1">
          <span class="body-md font-bold text-primary flex items-center gap-1.5">
            {{ t('thoughts.readArticle') }}
            <Icon name="ph:arrow-right-bold" class="text-lg group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </NuxtLink>
    </div>
  </motion.section>
</template>