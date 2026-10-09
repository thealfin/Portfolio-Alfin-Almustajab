<script setup lang="ts">
const route = useRoute()
const showPreloader = ref(false)

if (import.meta.client) {
  // Hanya tampilkan preloader saat pengunjung pertama kali membuka website di halaman '/'
  if (route.path === '/' && sessionStorage.getItem('portfolio_preloader_seen') !== '1') {
    showPreloader.value = true
  } else {
    sessionStorage.setItem('portfolio_preloader_seen', '1')
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface-base text-on-surface">
    <WelcomePreloader v-if="showPreloader" />
    <AppNavbar />
    <main class="overflow-x-clip">
      <slot />
    </main>
    <AppFooter />
    <ClientOnly>
      <AiAssistantWidget />
    </ClientOnly>
  </div>
</template>
