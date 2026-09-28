<script setup lang="ts">
import RoleRotator from './RoleRotator.vue'

defineProps<{
  roles?: string[]
  intervalDuration?: number
  customClass?: string
}>()
</script>

<template>
  <RoleRotator :roles="roles" :interval-duration="intervalDuration" :custom-class="customClass" />
</template>
