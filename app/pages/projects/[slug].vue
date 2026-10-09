<script setup lang="ts">
import { getTechIcon } from '~/utils/techIcons'

const route = useRoute()
const { t, locale } = useI18n()
const { pick } = useLocale()

const slug = computed(() => String(route.params.slug || ''))

// Fetch project by slug with lazy: true so skeleton page renders instantly upon navigation
const { data: project, status, error } = useFetch<any>(() => `/api/projects/${slug.value}`, {
  key: `project-${slug.value}`,
  lazy: true,
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] || nuxtApp.static.data[key],
})

watch([status, error, project], () => {
  if (status.value !== 'pending' && (error.value || !project.value)) {
    showError({ statusCode: 404, statusMessage: 'Project tidak ditemukan' })
  }
})

// Fetch all projects for synchronized previous & next navigation
const { data: allProjects } = useFetch<any[]>('/api/projects', {
  key: 'all-projects-list',
  default: () => [],
  lazy: true,
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] || nuxtApp.static.data[key],
})

// Synchronized project sequence according to sort_order
const sortedProjects = computed(() => {
  return (allProjects.value || []).slice().sort((a: any, b: any) => {
    const orderA = a.sort_order ?? 9999
    const orderB = b.sort_order ?? 9999
    return orderA - orderB
  })
})

const totalProjects = computed(() => sortedProjects.value.length)

const currentIndex = computed(() => {
  if (!sortedProjects.value.length || !slug.value) return -1
  return sortedProjects.value.findIndex((p: any) => p.slug === slug.value)
})

// Proyek Sebelumnya (Previous Project in synchronized order)
const prevProject = computed(() => {
  const list = sortedProjects.value
  if (!list.length || currentIndex.value === -1 || list.length <= 1) return null
  const prevIdx = (currentIndex.value - 1 + list.length) % list.length
  return list[prevIdx]
})

// Proyek Selanjutnya (Next Project in synchronized order)
const nextProject = computed(() => {
  const list = sortedProjects.value
  if (!list.length || currentIndex.value === -1 || list.length <= 1) return null
  const nextIdx = (currentIndex.value + 1) % list.length
  return list[nextIdx]
})

const prevProjectIndex = computed(() => {
  if (!sortedProjects.value.length || !prevProject.value) return 0
  return sortedProjects.value.findIndex((p: any) => p.slug === prevProject.value.slug) + 1
})

const nextProjectIndex = computed(() => {
  if (!sortedProjects.value.length || !nextProject.value) return 0
  return sortedProjects.value.findIndex((p: any) => p.slug === nextProject.value.slug) + 1
})

// Keyboard arrow navigation for quick browsing
const onKeydownNavigation = (e: KeyboardEvent) => {
  if (selectedMedia.value) return
  const tag = (e.target as HTMLElement)?.tagName?.toLowerCase()
  if (tag === 'input' || tag === 'textarea') return

  if (e.key === 'ArrowLeft' && prevProject.value) {
    navigateTo(`/projects/${prevProject.value.slug}`)
  } else if (e.key === 'ArrowRight' && nextProject.value) {
    navigateTo(`/projects/${nextProject.value.slug}`)
  }
}

onMounted(() => {
  if (import.meta.client) {
    window.addEventListener('keydown', onKeydownNavigation)
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', onKeydownNavigation)
  }
})

// Fetch master stacks for icon URLs
const { data: stacks } = useFetch<any[]>('/api/stacks', {
  key: 'all-stacks-list',
  default: () => [],
  lazy: true,
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] || nuxtApp.static.data[key],
})

const stackMap = computed(() => {
  const map = new Map<string, any>()
  for (const s of (stacks.value ?? [])) {
    if (s?.name) {
      map.set(s.name.toLowerCase().trim(), s)
    }
  }
  return map
})

const getStackData = (techName: string) => {
  if (!techName) return null
  return stackMap.value.get(techName.toLowerCase().trim()) ?? null
}

const statusClass = (status?: string) => {
  const map: Record<string, string> = {
    Completed: 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30',
    'In Progress': 'text-[#0EA5E9] bg-[#0EA5E9]/10 border-[#0EA5E9]/30',
    'On Hold': 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30',
    Archived: 'text-on-surface-variant bg-on-surface-variant/10 border-outline-variant/30',
  }
  return map[status ?? ''] ?? 'text-primary bg-primary/10 border-primary/30'
}

// Active media preview lightbox with macOS neumorphic frame
const selectedMedia = ref<any>(null)
const openMediaLightbox = (m: any) => {
  if (!m) return
  selectedMedia.value = m
}
const closeMediaLightbox = () => {
  selectedMedia.value = null
}

const onLightboxKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && selectedMedia.value) {
    closeMediaLightbox()
  }
}

watch(selectedMedia, (isOpen) => {
  if (import.meta.client) {
    if (isOpen) {
      window.addEventListener('keydown', onLightboxKeydown)
      document.body.style.overflow = 'hidden'
    } else {
      window.removeEventListener('keydown', onLightboxKeydown)
      document.body.style.overflow = ''
    }
  }
})

onBeforeUnmount(() => {
  if (import.meta.client) {
    window.removeEventListener('keydown', onLightboxKeydown)
    document.body.style.overflow = ''
  }
})

// SEO
useSeoMeta({
  title: () => `${project.value?.title || 'Project'} — Alfin Almustajab`,
  description: () => pick(project.value, 'summary') || 'Detail proyek dan studi kasus pengembangan web oleh Alfin Almustajab.',
  ogTitle: () => `${project.value?.title || 'Project'} — Alfin Almustajab`,
  ogDescription: () => pick(project.value, 'summary') || '',
  ogImage: () => project.value?.cover_image_url || '/favicon.webp',
})
</script>

<template>
  <div class="relative min-h-screen">
    <ProjectDetailSkeleton v-if="status === 'pending' || !project" />

    <div v-else class="relative min-h-screen pb-24 pt-28 md:pt-32">
      <!-- Ambient Subtle Background Glow -->
      <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div class="absolute top-20 right-10 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] mix-blend-multiply opacity-50" />
        <div class="absolute top-96 left-[-100px] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] mix-blend-multiply opacity-35" />
      </div>

      <div class="container-portfolio max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-8 md:gap-12">
        <!-- Breadcrumb & Top Bar Navigation -->
        <nav aria-label="Breadcrumb" class="flex items-center justify-between gap-4 flex-wrap pb-2 border-b border-outline-variant/30">
          <div class="flex items-center gap-2 text-xs sm:text-sm text-on-surface-variant flex-wrap">
            <NuxtLink to="/" class="hover:text-primary transition-colors flex items-center gap-1.5 font-medium">
              <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Beranda</span>
            </NuxtLink>
            <span class="text-outline">/</span>
            <NuxtLink to="/" class="hover:text-primary transition-colors font-medium">
              Proyek
            </NuxtLink>
            <span class="text-outline">/</span>
            <span class="text-on-surface font-semibold truncate max-w-[200px] sm:max-w-xs">{{ project.title }}</span>
          </div>

          <div class="flex items-center gap-3">
            <NuxtLink
              to="/"
              class="inline-flex items-center gap-2 neu-raised px-4 py-1.5 rounded-full text-xs font-bold text-primary hover:neu-pressed transition-all active:scale-95"
            >
              <Icon name="ph:arrow-left-bold" class="text-sm" />
              <span>Kembali ke Beranda</span>
            </NuxtLink>
          </div>
        </nav>

        <!-- Project Hero Header -->
        <header class="flex flex-col gap-6">
          <div class="flex flex-wrap items-center gap-3">
            <span
              v-for="cat in (project.category ?? [])"
              :key="cat"
              class="px-3.5 py-1 rounded-full neu-pressed label-caps text-primary text-[11px] font-bold tracking-wider"
            >
              {{ cat }}
            </span>
            <span class="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40" />
            <span class="label-caps text-on-surface-variant text-xs font-bold">{{ project.year }}</span>
            <span v-if="project.client" class="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40" />
            <span v-if="project.client" class="label-caps text-on-surface-variant text-xs">
              Klien: <strong class="text-on-surface">{{ project.client }}</strong>
            </span>
            <span
              v-if="project.status"
              class="ml-auto px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5"
              :class="statusClass(project.status)"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{{ project.status }}</span>
            </span>
          </div>

          <div>
            <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-on-surface leading-tight tracking-tight max-w-4xl">
              {{ project.title }}
            </h1>
          </div>
        </header>

        <!-- Main Showcase Cover Image Banner (Lega & Fit, Click to Zoom) -->
        <div
          class="w-full aspect-[16/9] max-h-[580px] neu-raised rounded-[24px] sm:rounded-[32px] p-2 sm:p-4 relative overflow-hidden group shadow-xl cursor-pointer"
          role="button"
          tabindex="0"
          title="Klik untuk memperbesar / zoom media"
          @click="project.cover_image_url && openMediaLightbox({ image_url: project.cover_image_url, caption: project.title })"
          @keydown.enter="project.cover_image_url && openMediaLightbox({ image_url: project.cover_image_url, caption: project.title })"
        >
          <div class="w-full h-full rounded-[18px] sm:rounded-[26px] overflow-hidden bg-surface-container relative flex items-center justify-center">
            <!-- Ambient soft blur behind -->
            <img
              v-if="project.cover_image_url"
              :src="project.cover_image_url"
              :alt="project.title"
              class="absolute inset-0 w-full h-full object-cover blur-2xl opacity-25 scale-110 pointer-events-none"
              aria-hidden="true"
            />
            <!-- 100% visible, complete screenshot without any edge cropping -->
            <img
              v-if="project.cover_image_url"
              :src="project.cover_image_url"
              :alt="project.title"
              class="relative z-10 w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.01]"
            />
            <span v-else class="text-8xl text-primary/15 font-extrabold select-none">{{ project.title?.charAt(0) }}</span>

            <!-- Zoom overlay cue on hover -->
            <div class="absolute inset-0 z-20 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span class="neu-raised px-4 py-2 rounded-full text-xs font-bold text-white bg-black/60 backdrop-blur-sm flex items-center gap-2 shadow-lg">
                <Icon name="ph:magnifying-glass-plus-bold" class="text-base text-primary" />
                <span>Klik untuk perbesar</span>
              </span>
            </div>
          </div>
        </div>

      <!-- Main Content & Detailed Breakdown Grid -->
      <div class="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 relative items-start">
        <!-- Left: Case Study Deep Dive (8 Cols) -->
        <main class="lg:col-span-8 flex flex-col gap-10">
          <!-- Overview / Ringkasan -->
          <section class="neu-raised rounded-[24px] sm:rounded-[28px] p-6 sm:p-9 flex flex-col gap-4 border border-outline-variant/30">
            <h2 class="text-xl sm:text-2xl font-extrabold text-on-surface flex items-center gap-2.5">
              <Icon name="ph:file-text-bold" class="text-primary text-2xl" />
              <span>Ringkasan Proyek</span>
            </h2>
            <p class="body-lg text-on-surface-variant leading-relaxed whitespace-pre-line text-[16px] sm:text-[17px]">
              {{ pick(project, 'summary') }}
            </p>
          </section>

          <!-- Tantangan (The Challenge) -->
          <section v-if="pick(project, 'challenge')" class="neu-raised rounded-[24px] sm:rounded-[28px] p-6 sm:p-9 flex flex-col gap-4 border border-outline-variant/30">
            <h2 class="text-xl sm:text-2xl font-extrabold text-on-surface flex items-center gap-2.5">
              <Icon name="ph:lightning-bold" class="text-amber-500 text-2xl" />
              <span>{{ t('projectDetail.challenge') }}</span>
            </h2>
            <p class="body-lg text-on-surface-variant leading-relaxed whitespace-pre-line text-[16px] sm:text-[17px]">
              {{ pick(project, 'challenge') }}
            </p>
          </section>

          <!-- Solusi & Hasil (The Result) -->
          <section v-if="pick(project, 'result')" class="neu-raised rounded-[24px] sm:rounded-[28px] p-6 sm:p-9 flex flex-col gap-4 border border-outline-variant/30">
            <h2 class="text-xl sm:text-2xl font-extrabold text-on-surface flex items-center gap-2.5">
              <Icon name="ph:check-circle-bold" class="text-emerald-500 text-2xl" />
              <span>Solusi & Hasil (Results)</span>
            </h2>
            <p class="body-lg text-on-surface-variant leading-relaxed whitespace-pre-line text-[16px] sm:text-[17px]">
              {{ pick(project, 'result') }}
            </p>
          </section>

          <!-- Peran & Tanggung Jawab (Role Description) -->
          <section v-if="pick(project, 'role_description')" class="neu-raised rounded-[24px] sm:rounded-[28px] p-6 sm:p-9 flex flex-col gap-4 border border-outline-variant/30">
            <h2 class="text-xl sm:text-2xl font-extrabold text-on-surface flex items-center gap-2.5">
              <Icon name="ph:user-gear-bold" class="text-primary text-2xl" />
              <span>{{ t('projectDetail.role') }}</span>
            </h2>
            <p class="body-lg text-on-surface-variant leading-relaxed whitespace-pre-line text-[16px] sm:text-[17px]">
              {{ pick(project, 'role_description') }}
            </p>
          </section>

          <!-- Galeri Tangkapan Layar & Media Tambahan (project_media) -->
          <section v-if="project.project_media && project.project_media.length > 0" class="flex flex-col gap-5 pt-4">
            <h2 class="text-xl sm:text-2xl font-extrabold text-on-surface flex items-center gap-2.5">
              <Icon name="ph:images-bold" class="text-primary text-2xl" />
              <span>Galeri & Tampilan Layar</span>
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                v-for="(m, idx) in project.project_media"
                :key="idx"
                class="neu-raised rounded-2xl p-2.5 overflow-hidden flex flex-col gap-2 cursor-pointer group hover:-translate-y-1 transition-transform"
                @click="openMediaLightbox(m)"
              >
                <div class="w-full aspect-video rounded-xl overflow-hidden bg-surface-container relative">
                  <img
                    :src="m.image_url"
                    :alt="m.caption || `Screenshot ${idx + 1}`"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Icon name="ph:magnifying-glass-plus-bold" class="text-white text-3xl" />
                  </div>
                </div>
                <p v-if="m.caption" class="body-sm text-on-surface-variant px-1 font-medium truncate">
                  {{ m.caption }}
                </p>
              </div>
            </div>
          </section>
        </main>

        <!-- Right: Sticky Sidebar Specs & Stack (4 Cols) -->
        <aside class="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-6">
          <!-- Metadata Card -->
          <div class="neu-raised p-6 sm:p-7 rounded-[24px] flex flex-col gap-6 border border-outline-variant/30">
            <h3 class="title-md text-on-surface font-extrabold pb-3 relative border-b border-outline-variant/30">
              Informasi Proyek
            </h3>

            <div class="flex flex-col gap-4">
              <div class="flex justify-between items-center py-1">
                <span class="label-caps text-on-surface-variant text-xs">{{ t('projectDetail.client') }}</span>
                <span class="body-md text-on-surface font-bold text-right">{{ project.client || 'Personal Project' }}</span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="label-caps text-on-surface-variant text-xs">{{ t('projectDetail.year') }}</span>
                <span class="body-md text-on-surface font-bold">{{ project.year }}</span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="label-caps text-on-surface-variant text-xs">{{ t('projectDetail.status') }}</span>
                <span
                  class="body-sm font-bold px-3 py-1 rounded-full border flex items-center gap-1.5"
                  :class="statusClass(project.status)"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-current" />
                  {{ project.status || 'Active' }}
                </span>
              </div>
              <div class="flex justify-between items-center py-1">
                <span class="label-caps text-on-surface-variant text-xs">Kategori</span>
                <span class="body-sm text-primary font-bold text-right truncate max-w-[150px]">
                  {{ (project.category ?? []).join(', ') }}
                </span>
              </div>
            </div>

            <!-- Action buttons in sidebar -->
            <div class="flex flex-col gap-3 pt-2">
              <a
                v-if="project.live_url"
                :href="project.live_url"
                target="_blank"
                rel="noopener"
                class="w-full py-3.5 rounded-full neu-accent flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform font-bold text-sm shadow-md"
              >
                <span>Lihat Live Demo</span>
                <Icon name="ph:arrow-square-out-bold" class="text-base" />
              </a>
              <a
                v-if="project.repo_url"
                :href="project.repo_url"
                target="_blank"
                rel="noopener"
                class="w-full py-3.5 rounded-full neu-raised flex items-center justify-center gap-2 hover:text-primary hover:neu-pressed transition-all font-bold text-sm"
              >
                <Icon name="ph:github-logo-bold" class="text-base" />
                <span>Lihat Repository</span>
              </a>
            </div>
          </div>

          <!-- Tech Stack Card -->
          <div class="neu-raised p-6 sm:p-7 rounded-[24px] flex flex-col gap-5 border border-outline-variant/30">
            <h3 class="title-md text-on-surface font-extrabold pb-3 relative border-b border-outline-variant/30 flex items-center gap-2">
              <Icon name="ph:code-bold" class="text-primary text-xl" />
              <span>Teknologi Digunakan</span>
            </h3>

            <div class="flex flex-wrap gap-2.5">
              <div
                v-for="tech in (project.tech_stack ?? [])"
                :key="tech"
                class="neu-raised px-3.5 py-2 rounded-xl flex items-center gap-2.5 hover:-translate-y-0.5 transition-transform"
              >
                <div class="w-6 h-6 rounded-md neu-pressed flex items-center justify-center p-0.5 shrink-0">
                  <img
                    v-if="getStackData(tech)?.icon_url"
                    :src="getStackData(tech).icon_url"
                    :alt="tech"
                    class="w-4 h-4 object-contain"
                    loading="lazy"
                  />
                  <GeminiIcon
                    v-else-if="getStackData(tech)?.gemini"
                    class="w-4 h-4 text-sky-500"
                  />
                  <Icon
                    v-else
                    :name="getTechIcon(tech)"
                    class="text-sm text-primary"
                  />
                </div>
                <span class="body-sm text-on-surface font-bold">{{ tech }}</span>
              </div>
            </div>
          </div>

          <!-- Contact Collaboration Card -->
          <div class="neu-raised p-6 rounded-[24px] flex flex-col gap-3.5 border border-primary/20 bg-primary/5">
            <h4 class="title-sm text-on-surface font-bold">Tertarik dengan proyek ini?</h4>
            <p class="body-sm text-on-surface-variant">
              Mari diskusikan solusi arsitektur dan pengembangan aplikasi untuk kebutuhan bisnis Anda.
            </p>
            <NuxtLink
              to="/#contact"
              class="neu-accent py-2.5 px-4 rounded-full text-center body-sm font-bold text-on-primary hover:scale-105 transition-transform flex items-center justify-center gap-2 mt-1"
            >
              <Icon name="ph:chat-circle-dots-bold" class="text-base" />
              <span>Hubungi Alfin</span>
            </NuxtLink>
          </div>
        </aside>
      </div>

      <!-- Tombol Navigasi Proyek Sebelum & Sesudah (Synchronized with Project Order) -->
      <section v-if="prevProject || nextProject" class="flex flex-col gap-6 pt-10 border-t border-outline-variant/30">
        <!-- Section Header with Project Sequence Tracker -->
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex flex-col gap-1">
            <span class="label-caps text-primary text-xs font-bold tracking-wider flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 7 3 12l5 5M16 7l5 5-5 5M3 12h18" />
              </svg>
              <span>Eksplorasi Proyek</span>
            </span>
            <h2 class="headline-md text-on-surface font-extrabold">
              Proyek Sebelum & Sesudah
            </h2>
          </div>

          <div class="flex items-center gap-3">
            <span v-if="currentIndex !== -1 && totalProjects > 0" class="neu-pressed px-3.5 py-1.5 rounded-full text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
              <span>Proyek</span>
              <strong class="text-primary">{{ currentIndex + 1 }}</strong>
              <span>dari</span>
              <span>{{ totalProjects }}</span>
            </span>

            <NuxtLink
              to="/"
              class="neu-raised hover:neu-pressed px-4 py-1.5 rounded-full text-xs font-bold text-primary transition-all flex items-center gap-1.5"
            >
              <span>Semua Proyek</span>
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect width="7" height="7" x="3" y="3" rx="1.5" />
                <rect width="7" height="7" x="14" y="3" rx="1.5" />
                <rect width="7" height="7" x="14" y="14" rx="1.5" />
                <rect width="7" height="7" x="3" y="14" rx="1.5" />
              </svg>
            </NuxtLink>
          </div>
        </div>

        <!-- 2 Columns Previous & Next Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Card 1: Proyek Sebelumnya -->
          <NuxtLink
            v-if="prevProject"
            :to="'/projects/' + prevProject.slug"
            class="neu-raised rounded-2xl sm:rounded-[28px] p-5 sm:p-6 flex flex-col gap-4 group hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 border border-outline-variant/20 hover:border-primary/40 cursor-pointer"
          >
            <!-- Card Header: Label & Order Indicator -->
            <div class="flex items-center justify-between pb-1 border-b border-outline-variant/20">
              <div class="flex items-center gap-2 text-primary font-bold text-xs sm:text-sm">
                <div class="w-7 h-7 rounded-full neu-pressed flex items-center justify-center group-hover:-translate-x-1 transition-transform">
                  <Icon name="ph:arrow-left-bold" class="text-sm" />
                </div>
                <span>Proyek Sebelumnya</span>
              </div>
              <span class="text-xs text-on-surface-variant font-medium">
                #{{ prevProjectIndex }} dari {{ totalProjects }}
              </span>
            </div>

            <!-- Preview Image with Inset Sunken Neumorphic Frame -->
            <div class="w-full aspect-[16/9] rounded-xl sm:rounded-2xl overflow-hidden bg-surface-container relative neu-sunken p-1 group-hover:scale-[1.01] transition-transform">
              <div class="w-full h-full rounded-lg sm:rounded-xl overflow-hidden relative">
                <img
                  v-if="prevProject.cover_image_url"
                  :src="prevProject.cover_image_url"
                  :alt="prevProject.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div v-else class="w-full h-full flex items-center justify-center bg-surface-container-high/40 text-4xl font-extrabold text-primary/20">
                  {{ prevProject.title?.charAt(0) }}
                </div>
              </div>
            </div>

            <!-- Metadata, Title & Summarize -->
            <div class="flex flex-col gap-2 flex-1">
              <div class="flex items-center gap-2 pt-1">
                <span class="px-2.5 py-0.5 rounded-full neu-pressed text-[10px] font-bold text-primary">
                  {{ (prevProject.category ?? [])[0] || 'Proyek' }}
                </span>
                <span class="text-xs text-on-surface-variant ml-auto font-medium">{{ prevProject.year }}</span>
              </div>

              <h3 class="title-md sm:text-xl text-on-surface group-hover:text-primary transition-colors font-extrabold line-clamp-1">
                {{ prevProject.title }}
              </h3>

              <p class="body-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                {{ pick(prevProject, 'summary') }}
              </p>

              <!-- Action Callout -->
              <div class="mt-auto pt-2 flex items-center gap-1.5 text-xs font-bold text-primary group-hover:underline">
                <Icon name="ph:arrow-left-bold" class="text-xs group-hover:-translate-x-1 transition-transform" />
                <span>Lihat Studi Kasus Proyek Ini</span>
              </div>
            </div>
          </NuxtLink>

          <!-- Card 2: Proyek Selanjutnya -->
          <NuxtLink
            v-if="nextProject"
            :to="'/projects/' + nextProject.slug"
            class="neu-raised rounded-2xl sm:rounded-[28px] p-5 sm:p-6 flex flex-col gap-4 group hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 border border-outline-variant/20 hover:border-primary/40 cursor-pointer"
          >
            <!-- Card Header: Order Indicator & Label -->
            <div class="flex items-center justify-between pb-1 border-b border-outline-variant/20">
              <span class="text-xs text-on-surface-variant font-medium">
                #{{ nextProjectIndex }} dari {{ totalProjects }}
              </span>
              <div class="flex items-center gap-2 text-primary font-bold text-xs sm:text-sm">
                <span>Proyek Selanjutnya</span>
                <div class="w-7 h-7 rounded-full neu-pressed flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <Icon name="ph:arrow-right-bold" class="text-sm" />
                </div>
              </div>
            </div>

            <!-- Preview Image with Inset Sunken Neumorphic Frame -->
            <div class="w-full aspect-[16/9] rounded-xl sm:rounded-2xl overflow-hidden bg-surface-container relative neu-sunken p-1 group-hover:scale-[1.01] transition-transform">
              <div class="w-full h-full rounded-lg sm:rounded-xl overflow-hidden relative">
                <img
                  v-if="nextProject.cover_image_url"
                  :src="nextProject.cover_image_url"
                  :alt="nextProject.title"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div v-else class="w-full h-full flex items-center justify-center bg-surface-container-high/40 text-4xl font-extrabold text-primary/20">
                  {{ nextProject.title?.charAt(0) }}
                </div>
              </div>
            </div>

            <!-- Metadata, Title & Summarize -->
            <div class="flex flex-col gap-2 flex-1">
              <div class="flex items-center gap-2 pt-1">
                <span class="px-2.5 py-0.5 rounded-full neu-pressed text-[10px] font-bold text-primary">
                  {{ (nextProject.category ?? [])[0] || 'Proyek' }}
                </span>
                <span class="text-xs text-on-surface-variant ml-auto font-medium">{{ nextProject.year }}</span>
              </div>

              <h3 class="title-md sm:text-xl text-on-surface group-hover:text-primary transition-colors font-extrabold line-clamp-1">
                {{ nextProject.title }}
              </h3>

              <p class="body-sm text-on-surface-variant line-clamp-2 leading-relaxed">
                {{ pick(nextProject, 'summary') }}
              </p>

              <!-- Action Callout -->
              <div class="mt-auto pt-2 flex items-center justify-end gap-1.5 text-xs font-bold text-primary group-hover:underline">
                <span>Lihat Studi Kasus Proyek Ini</span>
                <Icon name="ph:arrow-right-bold" class="text-xs group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>

  <!-- Lightbox Modal for Media Screenshots with macOS Neumorphism Frame & 3 Dots -->
  <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="selectedMedia"
          class="fixed inset-0 z-[150] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 md:p-8"
          @click="closeMediaLightbox"
        >
          <div
            class="relative w-full max-w-5xl max-h-[92vh] flex flex-col neu-raised rounded-2xl sm:rounded-[28px] overflow-hidden bg-surface-base border border-outline-variant/30 shadow-2xl transition-all"
            @click.stop
          >
            <!-- macOS Window Header Bar -->
            <div class="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-3.5 border-b border-outline-variant/20 bg-surface-container-low/80 backdrop-blur-sm select-none">
              <!-- Apple 3 Window Dots (Red, Yellow, Green - Tanpa Emoji) -->
              <div class="flex items-center gap-2 group/dots">
                <!-- Red Close Dot -->
                <button
                  type="button"
                  class="w-3.5 h-3.5 rounded-full bg-[#FF5F56] border border-[#E0443E]/60 flex items-center justify-center shadow-inner cursor-pointer transition-transform hover:scale-110 active:scale-95"
                  title="Tutup (Esc)"
                  aria-label="Tutup preview"
                  @click="closeMediaLightbox"
                >
                  <svg class="w-2 h-2 text-[#4c0002] opacity-0 group-hover/dots:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <!-- Yellow Minimize Dot -->
                <span
                  class="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/60 flex items-center justify-center shadow-inner"
                  title="Minimize"
                >
                  <svg class="w-2 h-2 text-[#593b00] opacity-0 group-hover/dots:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </span>
                <!-- Green Expand Dot -->
                <span
                  class="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29]/60 flex items-center justify-center shadow-inner"
                  title="Fullscreen"
                >
                  <svg class="w-2 h-2 text-[#003b07] opacity-0 group-hover/dots:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <polyline points="9 21 3 21 3 15"></polyline>
                  </svg>
                </span>
              </div>

              <!-- Window Title / Caption Header -->
              <div class="flex items-center gap-2 truncate px-3">
                <span class="text-xs sm:text-sm font-semibold text-on-surface truncate max-w-xs sm:max-w-md">
                  {{ selectedMedia.caption || (project.title + ' — Preview Media') }}
                </span>
              </div>

              <!-- Close Action Button -->
              <button
                class="neu-raised hover:neu-pressed w-7 h-7 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary transition-all text-xs"
                title="Tutup (Esc)"
                aria-label="Tutup modal"
                @click="closeMediaLightbox"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <!-- Image Viewport with Sunken Neumorphic Frame -->
            <div class="p-3 sm:p-5 flex-1 flex flex-col items-center justify-center overflow-auto max-h-[calc(90vh-65px)]">
              <div class="neu-sunken w-full rounded-xl sm:rounded-2xl p-2 sm:p-3 flex items-center justify-center bg-surface-container/60 shadow-inner">
                <img
                  :src="selectedMedia.image_url"
                  :alt="selectedMedia.caption || 'Preview'"
                  class="max-w-full max-h-[72vh] object-contain rounded-lg sm:rounded-xl shadow-md transition-transform"
                />
              </div>

              <!-- Optional Caption Footer -->
              <p v-if="selectedMedia.caption" class="mt-3 text-center text-on-surface-variant text-xs sm:text-sm font-medium px-4">
                {{ selectedMedia.caption }}
              </p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
