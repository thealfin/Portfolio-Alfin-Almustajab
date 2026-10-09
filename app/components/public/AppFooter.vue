<script setup lang="ts">
import FooterLiquidCanvas from './ui/FooterLiquidCanvas.vue'

const { t } = useI18n()
const year = new Date().getFullYear()

const socials = [
  {
    name: 'LinkedIn',
    icon: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/linkedin/default.svg',
    url: 'https://www.linkedin.com/in/alfin-almustajab-630501374/',
    glowClass: 'bg-[#0077b5]/40',
  },
  {
    name: 'GitHub',
    icon: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/github/default.svg',
    url: 'https://github.com/thealfin',
    glowClass: 'bg-white/40',
  },
  {
    name: 'Email',
    icon: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/gmail/default.svg',
    url: 'mailto:kangalfin95@gmail.com',
    glowClass: 'bg-[#ea4335]/40',
  },
  {
    name: 'WhatsApp',
    icon: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/whatsapp/default.svg',
    url: 'https://wa.me/6285789824597',
    glowClass: 'bg-[#25d366]/40',
  },
]
</script>

<template>
  <footer class="relative w-full overflow-hidden bg-[#030d22] text-white pt-24 pb-14 select-none">
    <!-- 1. Three.js Inverted Deep Liquid Silk Blue Canvas (Lanjutan Hero Silk Wave) -->
    <FooterLiquidCanvas />

    <!-- 2. Inverted Top Transition Blur Bridge: Transisi mulus antara akhir Contact Section ke Silk Footer -->
    <div
      class="absolute top-0 inset-x-0 h-32 sm:h-40 pointer-events-none z-10 bg-gradient-to-b from-surface-base via-surface-base/70 to-transparent backdrop-blur-md"
      style="-webkit-mask-image: linear-gradient(to bottom, black 0%, black 35%, transparent 100%); mask-image: linear-gradient(to bottom, black 0%, black 35%, transparent 100%);"
    />

    <!-- Subtle Radial Vignette for rich depth -->
    <div
      class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,18,48,0.15)_0%,rgba(0,12,32,0.4)_65%,rgba(0,8,22,0.75)_100%)] pointer-events-none z-[1]"
    />

    <!-- 3. Central Content with Layered Neumorphic & Frosted Glass Islands -->
    <div class="relative z-20 container-portfolio flex flex-col items-center gap-7 pt-4">
      <!-- Status Badge: Terbuka untuk Kolaborasi dengan Frosted Pill -->
      <div class="backdrop-blur-md bg-surface/85 border border-white/30 neu-raised px-4 py-1.5 rounded-full flex items-center gap-2.5 shadow-sm">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        <span class="label-caps text-on-surface font-bold tracking-wider text-[11px] sm:text-xs">
          {{ t('footer.available') }}
        </span>
      </div>

      <!-- Layered Transition Dock Pod: Lapisan Transparan Menjaga Ikon Tetap Kontras & Menonjol -->
      <div class="neu-raised rounded-full p-2 sm:p-2.5 px-4 sm:px-6 backdrop-blur-xl bg-surface/85 border border-white/25 shadow-island flex items-center gap-3.5 sm:gap-5">
        <a
          v-for="s in socials"
          :key="s.name"
          :href="s.url"
          target="_blank"
          rel="noopener"
          class="group relative w-11 h-11 sm:w-12 sm:h-12 rounded-full neu-raised bg-surface-card/95 hover:bg-surface border border-white/40 flex items-center justify-center hover:scale-110 -translate-y-0 hover:-translate-y-1 transition-all duration-300 shadow-md"
          :aria-label="s.name"
          :title="s.name"
        >
          <!-- Ambient brand glow on hover -->
          <span
            class="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-[8px] -z-10"
            :class="s.glowClass"
          />
          <img
            :src="s.icon"
            :alt="s.name"
            class="w-5 h-5 sm:w-5.5 sm:h-5.5 object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-sm"
            loading="lazy"
          />
        </a>
      </div>

      <!-- High-contrast Copyright Notice -->
      <p class="label-caps text-white/85 font-medium tracking-wider drop-shadow-[0_1px_6px_rgba(0,0,0,0.7)] text-[11px] sm:text-xs text-center mt-1">
        © {{ year }} {{ t('footer.copyright') }}
      </p>
    </div>
  </footer>
</template>

