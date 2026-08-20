<script setup lang="ts">
import { motion } from 'motion-v'

const props = defineProps<{
  stacks: { name: string; icon_url: string | null; gemini?: boolean }[]
}>()
const { t } = useI18n()

const broken = ref<Set<string>>(new Set())

const onImgError = (name: string) => {
  broken.value = new Set(broken.value).add(name)
}
</script>

<template>
  <motion.section
    id="stack"
    class="w-full relative z-10"
    :initial="{ opacity: 0, y: 40 }"
    :while-in-view="{ opacity: 1, y: 0 }"
    :viewport="{ once: true, margin: '-80px' }"
    :transition="{ duration: 0.7 }"
  >
    <SectionHeading :eyebrow="t('stack.title')">
      {{ t('stack.title') }}
    </SectionHeading>
    <p class="body-lg text-on-surface-variant max-w-2xl mt-3">{{ t('stack.subtitle') }}</p>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
      <div
        v-for="s in stacks"
        :key="s.name"
        class="neu-raised rounded-card p-5 flex flex-col items-center gap-2.5 hover:neu-pressed transition-shadow duration-300"
      >
        <span class="w-12 h-12 rounded-full neu-raised flex items-center justify-center text-primary">
          <GeminiIcon v-if="s.gemini" class="w-5 h-5 text-[#1a73e8]" />
          <img
            v-else-if="s.icon_url && !broken.has(s.name)"
            :src="s.icon_url"
            :alt="s.name"
            loading="lazy"
            class="w-6 h-6 object-contain"
            @error="onImgError(s.name)"
          />
          <span v-else class="body-lg font-extrabold text-on-surface-variant">{{ s.name?.charAt(0) }}</span>
        </span>
        <span class="body-md text-on-surface font-bold">{{ s.name }}</span>
      </div>
    </div>
  </motion.section>
</template>