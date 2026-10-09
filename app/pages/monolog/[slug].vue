<script setup lang="ts">
const route = useRoute()
// Redirect /monolog/:slug to /thoughts/:slug
await navigateTo(`/thoughts/${route.params.slug}`, { replace: true, redirectCode: 301 })
</script>

<template>
  <div />
</template>
