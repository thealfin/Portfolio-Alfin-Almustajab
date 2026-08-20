<script setup lang="ts">
import { motion } from 'motion-v'

const props = defineProps<{
  profile: any
}>()
const { t } = useI18n()
const { pick } = useLocale()
const { scrollTo } = useScrollTo()

const initials = computed(() => {
  const fullName = props.profile?.full_name ?? 'Alfin Almustajab'
  return fullName
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
})
</script>

<template>
  <section id="home" class="relative w-full px-5 md:px-8 max-w-7xl mx-auto pt-24 md:pt-30 flex flex-col items-start gap-5 scroll-mt-24">
    <motion.div
      class="flex items-center gap-3"
      :initial="{ opacity: 0, y: 30 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.6 }"
    >
      <span class="w-10 h-[2px] bg-primary" />
      <span class="label-caps text-on-surface-variant uppercase tracking-[0.2em]">
        {{ profile?.eyebrow_text ?? t('hero.eyebrow') }}
      </span>
    </motion.div>

    <motion.h1
      class="display-lg text-on-surface leading-[1.1] relative z-10"
      :initial="{ opacity: 0, y: 30 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.8 }"
    >
      {{ profile?.full_name ?? 'Alfin Almustajab' }}
    </motion.h1>

    <motion.p
      class="body-lg text-on-surface-variant max-w-[520px]"
      :initial="{ opacity: 0, y: 30 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 1 }"
    >
      {{ pick(profile ?? {}, 'tagline') || t('hero.tagline') }}
    </motion.p>

    <motion.div
      class="flex items-center gap-4 mt-6"
      :initial="{ opacity: 0, y: 30 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 1.2 }"
    >
      <button
        class="neu-accent px-6 py-3 rounded-full font-bold hover:-translate-y-1 transition-all duration-300"
        @click="scrollTo('projects')"
      >
        {{ t('featured.viewAll') }}
      </button>
      <button
        class="neu-raised px-6 py-3 rounded-full font-bold text-primary hover:neu-pressed transition-all duration-300"
        @click="scrollTo('contact')"
      >
        {{ t('nav.contact') }}
      </button>
    </motion.div>
  </section>
</template>