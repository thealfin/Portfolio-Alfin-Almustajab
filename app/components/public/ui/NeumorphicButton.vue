<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'raised'
    type?: 'button' | 'submit'
    block?: boolean
  }>(),
  { variant: 'raised', type: 'button', block: false },
)
</script>

<template>
  <component
    :is="block ? 'div' : 'button'"
    :type="!block ? type : undefined"
    class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-bold transition-all duration-300 text-base hover:-translate-y-0.5 active:translate-y-0"
    :class="[
      variant === 'primary' ? 'neu-accent' : 'neu-raised text-primary hover:neu-pressed',
      block ? 'w-full' : '',
    ]"
  >
    <slot />
  </component>
</template>
