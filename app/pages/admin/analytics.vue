<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { analytics } = useAdmin()
const { t } = useI18n()

const range = ref(7)
const loading = ref(false)
const error = ref<string | null>(null)
const data = ref<any>(null)

const load = async () => {
  loading.value = true
  error.value = null
  try {
    const { data: res } = await analytics(range.value)
    data.value = res
  } catch (e: any) {
    error.value = e?.response?.data?.statusMessage ?? e?.message ?? 'Gagal memuat analitik'
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(range, load)

const rangeOptions = [7, 14, 30, 90]

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

const colors = ['#005bb2', '#0EA5E9', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#14B8A6', '#F97316', '#6366F1', '#EC4899']

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
  if (s < 60) return `${s} dtk`
  const m = Math.floor(s / 60)
  const rs = s % 60
  if (m < 60) return `${m}m ${rs}s`
  const h = Math.floor(m / 60)
  return `${h}j ${m % 60}m`
}

const fmtTime = (iso?: string) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const locOf = (s: any) => [s.city, s.region, s.country].filter(Boolean).join(', ') || '—'

const deviceIcon = (d?: string) => {
  if (d === 'Mobile') return 'ph:device-mobile-bold'
  if (d === 'Tablet') return 'ph:device-tablet-bold'
  return 'ph:desktop-bold'
}

const expand = ref<Set<string>>(new Set())
const toggleExpand = (id: string) => {
  const next = new Set(expand.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  expand.value = next
}
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
      <div class="flex flex-col gap-1.5">
        <h1 class="headline-lg text-on-surface">{{ t('admin.analyticsTitle') }}</h1>
        <p class="body-md text-on-surface-variant">{{ t('admin.analyticsSubtitle') }}</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex gap-1.5 bg-surface p-0.5 rounded-full neu-pressed self-start">
          <button
            v-for="d in rangeOptions"
            :key="d"
            class="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            :class="range === d ? 'text-primary neu-raised' : 'text-on-surface-variant hover:text-on-surface'"
            @click="range = d"
          >
            {{ d }} {{ t('admin.analyticsDays') }}
          </button>
        </div>
        <button
          class="neu-raised px-4 py-2.5 rounded-full flex items-center gap-2 text-primary font-bold body-md hover:neu-pressed transition-all"
          @click="load"
        >
          <Icon name="ph:arrows-clockwise-bold" class="text-base" :class="loading ? 'animate-spin' : ''" />
        </button>
      </div>
    </div>

    <p v-if="error" class="body-md text-error">{{ error }}</p>
    <p v-if="loading && !data" class="body-md text-on-surface-variant">{{ t('admin.loading') }}</p>

    <template v-if="data">
      <!-- Ringkasan -->
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
          <span class="headline-lg text-on-surface">{{ data.activeNow }}</span>
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

      <!-- Grafik harian -->
      <section class="neu-raised rounded-[18px] p-5 flex flex-col w-full relative overflow-hidden">
        <div class="absolute -right-24 -top-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl mix-blend-multiply pointer-events-none" />
        <div class="mb-5 z-10">
          <h2 class="title-md text-on-surface">{{ t('admin.anDailyTrend') }}</h2>
          <p class="body-md text-on-surface-variant mt-0.5">{{ t('admin.anDailyTrendSubtitle') }}</p>
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

      <!-- Donut browser / device / negara + daftar -->
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
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

        <div class="neu-raised rounded-[18px] p-5 flex flex-col w-full">
          <h2 class="title-md text-on-surface mb-4">{{ t('admin.anDevices') }}</h2>
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
          <div class="mt-4 flex flex-col gap-1.5">
            <div v-for="(i, idx) in devicesDonut.items" :key="i.label" class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <div class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: colors[idx % colors.length] }" />
                <span class="body-md text-on-surface">{{ i.label }}</span>
              </div>
              <span class="font-medium text-on-surface-variant">{{ i.count }}</span>
            </div>
            <p v-if="!devicesDonut.items.length" class="body-md text-on-surface-variant">{{ t('admin.anEmpty') }}</p>
          </div>
        </div>

        <div class="neu-raised rounded-[18px] p-5 flex flex-col w-full">
          <h2 class="title-md text-on-surface mb-4">{{ t('admin.anCountries') }}</h2>
          <div class="flex flex-col gap-2.5 mt-1">
            <div v-for="(i, idx) in data.countries ?? []" :key="i.label" class="flex flex-col gap-1">
              <div class="flex items-center justify-between">
                <span class="body-md text-on-surface flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: colors[idx % colors.length] }" />
                  {{ i.label }}
                </span>
                <span class="font-medium text-on-surface-variant">{{ i.count }}</span>
              </div>
              <div class="w-full h-1.5 bg-surface rounded-full overflow-hidden neu-pressed">
                <div class="h-full rounded-full" :style="{ width: `${(i.count / maxCount(data.countries)) * 100}%`, backgroundColor: colors[idx % colors.length] }" />
              </div>
            </div>
            <p v-if="!(data.countries ?? []).length" class="body-md text-on-surface-variant">{{ t('admin.anEmpty') }}</p>
          </div>
          <h2 class="title-md text-on-surface mb-3 mt-6">{{ t('admin.anTopPages') }}</h2>
          <div class="flex flex-col gap-2.5">
            <div v-for="(i, idx) in data.pages ?? []" :key="i.label" class="flex items-center justify-between">
              <span class="body-md text-on-surface truncate flex items-center gap-2">
                <Icon name="ph:file-text-bold" class="text-primary text-sm shrink-0" />
                {{ i.label }}
              </span>
              <span class="font-medium text-on-surface-variant ml-2 shrink-0">{{ i.count }}</span>
            </div>
            <p v-if="!(data.pages ?? []).length" class="body-md text-on-surface-variant">{{ t('admin.anEmpty') }}</p>
          </div>
        </div>
      </section>

      <!-- Detail pengunjung -->
      <section class="neu-raised rounded-[18px] p-5 flex flex-col w-full">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="title-md text-on-surface">{{ t('admin.anVisitorDetails') }}</h2>
            <p class="body-md text-on-surface-variant mt-0.5">{{ t('admin.anVisitorDetailsSubtitle') }}</p>
          </div>
        </div>

        <div v-if="!data.sessions.length" class="border-2 border-dashed border-outline-variant/40 rounded-[16px] p-8 flex flex-col items-center gap-3 text-on-surface-variant">
          <Icon name="ph:chart-bar-bold" class="text-3xl text-outline" />
          <p class="body-md text-center">{{ t('admin.anEmpty') }}</p>
        </div>

        <div v-else class="flex flex-col gap-3">
          <div
            v-for="s in data.sessions"
            :key="s.session_id"
            class="neu-pressed rounded-[16px] px-4 py-3.5 flex flex-col gap-2"
          >
            <button class="w-full flex items-center gap-3 text-left" @click="toggleExpand(s.session_id)">
              <span class="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-primary shrink-0">
                <Icon :name="deviceIcon(s.device_type)" class="text-base" />
              </span>
              <span class="flex-1 min-w-0">
                <span class="flex flex-wrap items-center gap-2">
                  <span class="body-md text-on-surface font-bold">{{ s.browser || '—' }} <span class="text-on-surface-variant font-medium">· {{ s.os || '—' }}</span></span>
                  <span
                    class="px-2 py-0.5 rounded-full label-caps text-[9px] font-bold neu-raised text-primary"
                  >
                    {{ s.device_type || 'Desktop' }}
                  </span>
                </span>
                <span class="block body-md text-on-surface-variant text-[11px] truncate mt-0.5">
                  <Icon name="ph:map-pin-bold" class="inline text-xs mr-0.5" />
                  {{ locOf(s) }} · {{ fmtDuration(s.duration_seconds) }} · {{ fmtTime(s.last_seen) }}
                </span>
              </span>
              <Icon
                :name="expand.has(s.session_id) ? 'ph:caret-up-bold' : 'ph:caret-down-bold'"
                class="text-on-surface-variant shrink-0"
              />
            </button>

            <div v-if="expand.has(s.session_id)" class="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-outline-variant/50">
              <div class="flex flex-col gap-0.5">
                <span class="label-caps text-on-surface-variant">{{ t('admin.anBrowser') }}</span>
                <span class="body-md text-on-surface">{{ s.browser }} <span v-if="s.browser_version" class="text-on-surface-variant">({{ s.browser_version }})</span></span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="label-caps text-on-surface-variant">{{ t('admin.anOS') }}</span>
                <span class="body-md text-on-surface">{{ s.os || '—' }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="label-caps text-on-surface-variant">{{ t('admin.anDevice') }}</span>
                <span class="body-md text-on-surface">{{ s.device_type || '—' }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="label-caps text-on-surface-variant">{{ t('admin.anScreen') }}</span>
                <span class="body-md text-on-surface">{{ s.screen_size || '—' }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="label-caps text-on-surface-variant">{{ t('admin.anLanguage') }}</span>
                <span class="body-md text-on-surface">{{ s.language || '—' }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="label-caps text-on-surface-variant">{{ t('admin.anDuration') }}</span>
                <span class="body-md text-on-surface">{{ fmtDuration(s.duration_seconds) }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="label-caps text-on-surface-variant">{{ t('admin.anReferrer') }}</span>
                <span class="body-md text-on-surface truncate">{{ s.referrer || '—' }}</span>
              </div>
              <div class="flex flex-col gap-0.5">
                <span class="label-caps text-on-surface-variant">{{ t('admin.anLocation') }}</span>
                <span class="body-md text-on-surface">{{ locOf(s) }}</span>
              </div>
              <div class="flex flex-col gap-0.5 md:col-span-4">
                <span class="label-caps text-on-surface-variant">{{ t('admin.anPagesOpened') }}</span>
                <div class="flex flex-wrap gap-2 mt-0.5">
                  <span
                    v-for="pg in s.pages"
                    :key="pg"
                    class="neu-raised px-2.5 py-1 rounded-full body-md text-on-surface-variant text-[11px]"
                  >
                    {{ pg }}
                  </span>
                  <span v-if="!s.pages.length" class="body-md text-on-surface-variant text-[11px]">—</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>