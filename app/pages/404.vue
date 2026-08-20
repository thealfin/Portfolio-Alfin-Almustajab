<script setup lang="ts">
import { motion } from 'motion-v'

const { t } = useI18n()
</script>

<template>
  <div class="relative w-full min-h-[75vh] flex items-center justify-center px-5 md:px-8">
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-16 right-10 w-[520px] h-[520px] bg-primary/10 rounded-full blur-[100px] mix-blend-multiply opacity-50" />
      <div class="absolute bottom-24 left-[-100px] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[80px] mix-blend-multiply opacity-30" />
    </div>

    <motion.div
      class="w-full max-w-2xl neu-raised rounded-[32px] p-10 md:p-14 flex flex-col items-center text-center gap-7 relative"
      :initial="{ opacity: 0, y: 30 }"
      :animate="{ opacity: 1, y: 0 }"
      :transition="{ duration: 0.6 }"
    >
      <span class="text-8xl md:text-9xl font-extrabold tracking-tighter text-primary/20 select-none leading-none">404</span>

      <div class="flex flex-col gap-3 items-center">
        <h1 class="display-lg text-on-surface">{{ t('notFound.title') }}</h1>
        <p class="body-lg text-on-surface-variant max-w-md">{{ t('notFound.subtitle') }}</p>
        <span class="label-caps text-on-surface-variant uppercase tracking-[0.2em] mt-2">{{ t('notFound.hint') }}</span>
      </div>

      <div class="flex flex-col sm:flex-row items-center gap-4">
        <NuxtLink
          to="/"
          class="neu-accent px-7 py-3.5 rounded-full font-bold flex items-center gap-2 hover:-translate-y-1 transition-all duration-300"
        >
          <Icon name="ph:arrow-left-bold" class="text-lg" />
          {{ t('notFound.home') }}
        </NuxtLink>
        <NuxtLink
          to="/#projects"
          class="neu-raised px-7 py-3.5 rounded-full font-bold text-primary hover:neu-pressed transition-all duration-300"
        >
          {{ t('notFound.projects') }}
        </NuxtLink>
        <NuxtLink
          to="/#contact"
          class="neu-raised px-7 py-3.5 rounded-full font-bold text-on-surface-variant hover:text-primary hover:neu-pressed transition-all duration-300"
        >
          {{ t('notFound.contact') }}
        </NuxtLink>
      </div>
    </motion.div>
  </div>
</template>
