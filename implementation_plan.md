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

---

## 2. Implementation Plan v1.3: Animated Scroll-Stacking Project Cards, Squircle Tech Badges, & Modal Image Fit

| Metadata | Detail |
|---|---|
| **Proyek** | Portfolio Website Alfin Almustajab |
| **Dokumen** | Implementation Plan — Scroll-Stacking Project Cards & Tech Badges |
| **Versi** | 1.3.0 |
| **Tanggal** | 8 Oktober 2026 |
| **Role** | Senior Frontend Engineer & UI/UX Specialist |
| **Tech Stack** | Nuxt 4, Vue 3, GSAP + ScrollTrigger, Lenis Smooth Scroll, Tailwind CSS |
| **Status** | 🟢 Seluruh Fitur & Revisi Selesai Diimplementasikan |

### Rincian Perubahan yang Diimplementasikan:
1. **GSAP ScrollTrigger Stacking Engine (`ProjectsSection.vue`):**
   - ✅ Integrasi CSS `position: sticky` dengan dynamic top offset staggered (`top: calc(var(--stack-offset-base) + i * var(--stack-step))`).
   - ✅ Interpolasi scale dinamis berbasis GSAP ScrollTrigger yang terhubung dengan Lenis smooth scroll: kartu yang ditimpa kartu berikutnya secara bertahap mengecil (*scale down* dari `1.0` ke `~0.88–0.94` sesuai kedalaman tumpukan).
   - ✅ Bottom spacer `12vh` untuk memberikan ruang settling kartu terakhir.

2. **Penyempurnaan Penomoran Proyek:**
   - ✅ Menghilangkan angka raksasa `120px` di samping kartu yang sebelumnya menimpa teks.
   - ✅ Menggantikannya dengan penanda nomor kecil elegan (`PROJECT 01 / 05`) dengan status dot beranimasi di pojok atas gambar visual proyek (berseberangan dengan tags).

3. **Squircle Tech Stack Badges (`techIcons.ts` & `ProjectsSection.vue`):**
   - ✅ Membuat utility helper `app/utils/techIcons.ts` yang memetakan puluhan tech stack ke icon Iconify / Devicon `@nuxt/icon`.
   - ✅ Menampilkan squircle button berukuran `40x40px` (desktop) dan `36x36px` (mobile) dengan styling `neu-pressed`, interaksi hover lift `-translate-y-1`, zoom icon, serta tooltip melayang.

4. **Penyempurnaan Detail Modal (Desktop & Mobile Fit):**
   - ✅ Mengubah kontainer gambar utama dari fixed square box (`h-[360px]`) menjadi rasio landscape responsif (`aspect-[16/10] sm:aspect-video md:aspect-[16/9]`).
   - ✅ Menerapkan `object-contain` dan ambient soft blurred backdrop agar **100% gambar screenshot terlihat utuh tanpa terpotong border**, baik pada mode desktop maupun mobile (menjadi persegi panjang landscape).
   - ✅ Menyesuaikan margin modal pada mobile (`inset-2 sm:inset-4 md:inset-[20px]`) agar lebih leluasa.
   - ✅ Mengadopsi squircle badges juga pada bagian Tech Stack di dalam modal detail.

5. **Perbaikan Blocker Sticky & GSAP Ticker Scale (`default.vue` & `ProjectsSection.vue`):**
   - ✅ Memperbaiki akar penyebab kartu tidak menumpuk: mengganti `<main class="overflow-x-hidden">` menjadi `<main class="overflow-x-clip">` di `app/layouts/default.vue` karena `overflow-x: hidden` membatalkan `position: sticky` di browser.
   - ✅ Mengganti `<motion.section>` menjadi `<section>` biasa agar tidak menghasilkan inline CSS `transform: translateY(...)` yang membatalkan sticky containing block.
   - ✅ Mengintegrasikan kalkulasi scale kartu secara langsung ke `gsap.ticker` yang tersinkronisasi mulus dengan Lenis smooth scroll di setiap frame.

6. **Redesain Filter Proyek Menjadi 2 Tombol Bersih:**
   - ✅ Menghilangkan deretan 16 tombol filter yang memakan banyak ruang visual.
   - ✅ Menggantikannya dengan sistem 2 tombol elegan:
     1. Tombol `Semua` (`All`) dengan badge counter total proyek.
     2. Tombol `Filter Kategori` (dropdown option) yang membuka popover neumorphic berisi seluruh tag/kategori dengan counter masing-masing, checkmark, dan fitur auto-close saat klik di luar area (*click outside*).
     3. Ketika kategori aktif dipilih, tombol kedua otomatis menampilkan nama tag yang aktif (`Kategori: [Nama Tag]`).

---

## 3. Implementation Plan v1.4: Dynamic Navbar Font Scaling (Golden Ratio & 3/4 Rounding) & Inverted Liquid Silk Wave Footer with Layered Icon Transition

| Metadata | Detail |
|---|---|
| **Proyek** | Portfolio Website Alfin Almustajab |
| **Dokumen** | Implementation Plan — Navbar Font Scaling & Footer Liquid Silk Transition |
| **Versi** | 1.4.0 |
| **Tanggal** | 8 Oktober 2026 |
| **Role** | Senior Frontend Engineer & UI/UX Specialist |
| **Tech Stack** | Nuxt 4, Vue 3, Three.js (WebGL), Tailwind CSS, Neumorphism Design System |
| **Status** | 🟢 Seluruh Fitur Selesai Diimplementasikan |

---

### A. Bagian 1: Fungsi Dynamic Font Scaling pada Navbar saat Menyempit/Scroll

#### 1. Latar Belakang Masalah
Saat navbar di-scroll melewati threshold (scrollY > 50px), navbar menyusut dari tinggi `h-16` (64px) dengan lebar `max-w-7xl` menjadi pill compact `h-10` (40px) dengan lebar `max-w-3xl`. Namun, ukuran teks item menu (`Beranda`, `Proyek`, `Pengalaman`, `Monolog`, `Kontak`) saat ini hanya mengandalkan class statis `font-medium` tanpa fungsi interpolasi matematis yang proporsional terhadap penyempitan navbar.

#### 2. Konsep Matematis: Golden Ratio ($\Phi$) & Rasio 3/4
Permintaan pengguna: Ukuran font menu mengecil dengan rasio 3/4 persen namun dibulatkan menggunakan prinsip Golden Ratio ($\Phi \approx 1.6180339887$).
- **Golden Ratio ($\Phi$)**: $\Phi = \frac{1 + \sqrt{5}}{2} \approx 1.618$
- **Reciprocal Golden Ratio ($\phi$)**: $\frac{1}{\Phi} \approx 0.618$
- **Faktor 3/4**: $\frac{3}{4} = 0.75$

#### 3. Matriks Simulasi Ukuran Font (Perbandingan Base Size vs Scrolled Size)
| Base Size (Unscrolled) | Rasio 3/4 ($base \times 0.75$) | Golden Ratio Step ($base / \Phi$) | Pembulatan Harmonis Direkomendasikan |
|---|---|---|---|
| **22 px** (Ukuran Awal Contoh) | $22 \times 0.75 = 16.5 \text{ px}$ | $22 / 1.618 = 13.59 \text{ px}$ | **16 px** (Rasio 3/4) atau **14 px** (Golden Ratio) |
| **20 px** (Base Ideal Desktop) | $20 \times 0.75 = 15.0 \text{ px}$ | $20 / 1.618 = 12.36 \text{ px}$ | **15 px** / **14 px** |
| **18 px** (Base Standar UI) | $18 \times 0.75 = 13.5 \text{ px}$ | $18 / 1.618 = 11.12 \text{ px}$ | **14 px** / **13 px** |

#### 4. Spesifikasi Implementasi Fungsi (`AppNavbar.vue`)
Kita akan membuat utility function terstruktur dan bersih:
```ts
export const PHI = 1.618033988749895

export interface NavbarFontConfig {
  baseSize: number // default: 20 atau 22 px
  method: 'three-quarter' | 'golden-ratio' | 'golden-harmonic'
}

/**
 * Menghitung ukuran font menu navbar secara dinamis berdasarkan state scroll.
 * Menerapkan reduksi 3/4 dengan pembulatan harmonis Golden Ratio.
 */
export function computeNavbarFontSize(
  isScrolled: boolean,
  baseSize: number = 22,
  method: 'three-quarter' | 'golden-ratio' = 'three-quarter'
): string {
  if (!isScrolled) return `${baseSize}px`

  if (method === 'golden-ratio') {
    // base / 1.618 => 22 / 1.618 = 13.59 -> dibulatkan ke 14px
    return `${Math.round(baseSize / PHI)}px`
  }

  // base * 0.75 => 22 * 0.75 = 16.5 -> dibulatkan ke 16px (atau 15px untuk base 20)
  return `${Math.round(baseSize * 0.75)}px`
}
```

#### 5. Integrasi ke Template & Animasi Halus
- Menu links mengikat inline style `:style="{ fontSize: navMenuFontSize }"` atau CSS Variable `--nav-link-font-size`.
- Ditambahkan CSS transisi `transition: font-size 0.3s cubic-bezier(0.4, 0, 0.2, 1)` agar transisi perubahan ukuran font dari 22px &rarr; 16px/14px berlangsung mulus (*fluid transition*), tanpa lonjakan (*jumpy*).
- Penyesuaian harmonis pada tombol pelengkap:
  - Tombol **Resume**: Dari `text-base` &rarr; `text-xs`/`text-sm` saat scrolled.
  - Switcher Bahasa (`EN / ID`): Proporsional mengecil secara harmonis.
  - Icon Gemini AI: Menyesuaikan dari `w-10 h-10` &rarr; `w-8 h-8`.

---

### B. Bagian 2: Inverted Liquid Silk Wave Animation pada Footer & Lapisan Transisi Ikon

#### 1. Latar Belakang & Konsep Visual
- **Hero Banner** memiliki animasi khas *Deep Royal Blue Liquid Silk Wave* via Three.js WebGL shader (`LiquidCanvas.vue`).
- Untuk menyatukan *editorial storytelling* website dari awal hingga akhir, footer akan mengadopsi lanjutan animasi silk wave yang sama, menciptakan pengalaman visual sirkular (*full-circle aesthetic closure*).
- **Inverted (Dibalik)**:
  - Pada Hero, gelombang silk mengalir di awal banner dan meluntur ke bawah menuju konten About.
  - Pada Footer, posisinya **dibalik**: Efek transisi blur & gradient berada di **bagian atas footer**, menjembatani akhir dari `ContactSection` (latar terang) menuju latar kain sutra biru royal (Footer).

#### 2. Desain Transisi Blur di Bagian Atas (*Top Gradient Blur Bridge*)
1. **Backdrop Blur & Alpha Masking**:
   - Bagian atas footer diberikan lapisan transisi:
     `mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 20%, black 100%)`
   - Dipadukan dengan frosted glass header ribbon di puncak footer: `backdrop-blur-md bg-gradient-to-b from-surface-base via-surface-base/60 to-transparent h-24 absolute top-0 inset-x-0 pointer-events-none z-10`.
   - Hasilnya: Transisi dari section Contact ke gelombang sutra footer terjadi secara organik tanpa patahan garis batas yang kaku.

2. **Inverted Wave & Light Coordinate**:
   - Pada Three.js shader untuk footer (`FooterLiquidCanvas.vue`), vektor arah cahaya (`lightDir`) dan koordinat gelombang disesuaikan agar alunan lipatan sutra memantulkan highlight yang harmonis saat dilihat dari atas ke bawah.
   - Dilengkapi **`IntersectionObserver`**: Render loop Three.js hanya berjalan saat footer masuk ke dalam viewport layar (`rootMargin: '150px'`), menghemat pemakaian GPU/CPU laptop dan mobile hingga 0% saat pengguna membaca section lainnya.

#### 3. Lapisan Transisi Pelindung Ikon Footer (*Layered Glass Pods*)
Tantangan: Gelombang sutra biru tua memiliki kontras dinamis dengan pantulan specular terang dan bayangan navy pekat. Jika ikon sosial media diletakkan langsung di atasnya tanpa pembatas, ikon akan berbenturan warna dan sulit terlihat.

**Solusi Arsitektur 3 Lapis Pelindung Ikon:**
1. **Lapisan 1 — Frosted Glass Island Pedestal (Dock Utama):**
   - Wrapper kontainer ikon dibungkus dalam kapsul dock mengambang:
     `neu-raised rounded-full p-2.5 px-6 backdrop-blur-xl bg-surface/80 border border-white/20 shadow-island`
   - Berfungsi sebagai "pulau tenang" (*visual haven*) yang menetralkan turbulensi gelombang sutra di belakangnya.
2. **Lapisan 2 — Elevated Neumorphic Pods (Tombol Ikon Individual):**
   - Tiap ikon sosial (`LinkedIn`, `GitHub`, `Gmail`, `WhatsApp`) berada dalam pill bundar `w-12 h-12 rounded-full neu-raised bg-surface-card/90 hover:bg-surface border border-white/30`.
   - Memiliki bayangan ganda halus (*dual shadow ambient*) khas Neumorphism.
   - Efek hover: Lift `-translate-y-1` dan scale `1.1` dengan soft ring glow sesuai warna brand (Biru LinkedIn, Putih/Hitam GitHub, Merah Gmail, Hijau WhatsApp).
3. **Lapisan 3 — Kontras Tipografi & Status Badge:**
   - Badge *"TERBUKA UNTUK KOLABORASI"* dibungkus pill frosted glass kecil dengan pulsating emerald dot.
   - Teks Copyright dibubuhi soft drop shadow agar 100% terbaca tajam dan elegan di atas gelombang sutra.

---

### C. Rencana File yang Dibuat & Dimodifikasi

1. **`app/components/public/AppNavbar.vue`**:
   - Menambahkan formula fungsi `computeNavbarFontSize(isScrolled, baseSize, method)`.
   - Menghubungkan font size menu teks desktop & mobile dengan transisi CSS `duration-300`.
   - Mengatur rasio Golden Ratio & 3/4 rounding (22px &rarr; 16px/14px).

2. **`app/components/public/ui/FooterLiquidCanvas.vue` (Komponen Baru)**:
   - Komponen WebGL Three.js shader sutra biru khusus footer dengan arah gelombang inverted.
   - Dilengkapi `IntersectionObserver` auto-pause/resume untuk efisiensi performa 60fps.
   - Masking gradient halus di sisi atas untuk blending mulus dengan latar halaman.

3. **`app/components/public/AppFooter.vue`**:
   - Mengintegrasikan `FooterLiquidCanvas.vue` sebagai background dinamis.
   - Menerapkan top-blur transition mask di bagian atas footer.
   - Merestrukturisasi ikon sosial ke dalam sistem 3 lapis (*frosted glass island dock* + *elevated pods*).
   - Menambahkan WhatsApp ke daftar ikon sosial footer agar selaras dengan Contact section.

---

### D. Rencana Pengujian & Validasi (Verification Plan)

1. **Uji Responsivitas Font Navbar:**
   - Scroll halaman dari posisi puncak (0px) &rarr; scroll down (> 50px).
   - Pastikan teks menu navbar mengecil secara halus dari 18px ke 14px tanpa glitch atau loncatan layout.
   - Pastikan klik menu tetap presisi dan active state tetap berada di tengah pill.
2. **Uji Transisi & Efek Silk Wave Footer:**
   - Scroll ke bagian paling bawah website (melewati Contact section).
   - Pastikan transisi antara Contact section dan Footer menyatu dengan gradasi blur yang halus.
   - Pastikan gelombang sutra bergerak anggun dan interaktif.
   - Pastikan ikon sosial LinkedIn, GitHub, Gmail, WhatsApp terlihat sangat jelas, kontras, dan estetik dengan frosted pedestal.
3. **Uji Performa WebGL:**
   - Periksa console browser tidak ada warning / memory leak WebGL.
   - Verifikasi canvas berhenti me-render saat berada di bagian atas website, dan kembali aktif saat mendekati footer.

---

## 4. Implementation Plan v1.5: Photo Card Proportion Optimization (Desktop Signature Alignment & 20% Mobile Scaling with Stable Anti-Shift Layout)

| Metadata | Detail |
|---|---|
| **Proyek** | Portfolio Website Alfin Almustajab |
| **Dokumen** | Implementation Plan — About Photo Card Alignment & Mobile Anti-Shift |
| **Versi** | 1.5.0 |
| **Tanggal** | 8 Oktober 2026 |
| **Role** | Senior Frontend Engineer & UI/UX Specialist |
| **Komponen** | `app/components/public/AboutSection.vue` & `app/components/public/ui/RoleRotator.vue` |
| **Status** | 🟢 Seluruh Fitur Selesai Diimplementasikan |

---

### A. Analisa Masalah & Identifikasi Visual

#### 1. Masalah Tampilan Desktop (Kesejajaran Vertikal / Signature Alignment)
- **Kondisi Saat Ini**:
  Pada grid desktop (`grid-cols-1 lg:grid-cols-2`), card foto profil (`neu-raised rounded-card p-6 md:p-8 w-full`) memiliki dimensi total yang terlalu tinggi (`~660px+`). Sementara kolom kanan (kicker, headline, infinite marquee, 2 paragraf bio, dan signature `my-signature.webp`) memiliki tinggi sekitar `~520px - 540px`.
- **Dampak Visual**:
  Bagian bawah card foto menjulur jauh ke bawah melampaui bagian bawah section tanda tangan (*signature section*), menciptakan ketidakseimbangan proporsi layout grid.
- **Target**:
  Mengecilkan tinggi card foto profil sehingga bagian bawah card foto **sejajar presisi horizontal (*flush alignment*)** dengan bagian bawah gambar tanda tangan (*signature*).

#### 2. Masalah Tampilan Mobile (Skala Ukuran & Layout Shift Bolak-Balik)
- **Kondisi Saat Ini**:
  1. Card foto profil di mode mobile terasa terlalu mendominasi layar secara vertikal (+20% dari proporsi ideal).
  2. Susunan footer card foto menggunakan `flex items-end justify-between gap-4 flex-wrap`.
     - Saat role yang muncul memiliki teks pendek (misal *"Web Builder"* atau *"Full-Stack"*), teks muat dalam 1 baris bersama badge *"● TERSEDIA"*.
     - Saat role berganti ke teks yang lebih panjang (misal *"Digital Marketing"* atau *"UI UX Designer"*), lebar teks mendesak badge *"● TERSEDIA"*, sehingga badge tersebut **terdorong turun ke baris baru (*line wrap*)**.
- **Dampak UX/UI**:
  Setiap 2.8 detik saat `RoleRotator` berganti kata, tinggi card foto memanjang dan memendek secara dinamis (*Cumulative Layout Shift / CLS*). Hal ini menyebabkan seluruh konten dan section di bawahnya bergerak bolak-balik naik-turun, merusak kenyamanan membaca dan merusak estetika antarmuka.
- **Target**:
  1. Mengecilkan ukuran bagan foto di mode mobile sebesar **20%**.
  2. Menggeser posisi badge *"● TERSEDIA"* di mode mobile ke baris yang memberikan keleluasaan ruang (*space*) penuh bagi teks role, sehingga tidak akan pernah bertabrakan atau wrap, dan tinggi card menjadi **100% stabil, konstan, dan anti-shift**.

---

### B. Rencana Solusi Desain & Teknis

#### 1. Penyesuaian Proporsi Card Foto Desktop (Sejajar Garis Bawah Signature)
- **Penyesuaian Ketinggian Wadah Foto (`neu-pressed`)**:
  - Ubah `min-h-[420px]` pada breakpoint desktop (`lg`) menjadi `lg:min-h-[330px]` / `md:min-h-[350px]`.
- **Penyesuaian Skala Gambar Avatar**:
  - Ubah batas lebar maksimum gambar avatar dari `md:max-w-[380px]` menjadi `lg:max-w-[310px]` dengan scale yang tetap rapi dan tidak terpotong tepi bawahnya.
- **Penyesuaian Spacing Vertikal**:
  - Padding card: `lg:p-6` (dari `md:p-8`).
  - Margin atas container foto: `mt-5 md:mt-5` (dari `mt-6 md:mt-8`).
  - Margin divider garis: `my-4 md:my-5` (dari `my-6 md:my-8`).
- **Hasil**: Tinggi total card foto menyusut ~110px, sehingga tepi bawah card foto akan berada pada **garis horizontal yang sama persis** dengan tepi bawah gambar tanda tangan.

#### 2. Reduksi 20% Ukuran Bagan Foto di Mode Mobile
Sesuai arahan pengguna, seluruh elemen kunci bagan foto di mobile dikurangi sebesar 20%:
| Elemen | Ukuran Lama (Mobile) | Ukuran Baru (-20%) | Keterangan |
|---|---|---|---|
| **Wadah Foto (`min-h`)** | `360px` | `288px` (`min-h-[288px]`) | Tepat 20% lebih ringkas |
| **Lebar Maks Gambar Avatar** | `340px` | `272px` (`max-w-[272px]`) | Tepat 20% lebih proporsional |
| **Card Padding** | `p-6` (24px) | `p-4 sm:p-5` (16-20px) | Mengurangi ruang berlebih |
| **Container Padding Foto** | `pt-5 px-5` | `pt-4 px-4` | Menjaga framing avatar |
| **Margin Divider & Elemen** | `my-6 mt-6` | `my-4 mt-4` | Mencegah penumpukan tinggi |

#### 3. Restrukturisasi Layout Mobile Anti-Shift (Badge Bergeser Memberi Space Penuh)
Untuk menghentikan layout shift bolak-balik saat role berganti, kita pisahkan hierarki baris informasi di bawah foto:
- **Baris 1 (Nama & Badge Status)**:
  - Menggabungkan Nama Lengkap (`Alfin Almustajab`) dan Badge *"● TERSEDIA"* dalam satu baris fleksibel:
    ```html
    <div class="flex items-center justify-between gap-3">
      <p class="headline-md sm:headline-lg text-on-surface font-bold">{{ fullName }}</p>
      <div class="neu-island rounded-full px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 shrink-0">
        <span class="relative flex h-2 w-2 sm:h-2.5 sm:w-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span class="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-green-500" />
        </span>
        <span class="label-caps text-on-surface-variant text-[10px] sm:text-xs">{{ t('about.available') }}</span>
      </div>
    </div>
    ```
  - **Keuntungan**: Badge status *"● TERSEDIA"* bergeser ke kanan atas berdampingan dengan nama, memanfaatkan ruang horizontal yang luas.
- **Baris 2 (Role Switcher — Full Width Space)**:
  - Teks *"Specialized as"* bersama `RoleSwitcher` kini menempati baris terpisah dengan **100% ruang horizontal bebas hambatan**:
    ```html
    <div class="title-sm sm:title-md text-on-surface-variant flex items-center gap-1.5 flex-nowrap whitespace-nowrap overflow-visible min-h-[1.75rem]">
      <span class="shrink-0">Specialized as</span>
      <RoleSwitcher custom-class="text-primary font-bold" />
    </div>
    ```
  - Ditambahkan `min-h-[1.75rem]` pada container role agar memiliki tinggi cadangan yang tetap stabil saat transisi perpindahan kata.
  - **Keuntungan**: Role terpanjang sekalipun (*"Digital Marketing"*, *"UI UX Designer"*, *"AI Enthusiast"*) tidak akan pernah terdesak atau mendorong elemen lain ke baris baru.
- **Perilaku Responsif**:
  - Di layar desktop (`lg`), tata letak ini tetap rapi dan seimbang secara tipografi, selaras dengan proporsi ringkas yang baru.

---

### C. Komponen yang Dimodifikasi

1. **`app/components/public/AboutSection.vue`**:
   - Memperbarui class padding, container `min-h`, dan ukuran avatar image untuk desktop (sejajar signature) dan mobile (pengecilan 20%).
   - Merestrukturisasi blok nama, badge tersedia, dan role switcher ke dalam sistem 2 baris anti-wrap.
2. **`app/components/public/ui/RoleRotator.vue`**:
   - Menambahkan reserve line height stabil untuk menjamin zero layout shift pada teks role saat transisi.

---

### D. Rencana Pengujian & Validasi

1. **Uji Kesejajaran Desktop:**
   - Buka tampilan desktop pada resolusi 1280px ke atas (`lg` dan `xl`).
   - Periksa garis batas bawah card foto profil dan bandingkan dengan garis bawah gambar tanda tangan `my-signature.webp`.
   - Pastikan keduanya sejajar rata secara horizontal (*flush aligned*).
2. **Uji Proporsi Mobile (-20%):**
   - Buka tampilan mobile pada resolusi 360px – 430px (smartphone standar).
   - Pastikan card foto profil tampak lebih proporsional dan tidak mendominasi layar secara berlebihan.
3. **Uji Transisi Role Anti-Shift:**
   - Amati pergantian role otomatis dari *Full-Stack* &rarr; *UI UX Designer* &rarr; *IT Support* &rarr; *Digital Marketing* &rarr; *AI Enthusiast* &rarr; *Web Builder* &rarr; *Copywriter*.
   - Pastikan badge *"● TERSEDIA"* tetap tenang di posisinya tanpa pernah melompat ke baris bawah.
   - Pastikan tinggi card foto profil 100% konstan dan tidak ada pergeseran layout (*zero cumulative layout shift*) pada section di bawahnya.

---

## 5. Implementation Plan v1.6: Universal 2-Button Category Filter System Across Monolog and Admin Panels

| Metadata | Detail |
|---|---|
| **Proyek** | Portfolio Website Alfin Almustajab |
| **Dokumen** | Implementation Plan — Universal 2-Button Category Filter System |
| **Versi** | 1.6.0 |
| **Tanggal** | 8 Oktober 2026 |
| **Role** | Senior Frontend Engineer & UI/UX Specialist |
| **Komponen** | `ThoughtsSection.vue`, `admin/projects.vue`, `admin/thoughts.vue` |
| **Status** | 🟢 Seluruh Fitur Selesai Diimplementasikan |

---

### A. Rincian Fitur yang Diterapkan:
1. **Public Monolog / Thoughts (`ThoughtsSection.vue`)**:
   - Menggantikan deretan tombol filter tag statis dengan sistem 2 tombol elegan:
     1. **Tombol 1 (Semua)**: Menampilkan teks `Semua` dengan counter badge `{{ all.length }}`.
     2. **Tombol 2 (Filter Kategori / Dropdown Option)**: Menampilkan icon `ph:funnel-bold`, label dinamis (atau dot pulse + nama tag yang aktif), dan icon `ph:caret-down-bold`.
     3. **Neumorphic Popover Menu**: Menampilkan daftar seluruh kategori unik beserta counter masing-masing dan checkmark indikator `ph:check-bold`, lengkap dengan `onClickOutside` auto-close dan keyboard `Escape` handler.

2. **Admin Panel Portfolio / Projects (`admin/projects.vue`)**:
   - Menggantikan loop horizontal buttons kategori dengan sistem 2 tombol:
     1. **Tombol 1 (Semua)**: Dilengkapi icon kotak-kotak `ph:squares-four-bold` (konsisten dengan admin tech stack), teks `Semua`, dan counter `{{ projects.length }}`.
     2. **Tombol 2 (Filter Kategori)**: Tombol dropdown popover dengan menu kategori, counter per kategori, checkmark aktif, dan auto-close saat klik di luar area.

3. **Admin Panel Monolog / Thoughts (`admin/thoughts.vue`)**:
   - Menerapkan arsitektur 2 tombol yang sama:
     1. **Tombol 1 (Semua)**: Dilengkapi icon kotak-kotak `ph:squares-four-bold`, teks `Semua`, dan counter `{{ thoughts.length }}`.
     2. **Tombol 2 (Filter Kategori)**: Popover dropdown dengan filter kategori dinamis, counter tulisan, dan checkmark aktif.

---

## 6. Implementation Plan v1.7: Dynamic Thought Views Generation & Localhost Filtering with Database Reset

| Metadata | Detail |
|---|---|
| **Proyek** | Portfolio Website Alfin Almustajab |
| **Dokumen** | Implementation Plan — Dynamic Monolog Views & Localhost Filter |
| **Versi** | 1.7.0 |
| **Tanggal** | 9 Oktober 2026 |
| **Role** | Senior Backend & Database Engineer |
| **Komponen** | `server/api/thoughts/[slug].get.ts`, `server/utils/network.ts`, `ThoughtsSection.vue`, PostgreSQL `thoughts` |
| **Status** | 🟢 Seluruh Fitur Selesai Diimplementasikan |

---

### A. Rincian Fitur yang Diterapkan:
1. **Reset Database `views_count` Menjadi Nol (0)**:
   - Menjalankan operasi SQL database pada tabel `public.thoughts`:
     `UPDATE public.thoughts SET views_count = 0;`
   - Dibuatkan fungsi RPC `public.reset_thought_views()` berstatus `SECURITY DEFINER` di Supabase untuk pengelolaan pembersihan data views berkala.
   - Semua baris artikel monolog telah diverifikasi memiliki `views_count = 0`.

2. **Deteksi & Pengecualian Akses Localhost (`server/utils/network.ts`)**:
   - Dibuat helper server `isLocalhostRequest(event: H3Event)` yang memvalidasi:
     - Header `Host` dan `X-Forwarded-Host` (memeriksa `localhost`, `127.0.0.1`, `[::1]`, `.local`).
     - Header `Referer` dan `Origin` (mencegah hit dari dev server lokal).
     - Client IP address (`127.0.0.1`, `::1`, `::ffff:127.0.0.1`, `localhost`).
   - Pada endpoint `GET /api/thoughts/[slug]`, pengecekan `isLocalhostRequest` dijalankan sebelum memanggil RPC `increment_thought_views`:
     - Jika request berasal dari localhost: **views_count TIDAK bertambah**.
     - Jika request berasal dari user/visitor publik di production: **views_count otomatis bertambah (+1)**.

3. **Sinkronisasi Tampilan Views pada Antarmuka Monolog (`ThoughtsSection.vue`)**:
   - Menambahkan badge jumlah tayang (`Icon ph:eye-bold` + counter `{n} dilihat`) langsung pada setiap kartu artikel di daftar monolog, sehingga jumlah pembaca dapat terlihat secara transparan sebelum artikel diklik.
   - Ketika artikel diklik (`openReader`), nilai `views_count` pada kartu langsung diperbarui secara reaktif sesuai hasil respons dari server.



