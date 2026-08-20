import { readFileSync, writeFileSync } from 'node:fs'

const env = readFileSync('.env.local', 'utf8')
const keyLine = env.split('\n').find((l) => l.startsWith('GEMINI_API_KEY='))
const key = keyLine?.split('=')[1]?.trim()
if (!key) throw new Error('GEMINI_API_KEY missing')

const chunks = [
  ['f547c8c3-af92-4258-9143-e336986f1168', 'Alfin Almustajab adalah Front-End Developer & IT Support di PT. Digital Teknologi Perkasa, dengan pengalaman membangun web app modern menggunakan Vue.js, Nuxt.js (SSR), dan Tailwind CSS, serta integrasi database Supabase dan MySQL/MariaDB.'],
  ['60573210-4227-424a-851e-d82486f3ac90', 'Alfin aktif di tim Digital Marketing Pesantren Smart Digital (PSD) dan memiliki minat kuat pada integrasi AI seperti chatbot dan Retrieval-Augmented Generation (RAG).'],
  ['10f97d76-e822-4e27-86df-8894b0345e56', 'Digitek adalah website resmi perusahaan PT. Digital Teknologi Perkasa. Alfin berperan sebagai Front-End Developer & IT Support, membangun UI, struktur admin panel, dan branding perusahaan.'],
  ['aefe68a6-ba32-475e-8a3f-22bf99f8eff7', 'Elapak Pontren adalah e-commerce pesantren dengan admin panel analitik, hasil migrasi ke design system dan standar WCAG 2.2 AA.'],
  ['b11fb7e5-016b-42db-96d9-7470ca3398e0', 'Website Yayasan Al Hikmah adalah portal informasi dan manajemen data internal yayasan pondok pesantren multi-unit pendidikan dengan struktur menu kompleks, sistem admin CRUD, dan database MySQL.'],
  ['e7bc089f-60ce-4430-83a4-912f45cbf454', 'Di PT. Digital Teknologi Perkasa, Alfin mengembangkan front-end responsif dengan Nuxt.js, membangun backend dengan Nitro dan Slim 3, menangani IT support, dan bereksperimen dengan integrasi AI (chatbot, RAG, Gemini API).'],
  ['3acf2ebe-c9ad-4719-85c1-f06de9b52a8e', 'Sebagai Digital Marketing Team Member PSD, Alfin mendukung promosi PSD ke pesantren mitra dan menganalisis data marketing untuk strategi outreach.'],
  ['c6429b9f-38fe-4e28-9151-caca8a8c605f', 'Alfin lulusan Universitas Ma\u2019arif Lampung (S.E., Program Studi Perbankan Syariah, GPA 3.75) dan bersertifikat Digital Marketing Bootcamp dari RevoU.'],
  ['868b286e-7bbf-4f80-81ce-d9c335809298', 'Cara menghubungi Alfin: email kangalfin95@gmail.com, LinkedIn (linkedin.com/in/alfin-almustajab-630501374), dan GitHub (github.com/thealfin).'],
  ['dd933bf0-6d4c-4163-99bb-864f269087c9', 'Alfin tersedia untuk peluang kerja, proyek freelance, dan kolaborasi di bidang front-end development, IT support, dan integrasi AI.'],
]

const out = []
for (const [id, text] of chunks) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text }] },
      }),
    },
  )
  const json = await res.json()
  if (!json.embedding) throw new Error(JSON.stringify(json))
  out.push({ id, embedding: json.embedding.values })
  console.log(`embedded ${id} (${json.embedding.values.length} dims)`)
}

writeFileSync('.output/embeddings.json', JSON.stringify(out, null, 0))
console.log(`wrote ${out.length} embeddings to .output/embeddings.json`)