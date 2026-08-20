<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    value: number
    suffix?: string
  }>(),
  { suffix: '' },
)

const display = ref(0)
const target = computed(() => props.value)

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    display.value = target.value
    return
  }
  const duration = 1200
  const start = performance.now()
  const tick = (now: number) => {
    const p = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - p, 3)
    display.value = Math.round(target.value * eased)
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
})

const viewportEl = ref<HTMLElement | null>(null)
const { visible } = useElementVisibility(viewportEl)

watch(visible, (v) => {
  if (v) {
    display.value = target.value
  }
})
</script>

<template>
  <div ref="viewportEl" class="flex flex-col items-center justify-center gap-2 text-center">
    <span class="text-[40px] leading-none font-extrabold text-primary">
      {{ display }}{{ suffix }}
    </span>
    <slot />
  </div>
</template>
