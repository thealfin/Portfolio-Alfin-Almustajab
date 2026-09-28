<div align="center">

# Alfin Almustajab — Official Web Portfolio

**Front-End Developer & IT Support** · Nuxt 4 + Supabase + Gemini AI

A modern, highly immersive personal portfolio featuring an interactive **Three.js Liquid Background**, an Apple-inspired **Multilingual Welcome Preloader**, an eye-tracking **Clover AI Assistant (RAG)** with real-time **Thinking Orbs**, an authentic **GitHub Contribution Heatmap**, and a comprehensive **Admin Panel** with visitor analytics.

[![Nuxt](https://img.shields.io/badge/Nuxt_4-00DC82?style=flat-square&logo=nuxtdotjs&logoColor=white)](https://nuxt.com)
[![Vue](https://img.shields.io/badge/Vue_3-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat-square&logo=threedotjs&logoColor=white)](https://threejs.org)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Google Gemini](https://img.shields.io/badge/Gemini_API-8E75B2?style=flat-square&logo=googlegemini&logoColor=white)](https://ai.google.dev)
[![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=flat-square&logo=greensock&logoColor=white)](https://gsap.com)
[![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## 🖥️ Preview

> Screenshots diambil langsung dari aplikasi yang berjalan (desktop & mobile).

### Homepage Sections

| | | |
|:---:|:---:|:---:|
| <img src="docs/screenshots/home-hero.png" alt="Hero" width="100%"/> | <img src="docs/screenshots/home-about.png" alt="About" width="100%"/> | <img src="docs/screenshots/home-projects.png" alt="Projects" width="100%"/> |
| **Hero & Three.js Liquid Canvas** | **About & Bio** | **Featured Projects** |
| <img src="docs/screenshots/home-experience.png" alt="Experience" width="100%"/> | <img src="docs/screenshots/home-stack.png" alt="Tech Stack" width="100%"/> | <img src="docs/screenshots/home-thoughts.png" alt="Thoughts" width="100%"/> |
| **Experience Timeline** | **Tech & AI Stack** | **Thoughts / Writing** |
| <img src="docs/screenshots/home-testimonials.png" alt="Testimonials" width="100%"/> | <img src="docs/screenshots/home-contact.png" alt="Contact" width="100%"/> | <img src="docs/screenshots/admin-login.png" alt="Admin login" width="100%"/> |
| **Testimonials** | **Contact / CTA** | **Admin Login** |

### Mobile Views

<p align="center">
  <img src="docs/screenshots/mobile-hero.png" alt="Mobile hero" width="32%" />
  <img src="docs/screenshots/mobile-projects.png" alt="Mobile projects" width="32%" />
</p>

---

## ✨ Key Features & Latest Highlights

### 🌊 1. Interactive Three.js Liquid Background Canvas
- **Custom WebGL Shader Waves**: Simulasi kain sutra cair dinamis (*liquid silk*) multi-oktaf yang terinspirasi dari estetika web modern.
- **Harmonized Royal Blue Palette**: Warna senada yang diselaraskan dengan palet utama `#005bb2` dan aksen biru royal khas portofolio.
- **Interactive Pointer Ripples**: Gelombang permukaan merespons gerakan kursor mouse secara organik dengan redaman fisika halus.
- **Rock-solid Persistence**: Shader loop berjalan stabil 60 FPS tanpa macet saat di-scroll, di-resize, ataupun saat membuka panel inspect element.

### 🍎 2. Apple-Style Multilingual Welcome Preloader
- **First-Visit Greeting Overlay**: Section loading sapaan yang hanya aktif saat pengunjung pertama kali membuka/me-refresh web.
- **12+ International Greetings**: Siklus animasi tipografi tulisan tangan ala Apple Hello dalam berbagai aksara dan bahasa dunia:
  - *Hello* (English), *Halo* (Indonesia), *مرحبًا* (Arabic), *こんにちは* (Japanese), *안녕하세요* (Korean), *你好* (Chinese), *Привет* (Russian), *नमस्ते* (Hindi), *Bonjour* (French), *Hola* (Spanish), *Ciao* (Italian), dsb.
- **Seamless Fade-in Transition**: Memudar lembut begitu seluruh asset awal siap untuk menampilkan halaman utama.

### 🤖 3. Interactive Clover AI Bot Assistant & Thinking Orbs
- **Clover Bot Avatar with Eye Tracking**: Avatar bot AI interaktif dari [`bot-avatars`](https://libraries.dev/bots) dengan kemampuan pelacakan kursor (*pupil/eye focus*), reaksi sentuh (*click poke*), dan pergantian ekspresi dinamis (*idle*, *working*, *sleeping*).
- **Animated Thinking Orb**: Indikator loading AI berbasi partikel orbit melengkung dari [`thinking-orbs`](https://libraries.dev/orbs).
  - Menggunakan 39 partikel orbit bergerak aktif dengan kontras tinggi (`color="#0284c7"`) dan ukuran dot tajam (`:dot-size="1.8"`).
  - Berpendar harmonis baik di light mode maupun dark mode tanpa efek blank/invisible.
- **Policy-Bound RAG (Digital Twin)**: Ditenagai Google Gemini API + Supabase `pgvector`, asisten AI hanya menjawab seputar profil, keahlian, dan portofolio Alfin secara terarah.
- **Zero-Lag Modal Exit**: Didesain dengan layer akselerasi hardware GPU (`transform-gpu`) dan optimasi per-frame layout throttling sehingga modal tertutup seketika tanpa lag/stutter.

### 📊 4. Real GitHub Contribution Activity & Breakdown
- **Interactive Heatmap Grid**: Menampilkan 52 minggu grid kontribusi GitHub dengan palet warna gradasi biru (Level 0 s/d Level 4).
- **Year Selector Switcher**: Filter data aktivitas per tahun (2026 & 2025) secara interaktif.
- **Live Tooltip & Repository Feed**: Menampilkan statistik commit, tanggal, dan link repo langsung (`Couplecash-Native`, `couplecash`, `Katalog-Web-PPDB-Pesantren`, dll.).
- **Official Monochrome GitHub SVG**: Terintegrasi menggunakan badge SVG resmi dari [thesvg.org](https://thesvg.org/icon/github?variant=mono) yang diselaraskan dengan tone warna dot biru aktif.

### 🎯 5. Hero Banner & Infinite Marquee Role Ticker
- **Signature Motto**: Tagline *"With allfine, everything can will be fine."*
- **Dynamic Role Marquee**: Ticker animasi berjalan tanpa henti untuk role keahlian:
  *Full-Stack Developer · UI/UX Designer · IT Support · Digital Marketing · AI Enthusiast · Web Developer*.
- **Scroll Fade Disband**: Efek bubar/luntur tipografi saat halaman mulai di-scroll ke bawah.

### 🔐 6. Core Portfolio Features & Admin Panel
- **Featured Projects**: Studi kasus proyek mendalam dengan filter stack, live demo, dan rincian arsitektur.
- **Experience Timeline**: Rekam jejak profesional di PT. Digital Teknologi Perkasa dan sertifikasi industri.
- **Admin Panel**: Dashboard lengkap untuk mengelola Projects, Tech Stack, Thoughts, Pesan Pengunjung, Log Chat AI, Knowledge Base RAG, dan Keamanan.
- **Anonymous Visitor Analytics**: Pelacakan analitik pengunjung berbasis heartbeat server-side tanpa melanggar privasi.
- **Bilingual Support (i18n)**: Dukungan Bahasa Indonesia (ID) & English (EN) via `@nuxtjs/i18n`.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Nuxt 4](https://nuxt.com) (Universal/SSR) + [Vue 3](https://vuejs.org) + TypeScript |
| **Graphics & WebGL** | [Three.js](https://threejs.org) (`three` + custom GLSL shader waves) |
| **AI Bot & Loading Orbs** | [`bot-avatars`](https://libraries.dev/bots) (Clover) + [`thinking-orbs`](https://libraries.dev/orbs) |
| **Backend & Database** | [Supabase](https://supabase.com) — Postgres, Auth, Storage, `pgvector` |
| **AI Engine (RAG)** | Google [Gemini API](https://ai.google.dev) (`@google/generative-ai`) |
| **Styling & Design System** | [Tailwind CSS](https://tailwindcss.com) + Neumorphic Design Tokens |
| **Animation Engine** | [GSAP](https://gsap.com) + [Lenis](https://github.com/darkroomengineering/lenis) + [Motion](https://motion.dev) (`motion-v`) |
| **State & Composables** | [Pinia](https://pinia.vuejs.org) + [VueUse](https://vueuse.org) |
| **Internationalization** | [@nuxtjs/i18n](https://i18n.nuxtjs.org) (ID & EN) |
| **SEO & Meta** | [@nuxtjs/sitemap](https://sitemap.nuxtjs.org) + [@nuxtjs/robots](https://robots.nuxtjs.org) |
| **Deployment** | [Vercel](https://vercel.com) (Nitro Engine / Nuxt SSR) |

---

## 🏗 Architecture

```
┌─────────────┐   SSR / Nitro    ┌──────────────────┐
│   Browser   │ ───────────────▶ │  Nuxt 4 (Nitro)  │
│  (Vue SPA)  │ ◀─────────────── │  server routes   │
└─────────────┘    HTML / JSON   └─────────┬────────┘
      │                                    │  server-side only
      │ useFetch / useAsyncData            ▼
      ├─────────────────────────▶ ┌──────────────────────┐
      │                           │       Supabase        │
      │                           │ Postgres · Auth ·     │
      │                           │ pgvector (embeddings) │
      │                           └───────────┬──────────┘
      │                                       ▼
      │                              ┌────────────────┐
      │                              │  Gemini API    │
      │                              │ embed + generate│
      ▼                              └────────────────┘
┌───────────────────────────────────────────────┐
│              Client-side Engine               │
│  Three.js WebGL · bot-avatars · thinking-orbs │
└───────────────────────────────────────────────┘
```

**Rendering Strategy** (`nuxt.config.ts` route rules):

| Route | Strategy |
|---|---|
| `/` | Full SSR (Universal Render) |
| `/admin/**` | SPA only (Client-side protected) |
| `/api/chat` | Nitro Server Route with RAG vector search |
| `/api/github-contributions` | Nitro Server Route with caching |

---

## 📁 Project Structure

```
├── app/
│   ├── assets/css/      # Neumorphic tokens, tailwind imports, typography
│   ├── components/
│   │   ├── public/      # Hero, About, Projects, Stack, Thoughts, Testimonials, Contact
│   │   │   ├── GithubActivitySection.vue  # GitHub Heatmap & activity feed
│   │   │   ├── AiAssistantWidget.vue      # Clover Bot & Thinking Orb chat
│   │   │   └── ui/
│   │   │       ├── LiquidCanvas.vue       # Three.js GLSL shader background
│   │   │       ├── WelcomePreloader.vue   # Fullscreen greeting preloader
│   │   │       ├── AppleHelloText.vue     # Multi-language handwritten greeting
│   │   │       ├── BotAvatar.vue          # Interactive Clover 2D canvas bot
│   │   │       ├── ThinkingOrb.vue        # Dotted orbits loading indicator
│   │   │       └── RoleRotator.vue        # Infinite running marquee ticker
│   │   └── admin/       # Admin CRUD forms (Project, Stack, Thought, Knowledge)
│   ├── composables/     # useProjects, useChat, useAuth, useAnalytics, ...
│   ├── layouts/         # default (with LiquidCanvas) & admin layouts
│   ├── pages/           # index (home), login, admin/*
│   └── utils/           # date & string helpers
├── server/
│   ├── api/             # chat, github-contributions, projects, messages, analytics
│   └── utils/           # Supabase client, Gemini RAG embeddings (server-only)
├── database/            # SQL migrations & pgvector setup
├── i18n/                # id.json / en.json translation dictionaries
└── public/              # static assets (CV, icons, images)
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js **20+**
- A [Supabase](https://supabase.com) project (Postgres + Auth + `pgvector` extension)
- A [Google Gemini API](https://ai.google.dev) key

### Setup

```bash
# install dependencies
npm install

# configure environment
cp .env.example .env.local   # then fill in your values
```

```bash
# development server at http://localhost:3000
npm run dev

# production build & preview
npm run build
npm run preview

# static export
npm run generate
```

### Environment Variables

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase publishable/anon key (client-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (**server-only**) |
| `GEMINI_API_KEY` | Google Gemini API key (**server-only**) |
| `NUXT_PUBLIC_SITE_URL` | Public site URL for sitemap/SEO |

> ⚠️ Jangan pernah mengekspos `SUPABASE_SERVICE_ROLE_KEY` atau `GEMINI_API_KEY` ke sisi klien. Seluruh proses RAG asisten AI dijalankan secara aman melalui Nitro Server Engine.

### Database Migrations & RAG Seeding

Terapkan skrip migrasi SQL pada folder [`database/`](database) di database Supabase Anda, lalu jalankan seeding knowledge embeddings awal:

```bash
node scripts/seed-embeddings.mjs
```

---

## 📜 Author

**Alfin Almustajab** — Front-End Developer & IT Support

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/alfin-almustajab-630501374/)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/thealfin)
[![Email](https://img.shields.io/badge/Email-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:kangalfin95@gmail.com)

---

Built with ❤️ using [Nuxt 4](https://nuxt.com), [Three.js](https://threejs.org), [Supabase](https://supabase.com), and [Google Gemini](https://ai.google.dev).