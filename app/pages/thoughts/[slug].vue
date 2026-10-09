<script setup lang="ts">
import { renderMarkdown, ICON_COPY_SVG, ICON_CHECK_SVG } from '~/utils/markdown'

const route = useRoute()
const { t, locale } = useI18n()

const slug = computed(() => String(route.params.slug || ''))

// Fetch thought by slug with lazy: true so skeleton page renders instantly upon navigation
const { data: thought, status, error } = useFetch<any>(() => `/api/thoughts/${slug.value}`, {
  key: `thought-${slug.value}`,
  lazy: true,
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] || nuxtApp.static.data[key],
})

watch([status, error, thought], () => {
  if (status.value !== 'pending' && (error.value || !thought.value)) {
    showError({ statusCode: 404, statusMessage: 'Artikel tidak ditemukan' })
  }
})

// Fetch all thoughts for recommendations
const { data: allThoughts } = useFetch<any[]>('/api/thoughts', {
  key: 'all-thoughts-list',
  default: () => [],
  lazy: true,
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] || nuxtApp.static.data[key],
})

const recommendedThoughts = computed(() => {
  return (allThoughts.value || [])
    .filter((th: any) => th.slug !== slug.value)
    .slice(0, 3)
})

// Lightbox state for zoomable cover image
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

// Auto-switch language based on user's active site mode (locale)
const activeTitle = computed(() => {
  if (!thought.value) return ''
  return locale.value === 'en' && thought.value.title_en
    ? thought.value.title_en
    : (thought.value.title_id || thought.value.title_en)
})

const activeContent = computed(() => {
  if (!thought.value) return ''
  return locale.value === 'en' && thought.value.content_en
    ? thought.value.content_en
    : (thought.value.content_id || thought.value.content_en)
})

const renderedHtml = computed(() => {
  return renderMarkdown(activeContent.value || '')
})

// Reading Progress
const scrollProgress = ref(0)
const onWindowScroll = () => {
  if (typeof window === 'undefined') return
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0
}

onMounted(() => {
  window.addEventListener('scroll', onWindowScroll, { passive: true })
  onWindowScroll()
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', onWindowScroll)
  }
})

// Copy code block handling & smooth heading jumps
const handleArticleClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  const copyBtn = target.closest('.copy-code-btn') as HTMLElement
  if (copyBtn) {
    const rawCode = decodeURIComponent(copyBtn.dataset.code || '')
    if (rawCode) {
      navigator.clipboard.writeText(rawCode).then(() => {
        const label = copyBtn.querySelector('.copy-label')
        const icon = copyBtn.querySelector('.copy-icon')
        if (label) label.textContent = 'Disalin!'
        if (icon) icon.innerHTML = ICON_CHECK_SVG
        copyBtn.classList.add('text-emerald-400', 'bg-white/30')
        setTimeout(() => {
          if (label) label.textContent = 'Salin'
          if (icon) icon.innerHTML = ICON_COPY_SVG
          copyBtn.classList.remove('text-emerald-400', 'bg-white/30')
        }, 2000)
      })
    }
    return
  }

  // Smooth anchor jump for Headings
  const anchor = target.closest('a')
  if (anchor && anchor.getAttribute('href')?.startsWith('#')) {
    const targetId = anchor.getAttribute('href')!.slice(1)
    const targetEl = document.getElementById(targetId)
    if (targetEl) {
      e.preventDefault()
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }
}

const formatDate = (iso: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  return new Intl.DateTimeFormat(locale.value === 'en' ? 'en-US' : 'id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

// SEO Meta
useSeoMeta({
  title: () => `${activeTitle.value} — Alfin Almustajab`,
  description: () => (activeContent.value || '').replace(/[#*`_\[\]]/g, '').slice(0, 160),
  ogTitle: () => `${activeTitle.value} — Alfin Almustajab`,
  ogDescription: () => (activeContent.value || '').replace(/[#*`_\[\]]/g, '').slice(0, 160),
  ogImage: () => thought.value?.cover_image_url || '/favicon.webp',
  ogType: 'article',
})
</script>

<template>
  <div class="relative min-h-screen">
    <ThoughtDetailSkeleton v-if="status === 'pending' || !thought" />

    <div v-else class="relative min-h-screen pb-24 pt-28 md:pt-32">
      <!-- Top Fixed Reading Progress Indicator -->
      <div class="fixed top-0 left-0 right-0 z-[60] h-1.5 bg-outline-variant/20 overflow-hidden pointer-events-none">
        <div
          class="h-full bg-gradient-to-r from-primary via-primary-strong to-primary transition-all duration-150 ease-out"
          :style="{ width: `${scrollProgress}%` }"
        />
      </div>

      <!-- Ambient Subtle Background Glow -->
      <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div class="absolute top-20 right-10 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] mix-blend-multiply opacity-50" />
        <div class="absolute top-96 left-[-100px] w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[100px] mix-blend-multiply opacity-35" />
      </div>

      <div class="container-portfolio max-w-5xl mx-auto px-4 sm:px-6 flex flex-col gap-8 md:gap-10">
        <!-- Breadcrumb & Top Navigation -->
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
              Monolog
            </NuxtLink>
            <span class="text-outline">/</span>
            <span class="text-on-surface font-semibold truncate max-w-[240px] sm:max-w-md">{{ activeTitle }}</span>
          </div>

          <div>
            <NuxtLink
              to="/"
              class="inline-flex items-center gap-2 neu-raised px-4 py-1.5 rounded-full text-xs font-bold text-primary hover:neu-pressed transition-all active:scale-95"
            >
              <Icon name="ph:arrow-left-bold" class="text-sm" />
              <span>Kembali ke Beranda</span>
            </NuxtLink>
          </div>
        </nav>

        <!-- Main Article Header -->
        <header class="flex flex-col gap-5 pt-2">
          <div class="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <span
              v-for="cat in (thought.category ?? [])"
              :key="cat"
              class="px-3.5 py-1 rounded-full neu-pressed label-caps text-primary text-[11px] font-bold tracking-wider"
            >
              {{ cat }}
            </span>
            <span class="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40" />
            <span class="label-caps text-on-surface-variant text-xs flex items-center gap-1">
              <Icon name="ph:clock-bold" class="text-sm text-primary" />
              {{ thought.read_time_minutes ?? 1 }} Menit Baca
            </span>
            <span class="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40" />
            <span class="label-caps text-on-surface-variant text-xs flex items-center gap-1">
              <Icon name="ph:calendar-blank-bold" class="text-sm text-primary" />
              {{ formatDate(thought.created_at) }}
            </span>
            <span class="w-1.5 h-1.5 rounded-full bg-on-surface-variant/40" />
            <span class="label-caps text-on-surface-variant text-xs flex items-center gap-1">
              <Icon name="ph:eye-bold" class="text-sm text-primary" />
              {{ thought.views_count ?? 0 }} Dilihat
            </span>
          </div>

          <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-on-surface leading-[1.18] tracking-tight">
            {{ activeTitle }}
          </h1>
        </header>

        <!-- High-Res Cover Image (Click to Zoom in macOS Lightbox) -->
        <div
          v-if="thought.cover_image_url"
          class="w-full max-h-[540px] neu-raised rounded-[24px] sm:rounded-[28px] p-2 sm:p-4 overflow-hidden shadow-xl cursor-pointer group relative"
          role="button"
          tabindex="0"
          title="Klik untuk memperbesar / zoom"
          @click="openMediaLightbox({ image_url: thought.cover_image_url, caption: activeTitle })"
          @keydown.enter="openMediaLightbox({ image_url: thought.cover_image_url, caption: activeTitle })"
        >
          <div class="relative w-full h-full overflow-hidden rounded-[18px] sm:rounded-[22px]">
            <img
              :src="thought.cover_image_url"
              :alt="thought.image_alt_text ?? activeTitle"
              class="w-full h-full max-h-[500px] object-cover transition-transform duration-500 group-hover:scale-[1.01]"
            />
            <!-- Zoom cue on hover -->
            <div class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span class="neu-raised px-4 py-2 rounded-full text-xs font-bold text-white bg-black/60 backdrop-blur-sm flex items-center gap-2 shadow-lg">
                <Icon name="ph:magnifying-glass-plus-bold" class="text-base text-primary" />
                <span>Klik untuk perbesar</span>
              </span>
            </div>
          </div>
        </div>

        <!-- Full Editorial Markdown Content (Lega & Leluasa) -->
        <article
          class="article-editorial w-full bg-surface-card/60 backdrop-blur-sm neu-raised rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 md:p-14 border border-outline-variant/30 shadow-lg"
          @click="handleArticleClick"
          v-html="renderedHtml"
        />

        <!-- Author Bio Signature Card -->
        <footer class="neu-raised rounded-[24px] p-6 sm:p-8 flex items-center justify-between gap-6 flex-wrap border border-outline-variant/40 mt-4">
          <div class="flex items-center gap-4 sm:gap-5">
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full neu-pressed p-1.5 shrink-0 overflow-hidden shadow-inner">
              <img src="/alfin-photo.webp" alt="Alfin Almustajab" class="w-full h-full object-cover rounded-full" />
            </div>
            <div class="flex flex-col gap-1">
              <span class="text-lg sm:text-xl font-extrabold text-on-surface">Alfin Almustajab</span>
              <span class="body-md text-on-surface-variant font-medium">Full-Stack Developer, UI/UX Designer & AI Specialist</span>
              <p class="body-sm text-on-surface-variant/80 mt-1 max-w-xl">
                Membangun aplikasi web berperforma tinggi, sistem cerdas terintegrasi AI, dan antarmuka interaktif modern.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <NuxtLink
              to="/"
              class="neu-raised px-5 py-2.5 rounded-full body-sm font-bold text-primary hover:neu-pressed transition-all flex items-center gap-2"
            >
              <Icon name="ph:arrow-left-bold" class="text-base" />
              <span>Kembali ke Beranda</span>
            </NuxtLink>
          </div>
        </footer>

        <!-- Rekomendasi Artikel Lainnya -->
        <section v-if="recommendedThoughts.length > 0" class="flex flex-col gap-6 pt-8 border-t border-outline-variant/30">
          <div class="flex items-center justify-between">
            <h2 class="headline-md text-on-surface font-extrabold">Artikel Monolog Lainnya</h2>
            <NuxtLink to="/" class="body-sm font-bold text-primary hover:underline flex items-center gap-1">
              <span>Lihat Semua</span>
              <Icon name="ph:arrow-right-bold" class="text-sm" />
            </NuxtLink>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <NuxtLink
              v-for="rec in recommendedThoughts"
              :key="rec.slug"
              :to="'/thoughts/' + rec.slug"
              class="neu-raised rounded-2xl p-5 flex flex-col gap-3 hover:-translate-y-1 hover:shadow-xl transition-all group"
            >
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full neu-pressed text-[10px] font-bold text-primary">
                  {{ (rec.category ?? [])[0] || 'Artikel' }}
                </span>
                <span class="text-[11px] text-on-surface-variant ml-auto">{{ rec.read_time_minutes ?? 1 }} mnt</span>
              </div>
              <h3 class="title-md text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug font-bold">
                {{ locale === 'en' && rec.title_en ? rec.title_en : rec.title_id }}
              </h3>
              <span class="body-sm font-bold text-primary mt-auto flex items-center gap-1 pt-2">
                <span>Baca Selengkapnya</span>
                <Icon name="ph:arrow-right-bold" class="text-xs group-hover:translate-x-1 transition-transform" />
              </span>
            </NuxtLink>
          </div>
        </section>
      </div>
    </div>

  <!-- Lightbox Modal for Media/Cover with macOS Neumorphic Frame & 3 Apple Dots -->
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
                class="w-3.5 h-3.5 rounded-full bg-[#FFBD2E] border border-[#DEA123]/60 flex items-center justify-center shadow-inner cursor-default"
                title="Minimize"
              >
                <svg class="w-2 h-2 text-[#593b00] opacity-0 group-hover/dots:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </span>
              <!-- Green Expand Dot -->
              <span
                class="w-3.5 h-3.5 rounded-full bg-[#27C93F] border border-[#1AAB29]/60 flex items-center justify-center shadow-inner cursor-default"
                title="Fullscreen"
              >
                <svg class="w-2 h-2 text-[#003b07] opacity-0 group-hover/dots:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <polyline points="9 21 3 21 3 15"></polyline>
                </svg>
              </span>
            </div>

            <!-- Window Title -->
            <div class="flex items-center gap-2 truncate px-3">
              <span class="text-xs sm:text-sm font-semibold text-on-surface truncate max-w-xs sm:max-w-md">
                {{ selectedMedia.caption || activeTitle }}
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
            <div class="neu-sunken w-full rounded-xl sm:rounded-2xl p-2 sm:p-3 flex items-center justify-center bg-surface-container/60 shadow-inner border border-outline-variant/10">
              <img
                :src="selectedMedia.image_url"
                :alt="selectedMedia.caption || 'Preview'"
                class="max-w-full max-h-[72vh] object-contain rounded-lg sm:rounded-xl shadow-md transition-transform"
              />
            </div>

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
