import { embedText } from '../../../utils/embedding.server'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  const content = String(body?.content ?? '').trim()
  const source = String(body?.source ?? '').trim()

  if (!content || content.length > 20000) {
    throw createError({ statusCode: 400, statusMessage: 'Konten tidak valid' })
  }

  const embedding = await embedText(content)

  const supabase = useSupabaseServerAsUser(event)
  const { data, error } = await supabase
    .from('ai_knowledge_chunks')
    .update({ source: source || 'manual', content, ...(embedding ? { embedding } : {}) })
    .eq('id', id)
    .select('id, source, content, created_at')
    .single()

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return data
})