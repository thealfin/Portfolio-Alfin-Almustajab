<template>
  <div class="min-h-screen bg-surface-base text-on-surface">
    <WelcomePreloader />
    <AppNavbar />
    <main class="overflow-x-hidden">
      <slot />
    </main>
    <AppFooter />
    <AiAssistantWidget />
  </div>
</template>
