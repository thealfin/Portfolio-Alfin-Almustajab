<script setup lang="ts">
const route = useRoute()
const rawSlug = Array.isArray(route.params.slug) ? route.params.slug.join('/') : String(route.params.slug || '')

// If it's a single slug like /integrasi-ai or /couplecash
if (rawSlug && !rawSlug.includes('/')) {
  try {
    // Check if thought matches
    const thought = await $fetch<any>(`/api/thoughts/${rawSlug}`).catch(() => null)
    if (thought?.id || thought?.slug) {
      await navigateTo(`/thoughts/${rawSlug}`, { replace: true })
    } else {
      // Check if project matches
      const project = await $fetch<any>(`/api/projects/${rawSlug}`).catch(() => null)
      if (project?.id || project?.slug) {
        await navigateTo(`/projects/${rawSlug}`, { replace: true })
      } else {
        await navigateTo('/404', { replace: true })
      }
    }
  } catch {
    await navigateTo('/404', { replace: true })
  }
} else {
  await navigateTo('/404', { replace: true })
}
</script>

<template>
  <div />
</template>