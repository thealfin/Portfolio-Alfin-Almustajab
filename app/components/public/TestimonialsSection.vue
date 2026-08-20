<script setup lang="ts">
import { motion } from 'motion-v'

const props = defineProps<{
  testimonials: any
}>()
const { t } = useI18n()
const { pick } = useLocale()

const active = ref(0)
const items = computed(() => props.testimonials ?? [])

watch(active, () => {})
</script>

<template>
  <motion.section
    id="testimonials"
    class="w-full relative z-10"
    :initial="{ opacity: 0, y: 40 }"
    :while-in-view="{ opacity: 1, y: 0 }"
    :viewport="{ once: true, margin: '-80px' }"
    :transition="{ duration: 0.7 }"
  >
    <SectionHeading :eyebrow="t('testimonials.title')">
      {{ t('testimonials.title') }}
    </SectionHeading>

    <div v-if="items.length" class="mt-10 relative">
      <div class="neu-raised rounded-card p-8 md:p-10 flex flex-col gap-6 min-h-[220px] justify-center">
        <Icon name="ph:quotes-fill" class="text-primary text-4xl" />
        <Transition name="fade" mode="out-in">
          <div :key="active" class="flex flex-col gap-5">
            <p class="headline-lg text-on-surface leading-relaxed">
              “{{ pick(items[active], 'quote') }}”
            </p>
            <div>
              <p class="title-md text-on-surface">{{ items[active].author_name }}</p>
              <p class="body-md text-primary font-semibold">{{ items[active].author_role }} · {{ items[active].author_company }}</p>
            </div>
          </div>
        </Transition>
      </div>

      <div class="flex justify-center gap-3 mt-6">
        <button
          v-for="(_, i) in items"
          :key="i"
          class="w-3 h-3 rounded-full transition-all duration-300"
          :class="i === active ? 'bg-primary w-8' : 'bg-outline-variant'"
          :aria-label="`Testimoni ${i + 1}`"
          @click="active = i"
        />
      </div>
    </div>
  </motion.section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>