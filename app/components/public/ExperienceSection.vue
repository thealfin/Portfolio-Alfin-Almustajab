<script setup lang="ts">
import { motion } from 'motion-v'

const props = defineProps<{
  experiences: any
  certifications: any
}>()
const { t } = useI18n()
const { pickArray } = useLocale()

const education = computed(() => (props.certifications ?? []).filter((c: any) => c.type === 'education'))
const certs = computed(() => (props.certifications ?? []).filter((c: any) => c.type !== 'education'))

const formatDate = (iso: string | null) => {
  if (!iso) return ''
  return formatWibMonthYear(iso)
}

const periodLabel = (e: any) => {
  const start = formatDate(e.start_date)
  const end = e.is_current ? t('experience.now') : formatDate(e.end_date)
  return `${start} — ${end}`.toUpperCase()
}
</script>

<template>
  <motion.section
    id="experience"
    class="w-full relative z-10"
    :initial="{ opacity: 0, y: 40 }"
    :while-in-view="{ opacity: 1, y: 0 }"
    :viewport="{ once: true, margin: '-80px' }"
    :transition="{ duration: 0.7 }"
  >
    <SectionHeading :eyebrow="t('experience.title')">
      {{ t('experience.title') }}
    </SectionHeading>

    <div class="max-w-4xl mx-auto w-full mt-10">
      <div class="flex flex-col gap-6 relative">
        <div class="hidden md:block absolute left-7 top-8 bottom-8 w-1 bg-surface-variant rounded-full z-0" />

        <div v-for="e in experiences" :key="e.id" class="relative z-10 flex flex-col md:flex-row gap-5 w-full group">
          <div class="hidden md:flex flex-col items-center pt-5 z-10">
            <div class="w-14 h-14 rounded-full neu-raised flex items-center justify-center transition-all duration-300">
              <div class="w-7 h-7 rounded-full neu-accent flex items-center justify-center">
                <Icon name="ph:briefcase-bold" class="text-sm text-on-primary" />
              </div>
            </div>
          </div>

          <div class="flex-1 neu-raised p-6 rounded-card hover:-translate-y-1 transition-transform duration-300">
            <div class="flex flex-col md:flex-row justify-between items-start mb-4 gap-4">
              <div class="flex flex-col gap-1">
                <h3 class="title-md text-on-surface">{{ e.role_title }}</h3>
                <p class="body-md text-primary font-bold">{{ e.company }}</p>
              </div>
              <div class="neu-pressed px-3.5 py-1.5 rounded-full">
                <span class="label-caps text-on-surface-variant">{{ periodLabel(e) }}</span>
              </div>
            </div>

            <ul class="space-y-2.5 body-md text-on-surface-variant">
              <li v-for="(a, i) in pickArray(e, 'achievements')" :key="i" class="flex gap-3 items-start">
                <Icon name="ph:check-circle-fill" class="text-primary mt-1 shrink-0" />
                <span>{{ a }}</span>
              </li>
            </ul>

            <div class="flex flex-wrap gap-2 mt-4">
              <span
                v-for="tech in e.tech_stack"
                :key="tech"
                class="neu-pressed px-2.5 py-1 rounded-full label-caps text-on-surface-variant text-[10px]"
              >
                {{ tech }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto w-full mt-10">
      <div class="flex flex-col md:flex-row gap-8">
        <div class="flex-1 flex flex-col gap-5">
          <h2 class="headline-lg text-on-surface flex items-center gap-3">
            <span class="w-10 h-10 rounded-full neu-pressed flex items-center justify-center text-primary">
              <Icon name="ph:graduation-cap-bold" />
            </span>
            {{ t('experience.education') }}
          </h2>
          <div v-for="ed in education" :key="ed.id" class="neu-raised p-5 rounded-card flex flex-col gap-2">
            <h4 class="title-md text-on-surface">{{ ed.title }}</h4>
            <p class="body-md text-primary">{{ ed.issuer }}</p>
            <p class="label-caps text-on-surface-variant mt-1.5">{{ ed.year }}</p>
          </div>
        </div>

        <div class="flex-1 flex flex-col gap-5">
          <h2 class="headline-lg text-on-surface flex items-center gap-3">
            <span class="w-10 h-10 rounded-full neu-pressed flex items-center justify-center text-primary">
              <Icon name="ph:certificate-bold" />
            </span>
            {{ t('experience.certifications') }}
          </h2>
          <div class="flex flex-wrap gap-3">
            <div v-for="c in certs" :key="c.id" class="neu-raised px-5 py-3 rounded-full flex items-center gap-3">
              <span class="w-2 h-2 rounded-full bg-primary" />
              <span class="body-md text-on-surface-variant font-bold">{{ c.title }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.section>
</template>