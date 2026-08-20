import { embedText } from '../../../utils/embedding.server'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody(event)
  const source = String(body?.source ?? '').trim()
  const content = String(body?.content ?? '').trim()

  if (!content || content.length > 20000) {
    throw createError({ statusCode: 400, statusMessage: 'Konten tidak valid' })
  }

  const supabase = useSupabaseServerAsUser(event)
  const embedding = await embedText(content)

  const { data, error } = await supabase
    .from('ai_knowledge_chunks')
    .insert({ source: source || 'manual', content, embedding })
    .select('id, source, content, created_at')
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})