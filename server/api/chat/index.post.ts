import { GoogleGenerativeAI } from '@google/generative-ai'

const SESSION_LIMIT = 7

const CONTACT_LINKS = [
  '- Email: [kangalfin95@gmail.com](mailto:kangalfin95@gmail.com)',
  '- WhatsApp: [wa.me/6285789824597](https://wa.me/6285789824597)',
  '- LinkedIn: [linkedin.com/in/alfin-almustajab-630501374](https://www.linkedin.com/in/alfin-almustajab-630501374/)',
  '- GitHub: [github.com/thealfin](https://github.com/thealfin)',
].join('\n')

// Baseline knowledge context to ensure the AI always has verified ground-truth facts about Alfin
const BASELINE_ALFIN_PROFILE = `
Profil Lengkap Alfin Almustajab:
- Nama: Alfin Almustajab
- Peran: Front-End to Full-Stack Developer & IT Support, UI/UX Designer, Digital Marketing Specialist, AI Enthusiast.
- Perusahaan Saat Ini: PT. Digital Teknologi Perkasa & Tim Digital Marketing Pesantren Smart Digital (PSD).
- Keahlian Teknis (Tech Stack): Vue.js, Nuxt 4 (SSR/Universal), TypeScript, Tailwind CSS, Three.js (WebGL GLSL Shader), Supabase (Postgres & pgvector), MySQL/MariaDB, Nitro Engine, Slim 3, Google Gemini API, RAG (Retrieval-Augmented Generation).
- Proyek Unggulan:
  1. Digitek (Website resmi PT. Digital Teknologi Perkasa https://digitekperkasa.com & web baru https://digitek-blond.vercel.app): Alfin membangun UI responsif, arsitektur admin panel, dan company branding.
  2. Elapak Pontren: E-commerce pesantren dengan admin panel analitik, implementasi design system dan standar aksesibilitas WCAG 2.2 AA.
  3. Website Yayasan Al Hikmah: Portal informasi terpadu dan sistem manajemen data internal yayasan pondok pesantren dengan sistem admin CRUD dan database MySQL.
  4. Couplecash & Couplecash-Native: Aplikasi web dan mobile pengelolaan keuangan modern berbasis TypeScript dan Vue.
  5. Katalog Web PPDB Pesantren: Platform pendaftaran santri baru terpadu untuk pondok pesantren.
- Pendidikan: S.E. Perbankan Syariah, Universitas Ma'arif Lampung (GPA 3.75).
- Sertifikasi: Full-Stack Digital Marketing Bootcamp dari RevoU.
- Ketersediaan Kolaborasi: Terbuka untuk peluang kerja full-time, freelance, dan proyek kolaborasi pembuatan web app modern, front-end development, IT support, dan integrasi AI.
- Kontak Resmi:
  - Email: [kangalfin95@gmail.com](mailto:kangalfin95@gmail.com)
  - WhatsApp: [wa.me/6285789824597](https://wa.me/6285789824597)
  - LinkedIn: [linkedin.com/in/alfin-almustajab-630501374](https://www.linkedin.com/in/alfin-almustajab-630501374/)
  - GitHub: [github.com/thealfin](https://github.com/thealfin)
`

const isEnglishQuery = (text: string) => {
  const idRegex = /\b(halo|hai|selamat|pagi|siang|malam|apa|siapa|bagaimana|gimana|bisa|projek|proyek|pengalaman|dan|ini|itu|di|ke|dari|ya|kak|bang|mas|tentang|tolong|kamu|dia|kerja|kuliah|sekolah|kontak|hubungi)\b/i
  const enRegex = /\b(hi|hello|hey|who|what|where|when|why|how|can|could|would|is|are|tell|me|about|project|projects|experience|skill|skills|and|this|that|in|to|from|please|you|he|his|work|contact|hire|collaborate)\b/i
  if (idRegex.test(text)) return false
  if (enRegex.test(text)) return true
  return /^[a-zA-Z0-9\s.,?!'"-:;()]+$/.test(text)
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { message = '', sessionId = '', userId = '' } = await readBody(event)

  if (!message.trim() || message.length > 500) {
    throw createError({ statusCode: 400, statusMessage: 'Pesan tidak valid' })
  }

  const supabase = useSupabaseServer()

  // Hitung pertanyaan yang sudah dipakai di sesi ini (rate limit 7/sesi)
  // via SECURITY DEFINER (anon tidak boleh SELECT ai_chat_logs langsung)
  const { data: sessionCtx } = await supabase.rpc('get_ai_chat_context', { session_uuid: sessionId, max_rows: 8 })
  const used = sessionCtx?.[0]?.session_count ?? 0
  const isLast = used + 1 >= SESSION_LIMIT
  const userLangIsEn = isEnglishQuery(message)

  const closing = (extra?: string) => {
    if (userLangIsEn) {
      return `This chat session has reached its limit of ${SESSION_LIMIT} questions. Thank you for visiting! ${extra || "If you'd like to discuss projects, hire Alfin, or collaborate, feel free to reach out directly:"}\n${CONTACT_LINKS}`
    }
    return `Sesi obrolan ini sudah mencapai batas ${SESSION_LIMIT} pertanyaan. Terima kasih sudah mampir! ${extra || 'Kalau kamu tertarik lanjut diskusi, hire, atau kolaborasi, langsung aja hubungi Alfin:'}\n${CONTACT_LINKS}`
  }

  // Sesi sudah ditutup -> tolak pesan baru
  if (used >= SESSION_LIMIT) {
    return {
      answer: closing(userLangIsEn ? 'Session closed.' : 'Sesi sudah ditutup.'),
      wasAnswered: false,
      sessionEnded: true,
      questionsUsed: SESSION_LIMIT,
      sessionLimit: SESSION_LIMIT,
    }
  }

  // Muat pengaturan gaya AI dari database bila ada
  const { data: settings } = await supabase.from('ai_settings').select('persona, instructions, memory_enabled').limit(1)
  const customInstructions = settings?.[0]?.instructions ?? ''
  const memoryEnabled = settings?.[0]?.memory_enabled ?? true

  // Fallback: jika GEMINI_API_KEY belum diisi, jawab dari context dasar langsung
  if (!config.geminiApiKey) {
    const answer = userLangIsEn
      ? `Thank you for your message! Here is the available information:\n\n${BASELINE_ALFIN_PROFILE}\n\n(Full AI interaction will be active after GEMINI_API_KEY is configured in .env.local.)`
      : `Terima kasih atas pertanyaanmu. Berikut informasi dasar yang tersedia:\n\n${BASELINE_ALFIN_PROFILE}\n\n(Jawaban AI interaktif aktif setelah GEMINI_API_KEY dikonfigurasi di .env.local.)`
    await supabase.from('ai_chat_logs').insert({ session_id: sessionId, user_id: userId, question: message, answer, was_answered: false })
    const finalAnswer = isLast ? `${answer}\n\n${closing()}` : answer
    return { answer: finalAnswer, wasAnswered: false, sessionEnded: isLast, questionsUsed: used + 1, sessionLimit: SESSION_LIMIT }
  }

  const genAI = new GoogleGenerativeAI(config.geminiApiKey)

  // 1. Embed query via REST (3072 dims, matches ai_knowledge_chunks.embedding vector(3072))
  let matchedChunks: any[] = []
  try {
    const embRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${config.geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'models/gemini-embedding-001',
          content: { parts: [{ text: message }] },
        }),
      },
    )
    const embJson = await embRes.json()
    const vector = embJson?.embedding?.values

    if (vector) {
      // Use match_threshold 0.38 to allow multilingual semantic matching (English -> Indonesian chunks)
      const { data: chunks, error } = await supabase.rpc('match_knowledge_chunks', {
        query_embedding: vector,
        match_threshold: 0.38,
        match_count: 6,
      })
      if (!error && chunks) {
        matchedChunks = chunks
      }
    }
  } catch (err) {
    console.warn('[AI Chat] Semantic search warning:', err)
  }

  // Gabungkan baseline profile dengan potongan knowledge chunks hasil pencarian RAG
  const chunksText = matchedChunks.length > 0
    ? matchedChunks.map((c: any) => `[${c.source ?? 'knowledge'}] ${c.content}`).join('\n\n')
    : ''

  const combinedContext = [
    BASELINE_ALFIN_PROFILE.trim(),
    chunksText ? `DATA TAMBAHAN DARI KNOWLEDGE BASE:\n${chunksText}` : '',
  ].filter(Boolean).join('\n\n')

  // Memori: ambil riwayat percakapan terakhir sesi ini (kalau memori aktif)
  let historyContext = ''
  if (memoryEnabled && sessionCtx && sessionCtx.length > 1) {
    const history = [...sessionCtx].reverse()
    historyContext = history
      .map((h: any) => `- User: ${h.question}\n  AI: ${h.answer}`)
      .join('\n')
  }

  // System Prompt komprehensif: Multilingual, Relevansi Topik Alfin, dan Soft Selling Out-of-Scope
  const prompt = `
KAMU ADALAH:
Asisten AI resmi dan representasi digital profesional dari Alfin Almustajab di website portofolionya.

1. ATURAN MULTILINGUAL (SANGAT PENTING):
- Kamu menerima pertanyaan dalam BERBAGAI BAHASA, KHUSUSNYA Bahasa Inggris dan Bahasa Indonesia (serta bahasa lainnya).
- Deteksi bahasa yang digunakan oleh pengguna pada PERTANYAAN PENGGUNA.
- SELALU berikan respon dalam BAHASA YANG SAMA persis dengan bahasa yang digunakan pengguna:
  * Jika pengguna bertanya dalam Bahasa Inggris -> Wajib jawab dalam Bahasa Inggris yang fasih, alami, dan profesional.
  * Jika pengguna bertanya dalam Bahasa Indonesia -> Wajib jawab dalam Bahasa Indonesia yang ramah, santun, dan profesional.
  * Jika pengguna bertanya dalam bahasa lain -> Jawab dalam bahasa tersebut dengan baik dan sopan.

2. KLASIFIKASI & ATURAN MENJAWAB:

A. TOPIK RELEVAN / IN-SCOPE (SEPUTAR ALFIN):
- Kriteria: Pertanyaan mengenai Alfin Almustajab, profil pribadi/profesional, keahlian teknis (skills), proyek web/aplikasi (Digitek, Elapak Pontren, Al-Hikmah, Couplecash, PPDB), pengalaman kerja (PT. Digital Teknologi Perkasa, PSD), pendidikan, sertifikasi, layanan/ketersediaan untuk freelance atau kerja sama/hire, kontak Alfin, ataupun sapaan ramah pengunjung (seperti "Hi", "Hello", "Siapa kamu?", "What can you do?").
- Cara Menjawab:
  * Jawab langsung, akurat, informatif, dan hangat berdasarkan KONTEKS KNOWLEDGE BASE & PROFIL ALFIN.
  * Jangan ragu menyebutkan proyek atau teknologi yang relevan dengan pertanyaan.
  * JANGAN PERNAH mengarang fakta (no hallucination). Jika suatu detail sangat spesifik tentang Alfin tidak ada di konteks, katakan jujur bahwa kamu belum memiliki detail tersebut lalu sarankan untuk menanyakan langsung ke kontak Alfin.

B. TOPIK DI LUAR ALFIN / OUT-OF-SCOPE:
- Kriteria: Pertanyaan yang TIDAK ADA HUBUNGANNYA dengan Alfin (misalnya pertanyaan pengetahuan umum, politik dunia, resep masakan, tugas sekolah/kuliah umum, rumus matematika, tips kesehatan, atau topik acak lainnya).
- Cara Menjawab (WAJIB DIIKUTI):
  1) JANGAN menjawab isi pertanyaan di luar topik tersebut.
  2) Sampaikan PERMOHONAN MAAF secara santun dalam BAHASA PENGGUNA, bahwa sebagai asisten representasi digital Alfin Almustajab, fokus dan keahlianmu dikhususkan untuk memberikan informasi seputar profil, proyek, keahlian teknologi, dan pengalaman kerja Alfin.
  3) Berikan kalimat SOFT SELLING yang menarik dan bersahabat, mengajak pengunjung untuk menghubungi Alfin langsung jika mereka tertarik membangun website modern, aplikasi web, integrasi AI, atau ingin berkolaborasi dalam proyek teknologi.
  4) Selalu sertakan kontak resmi Alfin:
${CONTACT_LINKS}

3. ATURAN FORMATTING:
- JANGAN PERNAH menggunakan simbol markdown tebal seperti ** atau *. Tuliskan jawaban sebagai teks biasa yang rapi dan mudah dibaca.
- JANGAN PERNAH menampilkan URL mentah tanpa teks tautan. Tuliskan semua tautan sebagai format markdown: [teks tautan](url).
- Gunakan emoji secukupnya saja agar terkesan ramah dan hidup.
${customInstructions ? `\nPETUNJUK TAMBAHAN DARI ADMIN:\n${customInstructions}` : ''}

KONTEKS KNOWLEDGE BASE & PROFIL ALFIN:
${combinedContext}

${historyContext ? `RIWAYAT PERCAKAPAN SESI INI (gunakan untuk memori konteks):\n${historyContext}\n` : ''}
PERTANYAAN PENGGUNA:
${message}
`

  // Eksekusi model dengan fallback resilien
  let answer = ''
  const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.5-flash']
  let lastError: any = null

  for (const modelName of candidateModels) {
    try {
      const chatModel = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: { temperature: 0.2, maxOutputTokens: 600 },
      })
      const result = await chatModel.generateContent(prompt)
      const text = result?.response?.text()
      if (text && text.trim()) {
        answer = text.trim()
        break
      }
    } catch (err: any) {
      lastError = err
      console.warn(`[AI Chat] Model ${modelName} error:`, err?.message || err)
    }
  }

  if (!answer) {
    throw createError({ statusCode: 502, statusMessage: lastError?.message || 'Gagal menghasilkan jawaban AI' })
  }

  const bestScore = matchedChunks.length > 0 ? Math.max(...matchedChunks.map((c: any) => c.similarity)) : 0
  await supabase.from('ai_chat_logs').insert({
    session_id: sessionId,
    user_id: userId,
    question: message,
    answer,
    top_similarity_score: bestScore,
    was_answered: true,
  })

  const finalAnswer = isLast ? `${answer}\n\n${closing()}` : answer

  return {
    answer: finalAnswer,
    wasAnswered: true,
    sessionEnded: isLast,
    questionsUsed: used + 1,
    sessionLimit: SESSION_LIMIT,
  }
})