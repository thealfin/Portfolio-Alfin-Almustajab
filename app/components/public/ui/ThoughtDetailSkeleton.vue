<template>
  <div class="relative min-h-screen pb-24 pt-28 md:pt-32 select-none" aria-busy="true" aria-label="Loading article details">
    <!-- Ambient Subtle Background Glow -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-20 right-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] mix-blend-multiply opacity-40 animate-pulse" />
      <div class="absolute top-96 left-[-100px] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] mix-blend-multiply opacity-25" />
    </div>

    <div class="container-portfolio max-w-5xl mx-auto px-4 sm:px-6 flex flex-col gap-8 md:gap-10">
      <!-- Breadcrumb Skeleton -->
      <nav class="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-outline-variant/30">
        <div class="flex items-center gap-2.5">
          <div class="w-20 h-4 rounded-full neu-sunken bg-surface-container/80 animate-pulse" />
          <div class="w-2 h-4 text-outline/40">/</div>
          <div class="w-16 h-4 rounded-full neu-sunken bg-surface-container/80 animate-pulse" />
          <div class="w-2 h-4 text-outline/40">/</div>
          <div class="w-36 h-4 rounded-full neu-sunken bg-surface-container-high/80 animate-pulse" />
        </div>
        <div class="w-36 h-7 rounded-full neu-raised bg-surface-container/60 animate-pulse" />
      </nav>

      <!-- Article Header Skeleton -->
      <header class="flex flex-col gap-4">
        <!-- Category & Read Time -->
        <div class="flex flex-wrap items-center gap-3">
          <div class="w-24 h-6 rounded-full neu-pressed bg-surface-container-high/80 animate-pulse" />
          <div class="w-20 h-6 rounded-full neu-sunken bg-surface-container/60 animate-pulse" />
          <div class="w-24 h-6 rounded-full neu-sunken bg-surface-container/60 animate-pulse" />
        </div>

        <!-- Article Big Title Skeleton -->
        <div class="space-y-3 pt-2">
          <div class="w-full sm:w-5/6 h-10 sm:h-12 rounded-2xl neu-sunken bg-surface-container-high/80 animate-pulse" />
          <div class="w-3/5 sm:w-2/3 h-10 sm:h-12 rounded-2xl neu-sunken bg-surface-container-high/80 animate-pulse" />
        </div>
      </header>

      <!-- Featured Image Banner Skeleton -->
      <div class="w-full aspect-[21/9] max-h-[460px] neu-raised rounded-[24px] sm:rounded-[32px] p-2 sm:p-3 shadow-lg">
        <div class="w-full h-full rounded-[18px] sm:rounded-[26px] neu-sunken bg-surface-container/50 flex items-center justify-center relative overflow-hidden animate-pulse">
          <svg class="w-16 h-16 text-outline/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      </div>

      <!-- Article Body Card Skeleton -->
      <article class="neu-raised rounded-2xl sm:rounded-[32px] p-6 sm:p-10 md:p-12 flex flex-col gap-8 shadow-sm">
        <!-- Lead Paragraph -->
        <div class="space-y-3">
          <div class="w-full h-5 rounded-lg neu-sunken bg-surface-container-high/80 animate-pulse" />
          <div class="w-11/12 h-5 rounded-lg neu-sunken bg-surface-container-high/80 animate-pulse" />
          <div class="w-4/5 h-5 rounded-lg neu-sunken bg-surface-container-high/80 animate-pulse" />
        </div>

        <!-- Section Heading Placeholder -->
        <div class="w-64 h-8 rounded-xl neu-sunken bg-surface-container-high/90 animate-pulse mt-4" />

        <!-- Paragraphs -->
        <div class="space-y-3">
          <div class="w-full h-4 rounded-lg neu-sunken bg-surface-container/70 animate-pulse" />
          <div class="w-full h-4 rounded-lg neu-sunken bg-surface-container/70 animate-pulse" />
          <div class="w-5/6 h-4 rounded-lg neu-sunken bg-surface-container/70 animate-pulse" />
          <div class="w-3/4 h-4 rounded-lg neu-sunken bg-surface-container/70 animate-pulse" />
        </div>

        <!-- Mock Code Block with macOS 3 Dots Skeleton -->
        <div class="neu-sunken rounded-2xl p-4 sm:p-5 bg-surface-container/60 flex flex-col gap-3 my-4">
          <div class="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
            <span class="w-3 h-3 rounded-full bg-[#FF5F56]/60" />
            <span class="w-3 h-3 rounded-full bg-[#FFBD2E]/60" />
            <span class="w-3 h-3 rounded-full bg-[#27C93F]/60" />
            <div class="ml-auto w-20 h-3 rounded-md bg-outline-variant/30 animate-pulse" />
          </div>
          <div class="space-y-2 font-mono pt-2">
            <div class="w-3/4 h-3 rounded bg-outline-variant/30 animate-pulse" />
            <div class="w-1/2 h-3 rounded bg-outline-variant/30 animate-pulse" />
            <div class="w-2/3 h-3 rounded bg-outline-variant/30 animate-pulse" />
          </div>
        </div>

        <!-- Concluding Paragraphs -->
        <div class="space-y-3">
          <div class="w-full h-4 rounded-lg neu-sunken bg-surface-container/70 animate-pulse" />
          <div class="w-11/12 h-4 rounded-lg neu-sunken bg-surface-container/70 animate-pulse" />
          <div class="w-2/3 h-4 rounded-lg neu-sunken bg-surface-container/70 animate-pulse" />
        </div>
      </article>

      <!-- Bottom Recommendations Skeleton -->
      <section class="flex flex-col gap-6 pt-4">
        <div class="w-48 h-6 rounded-xl neu-sunken bg-surface-container-high/80 animate-pulse" />
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="i in 3" :key="i" class="neu-raised rounded-2xl p-5 flex flex-col gap-3">
            <div class="w-16 h-5 rounded-full neu-pressed bg-surface-container/70 animate-pulse" />
            <div class="w-full h-5 rounded-lg neu-sunken bg-surface-container-high/80 animate-pulse" />
            <div class="w-3/4 h-4 rounded-lg neu-sunken bg-surface-container/60 animate-pulse" />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
