<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
  }>(),
  { eyebrow: '' },
)
</script>

<template>
  <div class="flex flex-col gap-3">
    <div v-if="eyebrow" class="flex items-center gap-2.5">
      <span class="w-10 h-[2px] bg-primary" />
      <span class="label-caps text-on-surface-variant uppercase tracking-[0.2em]">{{ eyebrow }}</span>
    </div>
    <h2 class="headline-lg text-on-surface">
      <slot />
    </h2>
  </div>
</template>
