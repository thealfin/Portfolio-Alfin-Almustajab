<script lang="ts">
export const DEFAULT_ROLES = [
  'Full-Stack',
  'UI UX Designer',
  'IT Support',
  'Digital Marketing',
  'AI Enthusiast',
  'Web Builder',
  'Copywriter',
]
</script>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    roles?: string[]
    intervalDuration?: number
    customClass?: string
  }>(),
  {
    roles: () => [
      'Full-Stack',
      'UI UX Designer',
      'IT Support',
      'Digital Marketing',
      'AI Enthusiast',
      'Web Builder',
      'Copywriter',
    ],
    intervalDuration: 2800,
    customClass: '',
  }
)

const activeRoles = computed(() => (props.roles && props.roles.length > 0 ? props.roles : DEFAULT_ROLES))
const currentIndex = ref(0)
const currentRole = computed(() => activeRoles.value[currentIndex.value] ?? activeRoles.value[0])

let timer: ReturnType<typeof setInterval> | null = null

const startRotation = () => {
  if (timer) clearInterval(timer)
  // Respect prefers-reduced-motion
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return
  }

  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % activeRoles.value.length
  }, props.intervalDuration)
}

onMounted(() => {
  startRotation()
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<template>
  <span
    class="inline-block relative overflow-visible select-none text-left"
    aria-live="polite"
    aria-atomic="true"
  >
    <Transition name="role-slide" mode="out-in">
      <span
        :key="currentRole"
        :class="[
          'inline-block font-semibold transition-all duration-300 transform-gpu',
          customClass || 'text-primary'
        ]"
      >
        {{ currentRole }}
      </span>
    </Transition>
  </span>
</template>

<style scoped>
.role-slide-enter-active {
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.role-slide-leave-active {
  transition: opacity 0.3s cubic-bezier(0.7, 0, 0.84, 0), transform 0.3s cubic-bezier(0.7, 0, 0.84, 0);
}

.role-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.role-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
