<script setup lang="ts">
const { t } = useI18n()
const year = new Date().getFullYear()
const socials = [
  { name: 'LinkedIn', icon: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/linkedin/default.svg', url: 'https://www.linkedin.com/in/alfin-almustajab-630501374/' },
  { name: 'GitHub', icon: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/github/default.svg', url: 'https://github.com/thealfin' },
  { name: 'Email', icon: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/gmail/default.svg', url: 'mailto:kangalfin95@gmail.com' },
]
</script>

<template>
  <footer class="w-full py-10 bg-surface">
    <div class="container-portfolio border-t border-outline-variant/20 pt-8 flex flex-col items-center gap-6">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span class="label-caps text-on-surface-variant">{{ t('footer.available') }}</span>
      </div>
      <div class="flex gap-6">
        <a
          v-for="s in socials"
          :key="s.name"
          :href="s.url"
          target="_blank"
          rel="noopener"
          class="w-12 h-12 rounded-full neu-raised flex items-center justify-center hover:scale-110 transition-transform duration-300"
          :aria-label="s.name"
        >
          <img :src="s.icon" :alt="s.name" class="w-5 h-5" loading="lazy" />
        </a>
      </div>
      <p class="label-caps text-on-surface-variant/70">
        © {{ year }} {{ t('footer.copyright') }}
      </p>
    </div>
  </footer>
</template>
