<script setup lang="ts">
import { motion } from 'motion-v'

const props = defineProps<{
  thoughts: any
}>()
const { t, locale } = useI18n()

const all = computed(() => props.thoughts ?? [])
const activeCategory = ref('all')
const reader = ref<any>(null)
const readerLoading = ref(false)
const readerOpen = ref(false)

const categories = computed(() => {
  const set = new Set<string>()
  for (const th of all.value) for (const c of (th.category ?? [])) set.add(c)
  return [
    { label: t('thoughts.all'), value: 'all' },
    ...[...set].sort().map((c) => ({ label: c, value: c })),
  ]
})

const filtered = computed(() => {
  if (activeCategory.value === 'all') return all.value
  return all.value.filter((th) => (th.category ?? []).includes(activeCategory.value))
})

const formatDate = (iso: string) => {
  const d = new Date(iso)
  return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : 'id-ID', {
    month: 'short',
    year: 'numeric',
  }).format(d)
}

const openReader = async (th: any) => {
  readerLoading.value = true
  readerOpen.value = true
  document.body.style.overflow = 'hidden'
  try {
    const { api } = useApi()
    const { data } = await api.get(`/thoughts/${th.slug}`)
    reader.value = data
  } catch {
    reader.value = th
  } finally {
    readerLoading.value = false
  }
}

const closeReader = () => {
  readerOpen.value = false
  reader.value = null
  document.body.style.overflow = ''
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && readerOpen.value) closeReader()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
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
      <SectionHeading :eyebrow="t('thoughts.title')">
        {{ t('thoughts.title') }}
      </SectionHeading>
      <p class="body-lg text-on-surface-variant max-w-2xl">{{ t('thoughts.subtitle') }}</p>
    </div>

    <div class="flex flex-wrap gap-3" role="tablist">
      <button
        v-for="c in categories"
        :key="c.value"
        :aria-selected="activeCategory === c.value"
        class="px-5 py-2.5 rounded-full body-md transition-all"
        :class="activeCategory === c.value ? 'neu-pressed text-primary font-bold' : 'neu-raised text-on-surface-variant hover:text-on-surface hover:scale-105 active:scale-95'"
        @click="activeCategory = c.value"
      >
        {{ c.label }}
      </button>
    </div>

    <div v-if="!filtered.length" class="neu-raised rounded-card p-10 text-center">
      <p class="body-md text-on-surface-variant">{{ t('thoughts.empty') }}</p>
    </div>

    <div v-else class="flex flex-col gap-5">
      <button
        v-for="th in filtered"
        :key="th.slug"
        class="group w-full text-left neu-raised rounded-card p-6 md:p-7 flex flex-col gap-3 hover:scale-[1.01] transition-transform duration-300 cursor-pointer"
        @click="openReader(th)"
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
      </button>
    </div>
  </motion.section>

  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="readerOpen" class="fixed inset-0 z-[120]" role="dialog" aria-modal="true">
        <div class="absolute inset-0 bg-surface-base/70 backdrop-blur-xl backdrop-saturate-150" @click="closeReader" />

        <div class="absolute inset-[20px] neu-raised rounded-[20px] overflow-hidden flex flex-col bg-surface-card">
          <div class="flex items-center justify-between gap-3 px-6 py-4 border-b border-outline-variant/50 bg-surface-card shrink-0">
            <div class="flex items-center gap-3 min-w-0">
              <button
                class="w-10 h-10 rounded-full neu-pressed flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors shrink-0"
                :aria-label="t('thoughts.back')"
                @click="closeReader"
              >
                <Icon name="ph:x-bold" class="text-xl" />
              </button>
              <h2 class="title-md text-on-surface truncate">{{ reader?.title_id ?? '' }}</h2>
            </div>
          </div>

          <div class="flex-1 min-h-0 overflow-y-auto">
            <div v-if="readerLoading" class="p-8 max-w-4xl mx-auto flex flex-col gap-6">
              <div class="neu-raised rounded-card p-6 h-14 animate-pulse" />
              <div v-for="i in 6" :key="i" class="neu-raised rounded-card p-6 h-16 animate-pulse" />
            </div>

            <article v-else-if="reader" class="w-full max-w-4xl mx-auto flex flex-col gap-6 px-6 md:px-10 py-10 pb-20">
              <div class="flex flex-col gap-4">
                <div class="flex flex-wrap items-center gap-3">
                  <span
                    v-for="cat in (reader.category ?? [])"
                    :key="cat"
                    class="px-3 py-1 rounded-full neu-pressed label-caps text-primary text-[10px]"
                  >
                    {{ cat }}
                  </span>
                  <span class="w-1 h-1 rounded-full bg-on-surface-variant/40" />
                  <span class="label-caps text-on-surface-variant text-[11px]">
                    {{ t('thoughts.readTime', { n: reader.read_time_minutes ?? 1 }) }}
                  </span>
                  <span class="w-1 h-1 rounded-full bg-on-surface-variant/40" />
                  <span class="label-caps text-on-surface-variant text-[11px]">{{ formatDate(reader.created_at) }}</span>
                  <span class="w-1 h-1 rounded-full bg-on-surface-variant/40" />
                  <span class="label-caps text-on-surface-variant text-[11px] flex items-center gap-1">
                    <Icon name="ph:eye-bold" class="text-xs" />
                    {{ t('thoughts.views', { n: reader.views_count ?? 0 }) }}
                  </span>
                </div>
                <h1 class="display-lg text-on-surface leading-tight">
                  {{ locale === 'en' ? reader.title_en || reader.title_id : reader.title_id }}
                </h1>
              </div>

              <div v-if="reader.cover_image_url" class="w-full h-[280px] md:h-[380px] neu-raised rounded-card p-3 overflow-hidden">
                <img
                  :src="reader.cover_image_url"
                  :alt="reader.image_alt_text ?? reader.title_id"
                  loading="lazy"
                  class="w-full h-full rounded-[14px] object-cover"
                />
              </div>

              <div
                class="body-lg text-on-surface leading-relaxed whitespace-pre-line"
              >{{ locale === 'en' ? reader.content_en || reader.content_id : reader.content_id }}</div>
            </article>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>