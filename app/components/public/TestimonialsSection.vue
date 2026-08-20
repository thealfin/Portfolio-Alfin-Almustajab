<script setup lang="ts">
import { motion } from 'motion-v'

const props = defineProps<{
  testimonials: any
}>()
const { t } = useI18n()
const { pick } = useLocale()

const active = ref(0)
const items = computed(() => props.testimonials ?? [])

const broken = ref<Set<string>>(new Set())
const onImgError = (name: string) => {
  broken.value = new Set(broken.value).add(name)
}

const starIcon = (rating: number, i: number) => {
  if (rating >= i) return 'ph:star-fill'
  if (rating >= i - 0.5) return 'ph:star-half-fill'
  return 'ph:star'
}

const ratingLabel = (rating: number) => (rating % 1 === 0 ? rating.toFixed(0) : rating.toFixed(1))

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

            <div class="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
              <div class="flex items-center gap-4">
                <span class="w-14 h-14 rounded-full neu-raised flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    v-if="items[active].avatar_url && !broken.has(items[active].id)"
                    :src="items[active].avatar_url"
                    :alt="items[active].author_name"
                    class="w-full h-full object-cover"
                    loading="lazy"
                    @error="onImgError(items[active].id)"
                  />
                  <span v-else class="title-md font-extrabold text-primary">{{ items[active].author_name?.charAt(0) }}</span>
                </span>
                <div class="flex flex-col gap-1">
                  <p class="title-md text-on-surface">{{ items[active].author_name }}</p>
                  <p class="body-md text-primary font-semibold">{{ items[active].author_role }} · {{ items[active].author_company }}</p>
                </div>
              </div>

              <div class="flex items-center gap-2 md:ml-auto">
                <div class="flex items-center gap-0.5">
                  <Icon v-for="i in 5" :key="i" :name="starIcon(items[active].rating, i)" class="text-lg text-primary" />
                </div>
                <span class="label-caps text-on-surface-variant font-bold">{{ ratingLabel(items[active].rating) }} / 5</span>
              </div>
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