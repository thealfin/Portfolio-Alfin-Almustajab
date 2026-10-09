<template>
  <div class="relative min-h-screen pb-24 pt-28 md:pt-32 select-none" aria-busy="true" aria-label="Loading project details">
    <!-- Ambient Subtle Background Glow -->
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-20 right-10 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] mix-blend-multiply opacity-40 animate-pulse" />
      <div class="absolute top-96 left-[-100px] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[100px] mix-blend-multiply opacity-25" />
    </div>

    <div class="container-portfolio max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-8 md:gap-12">
      <!-- Breadcrumb Skeleton -->
      <nav class="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-outline-variant/30">
        <div class="flex items-center gap-2.5">
          <div class="w-20 h-4 rounded-full neu-sunken bg-surface-container/80 animate-pulse" />
          <div class="w-2 h-4 text-outline/40">/</div>
          <div class="w-16 h-4 rounded-full neu-sunken bg-surface-container/80 animate-pulse" />
          <div class="w-2 h-4 text-outline/40">/</div>
          <div class="w-32 h-4 rounded-full neu-sunken bg-surface-container-high/80 animate-pulse" />
        </div>
        <div class="w-36 h-7 rounded-full neu-raised bg-surface-container/60 animate-pulse" />
      </nav>

      <!-- Project Hero Header Skeleton -->
      <header class="flex flex-col gap-6">
        <!-- Tags & Metadata Row -->
        <div class="flex flex-wrap items-center gap-3">
          <div class="w-20 h-6 rounded-full neu-pressed bg-surface-container-high/70 animate-pulse" />
          <div class="w-16 h-6 rounded-full neu-pressed bg-surface-container-high/70 animate-pulse" />
          <div class="w-20 h-6 rounded-full neu-pressed bg-surface-container-high/70 animate-pulse" />
          <div class="w-2 h-2 rounded-full bg-on-surface-variant/20" />
          <div class="w-12 h-4 rounded-full neu-sunken bg-surface-container/60 animate-pulse" />
          <div class="ml-auto w-24 h-6 rounded-full neu-raised bg-surface-container/80 animate-pulse" />
        </div>

        <!-- Big Title Skeleton -->
        <div class="flex flex-col gap-3">
          <div class="w-4/5 sm:w-2/3 h-10 sm:h-14 rounded-2xl neu-sunken bg-surface-container-high/80 animate-pulse" />
          <div class="w-1/2 sm:w-1/3 h-6 rounded-xl neu-sunken bg-surface-container/60 animate-pulse" />
        </div>
      </header>

      <!-- Main Showcase Cover Image Banner Skeleton (Neumorphic Raised Frame) -->
      <div class="w-full aspect-[16/9] max-h-[560px] neu-raised rounded-[24px] sm:rounded-[32px] p-2 sm:p-4 shadow-xl">
        <div class="w-full h-full rounded-[18px] sm:rounded-[26px] neu-sunken bg-surface-container/50 flex flex-col items-center justify-center relative overflow-hidden animate-pulse">
          <!-- macOS Window Dots for skeleton preview -->
          <div class="absolute top-4 left-5 flex items-center gap-2 opacity-50">
            <span class="w-3 h-3 rounded-full bg-[#FF5F56]/60" />
            <span class="w-3 h-3 rounded-full bg-[#FFBD2E]/60" />
            <span class="w-3 h-3 rounded-full bg-[#27C93F]/60" />
          </div>
          <svg class="w-16 h-16 text-outline/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      </div>

      <!-- Main Layout 2 Columns Skeleton -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10 items-start">
        <!-- Left Main Content Skeleton (2 Cols) -->
        <div class="lg:col-span-2 flex flex-col gap-8">
          <!-- Overview Card Skeleton -->
          <div class="neu-raised rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col gap-4">
            <div class="w-36 h-6 rounded-xl neu-sunken bg-surface-container-high/80 animate-pulse" />
            <div class="space-y-2.5 pt-2">
              <div class="w-full h-4 rounded-lg neu-sunken bg-surface-container/70 animate-pulse" />
              <div class="w-11/12 h-4 rounded-lg neu-sunken bg-surface-container/70 animate-pulse" />
              <div class="w-4/5 h-4 rounded-lg neu-sunken bg-surface-container/70 animate-pulse" />
            </div>
          </div>

          <!-- Features Grid Skeleton -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div v-for="i in 4" :key="i" class="neu-raised rounded-2xl p-5 flex gap-4 items-start">
              <div class="w-10 h-10 rounded-xl neu-pressed bg-surface-container-high/70 shrink-0 animate-pulse" />
              <div class="flex-1 space-y-2">
                <div class="w-24 h-4 rounded-lg neu-sunken bg-surface-container-high/80 animate-pulse" />
                <div class="w-full h-3 rounded-md neu-sunken bg-surface-container/60 animate-pulse" />
              </div>
            </div>
          </div>

          <!-- Media Screenshots Skeleton -->
          <div class="neu-raised rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col gap-5">
            <div class="w-44 h-6 rounded-xl neu-sunken bg-surface-container-high/80 animate-pulse" />
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div v-for="i in 2" :key="i" class="aspect-video rounded-xl neu-sunken bg-surface-container/60 animate-pulse" />
            </div>
          </div>
        </div>

        <!-- Right Sticky Sidebar Skeleton (1 Col) -->
        <div class="lg:col-span-1 flex flex-col gap-6">
          <!-- CTA Buttons Skeleton -->
          <div class="flex flex-col gap-3">
            <div class="w-full h-12 rounded-full neu-raised bg-primary/20 animate-pulse" />
            <div class="w-full h-12 rounded-full neu-raised bg-surface-container/80 animate-pulse" />
          </div>

          <!-- Project Specs Card Skeleton -->
          <div class="neu-raised rounded-2xl sm:rounded-3xl p-6 flex flex-col gap-5">
            <div class="w-32 h-5 rounded-lg neu-sunken bg-surface-container-high/80 animate-pulse" />
            <div class="space-y-4">
              <div v-for="i in 4" :key="i" class="flex justify-between items-center py-2 border-b border-outline-variant/20">
                <div class="w-20 h-4 rounded-md neu-sunken bg-surface-container/60 animate-pulse" />
                <div class="w-28 h-4 rounded-md neu-sunken bg-surface-container-high/70 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Previous & Next Project Navigation Skeleton -->
      <div class="flex flex-col gap-6 pt-10 border-t border-outline-variant/30">
        <div class="flex items-center justify-between">
          <div class="w-48 h-6 rounded-xl neu-sunken bg-surface-container-high/80 animate-pulse" />
          <div class="w-32 h-6 rounded-full neu-raised bg-surface-container/60 animate-pulse" />
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="i in 2" :key="i" class="neu-raised rounded-2xl sm:rounded-[28px] p-5 sm:p-6 flex flex-col gap-4">
            <div class="flex justify-between items-center pb-1 border-b border-outline-variant/20">
              <div class="w-36 h-4 rounded-md neu-sunken bg-surface-container-high/80 animate-pulse" />
              <div class="w-16 h-4 rounded-md neu-sunken bg-surface-container/60 animate-pulse" />
            </div>
            <div class="aspect-[16/9] rounded-xl neu-sunken bg-surface-container/60 animate-pulse" />
            <div class="space-y-2 pt-1">
              <div class="w-2/3 h-5 rounded-lg neu-sunken bg-surface-container-high/80 animate-pulse" />
              <div class="w-full h-3 rounded-md neu-sunken bg-surface-container/60 animate-pulse" />
              <div class="w-4/5 h-3 rounded-md neu-sunken bg-surface-container/60 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
