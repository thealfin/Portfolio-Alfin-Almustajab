<script setup lang="ts">
import { motion } from 'motion-v'

const props = defineProps<{
  profile: any
}>()
const { t } = useI18n()

const fullName = computed(() => props.profile?.full_name ?? 'Alfin Almustajab')
const avatarUrl = computed(() => props.profile?.avatar_url ?? '/alfin-photo.webp')
</script>

<template>
  <motion.section
    id="about"
    class="relative z-10 w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start"
    :initial="{ opacity: 0, y: 40 }"
    :while-in-view="{ opacity: 1, y: 0 }"
    :viewport="{ once: true, margin: '-80px' }"
    :transition="{ duration: 0.7 }"
  >
    <motion.div
      class="neu-raised rounded-card p-6 md:p-8 w-full hover:-translate-y-1 transition-transform duration-500"
      :initial="{ opacity: 0, y: 40 }"
      :while-in-view="{ opacity: 1, y: 0 }"
      :viewport="{ once: true, margin: '-80px' }"
      :transition="{ duration: 0.7, delay: 0.1 }"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <span class="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span class="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span class="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span class="label-caps text-on-surface-variant">{{ t('about.fileLabel') }}</span>
      </div>

      <!-- Profile Avatar Container: Scaled up and flush with bottom border (meper tanpa potongan) -->
      <div class="relative neu-pressed rounded-[20px] mt-6 md:mt-8 pt-5 px-5 md:pt-7 md:px-7 pb-0 flex items-end justify-center overflow-hidden min-h-[360px] md:min-h-[420px]">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_50%_32%,rgba(0,91,178,0.10),transparent_62%)] pointer-events-none" />
        <img
          :src="avatarUrl"
          :alt="t('about.photoAlt')"
          class="relative z-10 w-full max-w-[340px] md:max-w-[380px] h-auto object-cover object-bottom scale-110 sm:scale-115 md:scale-120 origin-bottom mix-blend-normal drop-shadow-[0_20px_32px_rgba(17,28,44,0.25)] block align-bottom -mb-0.5"
        />
      </div>

      <div class="my-6 md:my-8 h-px bg-gradient-to-r from-transparent via-outline-variant/70 to-transparent" />

      <div class="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p class="headline-lg text-on-surface">{{ fullName }}</p>
          <div class="title-md text-on-surface-variant mt-1 flex items-center gap-1.5 flex-wrap">
            <span>Specialized as</span>
            <RoleSwitcher custom-class="text-primary font-bold" />
          </div>
        </div>
        <div class="neu-island rounded-full px-4 py-2 flex items-center gap-2">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <span class="label-caps text-on-surface-variant">{{ t('about.available') }}</span>
        </div>
      </div>
    </motion.div>

    <div class="flex flex-col gap-6 md:pt-3">
      <div class="flex items-center gap-2.5">
        <span class="w-10 h-[2px] bg-primary" />
        <span class="label-caps text-on-surface-variant uppercase tracking-[0.2em]">{{ t('about.kicker') }}</span>
      </div>

      <h2 class="display-lg text-on-surface leading-[1.1]">
        <span class="font-extrabold">{{ t('about.headingBold') }}</span>
        <br>
        <span class="text-primary">{{ t('about.headingItalic') }}</span>
      </h2>

      <!-- Infinite Marquee Roles Banner -->
      <div class="w-full max-w-[560px] overflow-hidden py-1 select-none relative group border-y border-outline-variant/30 my-1">
        <div class="flex items-center gap-6 whitespace-nowrap animate-marquee group-hover:[animation-play-state:paused]">
          <span class="label-caps text-on-surface-variant font-bold tracking-[0.2em] flex items-center gap-2">
            <span class="text-primary font-black text-xs">||</span>
            <span class="text-primary">•</span> Full-Stack
            <span class="text-primary">•</span> UI UX Designer
            <span class="text-primary">•</span> IT Support
            <span class="text-primary">•</span> Digital Marketing
            <span class="text-primary">•</span> AI Enthusiast
            <span class="text-primary">•</span> Web Builder
            <span class="text-primary">•</span> Copywriter
            <span class="text-primary font-black text-xs">||</span>
          </span>
          <span class="label-caps text-on-surface-variant font-bold tracking-[0.2em] flex items-center gap-2" aria-hidden="true">
            <span class="text-primary font-black text-xs">||</span>
            <span class="text-primary">•</span> Full-Stack
            <span class="text-primary">•</span> UI UX Designer
            <span class="text-primary">•</span> IT Support
            <span class="text-primary">•</span> Digital Marketing
            <span class="text-primary">•</span> AI Enthusiast
            <span class="text-primary">•</span> Web Builder
            <span class="text-primary">•</span> Copywriter
            <span class="text-primary font-black text-xs">||</span>
          </span>
        </div>
      </div>

      <p class="body-lg text-on-surface-variant max-w-[560px]">
        {{ t('about.p1') }}
      </p>
      <p class="body-lg text-on-surface-variant max-w-[560px]">
        {{ t('about.p2') }}
      </p>

      <div class="mt-2 pt-6 border-t border-outline-variant/60 flex flex-col gap-3">
        <span class="label-caps text-on-surface-variant">{{ t('about.greeting') }}</span>
        <img
          src="/my-signature.webp"
          :alt="t('about.signatureAlt')"
          class="w-36 md:w-44 h-auto select-none opacity-90"
        />
      </div>
    </div>

    <motion.div
      class="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5"
      :initial="{ opacity: 0, y: 40 }"
      :while-in-view="{ opacity: 1, y: 0 }"
      :viewport="{ once: true, margin: '-80px' }"
      :transition="{ duration: 0.7, delay: 0.2 }"
    >
      <div class="neu-raised rounded-card p-6 flex flex-col items-center justify-center gap-2 hover:neu-pressed transition-shadow duration-300 cursor-default">
        <StatCounter :value="profile?.years_experience ?? 1" suffix="+" />
        <span class="label-caps text-on-surface-variant text-center">{{ t('about.yearsLabel') }}</span>
      </div>
      <div class="neu-raised rounded-card p-6 flex flex-col items-center justify-center gap-2 hover:neu-pressed transition-shadow duration-300 cursor-default">
        <StatCounter :value="profile?.projects_completed ?? 3" suffix="+" />
        <span class="label-caps text-on-surface-variant text-center">{{ t('about.projectsLabel') }}</span>
      </div>
      <div class="neu-raised rounded-card p-6 flex flex-col items-center justify-center gap-2 hover:neu-pressed transition-shadow duration-300 cursor-default">
        <StatCounter :value="profile?.clients_served ?? 3" suffix="+" />
        <span class="label-caps text-on-surface-variant text-center">{{ t('about.clientsLabel') }}</span>
      </div>
    </motion.div>
  </motion.section>
</template>
