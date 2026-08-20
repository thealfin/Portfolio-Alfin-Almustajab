const WIB_TIMEZONE = 'Asia/Jakarta'

function wibDateKey(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: WIB_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const days = Math.min(90, Number(query.days ?? 7))

  const supabase = useSupabaseServerAsUser(event)

  // Awal hari (00:00) WIB hari ini, lalu mundur (days - 1)
  const todayKey = wibDateKey(new Date())
  const since = new Date(`${todayKey}T00:00:00+07:00`)
  since.setDate(since.getDate() - (days - 1))

  const { data: logs, error } = await supabase
    .from('ai_chat_logs')
    .select('created_at')
    .gte('created_at', since.toISOString())

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const counts: number[] = []
  const labels: string[] = []
  for (let i = 0; i < days; i++) {
    const d = new Date(since)
    d.setDate(d.getDate() + i)
    const key = wibDateKey(d)
    labels.push(d.toLocaleDateString('id-ID', { weekday: 'short', timeZone: WIB_TIMEZONE }))
    counts.push(
      (logs ?? []).filter((l) => (l.created_at ? wibDateKey(new Date(l.created_at)) === key : false)).length,
    )
  }

  return { labels, counts }
})
