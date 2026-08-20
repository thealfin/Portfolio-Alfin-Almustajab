<script setup lang="ts">
const props = defineProps<{
  titles: string[]
}>()

const index = ref(0)
const visible = ref(true)

let interval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  interval = setInterval(() => {
    visible.value = false
    setTimeout(() => {
      index.value = (index.value + 1) % props.titles.length
      visible.value = true
    }, 400)
  }, 2500)
})

onBeforeUnmount(() => {
  if (interval) clearInterval(interval)
})
</script>

<template>
  <span class="inline-block">
    <Transition name="rotate" mode="out-in">
      <span :key="index" :class="visible ? 'opacity-100' : 'opacity-0'" class="transition-opacity duration-400">
        <slot :title="titles[index]">
          {{ titles[index] }}
        </slot>
      </span>
    </Transition>
  </span>
</template>

<style scoped>
.rotate-enter-active,
.rotate-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.rotate-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.rotate-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
