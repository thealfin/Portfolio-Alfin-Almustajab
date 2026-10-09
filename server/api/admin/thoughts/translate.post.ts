import { GoogleGenerativeAI } from '@google/generative-ai'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const titleId = String(body?.title_id ?? '').trim()
  const contentId = String(body?.content_id ?? '').trim()

  if (!titleId || !contentId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Judul dan konten bahasa Indonesia wajib diisi untuk diterjemahkan.',
    })
  }

  if (!config.geminiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'GEMINI_API_KEY belum dikonfigurasi di lingkungan server (.env.local).',
    })
  }

  const genAI = new GoogleGenerativeAI(config.geminiApiKey)

  const prompt = `You are a bilingual senior technical writer, software engineer, and professional translator.
Translate the following Indonesian technical article into high-quality, natural, and professional English.

CRITICAL INSTRUCTIONS:
1. Translate the Indonesian title into an engaging, accurate English title.
2. Translate the Indonesian Markdown article body into fluent, natural English suitable for an international software engineering blog.
3. PRESERVE ALL Markdown structure EXACTLY:
   - All heading levels (#, ##, ###, ####)
   - Bullet lists (-) and numbered lists (1. 2.)
   - Blockquotes (> ...)
   - Horizontal dividers (---)
   - Markdown comparison tables (| ... |) - translate column headers and descriptive cell text, but keep markdown pipes aligned.
4. STRICT CODE PROTECTION:
   - DO NOT alter, translate, or break any code blocks (\`\`\`sql, \`\`\`typescript, \`\`\`javascript, \`\`\`bash, \`\`\`json, etc.).
   - DO NOT translate code syntax, variable names, function names, keywords, SQL queries, database columns, API routes, or package imports.
   - Preserve inline code backticks (\`...\`) untouched.
5. Preserve all external URLs, image links, and citations.

Return your response ONLY as a valid JSON object matching this schema, without any conversational preamble or extra text:
{
  "title_en": "Your translated English title",
  "content_en": "Your complete translated English Markdown article content"
}

---
INDONESIAN TITLE:
${titleId}

---
INDONESIAN MARKDOWN CONTENT:
${contentId}
`

  const candidateModels = [
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-3.5-flash',
  ]


  let translatedData: { title_en: string; content_en: string } | null = null
  let lastError: any = null

  for (const modelName of candidateModels) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      })

      const res = await model.generateContent(prompt)
      const rawText = res.response.text()

      if (rawText && rawText.trim()) {
        const cleaned = rawText
          .replace(/^```json\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim()
        const parsed = JSON.parse(cleaned)
        if (parsed.title_en && parsed.content_en) {
          translatedData = {
            title_en: String(parsed.title_en).trim(),
            content_en: String(parsed.content_en).trim(),
          }
          break
        }
      }
    } catch (err: any) {
      lastError = err
      console.warn(`[AI Translate] Model ${modelName} error:`, err?.message || err)
    }
  }

  if (!translatedData) {
    throw createError({
      statusCode: 502,
      statusMessage: lastError?.message || 'Gagal menghasilkan terjemahan AI dengan Gemini.',
    })
  }

  return translatedData
})
