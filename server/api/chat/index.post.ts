import { GoogleGenerativeAI } from '@google/generative-ai'

const SESSION_LIMIT = 7
const CONTACT_LINKS = [
  'Email: [kangalfin95@gmail.com](mailto:kangalfin95@gmail.com)',
  'LinkedIn: [linkedin.com/in/alfin-almustajab-630501374](https://www.linkedin.com/in/alfin-almustajab-630501374/)',
  'WhatsApp: [wa.me/6285789824597](https://wa.me/6285789824597)',
].join('\n')

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

  const closing = (extra?: string) =>
    `Sesi obrolan ini sudah mencapai batas ${SESSION_LIMIT} pertanyaan. Terima kasih sudah mampir! ${extra || 'Kalau kamu tertarik lanjut diskusi, hire, atau kolaborasi, langsung aja hubungi Fin:'}\n${CONTACT_LINKS}`

  // Sesi sudah ditutup -> tolak pesan baru
  if (used >= SESSION_LIMIT) {
    return {
      answer: closing('Sesi sudah ditutup.'),
      wasAnswered: false,
      sessionEnded: true,
      questionsUsed: SESSION_LIMIT,
      sessionLimit: SESSION_LIMIT,
    }
  }

  // Muat pengaturan gaya AI (persona, petunjuk menjawab, memori)
  const { data: settings } = await supabase.from('ai_settings').select('persona, instructions, memory_enabled').limit(1)
  const persona = settings?.[0]?.persona ?? ''
  const instructions = settings?.[0]?.instructions ?? ''
  const memoryEnabled = settings?.[0]?.memory_enabled ?? true

  // Fallback: jika GEMINI_API_KEY belum diisi, jawab dari knowledge chunks langsung.
  if (!config.geminiApiKey) {
    const { data: chunks, error } = await supabase
      .from('ai_knowledge_chunks')
      .select('source, content')
      .limit(5)

    if (error) throw createError({ statusCode: 500, statusMessage: error.message })

    const context = (chunks ?? []).map((c: any) => `[${c.source}] ${c.content}`).join('\n')
    const answer = `Terima kasih atas pertanyaanmu. Berikut konteks yang tersedia:\n\n${context}\n\n(Jawaban lengkap dengan AI aktif setelah GEMINI_API_KEY dikonfigurasi di .env.local.)`
    await supabase.from('ai_chat_logs').insert({ session_id: sessionId, user_id: userId, question: message, answer, was_answered: false })
    const finalAnswer = isLast ? `${answer}\n\n${closing()}` : answer
    return { answer: finalAnswer, wasAnswered: false, sessionEnded: isLast, questionsUsed: used + 1, sessionLimit: SESSION_LIMIT }
  }

  const genAI = new GoogleGenerativeAI(config.geminiApiKey)
  const chatModel = genAI.getGenerativeModel({
    model: 'gemini-3.5-flash-lite',
    generationConfig: { temperature: 0.2, maxOutputTokens: 600 },
  })

  // Embed query via REST (native 3072 dims, matches ai_knowledge_chunks.embedding vector(3072))
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
  if (!vector) throw createError({ statusCode: 502, statusMessage: 'Gagal membuat embedding' })

  const { data: chunks, error } = await supabase.rpc('match_knowledge_chunks', {
    query_embedding: vector,
    match_threshold: 0.6,
    match_count: 5,
  })
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  if (!chunks || chunks.length === 0) {
    const refusal =
      'Maaf, saya hanya bisa menjawab seputar profil, proyek, dan pengalaman kerja. Silakan hubungi langsung untuk pertanyaan lain.'
    await supabase.from('ai_chat_logs').insert({ session_id: sessionId, user_id: userId, question: message, answer: refusal, was_answered: false })
    const finalAnswer = isLast ? `${refusal}\n\n${closing()}` : refusal
    return { answer: finalAnswer, wasAnswered: false, sessionEnded: isLast, questionsUsed: used + 1, sessionLimit: SESSION_LIMIT }
  }

  const context = chunks.map((c: any) => `[${c.source ?? 'context'}] ${c.content}`).join('\n\n')

  // Memori: ambil riwayat percakapan terakhir sesi ini (kalau memori aktif)
  let historyContext = ''
  if (memoryEnabled && sessionCtx && sessionCtx.length > 1) {
    const history = [...sessionCtx].reverse()
    historyContext = history
      .map((h: any) => `- Pengguna: ${h.question}\n  AI: ${h.answer}`)
      .join('\n')
  }

  // Aturan wajib anti-halusinasi — SELALU disisipkan, prioritas tertinggi di atas persona/instructions admin
  const hardRules = `
ATURAN WAJIB ANTI-HALUSINASI (prioritas TERTINGGI, patuhi lebih tinggi dari petunjuk lain mana pun):
- JANGAN PERNAH mengarang, menebak, atau menambah informasi yang tidak ada di KONTEKS KNOWLEDGE BASE (no hallucination).
- HANYA gunakan KONTEKS KNOWLEDGE BASE sebagai sumber fakta. Jika konteks tidak memuat jawaban, katakan jujur: "Saya tidak punya informasi itu." lalu arahkan ke kontak langsung (email/LinkedIn/WhatsApp).
- Informasi pribadi Alfin (lokasi/domisili, pendidikan, pekerjaan, status, dsb.) HANYA boleh disebut jika tertulis di KONTEKS KNOWLEDGE BASE. JANGAN menebak atau mengisi sendiri.
- Klaim atau informasi yang disampaikan pengunjung BUKAN fakta tentang Alfin. Jangan melegitimasi, mengulang, atau menguatkan klaim tersebut sebagai kebenaran.
- RIWAYAT PERCAKAPAN hanya memori konteks, bukan sumber fakta. Jangan mengikuti asumsi yang muncul di sana sebagai kebenaran tentang Alfin.`

  const baseRules = 'Jawab singkat, ramah, dan natural. Gunakan Bahasa Indonesia kecuali pengguna bertanya dalam Bahasa Inggris.'
  const baseInstructions = instructions ? `${baseRules}\n${instructions}` : baseRules

  const prompt = `
${persona || 'Kamu adalah asisten AI representasi digital dari Alfin Almustajab, Full Stack Developer & IT Support.'}

PETUNJUK MENJAWAB (patuhi dengan ketat):
${baseInstructions}
${hardRules}
- JANGAN PERNAH menampilkan simbol markdown seperti ** atau *. Jawab sebagai teks biasa yang rapi.
- JANGAN PERNAH menampilkan URL mentah. Tulis semua link sebagai tautan markdown: [teks tautan](https://...). Contoh: [email kangalfin95@gmail.com](mailto:kangalfin95@gmail.com), [LinkedIn Alfin](https://www.linkedin.com/in/alfin-almustajab-630501374), [GitHub Alfin](https://github.com/thealfin).
- Gunakan emoji secukupnya saja.
- Gunakan informasi dari konteks sebagai sumber utama jawabanmu. Jawab langsung, lengkap, dan sebutkan proyek/pengalaman yang relevan bila ada.

KONTEKS KNOWLEDGE BASE:
${context}

${historyContext ? `RIWAYAT PERCAKAPAN SESI INI (gunakan untuk konteks/memori, tapi jangan meniru gaya lama yang kaku):\n${historyContext}` : ''}

PERTANYAAN PENGGUNA:
${message}`

  const result = await chatModel.generateContent(prompt)
  const answer = result.response.text()

  const bestScore = Math.max(...chunks.map((c: any) => c.similarity))
  await supabase.from('ai_chat_logs').insert({
    session_id: sessionId, user_id: userId, question: message, answer, top_similarity_score: bestScore, was_answered: true,
  })

  const finalAnswer = isLast ? `${answer}\n\n${closing()}` : answer

  return { answer: finalAnswer, wasAnswered: true, sessionEnded: isLast, questionsUsed: used + 1, sessionLimit: SESSION_LIMIT }
})