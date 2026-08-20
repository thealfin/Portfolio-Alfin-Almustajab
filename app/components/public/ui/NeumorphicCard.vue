<script setup lang="ts">
withDefaults(
  defineProps<{
    padded?: boolean
    hoverable?: boolean
  }>(),
  { padded: true, hoverable: false },
)
</script>

<template>
  <div
    class="neu-raised rounded-card"
    :class="[
      padded ? 'p-6 md:p-8' : '',
      hoverable ? 'hover:scale-[1.01] transition-transform duration-500' : '',
    ]"
  >
    <slot />
  </div>
</template>
