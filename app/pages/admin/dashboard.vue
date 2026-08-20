<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

import { motion } from 'motion-v'
import { useRouter } from 'vue-router'

const { t } = useI18n()
const router = useRouter()
const { stats, activity, analytics } = useAdmin()

const { data: statsData, pending, error, refresh } = await useAsyncData('admin-stats', () => stats())
const range = ref(7)
const activityData = ref<{ labels: string[]; counts: number[] }>({ labels: [], counts: [] })
const activityLoading = ref(false)

const anRange = ref(7)
const anData = ref<any>(null)
const anLoading = ref(false)
const anError = ref<string | null>(null)

const loadAnalytics = async () => {
  anLoading.value = true
  anError.value = null
  try {
    const { data } = await analytics(anRange.value)
    anData.value = data
  } catch (e: any) {
    anError.value = e?.response?.data?.statusMessage ?? e?.message ?? null
  } finally {
    anLoading.value = false
  }
}

const loadActivity = async () => {
  activityLoading.value = true
  try {
    const { data } = await activity(range.value)
    activityData.value = data
  } catch {
    activityData.value = { labels: [], counts: [] }
  } finally {
    activityLoading.value = false
  }
}

onMounted(() => {
  loadActivity()
  loadAnalytics()
})

watch(range, loadActivity)
watch(anRange, loadAnalytics)

const anMaxDaily = computed(() => {
  const arr = anData.value?.daily ?? []
  return Math.max(1, ...arr.map((d: any) => Math.max(d.visits, d.visitors)))
})

const fmtDuration = (sec: number) => {
  const s = Number(sec ?? 0)
  if (s < 60) return `${s} dtk`
  const m = Math.floor(s / 60)
  const rs = s % 60
  if (m < 60) return `${m}m ${rs}s`
  return `${Math.floor(m / 60)}j ${m % 60}m`
}

const anLoc = (s: any) => [s.city, s.region, s.country].filter(Boolean).join(', ') || '—'

const goTo = (to?: string) => {
  if (to) router.push(to)
}

const cards = computed(() => [
  { label: t('admin.statsProjects'), value: statsData.value?.data?.projects ?? 0, icon: 'ph:article-bold', color: 'text-primary', tint: '#005bb2', to: '/admin/projects' },
  { label: t('admin.statsThoughts'), value: statsData.value?.data?.thoughts ?? 0, icon: 'ph:notebook-bold', color: 'text-[#0EA5E9]', tint: '#0EA5E9', to: '/admin/thoughts' },
  { label: t('admin.statsMessages'), value: statsData.value?.data?.messages ?? 0, icon: 'ph:envelope-simple-bold', color: 'text-[#F59E0B]', tint: '#F59E0B', to: '/admin/messages' },
  { label: t('admin.statsChatLogs'), value: statsData.value?.data?.chatLogs ?? 0, icon: 'ph:robot-bold', color: 'text-[#14B8A6]', tint: '#14B8A6', to: '/admin/chat-logs' },
  { label: t('admin.statsKnowledge'), value: statsData.value?.data?.knowledge ?? 0, icon: 'ph:book-open-bold', color: 'text-[#8B5CF6]', tint: '#8B5CF6', to: '/admin/knowledge' },
  { label: t('admin.statsTestimonials'), value: statsData.value?.data?.testimonials ?? 0, icon: 'ph:chat-circle-bold', color: 'text-[#10B981]', tint: '#10B981', to: '/admin/projects' },
  { label: t('admin.statsExperiences'), value: statsData.value?.data?.experiences ?? 0, icon: 'ph:briefcase-bold', color: 'text-[#EF4444]', tint: '#EF4444', to: '/admin/projects' },
])

// Donut (distribusi konten) berbasis data sungguhan
const donutData = computed(() => {
  const items = [
    { label: t('admin.statsProjects'), value: statsData.value?.data?.projects ?? 0, color: '#005bb2', to: '/admin/projects' },
    { label: t('admin.statsThoughts'), value: statsData.value?.data?.thoughts ?? 0, color: '#0EA5E9', to: '/admin/thoughts' },
    { label: t('admin.statsMessages'), value: statsData.value?.data?.messages ?? 0, color: '#F59E0B', to: '/admin/messages' },
    { label: t('admin.statsChatLogs'), value: statsData.value?.data?.chatLogs ?? 0, color: '#14B8A6', to: '/admin/chat-logs' },
    { label: t('admin.statsKnowledge'), value: statsData.value?.data?.knowledge ?? 0, color: '#8B5CF6', to: '/admin/knowledge' },
    { label: t('admin.statsExperiences'), value: statsData.value?.data?.experiences ?? 0, color: '#10B981', to: '/admin/projects' },
    { label: t('admin.statsCerts'), value: statsData.value?.data?.certifications ?? 0, color: '#EF4444', to: '/admin/projects' },
  ]
  const total = items.reduce((sum, i) => sum + i.value, 0)
  return { items, total }
})

const donutTotal = computed(() => donutData.value.total)

// Bangun segmen donut: [start, end] dalam derajat
const donutSegments = computed(() => {
  const { items, total } = donutData.value
  if (!total) return []
  let acc = 0
  return items.map((item) => {
    const start = acc
    acc += (item.value / total) * 360
    return { ...item, start, end: acc }
  })
})

// Koordinat busur untuk segmen
const arcPath = (startDeg: number, endDeg: number) => {
  const cx = 50
  const cy = 50
  const r = 40
  const toXY = (deg: number) => {
    const rad = (deg - 90) * (Math.PI / 180)
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
  }
  const [sx, sy] = toXY(startDeg)
  const [ex, ey] = toXY(endDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`
}

const percentOf = (item: { value: number }) => {
  const total = donutTotal.value
  return total ? Math.round((item.value / total) * 100) : 0
}

const days = computed(() => [7, 14, 30])

const maxCount = computed(() => Math.max(1, ...activityData.value.counts))

const chartPath = computed(() => {
  const counts = activityData.value.counts
  const n = counts.length
  if (!n) return ''
  const w = 800
  const h = 275
  const step = w / Math.max(1, n - 1)
  return counts
    .map((c, i) => {
      const x = Math.round(i * step)
      const y = Math.round(h - (c / maxCount.value) * (h - 40))
      return `${i === 0 ? 'M' : 'L'} ${x},${y}`
    })
    .join(' ')
})

const chartArea = computed(() => {
  if (!chartPath.value) return ''
  return `${chartPath.value} L 800,275 L 0,275 Z`
})
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
      <div class="flex flex-col gap-1.5">
        <h1 class="headline-lg text-on-surface">{{ t('admin.dashboard') }}</h1>
        <p class="body-md text-on-surface-variant">{{ t('admin.dashboardSubtitle') }}</p>
      </div>
      <button
        class="neu-raised px-5 py-2.5 rounded-full flex items-center gap-2.5 text-primary font-bold body-md hover:neu-pressed transition-all duration-300"
        @click="refresh(); loadActivity()"
      >
        <Icon name="ph:arrows-clockwise-bold" class="text-base" :class="pending || activityLoading ? 'animate-spin' : ''" />
        {{ t('admin.refresh') }}
      </button>
    </div>

    <p v-if="error" class="body-md text-error">{{ error?.statusMessage ?? error?.message }}</p>

    <!-- Overview Cards (klik -> menu terkait) -->
    <section class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-7 gap-4 w-full">
      <motion.div
        v-for="(c, i) in cards"
        :key="c.label"
        class="neu-raised rounded-[18px] p-4 flex flex-col items-center justify-center text-center group cursor-pointer hover:scale-[1.02] transition-transform duration-300"
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.4, delay: i * 0.08 }"
        @click="goTo(c.to)"
      >
        <span class="w-10 h-10 rounded-full neu-raised flex items-center justify-center mb-2.5" :class="c.color">
          <Icon :name="c.icon" class="text-lg" />
        </span>
        <span class="label-caps text-on-surface-variant mb-1">{{ c.label }}</span>
        <span class="headline-lg text-on-surface">{{ pending ? '—' : c.value }}</span>
      </motion.div>
    </section>

    <section class="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
      <!-- Chart Aktivitas -->
      <div class="lg:col-span-2 neu-raised rounded-[18px] p-5 flex flex-col w-full min-w-0 relative overflow-hidden">
        <div class="absolute -right-24 -top-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl mix-blend-multiply pointer-events-none" />
        <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3 z-10">
          <div>
            <h2 class="title-md text-on-surface">{{ t('admin.chartTitle') }}</h2>
            <p class="body-md text-on-surface-variant mt-0.5">{{ t('admin.chartSubtitle') }}</p>
          </div>
          <div class="flex gap-1.5 bg-surface p-0.5 rounded-full neu-pressed self-start">
            <button
              v-for="d in days"
              :key="d"
              class="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
              :class="range === d ? 'text-primary neu-raised' : 'text-on-surface-variant hover:text-on-surface'"
              @click="range = d"
            >
              {{ d }} Hari
            </button>
          </div>
        </div>

        <div class="w-full h-[225px] mt-auto z-10 flex items-end relative px-3">
          <svg class="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 300">
            <g class="text-surface-variant stroke-current" stroke-dasharray="4 4" stroke-width="1">
              <line x1="0" x2="800" y1="50" y2="50" />
              <line x1="0" x2="800" y1="125" y2="125" />
              <line x1="0" x2="800" y1="200" y2="200" />
              <line x1="0" x2="800" y1="275" y2="275" />
            </g>
            <defs>
              <linearGradient id="lineGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stop-color="#005bb2" stop-opacity="0.2" />
                <stop offset="100%" stop-color="#005bb2" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path v-if="chartArea" :d="chartArea" fill="url(#lineGrad)" />
            <path v-if="chartPath" class="stroke-primary" :d="chartPath" fill="none" stroke-linecap="round" stroke-width="3" />
          </svg>
          <div class="absolute bottom-0 left-0 w-full flex justify-between px-3 text-[10px] label-caps text-on-surface-variant/70 translate-y-6">
            <span v-for="(l, i) in activityData.labels" :key="i">{{ l }}</span>
          </div>
        </div>
      </div>

      <!-- Donut Distribusi Konten (data sungguhan, klik -> menu) -->
      <div class="neu-raised rounded-[18px] p-5 flex flex-col w-full relative">
        <div class="mb-4">
          <h2 class="title-md text-on-surface">{{ t('admin.donutTitle') }}</h2>
          <p class="body-md text-on-surface-variant mt-0.5">{{ t('admin.donutSubtitle') }}</p>
        </div>
        <div class="relative w-full aspect-square max-w-[180px] mx-auto flex items-center justify-center">
          <svg class="w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" fill="transparent" r="40" stroke="#E7ECF2" stroke-width="12" />
            <path
              v-for="seg in donutSegments"
              :key="seg.label"
              :d="arcPath(seg.start, seg.end)"
              :stroke="seg.color"
              fill="transparent"
              stroke-width="12"
              stroke-linecap="round"
              class="cursor-pointer transition-opacity hover:opacity-70"
              @click="goTo(seg.to)"
            >
              <title>{{ seg.label }} · {{ percentOf(seg) }}%</title>
            </path>
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center rounded-full pointer-events-none">
            <span class="headline-lg text-on-surface leading-none">{{ pending ? '—' : donutTotal }}</span>
            <span class="text-[9px] label-caps text-on-surface-variant mt-0.5">{{ t('admin.totalContent') }}</span>
          </div>
        </div>
        <div class="mt-5 flex flex-col gap-2">
          <button
            v-for="item in donutData.items"
            :key="item.label"
            class="flex items-center justify-between text-sm group cursor-pointer hover:neu-pressed rounded-full px-3 py-1.5 transition-all"
            @click="goTo(item.to)"
          >
            <div class="flex items-center gap-2">
              <div class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: item.color }" />
              <span class="body-md text-on-surface group-hover:text-primary transition-colors">{{ item.label }}</span>
            </div>
            <span class="font-medium text-on-surface-variant">{{ percentOf(item) }}%</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Analitik Pengunjung -->
    <section class="flex flex-col gap-4 w-full">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div class="flex flex-col gap-1">
          <h2 class="headline-lg text-on-surface">{{ t('admin.anSectionTitle') }}</h2>
          <p class="body-md text-on-surface-variant">{{ t('admin.anSectionSubtitle') }}</p>
        </div>
        <button
          class="neu-raised px-4 py-2 rounded-full body-md font-bold text-primary flex items-center gap-2 hover:neu-pressed transition-all self-start"
          @click="goTo('/admin/analytics')"
        >
          {{ t('admin.anViewFull') }}
          <Icon name="ph:arrow-right-bold" class="text-sm" />
        </button>
      </div>

      <p v-if="anError" class="body-md text-error">{{ anError }}</p>
      <p v-if="anLoading && !anData" class="body-md text-on-surface-variant">{{ t('admin.loading') }}</p>

      <div v-if="anData" class="flex flex-col gap-4">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="neu-raised rounded-[18px] p-4 flex flex-col items-center justify-center text-center">
            <span class="w-9 h-9 rounded-full neu-raised flex items-center justify-center mb-2 text-primary">
              <Icon name="ph:eye-bold" class="text-base" />
            </span>
            <span class="label-caps text-on-surface-variant mb-1">{{ t('admin.anTotalVisits') }}</span>
            <span class="headline-lg text-on-surface">{{ anData.totalVisits }}</span>
          </div>
          <div class="neu-raised rounded-[18px] p-4 flex flex-col items-center justify-center text-center">
            <span class="w-9 h-9 rounded-full neu-raised flex items-center justify-center mb-2 text-[#0EA5E9]">
              <Icon name="ph:users-bold" class="text-base" />
            </span>
            <span class="label-caps text-on-surface-variant mb-1">{{ t('admin.anUniqueVisitors') }}</span>
            <span class="headline-lg text-on-surface">{{ anData.uniqueVisitors }}</span>
          </div>
          <div class="neu-raised rounded-[18px] p-4 flex flex-col items-center justify-center text-center">
            <span class="w-9 h-9 rounded-full neu-raised flex items-center justify-center mb-2 text-[#10B981]">
              <Icon name="ph:clock-bold" class="text-base" />
            </span>
            <span class="label-caps text-on-surface-variant mb-1">{{ t('admin.anAvgDuration') }}</span>
            <span class="headline-lg text-on-surface">{{ fmtDuration(anData.avgDuration) }}</span>
          </div>
          <div class="neu-raised rounded-[18px] p-4 flex flex-col items-center justify-center text-center">
            <span class="w-9 h-9 rounded-full neu-raised flex items-center justify-center mb-2 text-[#F59E0B]">
              <Icon name="ph:pulse-bold" class="text-base" />
            </span>
            <span class="label-caps text-on-surface-variant mb-1">{{ t('admin.anActiveNow') }}</span>
            <span class="headline-lg text-on-surface">{{ anData.activeNow }}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div class="lg:col-span-2 neu-raised rounded-[18px] p-5 flex flex-col w-full relative overflow-hidden">
            <div class="absolute -right-24 -top-24 w-64 h-64 bg-[#0EA5E9]/5 rounded-full blur-3xl mix-blend-multiply pointer-events-none" />
            <div class="mb-4 flex items-center justify-between z-10">
              <h3 class="title-md text-on-surface">{{ t('admin.anDailyTrend') }}</h3>
              <div class="flex gap-1.5 bg-surface p-0.5 rounded-full neu-pressed">
                <button
                  v-for="d in [7, 14, 30]"
                  :key="d"
                  class="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  :class="anRange === d ? 'text-primary neu-raised' : 'text-on-surface-variant hover:text-on-surface'"
                  @click="anRange = d"
                >
                  {{ d }}
                </button>
              </div>
            </div>
            <div class="flex items-end gap-1.5 md:gap-2.5 h-[180px] w-full z-10">
              <div
                v-for="d in anData.daily"
                :key="d.date"
                class="flex-1 flex flex-col items-center gap-1 min-w-0 h-full justify-end"
              >
                <div
                  class="w-full max-w-[22px] rounded-t-lg bg-primary/25 hover:bg-primary/60 transition-colors"
                  :style="{ height: `${(d.visits / anMaxDaily) * 100}%` }"
                  :title="`${d.label}: ${d.visits}`"
                />
                <div
                  class="w-full max-w-[22px] rounded-t-lg bg-[#0EA5E9]/60 -mt-1"
                  :style="{ height: `${(d.visitors / anMaxDaily) * 100}%` }"
                  :title="`${d.label}: ${d.visitors}`"
                />
                <span class="text-[9px] label-caps text-on-surface-variant/60 truncate w-full text-center">{{ d.label }}</span>
              </div>
            </div>
          </div>

          <div class="neu-raised rounded-[18px] p-5 flex flex-col w-full">
            <h3 class="title-md text-on-surface mb-3">{{ t('admin.anBrowsers') }}</h3>
            <div class="flex flex-col gap-2.5 mt-1">
              <div v-for="(b, i) in (anData.browsers ?? []).slice(0, 6)" :key="b.label" class="flex items-center justify-between">
                <span class="body-md text-on-surface truncate">{{ b.label }}</span>
                <span class="font-medium text-on-surface-variant ml-2 shrink-0">{{ b.count }}</span>
              </div>
              <p v-if="!(anData.browsers ?? []).length" class="body-md text-on-surface-variant">{{ t('admin.anEmpty') }}</p>
            </div>
            <div class="mt-auto pt-4">
              <p class="label-caps text-on-surface-variant mb-2">{{ t('admin.anCountries') }}</p>
              <div class="flex flex-col gap-1.5">
                <div v-for="c in (anData.countries ?? []).slice(0, 4)" :key="c.label" class="flex items-center justify-between text-sm">
                  <span class="body-md text-on-surface truncate">{{ c.label }}</span>
                  <span class="font-medium text-on-surface-variant ml-2 shrink-0">{{ c.count }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="neu-raised rounded-[18px] p-5 flex flex-col w-full">
          <div class="mb-3">
            <h3 class="title-md text-on-surface">{{ t('admin.anRecentVisitors') }}</h3>
            <p class="body-md text-on-surface-variant mt-0.5">{{ t('admin.anVisitorDetailsSubtitle') }}</p>
          </div>
          <div v-if="!anData.sessions.length" class="border-2 border-dashed border-outline-variant/40 rounded-[16px] p-6 flex flex-col items-center gap-2 text-on-surface-variant">
            <Icon name="ph:chart-bar-bold" class="text-2xl text-outline" />
            <p class="body-md">{{ t('admin.anEmpty') }}</p>
          </div>
          <div v-else class="flex flex-col gap-2.5">
            <div
              v-for="s in anData.sessions.slice(0, 6)"
              :key="s.session_id"
              class="neu-pressed rounded-[16px] px-4 py-3 flex flex-col gap-1.5"
            >
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span class="body-md text-on-surface font-bold">{{ s.browser || '—' }} <span class="text-on-surface-variant font-medium">· {{ s.os || '—' }}</span></span>
                <span class="px-2 py-0.5 rounded-full label-caps text-[9px] font-bold neu-raised text-primary">{{ s.device_type || 'Desktop' }}</span>
                <span class="body-md text-on-surface-variant text-[11px] ml-auto">{{ fmtDuration(s.duration_seconds) }} · {{ new Date(s.last_seen).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) }}</span>
              </div>
              <span class="body-md text-on-surface-variant text-[11px] truncate">
                <Icon name="ph:map-pin-bold" class="inline text-xs mr-0.5" />
                {{ anLoc(s) }} · {{ (s.pages ?? []).slice(0, 3).join(' → ') || '—' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>