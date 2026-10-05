<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { analytics } = useAdmin()
const { t } = useI18n()

const range = ref(7)
const selectedDomain = ref('all')
const searchQuery = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const data = ref<any>(null)

const rangeOptions = [1, 7, 14, 30, 90]

const load = async () => {
  loading.value = true
  error.value = null
  try {
    const { data: res } = await analytics(range.value, selectedDomain.value)
    data.value = res
  } catch (e: any) {
    error.value = e?.response?.data?.statusMessage ?? e?.message ?? 'Gagal memuat analitik'
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch([range, selectedDomain], load)

const maxDaily = computed(() => {
  const arr = data.value?.daily ?? []
  return Math.max(1, ...arr.map((d: any) => Math.max(d.visits, d.visitors)))
})

const maxCount = (list: any[]) => {
  const arr = list ?? []
  return Math.max(1, ...arr.map((i) => i.count))
}

const donutData = (list: any[]) => {
  const items = (list ?? []).filter((i) => i.count > 0)
  const total = items.reduce((s, i) => s + i.count, 0)
  let acc = 0
  const segments = items.map((item) => {
    const start = acc
    acc += (item.count / total) * 360
    return { ...item, start, end: acc }
  })
  return { items, segments, total }
}

const colors = [
  '#005bb2',
  '#0EA5E9',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EF4444',
  '#14B8A6',
  '#F97316',
  '#6366F1',
  '#EC4899',
]

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

const browsersDonut = computed(() => donutData(data.value?.browsers ?? []))
const devicesDonut = computed(() => donutData(data.value?.devices ?? []))
const countriesDonut = computed(() => donutData(data.value?.countries ?? []))

const fmtDuration = (sec: number) => {
  const s = Number(sec ?? 0)
  if (s <= 0) return '0 dtk'
  if (s < 60) return `${s} dtk`
  const m = Math.floor(s / 60)
  const rs = s % 60
  if (m < 60) return `${m}m ${rs}s`
  const h = Math.floor(m / 60)
  return `${h}j ${m % 60}m`
}

const fmtTime = (iso?: string) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const locOf = (s: any) => [s.city, s.region, s.country].filter(Boolean).join(', ') || '—'

const deviceIcon = (d?: string) => {
  if (d === 'Mobile') return 'ph:device-mobile-bold'
  if (d === 'Tablet') return 'ph:device-tablet-bold'
  return 'ph:desktop-bold'
}

const domainBadgeColor = (dom?: string) => {
  if (!dom) return 'text-primary bg-primary/10'
  if (dom.includes('allfine.my.id')) return 'text-[#10B981] bg-[#10B981]/10'
  if (dom.includes('vercel.app')) return 'text-[#0EA5E9] bg-[#0EA5E9]/10'
  return 'text-primary bg-primary/10'
}

const expand = ref<Set<string>>(new Set())
const toggleExpand = (id: string) => {
  const next = new Set(expand.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expand.value = next
}

const filteredSessions = computed(() => {
  const list = data.value?.sessions ?? []
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return list
  return list.filter((s: any) => {
    return (
      (s.ip_address && s.ip_address.toLowerCase().includes(q)) ||
      (s.city && s.city.toLowerCase().includes(q)) ||
      (s.region && s.region.toLowerCase().includes(q)) ||
      (s.country && s.country.toLowerCase().includes(q)) ||
      (s.browser && s.browser.toLowerCase().includes(q)) ||
      (s.os && s.os.toLowerCase().includes(q)) ||
      (s.domain && s.domain.toLowerCase().includes(q)) ||
      (s.pages && s.pages.some((p: string) => p.toLowerCase().includes(q)))
    )
  })
})
</script>

<template>
  <div class="flex flex-col gap-5 w-full">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
      <div class="flex flex-col gap-1.5">
        <h1 class="headline-lg text-on-surface">{{ t('admin.analyticsTitle') }}</h1>
        <p class="body-md text-on-surface-variant">{{ t('admin.analyticsSubtitle') }}</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex gap-1.5 bg-surface p-0.5 rounded-full neu-pressed">
          <button
            v-for="d in rangeOptions"
            :key="d"
            class="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            :class="range === d ? 'text-primary neu-raised' : 'text-on-surface-variant hover:text-on-surface'"
            @click="range = d"
          >
            {{ d === 1 ? '24 Jam' : `${d} ${t('admin.analyticsDays')}` }}
          </button>
        </div>
        <button
          class="neu-raised px-4 py-2.5 rounded-full flex items-center gap-2 text-primary font-bold body-md hover:neu-pressed transition-all"
          :title="t('admin.refresh')"
          @click="load"
        >
          <Icon name="ph:arrows-clockwise-bold" class="text-base" :class="loading ? 'animate-spin' : ''" />
        </button>
      </div>
    </div>

    <!-- Domain Filter Tabs -->
    <div class="flex flex-wrap items-center gap-2 bg-surface p-1 rounded-2xl neu-pressed w-fit">
      <button
        class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
        :class="selectedDomain === 'all' ? 'text-primary neu-raised' : 'text-on-surface-variant hover:text-on-surface'"
        @click="selectedDomain = 'all'"
      >
        <Icon name="ph:globe-simple-bold" class="text-sm" />
        {{ t('admin.anAllDomains') }}
      </button>
      <button
        class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
        :class="selectedDomain === 'allfine.my.id' ? 'text-[#10B981] neu-raised' : 'text-on-surface-variant hover:text-on-surface'"
        @click="selectedDomain = 'allfine.my.id'"
      >
        <span class="w-2 h-2 rounded-full bg-[#10B981]" />
        www.allfine.my.id
      </button>
      <button
        class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
        :class="selectedDomain === 'portfolio-alfin-six.vercel.app' ? 'text-[#0EA5E9] neu-raised' : 'text-on-surface-variant hover:text-on-surface'"
        @click="selectedDomain = 'portfolio-alfin-six.vercel.app'"
      >
        <span class="w-2 h-2 rounded-full bg-[#0EA5E9]" />
        portfolio-alfin-six.vercel.app
      </button>
    </div>

    <p v-if="error" class="body-md text-error neu-pressed p-3 rounded-xl">{{ error }}</p>
    <p v-if="loading && !data" class="body-md text-on-surface-variant">{{ t('admin.loading') }}</p>

    <template v-if="data">
      <!-- Section Perbandingan Domain & Rata-rata Durasi User Akses Web -->
      <section class="neu-raised rounded-[20px] p-5 flex flex-col gap-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 class="title-md text-on-surface flex items-center gap-2">
              <Icon name="ph:hourglass-medium-bold" class="text-primary text-lg" />
              {{ t('admin.anDomainBreakdown') }}
            </h2>
            <p class="body-md text-on-surface-variant mt-0.5">{{ t('admin.anDomainBreakdownSubtitle') }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="dom in data.domainBreakdown ?? []"
            :key="dom.domain"
            class="neu-pressed rounded-[16px] p-4.5 flex flex-col gap-3 relative overflow-hidden"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span
                  class="w-8 h-8 rounded-full flex items-center justify-center neu-raised"
                  :class="dom.domain.includes('allfine') ? 'text-[#10B981]' : 'text-[#0EA5E9]'"
                >
                  <Icon :name="dom.domain.includes('allfine') ? 'ph:globe-bold' : 'ph:lightning-bold'" class="text-base" />
                </span>
                <span class="title-sm font-bold text-on-surface">{{ dom.label }}</span>
              </div>
              <span
                v-if="dom.activeNow > 0"
                class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-[#10B981] bg-[#10B981]/15"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                {{ dom.activeNow }} {{ t('admin.anStatusOnline') }}
              </span>
            </div>

            <div class="grid grid-cols-3 gap-2 pt-1 border-t border-outline-variant/30 text-center">
              <div class="flex flex-col">
                <span class="label-caps text-on-surface-variant text-[10px]">{{ t('admin.anTotalVisits') }}</span>
                <span class="title-md text-on-surface mt-0.5 font-bold">{{ dom.visits }}</span>
              </div>
              <div class="flex flex-col">
                <span class="label-caps text-on-surface-variant text-[10px]">{{ t('admin.anUniqueVisitors') }}</span>
                <span class="title-md text-on-surface mt-0.5 font-bold">{{ dom.uniqueVisitors }}</span>
              </div>
              <div class="flex flex-col">
                <span class="label-caps text-on-surface-variant text-[10px]">{{ t('admin.anAvgDuration') }}</span>
                <span class="title-md text-primary mt-0.5 font-bold">{{ fmtDuration(dom.avgDuration) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Ringkasan Metrik Utama -->
      <section class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 w-full">
        <div class="neu-raised rounded-[18px] p-4 flex flex-col items-center justify-center text-center">
          <span class="w-10 h-10 rounded-full neu-raised flex items-center justify-center mb-2.5 text-primary">
            <Icon name="ph:eye-bold" class="text-lg" />
          </span>
          <span class="label-caps text-on-surface-variant mb-1">{{ t('admin.anTotalVisits') }}</span>
          <span class="headline-lg text-on-surface">{{ data.totalVisits }}</span>
        </div>
        <div class="neu-raised rounded-[18px] p-4 flex flex-col items-center justify-center text-center">
          <span class="w-10 h-10 rounded-full neu-raised flex items-center justify-center mb-2.5 text-[#0EA5E9]">
            <Icon name="ph:users-bold" class="text-lg" />
          </span>
          <span class="label-caps text-on-surface-variant mb-1">{{ t('admin.anUniqueVisitors') }}</span>
          <span class="headline-lg text-on-surface">{{ data.uniqueVisitors }}</span>
        </div>
        <div class="neu-raised rounded-[18px] p-4 flex flex-col items-center justify-center text-center">
          <span class="w-10 h-10 rounded-full neu-raised flex items-center justify-center mb-2.5 text-[#10B981]">
            <Icon name="ph:clock-bold" class="text-lg" />
          </span>
          <span class="label-caps text-on-surface-variant mb-1">{{ t('admin.anAvgDuration') }}</span>
          <span class="headline-lg text-on-surface">{{ fmtDuration(data.avgDuration) }}</span>
        </div>
        <div class="neu-raised rounded-[18px] p-4 flex flex-col items-center justify-center text-center">
          <span class="w-10 h-10 rounded-full neu-raised flex items-center justify-center mb-2.5 text-[#F59E0B]">
            <Icon name="ph:pulse-bold" class="text-lg" />
          </span>
          <span class="label-caps text-on-surface-variant mb-1">{{ t('admin.anActiveNow') }}</span>
          <div class="flex items-center gap-2">
            <span v-if="data.activeNow > 0" class="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
            <span class="headline-lg text-on-surface">{{ data.activeNow }}</span>
          </div>
        </div>
        <div class="neu-raised rounded-[18px] p-4 flex flex-col items-center justify-center text-center">
          <span class="w-10 h-10 rounded-full neu-raised flex items-center justify-center mb-2.5 text-[#8B5CF6]">
            <Icon name="ph:link-bold" class="text-lg" />
          </span>
          <span class="label-caps text-on-surface-variant mb-1">{{ t('admin.anTopPages') }}</span>
          <span class="title-md text-on-surface truncate max-w-full px-2">{{ (data.pages ?? [])[0]?.label || '—' }}</span>
          <span class="body-md text-on-surface-variant">{{ (data.pages ?? [])[0]?.count ?? 0 }} {{ t('admin.anVisits') }}</span>
        </div>
      </section>

      <!-- Grafik Harian -->
      <section class="neu-raised rounded-[18px] p-5 flex flex-col w-full relative overflow-hidden">
        <div class="absolute -right-24 -top-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl mix-blend-multiply pointer-events-none" />
        <div class="mb-5 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 class="title-md text-on-surface">{{ t('admin.anDailyTrend') }}</h2>
            <p class="body-md text-on-surface-variant mt-0.5">{{ t('admin.anDailyTrendSubtitle') }}</p>
          </div>
          <div class="flex items-center gap-4 text-xs font-medium text-on-surface-variant">
            <span class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded bg-primary/50" />
              {{ t('admin.anTotalVisits') }}
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded bg-[#0EA5E9]" />
              {{ t('admin.anUniqueVisitors') }}
            </span>
          </div>
        </div>
        <div class="flex items-end gap-1.5 md:gap-2.5 h-[220px] w-full z-10">
          <div
            v-for="d in data.daily"
            :key="d.date"
            class="flex-1 flex flex-col items-center gap-1.5 min-w-0 h-full justify-end"
          >
            <span class="text-[10px] label-caps text-on-surface-variant">{{ d.visits || '' }}</span>
            <div
              class="w-full max-w-[26px] rounded-t-lg bg-primary/25 hover:bg-primary/60 transition-colors relative"
              :style="{ height: `${(d.visits / maxDaily) * 100}%` }"
              :title="`${d.label}: ${d.visits} ${t('admin.anVisits')}`"
            />
            <div
              class="w-full max-w-[26px] rounded-t-lg bg-[#0EA5E9]/60 hover:bg-[#0EA5E9] transition-colors -mt-1"
              :style="{ height: `${(d.visitors / maxDaily) * 100}%` }"
              :title="`${d.label}: ${d.visitors} ${t('admin.anUniqueVisitors')}`"
            />
            <span class="text-[9px] label-caps text-on-surface-variant/60 truncate w-full text-center">{{ d.label }}</span>
          </div>
        </div>
      </section>

      <!-- Donut Browser, Device, Negara & Top Pages -->
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
        <!-- Browsers -->
        <div class="neu-raised rounded-[18px] p-5 flex flex-col w-full">
          <h2 class="title-md text-on-surface mb-4">{{ t('admin.anBrowsers') }}</h2>
          <div class="relative w-full aspect-square max-w-[150px] mx-auto">
            <svg class="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="transparent" r="40" stroke="#E7ECF2" stroke-width="12" />
              <path
                v-for="(seg, i) in browsersDonut.segments"
                :key="seg.label"
                :d="arcPath(seg.start, seg.end)"
                :stroke="colors[i % colors.length]"
                fill="transparent"
                stroke-width="12"
                stroke-linecap="round"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span class="headline-lg text-on-surface leading-none">{{ browsersDonut.total }}</span>
              <span class="text-[9px] label-caps text-on-surface-variant mt-0.5">{{ t('admin.anVisits') }}</span>
            </div>
          </div>
          <div class="mt-4 flex flex-col gap-1.5">
            <div v-for="(i, idx) in browsersDonut.items" :key="i.label" class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: colors[idx % colors.length] }" />
                <span class="body-md text-on-surface">{{ i.label }}</span>
              </div>
              <span class="font-medium text-on-surface-variant">{{ i.count }}</span>
            </div>
            <p v-if="!browsersDonut.items.length" class="body-md text-on-surface-variant">{{ t('admin.anEmpty') }}</p>
          </div>
        </div>

        <!-- Devices & OS -->
        <div class="neu-raised rounded-[18px] p-5 flex flex-col w-full">
          <h2 class="title-md text-on-surface mb-4">{{ t('admin.anDevices') }} & {{ t('admin.anOS') }}</h2>
          <div class="relative w-full aspect-square max-w-[150px] mx-auto">
            <svg class="w-full h-full" viewBox="0 0 100 100">
              <circle cx="50" cy="50" fill="transparent" r="40" stroke="#E7ECF2" stroke-width="12" />
              <path
                v-for="(seg, i) in devicesDonut.segments"
                :key="seg.label"
                :d="arcPath(seg.start, seg.end)"
                :stroke="colors[i % colors.length]"
                fill="transparent"
                stroke-width="12"
                stroke-linecap="round"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span class="headline-lg text-on-surface leading-none">{{ devicesDonut.total }}</span>
              <span class="text-[9px] label-caps text-on-surface-variant mt-0.5">{{ t('admin.anVisits') }}</span>
            </div>
          </div>
          <div class="mt-4 flex flex-col gap-2">
            <div v-for="(i, idx) in devicesDonut.items" :key="i.label" class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: colors[idx % colors.length] }" />
                <span class="body-md text-on-surface">{{ i.label }}</span>
              </div>
              <span class="font-medium text-on-surface-variant">{{ i.count }}</span>
            </div>
            <div class="mt-3 pt-3 border-t border-outline-variant/30 flex flex-col gap-1.5">
              <span class="label-caps text-on-surface-variant text-[10px]">{{ t('admin.anOS') }}</span>
              <div v-for="o in data.os ?? []" :key="o.label" class="flex items-center justify-between text-xs">
                <span class="body-md text-on-surface">{{ o.label }}</span>
                <span class="font-medium text-on-surface-variant">{{ o.count }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Lokasi & Halaman Terpopuler -->
        <div class="neu-raised rounded-[18px] p-5 flex flex-col w-full">
          <h2 class="title-md text-on-surface mb-3">{{ t('admin.anCountries') }}</h2>
          <div class="flex flex-col gap-2 mt-1">
            <div v-for="(i, idx) in data.countries ?? []" :key="i.label" class="flex flex-col gap-1">
              <div class="flex items-center justify-between text-xs">
                <span class="body-md text-on-surface flex items-center gap-1.5 truncate">
                  <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: colors[idx % colors.length] }" />
                  {{ i.label }}
                </span>
                <span class="font-medium text-on-surface-variant ml-2">{{ i.count }}</span>
              </div>
              <div class="w-full h-1.5 bg-surface rounded-full overflow-hidden neu-pressed">
                <div
                  class="h-full rounded-full"
                  :style="{
                    width: `${(i.count / maxCount(data.countries)) * 100}%`,
                    backgroundColor: colors[idx % colors.length],
                  }"
                />
              </div>
            </div>
            <p v-if="!(data.countries ?? []).length" class="body-md text-on-surface-variant text-xs">{{ t('admin.anEmpty') }}</p>
          </div>

          <h2 class="title-md text-on-surface mb-3 mt-5">{{ t('admin.anTopPages') }}</h2>
          <div class="flex flex-col gap-2">
            <div v-for="i in data.pages ?? []" :key="i.label" class="flex items-center justify-between text-xs">
              <span class="body-md text-on-surface truncate flex items-center gap-1.5">
                <Icon name="ph:file-text-bold" class="text-primary text-sm shrink-0" />
                {{ i.label }}
              </span>
              <span class="font-medium text-on-surface-variant ml-2 shrink-0">{{ i.count }}</span>
            </div>
            <p v-if="!(data.pages ?? []).length" class="body-md text-on-surface-variant text-xs">{{ t('admin.anEmpty') }}</p>
          </div>
        </div>
      </section>

      <!-- Detail Sesi Pengunjung Lengkap (Schema visitor_analytics) -->
      <section class="neu-raised rounded-[20px] p-5 flex flex-col w-full gap-4">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 class="title-md text-on-surface">{{ t('admin.anVisitorDetails') }}</h2>
            <p class="body-md text-on-surface-variant mt-0.5">{{ t('admin.anVisitorDetailsSubtitle') }}</p>
          </div>
          <!-- Input Pencarian -->
          <div class="relative w-full md:w-72">
            <Icon name="ph:magnifying-glass-bold" class="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none" />
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="t('admin.anSearchVisitors')"
              class="w-full pl-9 pr-4 py-2 rounded-xl body-md bg-surface text-on-surface neu-pressed placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-1 focus:ring-primary text-xs"
            />
          </div>
        </div>

        <div v-if="!filteredSessions.length" class="border-2 border-dashed border-outline-variant/40 rounded-[16px] p-8 flex flex-col items-center gap-3 text-on-surface-variant">
          <Icon name="ph:chart-bar-bold" class="text-3xl text-outline" />
          <p class="body-md text-center">{{ t('admin.anEmpty') }}</p>
        </div>

        <div v-else class="flex flex-col gap-3">
          <div
            v-for="s in filteredSessions"
            :key="s.session_id"
            class="neu-pressed rounded-[16px] p-4 flex flex-col gap-2.5 transition-all"
          >
            <!-- Card Header Summary -->
            <button class="w-full flex items-center gap-3 text-left" @click="toggleExpand(s.session_id)">
              <span class="w-10 h-10 rounded-full neu-raised flex items-center justify-center text-primary shrink-0 relative">
                <Icon :name="deviceIcon(s.device_type)" class="text-lg" />
                <span
                  v-if="s.is_active"
                  class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10B981] border-2 border-surface"
                  title="Online sekarang"
                />
              </span>

              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="body-md text-on-surface font-bold">
                    {{ s.browser || '—' }} <span v-if="s.browser_version" class="text-xs text-on-surface-variant font-normal">v{{ s.browser_version }}</span>
                    <span class="text-on-surface-variant font-medium">· {{ s.os || '—' }}</span>
                  </span>

                  <!-- Domain Badge -->
                  <span
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold neu-raised"
                    :class="domainBadgeColor(s.domain)"
                  >
                    {{ s.domain || 'allfine.my.id' }}
                  </span>

                  <!-- Device Badge -->
                  <span class="px-2 py-0.5 rounded-full label-caps text-[9px] font-bold neu-raised text-on-surface-variant">
                    {{ s.device_type || 'Desktop' }}
                  </span>

                  <!-- Online Status Badge -->
                  <span
                    v-if="s.is_active"
                    class="px-2 py-0.5 rounded-full text-[9px] font-bold text-[#10B981] bg-[#10B981]/15 flex items-center gap-1"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                    {{ t('admin.anStatusOnline') }}
                  </span>
                </div>

                <div class="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-on-surface-variant mt-1">
                  <span class="flex items-center gap-1">
                    <Icon name="ph:map-pin-bold" class="text-xs text-primary" />
                    {{ locOf(s) }}
                  </span>
                  <span class="flex items-center gap-1 font-semibold text-primary">
                    <Icon name="ph:clock-bold" class="text-xs" />
                    {{ fmtDuration(s.duration_seconds) }}
                  </span>
                  <span class="text-on-surface-variant/70">
                    {{ fmtTime(s.last_active_at) }}
                  </span>
                </div>
              </div>

              <Icon
                :name="expand.has(s.session_id) ? 'ph:caret-up-bold' : 'ph:caret-down-bold'"
                class="text-on-surface-variant shrink-0"
              />
            </button>

            <!-- Card Expanded Details (All Schema Columns) -->
            <div
              v-if="expand.has(s.session_id)"
              class="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-outline-variant/40 text-xs"
            >
              <!-- Session Started -->
              <div class="flex flex-col gap-0.5">
                <span class="label-caps text-on-surface-variant text-[10px]">{{ t('admin.anSessionStarted') }}</span>
                <span class="body-md text-on-surface">{{ fmtTime(s.session_started_at) }}</span>
              </div>

              <!-- Last Active -->
              <div class="flex flex-col gap-0.5">
                <span class="label-caps text-on-surface-variant text-[10px]">{{ t('admin.anLastActive') }}</span>
                <span class="body-md text-on-surface">{{ fmtTime(s.last_active_at) }}</span>
              </div>

              <!-- Duration -->
              <div class="flex flex-col gap-0.5">
                <span class="label-caps text-on-surface-variant text-[10px]">{{ t('admin.anDuration') }}</span>
                <span class="body-md text-primary font-bold">{{ fmtDuration(s.duration_seconds) }} ({{ s.duration_seconds }}s)</span>
              </div>

              <!-- IP Address -->
              <div class="flex flex-col gap-0.5">
                <span class="label-caps text-on-surface-variant text-[10px]">{{ t('admin.anIpAddress') }}</span>
                <span class="body-md text-on-surface font-mono">{{ s.ip_address || '—' }}</span>
              </div>

              <!-- Browser & Version -->
              <div class="flex flex-col gap-0.5">
                <span class="label-caps text-on-surface-variant text-[10px]">{{ t('admin.anBrowser') }}</span>
                <span class="body-md text-on-surface">{{ s.browser }} <span v-if="s.browser_version" class="text-on-surface-variant">({{ s.browser_version }})</span></span>
              </div>

              <!-- OS -->
              <div class="flex flex-col gap-0.5">
                <span class="label-caps text-on-surface-variant text-[10px]">{{ t('admin.anOS') }}</span>
                <span class="body-md text-on-surface">{{ s.os || '—' }}</span>
              </div>

              <!-- Screen Size -->
              <div class="flex flex-col gap-0.5">
                <span class="label-caps text-on-surface-variant text-[10px]">{{ t('admin.anScreen') }}</span>
                <span class="body-md text-on-surface">{{ s.screen_size || '—' }}</span>
              </div>

              <!-- Language -->
              <div class="flex flex-col gap-0.5">
                <span class="label-caps text-on-surface-variant text-[10px]">{{ t('admin.anLanguage') }}</span>
                <span class="body-md text-on-surface">{{ s.language || '—' }}</span>
              </div>

              <!-- Location & Coordinates -->
              <div class="flex flex-col gap-0.5 md:col-span-2">
                <span class="label-caps text-on-surface-variant text-[10px]">{{ t('admin.anLocation') }} & {{ t('admin.anCoordinates') }}</span>
                <span class="body-md text-on-surface">
                  {{ locOf(s) }}
                  <span v-if="s.latitude && s.longitude" class="text-on-surface-variant font-mono text-[11px] block mt-0.5">
                    Lat: {{ s.latitude }}, Lng: {{ s.longitude }}
                  </span>
                </span>
              </div>

              <!-- Referrer -->
              <div class="flex flex-col gap-0.5 md:col-span-2">
                <span class="label-caps text-on-surface-variant text-[10px]">{{ t('admin.anReferrer') }}</span>
                <span class="body-md text-on-surface truncate">{{ s.referrer || 'Direct / None' }}</span>
              </div>

              <!-- Pages Opened Sequence -->
              <div class="flex flex-col gap-1 md:col-span-4">
                <span class="label-caps text-on-surface-variant text-[10px]">{{ t('admin.anPagesOpened') }}</span>
                <div class="flex flex-wrap gap-1.5 mt-0.5">
                  <span
                    v-for="pg in s.pages"
                    :key="pg"
                    class="neu-raised px-2.5 py-1 rounded-full body-md text-on-surface font-mono text-[11px] flex items-center gap-1.5"
                  >
                    <Icon name="ph:file-bold" class="text-primary text-xs" />
                    {{ pg }}
                  </span>
                  <span v-if="!s.pages.length" class="body-md text-on-surface-variant text-[11px]">—</span>
                </div>
              </div>

              <!-- User Agent -->
              <div class="flex flex-col gap-0.5 md:col-span-4 pt-1">
                <span class="label-caps text-on-surface-variant text-[10px]">User Agent</span>
                <span class="body-md text-on-surface-variant font-mono text-[11px] break-all bg-surface/50 p-2 rounded-lg neu-pressed">
                  {{ s.user_agent || '—' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>