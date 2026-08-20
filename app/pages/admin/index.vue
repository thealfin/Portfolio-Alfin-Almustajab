<script setup lang="ts">
const router = useRouter()
const { session, refreshSession } = useAuth()

onMounted(async () => {
  await refreshSession()
  router.replace(session.value ? '/admin/dashboard' : '/login')
})
</script>

<template>
  <div />
</template>