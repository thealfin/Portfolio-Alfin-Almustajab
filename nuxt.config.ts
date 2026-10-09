// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-08-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/google-fonts',
    '@nuxtjs/color-mode',
    '@nuxt/image',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxt/icon',
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'motion-v/nuxt',
  ],

  icon: {
    clientBundle: {
      scan: true,
    },
  },

  css: ['~/assets/css/main.css'],

  components: [
    { path: '~/components', pathPrefix: false },
  ],

  googleFonts: {
    families: {
      Inter: [400, 500, 600, 700, 800],
      Caveat: [600, 700],
      'Alex Brush': [400],
      Sacramento: [400],
      Amiri: [700],
    },
    display: 'swap',
  },

  colorMode: {
    classSuffix: '',
    preference: 'light',
  },

  i18n: {
    locales: [
      { code: 'id', name: 'Indonesia', file: 'id.json' },
      { code: 'en', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'id',
    strategy: 'no_prefix',
    detectBrowserLanguage: false,
    langDir: '../i18n/',
    experimental: {
      preload: true,
    },
  },

  routeRules: {
    '/': { isr: false },
    '/admin/**': { ssr: false },
    '/api/chat': { cors: true },
    '/api/projects': { headers: { 'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600' } },
    '/api/projects/**': { headers: { 'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600' } },
    '/api/thoughts': { headers: { 'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600' } },
    '/api/thoughts/**': { headers: { 'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600' } },
    '/api/stacks': { headers: { 'cache-control': 'public, max-age=300, s-maxage=600, stale-while-revalidate=1200' } },
  },

  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL || 'https://wrwgmmapexljecjnxirk.supabase.co',
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    githubToken: process.env.GITHUB_TOKEN || '',
    githubUsername: process.env.GITHUB_USERNAME || '',
    public: {
      supabaseUrl: process.env.SUPABASE_URL || 'https://wrwgmmapexljecjnxirk.supabase.co',
      supabaseKey: process.env.SUPABASE_KEY || '',
    },
  },

  site: {
    url: process.env.NUXT_PUBLIC_SITE_URL || 'https://portfolio-alfin-six.vercel.app',
  },

  app: {
    head: {
      htmlAttrs: { lang: 'id' },
      titleTemplate: '%s Alfin Almustajab',
      meta: [
        { name: 'description', content: 'Portofolio Alfin Almustajab Full-Stack Programer, UI UX Designer & IT Support.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/webp', href: '/favicon.webp' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200' },
      ],
    },
  },
})
