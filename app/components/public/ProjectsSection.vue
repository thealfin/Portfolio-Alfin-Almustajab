<script setup lang="ts">
import { motion } from 'motion-v'

const props = defineProps<{
  projects: any
}>()
const { t } = useI18n()
const { pick } = useLocale()

const all = computed(() => props.projects ?? [])
const activeCategory = ref('all')
const detail = ref<any>(null)
const detailLoading = ref(false)
const detailOpen = ref(false)

const categories = computed(() => {
  const set = new Set<string>()
  for (const p of all.value) for (const c of (p.category ?? [])) set.add(c)
  return [
    { label: t('projects.all'), value: 'all' },
    ...[...set].sort().map((c) => ({ label: c, value: c })),
  ]
})

const filtered = computed(() => {
  if (activeCategory.value === 'all') return all.value
  return all.value.filter((p) => (p.category ?? []).includes(activeCategory.value))
})

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
  if (e.key === 'Escape' && detailOpen.value) closeDetail()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <motion.section
    id="projects"
    class="w-full flex flex-col gap-8 relative z-10 scroll-mt-24"
    :initial="{ opacity: 0, y: 40 }"
    :while-in-view="{ opacity: 1, y: 0 }"
    :viewport="{ once: true, margin: '-80px' }"
    :transition="{ duration: 0.7 }"
  >
    <div class="flex flex-col gap-3">
      <SectionHeading :eyebrow="t('featured.pretitle')">
        {{ t('featured.title') }}
      </SectionHeading>
      <p class="body-lg text-on-surface-variant max-w-2xl">{{ t('projects.subtitle') }}</p>
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

    <div class="flex flex-col gap-10">
      <article
        v-for="(p, i) in filtered"
        :key="p.slug"
        class="group relative w-full flex flex-col md:flex-row items-center gap-10 p-8 rounded-[32px] neu-raised hover:scale-[1.01] transition-transform duration-500 cursor-pointer"
        :class="i % 2 === 1 ? 'md:flex-row-reverse' : ''"
        @click="openDetail(p)"
      >
        <div
          class="absolute top-1/2 -translate-y-1/2 display-lg text-[120px] text-on-surface-variant/30 select-none hidden md:block z-0 group-hover:text-primary transition-colors duration-500"
          :class="i % 2 === 1 ? '-right-6' : '-left-6'"
        >
          {{ String(i + 1).padStart(2, '0') }}
        </div>

        <div
          class="w-full md:w-1/2 flex flex-col gap-6 relative z-10"
          :class="i % 2 === 1 ? 'pr-0 md:pr-12 text-left md:text-right' : 'pl-0 md:pl-12'"
        >
          <div class="flex flex-wrap gap-3" :class="i % 2 === 1 ? 'justify-start md:justify-end' : ''">
            <span
              v-if="p.status"
              class="px-3 py-1.5 rounded-full label-caps text-[10px] font-bold"
              :class="statusClass(p.status)"
            >
              {{ p.status }}
            </span>
            <span
              v-for="cat in (p.category ?? []).slice(0, 2)"
              :key="cat"
              class="neu-pressed px-4 py-2 rounded-full label-caps text-on-surface text-[10px]"
            >
              {{ cat }}
            </span>
            <span class="label-caps text-on-surface-variant flex items-center">{{ p.year }}</span>
          </div>

          <h3 class="title-md text-[32px] leading-tight text-on-surface group-hover:text-primary transition-colors">{{ p.title }}</h3>
          <p class="body-md text-on-surface-variant">{{ pick(p, 'summary') }}</p>

          <div class="flex flex-wrap gap-3" :class="i % 2 === 1 ? 'justify-start md:justify-end' : ''">
            <span
              v-for="tech in (p.tech_stack ?? []).slice(0, 4)"
              :key="tech"
              class="neu-pressed px-4 py-2 rounded-full label-caps text-on-surface text-[10px]"
            >
              {{ tech }}
            </span>
          </div>

          <div class="pt-1 flex" :class="i % 2 === 1 ? 'md:justify-end' : ''">
            <span class="neu-raised px-5 py-2 rounded-full body-md text-on-surface font-bold group-hover:text-primary transition-colors flex items-center gap-2">
              {{ t('projects.viewDetail') }}
              <Icon name="ph:arrow-right-bold" class="text-lg" />
            </span>
          </div>
        </div>

        <div class="w-full md:w-1/2 h-[300px] neu-pressed p-4 rounded-[24px]">
          <div class="w-full h-full rounded-[16px] overflow-hidden bg-surface-container flex items-center justify-center">
            <img
              v-if="p.cover_image_url"
              :src="p.cover_image_url"
              :alt="p.title"
              loading="lazy"
              class="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
            />
            <span v-else class="text-6xl text-primary/15 font-extrabold select-none">{{ p.title?.charAt(0) }}</span>
          </div>
        </div>
      </article>
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
      <div v-if="detailOpen" class="fixed inset-0 z-[120]" role="dialog" aria-modal="true">
        <div class="absolute inset-0 bg-surface-base/70 backdrop-blur-xl backdrop-saturate-150" @click="closeDetail" />

        <div class="absolute inset-[20px] neu-raised rounded-[20px] overflow-hidden flex flex-col bg-surface-card">
          <div class="flex items-center justify-between gap-3 px-6 py-4 border-b border-outline-variant/50 bg-surface-card shrink-0">
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
            <div v-if="detailLoading" class="p-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div class="lg:col-span-8 flex flex-col gap-6">
                <div class="neu-pressed rounded-card p-3 h-[360px] md:h-[480px] animate-pulse" />
                <div v-for="i in 3" :key="i" class="neu-raised rounded-card p-6 h-24 animate-pulse" />
              </div>
              <div class="lg:col-span-4 neu-raised rounded-card p-8 h-96 animate-pulse" />
            </div>

            <div v-else-if="detail" class="w-full max-w-7xl mx-auto flex flex-col gap-12 px-6 md:px-10 py-8 pb-16">
              <div class="flex flex-col gap-5 w-full max-w-4xl">
                <h1 class="display-lg text-on-surface">{{ detail.title }}</h1>
                <div class="flex flex-wrap gap-4">
                  <span
                    v-for="cat in (detail.category ?? [])"
                    :key="cat"
                    class="px-4 py-2 rounded-full neu-pressed text-primary label-caps"
                  >
                    {{ cat }}
                  </span>
                  <span v-if="detail.year" class="px-4 py-2 rounded-full neu-pressed text-on-surface-variant label-caps">
                    {{ detail.year }}
                  </span>
                </div>
              </div>

              <div class="w-full h-[360px] md:h-[560px] neu-raised rounded-card p-4 relative overflow-hidden group">
                <div class="w-full h-full rounded-[16px] overflow-hidden bg-surface-container flex items-center justify-center">
                  <img
                    v-if="detail.cover_image_url"
                    :src="detail.cover_image_url"
                    :alt="detail.title"
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span v-else class="text-7xl text-primary/15 font-extrabold select-none">{{ detail.title?.charAt(0) }}</span>
                </div>
              </div>

              <div class="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 relative items-start">
                <div class="lg:col-span-8 flex flex-col gap-12">
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
                    <div class="flex flex-wrap gap-4 mt-2">
                      <div
                        v-for="tech in (detail.tech_stack ?? [])"
                        :key="tech"
                        class="neu-raised px-6 py-4 rounded-[16px] flex items-center gap-3"
                      >
                        <Icon name="ph:code-bold" class="text-primary" />
                        <span class="body-md text-on-surface font-bold">{{ tech }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="lg:col-span-4 lg:sticky lg:top-8 flex flex-col gap-8 neu-raised p-8 rounded-card">
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

              <div v-if="(detail.project_media ?? []).length" class="w-full flex flex-col gap-8 mt-8">
                <h2 class="title-md text-on-surface">{{ t('projectDetail.gallery') }}</h2>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div
                    v-for="m in detail.project_media"
                    :key="m.id"
                    class="neu-raised rounded-card p-3 aspect-square group cursor-pointer"
                  >
                    <div class="w-full h-full rounded-[16px] overflow-hidden">
                      <img
                        :src="m.image_url"
                        :alt="m.caption ?? detail.title"
                        loading="lazy"
                        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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