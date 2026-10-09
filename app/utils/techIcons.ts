/**
 * Helper mapper untuk nama teknologi (tech stack) ke icon identifier Iconify / @nuxt/icon
 */
export const getTechIcon = (tech: string): string => {
  if (!tech) return 'ph:code-bold'
  const clean = tech.trim().toLowerCase()

  const map: Record<string, string> = {
    // Vue ecosystem
    vue: 'logos:vue',
    'vue 3': 'logos:vue',
    'vue.js': 'logos:vue',
    vuejs: 'logos:vue',
    nuxt: 'logos:nuxt-icon',
    'nuxt 3': 'logos:nuxt-icon',
    'nuxt 4': 'logos:nuxt-icon',
    'nuxt.js': 'logos:nuxt-icon',
    nuxtjs: 'logos:nuxt-icon',
    pinia: 'logos:pinia',
    vite: 'logos:vitejs',
    vitejs: 'logos:vitejs',

    // React ecosystem
    react: 'logos:react',
    'react 18': 'logos:react',
    'react 19': 'logos:react',
    'react.js': 'logos:react',
    'react native': 'logos:react',
    next: 'logos:nextjs-icon',
    'next.js': 'logos:nextjs-icon',
    nextjs: 'logos:nextjs-icon',
    expo: 'logos:expo-icon',

    // Languages
    typescript: 'logos:typescript-icon',
    ts: 'logos:typescript-icon',
    javascript: 'logos:javascript',
    js: 'logos:javascript',
    python: 'logos:python',
    golang: 'logos:go',
    go: 'logos:go',
    php: 'logos:php',
    html: 'logos:html-5',
    html5: 'logos:html-5',
    css: 'logos:css-3',
    css3: 'logos:css-3',

    // CSS Frameworks
    tailwind: 'devicon:tailwindcss',
    'tailwind css': 'devicon:tailwindcss',
    tailwindcss: 'devicon:tailwindcss',
    sass: 'logos:sass',
    bootstrap: 'logos:bootstrap',

    // Backend & APIs
    node: 'logos:nodejs-icon',
    'node.js': 'logos:nodejs-icon',
    nodejs: 'logos:nodejs-icon',
    express: 'devicon:express',
    'express.js': 'devicon:express',
    nitro: 'logos:unjs',
    fastapi: 'logos:fastapi',
    rest: 'ph:brackets-curly-bold',
    'rest api': 'ph:brackets-curly-bold',
    graphql: 'logos:graphql',

    // Database & Cache
    postgresql: 'logos:postgresql',
    postgres: 'logos:postgresql',
    supabase: 'logos:supabase-icon',
    mysql: 'logos:mysql-icon',
    mongodb: 'logos:mongodb-icon',
    mongo: 'logos:mongodb-icon',
    redis: 'logos:redis',
    prisma: 'logos:prisma',
    neon: 'logos:neon-icon',

    // DevOps & Tools
    docker: 'logos:docker-icon',
    git: 'logos:git-icon',
    github: 'logos:github-icon',
    vercel: 'logos:vercel-icon',
    aws: 'logos:aws',
    cloudflare: 'logos:cloudflare-icon',
    figma: 'logos:figma',

    // Animations & Libraries
    gsap: 'logos:greensock-icon',
    three: 'logos:threejs',
    'three.js': 'logos:threejs',
    threejs: 'logos:threejs',

    // Specialized Tags
    ai: 'ph:sparkle-bold',
    gemini: 'logos:google-gemini',
    openai: 'logos:openai-icon',
    pwa: 'ph:device-mobile-bold',
    analytics: 'ph:chart-line-up-bold',
    saas: 'ph:cloud-bold',
    finance: 'ph:currency-dollar-bold',
  }

  // Exact match
  if (map[clean]) return map[clean]

  // Partial match
  for (const key of Object.keys(map)) {
    if (clean.includes(key)) return map[key]
  }

  return 'ph:code-bold'
}
