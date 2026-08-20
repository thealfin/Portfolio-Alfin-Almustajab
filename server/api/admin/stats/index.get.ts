export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const supabase = useSupabaseServerAsUser(event)

  const [
    { count: projects },
    { count: testimonials },
    { count: chatLogs },
    { count: messages },
    { count: experiences },
    { count: certifications },
    { count: knowledge },
    { count: thoughts },
  ] = await Promise.all([
    supabase.from('projects').select('*', { count: 'exact', head: true }),
    supabase.from('testimonials').select('*', { count: 'exact', head: true }),
    supabase.from('ai_chat_logs').select('*', { count: 'exact', head: true }),
    supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
    supabase.from('experiences').select('*', { count: 'exact', head: true }),
    supabase.from('certifications').select('*', { count: 'exact', head: true }),
    supabase.from('ai_knowledge_chunks').select('*', { count: 'exact', head: true }),
    supabase.from('thoughts').select('*', { count: 'exact', head: true }),
  ])

  return { projects, testimonials, chatLogs, messages, experiences, certifications, knowledge, thoughts }
})