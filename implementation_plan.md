# Implementation Plan v1.2: Hero Refinements, Multilingual Greeting Expansion, Marquee Roles, & About Bio Redaction

| Metadata | Detail |
|---|---|
| **Proyek** | Portfolio Website Alfin Almustajab |
| **Dokumen** | Implementation Plan — Hero Banner, Role Switcher & GitHub Activity |
| **Versi** | 1.2.0 |
| **Tanggal** | 28 September 2026 |
| **Role** | Senior Frontend Engineer & UI/UX Specialist |
| **Tech Stack** | Nuxt 4, Vue 3 (Composition API), Three.js (r182/WebGL), Tailwind CSS, Nitro Server Engine |
| **Status** | 🟢 Seluruh Fitur & Revisi Selesai Diimplementasikan |

---

## 1. Pembaruan Fitur yang Selesai Dikerjakan

1. **Refactor Hero Section & Role Rotator (`HeroSection.vue` & `RoleRotator.vue`):**
   - ✅ Hapus wrapper class kaku `min-w` pada `RoleRotator.vue` menjadi inline yang fleksibel dan terpusat (`inline-block relative overflow-visible select-none text-center`).
   - ✅ Hapus section button CTA (*Explore Projects* dan *Contact*) dari `HeroSection.vue`.
   - ✅ Kecilkan ukuran main tagline menjadi proporsional (`text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem]`).
   - ✅ Berikan pemisahan baris (*enter*) setelah frasa bridge *"Take a moment to discover meaningful craftsmanship,"* &rarr; baris baru: *"and let’s bring your vision to life seamlessly."*.
   - ✅ Tambahkan animasi scroll-driven dispersal (bubar, blur, renggang huruf, dan pudar ke atas) pada main tagline saat di-scroll.
   - ✅ Tambahkan efek animasi background liquid yang meluntur dari bawah ke atas menyatu ke warna dasar halaman seiring halaman di-scroll.

2. **Ekspansi Sapaan Multilingual di Welcome Preloader (`WelcomePreloader.vue` & `AppleHelloText.vue`):**
   - ✅ Tingkatkan durasi total loading menjadi **2.8 detik** agar seluruh variasi bahasa terload dan terbaca dengan nyaman.
   - ✅ Hapus bahasa Jerman (*Deutsch*).
   - ✅ Tambahkan 4 aksara bahasa baru:
     - **Mandarin / Cina**: `你好`
     - **Korea**: `안녕하세요`
     - **Rusia**: `Привет`
     - **India / Hindi**: `नमस्ते`
   - ✅ Lengkap dengan bahasa utama: `hello`, `halo`, `مرحباً`, `hola`, `bonjour`, `ciao`, `こんにちは`, dan penutup `welcome`.

3. **Infinite Marquee Roles di About Section (`AboutSection.vue`):**
   - ✅ Ubah section tags menjadi **Infinite Marquee Banner** yang berputar secara mulus terus-menerus.
   - ✅ Format batas awal dan akhir:
     `|| • Full-Stack • UI UX Designer • IT Support • Digital Marketing • AI Enthusiast • Web Builder • Copywriter ||`
   - ✅ Dilengkapi fitur *pause-on-hover* saat kursor diarahkan ke marquee.

4. **Pembaruan Redaksi Narasi Profil (p1 & p2) di `i18n/id.json` & `i18n/en.json`:**
   - ✅ **Bahasa Indonesia (`i18n/id.json`)**:
     - `about.p1`: *"Saya Alfin Almustajab, seorang multi-disciplinary digital creator yang memadukan keahlian Full-Stack engineering, UI/UX Designer, dan Web Builder berbasis di Indonesia. Saya berfokus merancang antarmuka modern yang estetik, membangun arsitektur web yang scalable, serta mengeksplorasi integrasi kecerdasan buatan sebagai seorang AI Enthusiast untuk menghadirkan solusi digital masa depan."*
     - `about.p2`: *"Dengan fondasi teknis yang kuat di bidang IT Support untuk menjaga keandalan sistem, dipadukan keahlian strategis dalam Digital Marketing dan Copywriter untuk merangkai pesan yang memikat, saya menghadirkan ekosistem digital yang holistik—mulai dari baris kode backend, keindahan visual, hingga strategi pertumbuhan produk yang berdampak nyata."*
   - ✅ **Bahasa Inggris (`i18n/en.json`)**:
     - `about.p1`: *"I'm Alfin Almustajab, a multidisciplinary digital creator merging Full-Stack engineering, UI/UX Design, and modern Web Building based in Indonesia. I specialize in architecting scalable web applications, crafting intuitive human-centric interfaces, and leveraging cutting-edge intelligence as an active AI Enthusiast."*
     - `about.p2`: *"Backed by solid technical expertise in IT Support ensuring robust infrastructure, complemented by strategic insights in Digital Marketing and impactful Copywriting, I deliver comprehensive digital solutions—from resilient backend code to high-converting user experiences."*

5. **GitHub Activity Heatmap Section (`GithubActivitySection.vue`):**
   - ✅ Heatmap 52 minggu kontribusi open source akun `thealfin`.
   - ✅ Interactive tooltip, badge 118 commits, level 0-4 colors, dan cached endpoint `/api/github-contributions`.
