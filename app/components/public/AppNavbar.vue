<script setup lang="ts">
type Link = { label: string; id: string }
const { t, locale, setLocale } = useI18n()
const { openChat } = useAiWidget()
const { scrollTo } = useScrollTo()

const route = useRoute()
const mobileOpen = ref(false)
const activeId = ref('home')
let observer: IntersectionObserver | null = null

const links = computed<Link[]>(() => [
  { label: t('nav.home'), id: 'home' },
  { label: t('nav.projects'), id: 'projects' },
  { label: t('nav.experience'), id: 'experience' },
  { label: t('nav.thoughts'), id: 'thoughts' },
  { label: t('nav.contact'), id: 'contact' },
])

const isActive = (l: Link) => {
  if (route.path.startsWith('/projects')) return l.id === 'projects'
  if (route.path.startsWith('/thoughts')) return l.id === 'thoughts'
  if (route.path !== '/') return false
  return activeId.value === l.id
}

const go = (l: Link) => {
  console.log('[Navbar] go clicked:', l.id)
  mobileOpen.value = false
  scrollTo(l.id)
}

const isScrolled = ref(false)

const setupObserver = () => {
  observer?.disconnect()
  if (typeof window === 'undefined' || route.path !== '/') return
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activeId.value = entry.target.id
      }
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
  )
  for (const l of links.value) {
    const el = document.getElementById(l.id)
    if (el) observer.observe(el)
  }
}

watch(() => route.path, (path) => {
  if (path === '/') {
    nextTick(() => {
      setTimeout(setupObserver, 200)
    })
  }
})

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  setupObserver()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  observer?.disconnect()
})

const onScroll = () => {
  isScrolled.value = window.scrollY > 50
}

const toggleLocale = () => {
  setLocale(locale.value === 'id' ? 'en' : 'id')
}

/**
 * Konstanta Golden Ratio (Phi)
 */
const PHI = 1.618033988749895

/**
 * Menghitung ukuran font menu navbar secara dinamis berdasarkan status scroll.
 * Konfigurasi: base 22px (unscrolled) dan menyusut ke 18px saat scrolled.
 *
 * @param scrolled Status apakah navbar menyempit/scrolled
 * @param basePx Ukuran font awal (default 22px)
 * @param scrolledPx Ukuran font saat navbar menyusut (default 18px)
 * @returns Nilai string CSS px (misal: '22px' atau '18px')
 */
function computeNavbarFontSize(
  scrolled: boolean,
  basePx = 18,
  scrolledPx = 14,
): string {
  if (!scrolled) return `${basePx}px`
  return `${scrolledPx}px`
}

const navMenuFontSize = computed(() => computeNavbarFontSize(isScrolled.value, 18, 14))
</script>

<template>
  <header
    class="fixed top-4 md:top-6 w-full z-50 flex justify-center px-4 transition-all duration-300"
    :class="isScrolled ? 'top-2 md:top-3' : 'top-4 md:top-6'"
  >
    <nav
      class="neu-raised rounded-full w-full flex items-center justify-between transition-all duration-300"
      :class="isScrolled ? 'h-11 md:h-12 max-w-3xl md:max-w-4xl px-3 md:px-6 shadow-island' : 'h-16 max-w-7xl px-4 md:px-8'"
    >
      <button class="flex items-center gap-4" aria-label="Beranda" @click="go({ id: 'home', label: '' })">
        <span
          class="rounded-full neu-raised flex items-center justify-center overflow-hidden transition-all duration-300"
          :class="isScrolled ? 'w-8 h-8 p-1' : 'w-10 h-10 p-1.5'"
        >
          <img src="/logo.webp" alt="Alfin Almustajab" class="w-full h-full object-contain" />
        </span>
      </button>

      <div class="hidden md:flex relative items-center gap-1.5 lg:gap-2">
        <button
          v-for="l in links"
          :key="l.id"
          class="relative rounded-full transition-all duration-300 font-medium cursor-pointer flex items-center justify-center leading-none"
          :style="{ fontSize: navMenuFontSize }"
          :class="[
            isActive(l) ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface',
            isScrolled ? 'px-3.5 py-1.5' : 'px-5 py-2'
          ]"
          :aria-current="isActive(l) ? 'page' : undefined"
          @click="go(l)"
        >
          <span
            class="absolute inset-0 rounded-full neu-pressed transition-opacity duration-300"
            :class="isActive(l) ? 'opacity-100' : 'opacity-0'"
          />
          <span class="relative z-10">{{ l.label }}</span>
        </button>
      </div>

      <div class="flex items-center gap-4 md:gap-6">
        <a
          href="/Alfin-Almustajab-CV.pdf"
          download="Alfin Almustajab - CV.pdf"
          class="neu-raised rounded-full flex items-center gap-1.5 font-medium hover:scale-105 active:scale-95 transition-all duration-300"
          :class="isScrolled ? 'px-3 py-1 text-xs md:text-sm' : 'px-4 py-2 text-sm md:text-base'"
          :aria-label="t('nav.resume')"
          :title="t('nav.resume')"
        >
          <Icon name="ph:arrow-down-bold" class="text-[11px] md:text-sm" />
          <span class="hidden sm:inline">{{ t('nav.resume') }}</span>
        </a>

        <button
          class="neu-pressed rounded-full flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase transition-all hover:scale-105 active:scale-95"
          :class="isScrolled ? 'px-2 py-1' : 'px-3 py-1.5'"
          :aria-label="locale === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'"
          @click="toggleLocale"
        >
          <span :class="locale === 'en' ? 'text-primary' : 'text-on-surface-variant'">en</span>
          <span class="text-on-surface-variant/40">/</span>
          <span :class="locale === 'id' ? 'text-primary' : 'text-on-surface-variant'">id</span>
        </button>

        <button
          class="neu-accent rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          :class="isScrolled ? 'w-8 h-8' : 'w-9 h-9 md:w-10 md:h-10'"
          :aria-label="t('nav.askAI')"
          :title="t('nav.askAI')"
          @click="openChat"
        >
          <GeminiIcon class="w-4 h-4 md:w-5 md:h-5 text-[#1a73e8]" />
        </button>

        <button
          class="md:hidden rounded-full bg-primary flex items-center justify-center transition-all"
          :class="isScrolled ? 'w-7 h-7' : 'w-8 h-8'"
          @click="mobileOpen = !mobileOpen"
        >
          <Icon name="ph:list-bold" class="text-on-primary" />
        </button>
      </div>
    </nav>

    <div
      v-if="mobileOpen"
      class="md:hidden fixed inset-0 top-20 flex justify-center px-6 z-40"
      @click.self="mobileOpen = false"
    >
      <div class="neu-raised rounded-[24px] p-6 w-full max-w-sm flex flex-col gap-2">
        <button
          v-for="l in links"
          :key="l.id"
          class="px-6 py-3 rounded-full transition-all font-medium cursor-pointer text-left"
          :class="isActive(l) ? 'neu-pressed text-primary font-bold' : 'text-on-surface-variant'"
          :aria-current="isActive(l) ? 'page' : undefined"
          @click="go(l)"
        >
          {{ l.label }}
        </button>

        <a
          href="/Alfin-Almustajab-CV.pdf"
          download="Alfin Almustajab - CV.pdf"
          class="mt-1 px-6 py-3 rounded-full neu-raised flex items-center justify-center gap-2 font-medium text-primary"
          @click="mobileOpen = false"
        >
          <Icon name="ph:arrow-down-bold" class="text-base" />
          {{ t('nav.resume') }}
        </a>
      </div>
    </div>
  </header>
</template>