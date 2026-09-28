<script setup lang="ts">
import { motion } from 'motion-v'

export interface ContributionDay {
  date: string
  count: number
  level: number
  repos?: string[]
}

export interface ActivityRepo {
  name: string
  commits: number
  url: string
  language?: string
  date?: string
  action?: string
}

export interface MonthActivity {
  month: string
  year: number
  totalCommits: number
  repos: ActivityRepo[]
}

export interface ContributionsApiResponse {
  selectedYear: number
  availableYears: number[]
  totals: {
    [year: string]: number
    allTime: number
  }
  contributions: ContributionDay[]
  activityFeed: MonthActivity[]
  source: string
}

const { t } = useI18n()
const selectedYear = ref<number>(2026)
const showActivityFeed = ref(true)

// Fetch real data from server API with reactive year
const { data, status } = await useFetch<ContributionsApiResponse>(
  () => `/api/github-contributions?year=${selectedYear.value}`,
  {
    lazy: true,
    server: true,
    watch: [selectedYear],
  }
)

const isLoading = computed(() => status.value === 'pending')

const currentYearTotal = computed(() => {
  if (selectedYear.value === 2026) return data.value?.totals?.['2026'] ?? 86
  if (selectedYear.value === 2025) return data.value?.totals?.['2025'] ?? 49
  return 86
})

// Organize contributions into weeks (7 days each: Sunday to Saturday)
const weeks = computed(() => {
  const days = data.value?.contributions || []
  if (days.length === 0) return []

  const result: ContributionDay[][] = []
  let currentWeek: ContributionDay[] = []

  // Ensure first day aligns with its day of week without timezone offset issues
  const [y, m, d] = days[0].date.split('-').map(Number)
  const firstDate = new Date(y, m - 1, d)
  const firstDayOfWeek = firstDate.getDay() // 0 = Sunday

  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({ date: '', count: -1, level: -1 })
  }

  days.forEach((day) => {
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      result.push(currentWeek)
      currentWeek = []
    }
  })

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: '', count: -1, level: -1 })
    }
    result.push(currentWeek)
  }

  return result
})

// Month labels calculation based on columns
const monthLabels = computed(() => {
  if (weeks.value.length === 0) return []
  const labels: { name: string; colIndex: number }[] = []
  let lastMonth = -1

  weeks.value.forEach((week, colIdx) => {
    const validDay = week.find((d) => d.date)
    if (validDay) {
      const [y, m, d] = validDay.date.split('-').map(Number)
      const dateObj = new Date(y, m - 1, d)
      const monthIdx = dateObj.getMonth()
      if (monthIdx !== lastMonth) {
        lastMonth = monthIdx
        labels.push({
          name: dateObj.toLocaleString('en-US', { month: 'short' }),
          colIndex: colIdx,
        })
      }
    }
  })

  return labels
})

// Interactive Tooltip state
const activeTooltip = ref<{
  visible: boolean
  x: number
  y: number
  date: string
  count: number
  repos?: string[]
} | null>(null)

const handleMouseEnter = (event: MouseEvent, day: ContributionDay) => {
  if (day.count < 0) return
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  activeTooltip.value = {
    visible: true,
    x: rect.left + rect.width / 2,
    y: rect.top - 8,
    date: day.date,
    count: day.count,
    repos: day.repos,
  }
}

const handleMouseLeave = () => {
  activeTooltip.value = null
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Initial Blue Theme Color Scale (matching Etheric Soft UI / primary brand tone)
const getLevelClass = (level: number) => {
  switch (level) {
    case 1:
      return 'bg-[#93c5fd] hover:ring-2 hover:ring-[#93c5fd]/90 shadow-[0_1px_2px_rgba(147,197,253,0.35)]'
    case 2:
      return 'bg-[#60a5fa] hover:ring-2 hover:ring-[#60a5fa]/90 shadow-[0_1px_3px_rgba(96,165,250,0.4)]'
    case 3:
      return 'bg-[#3a7bd5] hover:ring-2 hover:ring-[#3a7bd5]/90 shadow-[0_1px_4px_rgba(58,123,213,0.45)]'
    case 4:
      return 'bg-[#005bb2] hover:ring-2 hover:ring-[#005bb2]/90 shadow-[0_2px_6px_rgba(0,91,178,0.5)]'
    case 0:
    default:
      return 'bg-[#ebedf0] hover:bg-[#d0d7de] border border-black/5 dark:bg-white/5 dark:border-white/10'
  }
}
</script>

<template>
  <motion.section
    id="github-activity"
    class="w-full relative z-10 scroll-mt-24"
    :initial="{ opacity: 0, y: 40 }"
    :while-in-view="{ opacity: 1, y: 0 }"
    :viewport="{ once: true, margin: '-60px' }"
    :transition="{ duration: 0.7 }"
  >
    <div class="neu-raised rounded-card p-6 md:p-8 transition-shadow duration-300">
      <!-- 1. Header & Controls -->
      <div class="flex items-center justify-between flex-wrap gap-4 mb-6 pb-5 border-b border-outline-variant/40">
        <!-- Sisi Kiri: Judul Section & Badge Total Commit (Biru) -->
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span class="label-caps text-on-surface-variant uppercase tracking-[0.2em]">
              {{ t('github.kicker') }}
            </span>
          </div>
          <div class="flex items-center gap-3 flex-wrap">
            <h2 class="headline-lg text-on-surface">
              {{ t('github.title') }}
            </h2>
            <div class="neu-island rounded-full px-3.5 py-1 flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 border border-primary/20">
              <Icon name="ph:git-commit-bold" class="w-3.5 h-3.5" />
              <span>{{ currentYearTotal }} contributions in {{ selectedYear }}</span>
            </div>
          </div>
        </div>

        <!-- Sisi Kanan: Year Selector & Direct Profile Badge -->
        <div class="flex items-center gap-3 flex-wrap">
          <!-- Year Selector (2026 / 2025) ala GitHub Profile -->
          <div class="flex items-center p-1 rounded-full bg-[var(--surface-base)] border border-outline-variant/50 text-xs font-bold">
            <button
              type="button"
              :class="[
                'px-3.5 py-1 rounded-full transition-all duration-200',
                selectedYear === 2026
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              ]"
              @click="selectedYear = 2026"
            >
              2026
            </button>
            <button
              type="button"
              :class="[
                'px-3.5 py-1 rounded-full transition-all duration-200',
                selectedYear === 2025
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              ]"
              @click="selectedYear = 2025"
            >
              2025
            </button>
          </div>

          <!-- Direct Link to Profile -->
          <a
            href="https://github.com/thealfin"
            target="_blank"
            rel="noopener noreferrer"
            class="neu-raised hover:neu-pressed rounded-full px-4 py-2 flex items-center gap-2.5 transition-all duration-300 hover:scale-[1.02] group"
            aria-label="Direct link to Alfin's GitHub profile"
          >
            <div class="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <svg
                role="img"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
                class="w-4 h-4 group-hover:rotate-12 transition-transform duration-300"
                aria-hidden="true"
              >
                <title>GitHub</title>
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </div>
            <div class="flex flex-col items-start leading-none">
              <span class="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">@thealfin</span>
              <div class="flex items-center gap-1 mt-0.5">
                <span class="w-1.5 h-1.5 rounded-full bg-primary" />
                <span class="text-[9px] font-semibold text-on-surface-variant/80">Active</span>
              </div>
            </div>
            <Icon name="ph:arrow-up-right-bold" class="w-3.5 h-3.5 text-on-surface-variant group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>
      </div>

      <!-- 2. GitHub Contribution Heatmap Grid (Blue Dots) -->
      <div class="relative w-full">
        <!-- Skeleton Loading State -->
        <div v-if="isLoading" class="w-full flex flex-col gap-2 py-6 animate-pulse">
          <div class="h-4 bg-outline-variant/30 rounded w-1/3 mb-2" />
          <div class="h-28 bg-outline-variant/20 rounded-xl w-full" />
        </div>

        <!-- Heatmap Container -->
        <div v-else class="w-full overflow-x-auto custom-scrollbar pb-3 pt-1">
          <div class="min-w-[760px] flex flex-col gap-1.5 select-none">
            <!-- Month Headers -->
            <div class="flex text-[11px] font-semibold text-on-surface-variant/75 pl-8 h-4 relative">
              <span
                v-for="m in monthLabels"
                :key="m.colIndex"
                class="absolute"
                :style="{ left: `${m.colIndex * 14 + 32}px` }"
              >
                {{ m.name }}
              </span>
            </div>

            <!-- Heatmap Body: Day of Week + 52 Weeks Grid -->
            <div class="flex items-start gap-2">
              <!-- Day of Week Labels -->
              <div class="flex flex-col justify-between text-[10px] font-medium text-on-surface-variant/60 h-[100px] w-6 pt-0.5">
                <span>Mon</span>
                <span>Wed</span>
                <span>Fri</span>
              </div>

              <!-- 52 Weeks Columns -->
              <div class="flex items-center gap-[3px]">
                <div
                  v-for="(week, wIdx) in weeks"
                  :key="wIdx"
                  class="flex flex-col gap-[3px]"
                >
                  <template v-for="(day, dIdx) in week" :key="dIdx">
                    <!-- Placeholder cell -->
                    <div
                      v-if="day.count < 0"
                      class="w-[11.5px] h-[11.5px] opacity-0 pointer-events-none"
                    />
                    <!-- Active Contribution cell with Blue Scale -->
                    <button
                      v-else
                      type="button"
                      :class="[
                        'w-[11.5px] h-[11.5px] rounded-[2.5px] transition-transform duration-150 transform-gpu focus:outline-none focus:ring-2 focus:ring-primary',
                        getLevelClass(day.level)
                      ]"
                      :aria-label="`${day.count} contributions on ${day.date}`"
                      @mouseenter="handleMouseEnter($event, day)"
                      @mouseleave="handleMouseLeave"
                      @focus="handleMouseEnter($event, day)"
                      @blur="handleMouseLeave"
                    />
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Floating Tooltip -->
        <Teleport to="body">
          <div
            v-if="activeTooltip?.visible"
            :style="{
              left: `${activeTooltip.x}px`,
              top: `${activeTooltip.y}px`,
            }"
            class="fixed z-50 -translate-x-1/2 -translate-y-full pointer-events-none transition-all duration-100 ease-out"
          >
            <div class="neu-raised px-3 py-2 rounded-xl shadow-xl text-xs flex flex-col items-center gap-0.5 border border-outline-variant/60 bg-surface whitespace-nowrap">
              <span class="font-bold text-primary">
                {{ activeTooltip.count }} {{ activeTooltip.count === 1 ? 'contribution' : 'contributions' }}
              </span>
              <span class="text-[10px] text-on-surface-variant">
                {{ formatDate(activeTooltip.date) }}
              </span>
              <div v-if="activeTooltip.repos?.length" class="mt-1 pt-1 border-t border-outline-variant/30 flex flex-col gap-0.5">
                <span
                  v-for="(r, rIdx) in activeTooltip.repos"
                  :key="rIdx"
                  class="text-[9.5px] text-primary font-mono truncate max-w-[240px]"
                >
                  {{ r }}
                </span>
              </div>
            </div>
          </div>
        </Teleport>
      </div>

      <!-- 3. Heatmap Legend & Summary -->
      <div class="mt-4 pt-3 border-t border-outline-variant/30 flex items-center justify-between flex-wrap gap-4 text-xs">
        <span class="text-[11px] text-on-surface-variant/70">
          Showing real contribution records for <strong>@thealfin</strong> in <strong>{{ selectedYear }}</strong>
        </span>

        <!-- Heatmap Legend (Blue Scale) -->
        <div class="flex items-center gap-1.5 text-on-surface-variant/70 font-medium">
          <span class="text-[10px]">{{ t('github.less') }}</span>
          <div class="w-[10px] h-[10px] rounded-[2px] bg-[#ebedf0] dark:bg-white/10" />
          <div class="w-[10px] h-[10px] rounded-[2px] bg-[#93c5fd]" />
          <div class="w-[10px] h-[10px] rounded-[2px] bg-[#60a5fa]" />
          <div class="w-[10px] h-[10px] rounded-[2px] bg-[#3a7bd5]" />
          <div class="w-[10px] h-[10px] rounded-[2px] bg-[#005bb2]" />
          <span class="text-[10px]">{{ t('github.more') }}</span>
        </div>
      </div>

      <!-- 4. Real Contribution Activity Timeline Breakdown -->
      <div class="mt-6 pt-5 border-t border-outline-variant/40 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h3 class="title-md text-on-surface font-bold flex items-center gap-2">
            <Icon name="ph:clock-counter-clockwise-bold" class="w-4 h-4 text-primary" />
            <span>Contribution Activity — {{ selectedYear }}</span>
          </h3>
          <button
            type="button"
            class="text-xs font-semibold text-primary hover:underline"
            @click="showActivityFeed = !showActivityFeed"
          >
            {{ showActivityFeed ? 'Collapse' : 'Expand' }}
          </button>
        </div>

        <div v-if="showActivityFeed" class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div
            v-for="(feed, fIdx) in data?.activityFeed || []"
            :key="fIdx"
            class="neu-raised rounded-xl p-4 flex flex-col gap-2.5 border border-outline-variant/30 hover:border-primary/40 transition-colors"
          >
            <!-- Month Header -->
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-on-surface">{{ feed.month }} {{ feed.year }}</span>
              <span class="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                {{ feed.totalCommits }} commits
              </span>
            </div>

            <!-- Repositories List with Links -->
            <div class="flex flex-col gap-1.5 mt-0.5">
              <a
                v-for="(repo, rIdx) in feed.repos"
                :key="rIdx"
                :href="repo.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center justify-between text-xs text-on-surface-variant hover:text-primary transition-colors py-1 border-b border-outline-variant/20 last:border-b-0 group/item"
              >
                <div class="flex items-center gap-2 truncate pr-2">
                  <Icon name="ph:git-branch-bold" class="w-3.5 h-3.5 text-on-surface-variant group-hover/item:text-primary shrink-0" />
                  <div class="flex flex-col truncate">
                    <span class="font-mono text-[11px] font-medium truncate">{{ repo.name }}</span>
                    <span v-if="repo.action" class="text-[9px] text-primary italic">{{ repo.action }}</span>
                  </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <span v-if="repo.language" class="text-[9.5px] px-1.5 py-0.2 rounded bg-surface border border-outline-variant/40 text-on-surface-variant">
                    {{ repo.language }}
                  </span>
                  <span class="text-[10px] font-bold text-on-surface font-mono">
                    {{ repo.commits }} {{ repo.commits === 1 ? 'commit' : 'commits' }}
                  </span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.section>
</template>
