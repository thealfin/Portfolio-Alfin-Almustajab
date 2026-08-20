export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const days = Math.min(365, Math.max(1, Math.round(Number(query.days ?? 7)) || 7))
  const supabase = useSupabaseServerAsUser(event)

  const since = new Date(Date.now() - days * 86400000).toISOString()

  const { data, error } = await supabase
    .from('visitor_analytics')
    .select('session_id, page_path, referrer, browser, browser_version, os, device_type, user_agent, ip_address, country, region, city, language, screen_size, duration_seconds, created_at, session_started_at, last_active_at')
    .gte('created_at', since)
    .order('created_at', { ascending: false })

  if (error) throw createError({ statusCode: 500, statusMessage: error.message })

  const rows = data ?? []

  const daily = new Map<string, { date: string; label: string; visits: number; visitors: number }>()
  const daySessionSet = new Map<string, Set<string>>()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    const key = d.toISOString().slice(0, 10)
    daily.set(key, {
      date: key,
      label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
      visits: 0,
      visitors: 0,
    })
    daySessionSet.set(key, new Set<string>())
  }

  const sessionAgg = new Map<string, any>()
  const sessionVisitors = new Set<string>()
  let totalDuration = 0
  let durationCount = 0
  let activeNow = 0
  const now = Date.now()

  for (const r of rows) {
    const created = r.created_at ? new Date(r.created_at) : null
    if (created) {
      const key = created.toISOString().slice(0, 10)
      const day = daily.get(key)
      if (day) {
        day.visits++
        if (r.session_id) daySessionSet.get(key)?.add(r.session_id)
      }
    }

    if (r.session_id) {
      sessionVisitors.add(r.session_id)
      let agg = sessionAgg.get(r.session_id)
      if (!agg) {
        agg = {
          session_id: r.session_id,
          browser: r.browser,
          browser_version: r.browser_version,
          os: r.os,
          device_type: r.device_type,
          country: r.country,
          region: r.region,
          city: r.city,
          language: r.language,
          screen_size: r.screen_size,
          referrer: r.referrer,
          user_agent: r.user_agent,
          ip_address: r.ip_address,
          pages: [],
          duration_seconds: Number(r.duration_seconds ?? 0),
          first_seen: r.created_at,
          last_seen: r.created_at,
        }
        sessionAgg.set(r.session_id, agg)
      }
      if (r.page_path && !agg.pages.includes(r.page_path)) agg.pages.push(r.page_path)
      agg.duration_seconds = Math.max(agg.duration_seconds, Number(r.duration_seconds ?? 0))
      if (new Date(r.created_at) < new Date(agg.first_seen)) agg.first_seen = r.created_at
      if (new Date(r.created_at) > new Date(agg.last_seen)) agg.last_seen = r.created_at
    }

    if (r.duration_seconds) {
      totalDuration += Number(r.duration_seconds)
      durationCount++
    }
  }

  for (const [key, set] of daySessionSet) {
    const day = daily.get(key)
    if (day) day.visitors = set.size
  }

  const activeSessionSet = new Set<string>()
  for (const r of rows) {
    if (!r.session_id) continue
    const lastActive = r.last_active_at ? new Date(r.last_active_at).getTime() : (r.created_at ? new Date(r.created_at).getTime() : 0)
    if (now - lastActive < 5 * 60000) activeSessionSet.add(r.session_id)
  }
  activeNow = activeSessionSet.size

  const countBy = (field: string, limit = 8) => {
    const map = new Map<string, number>()
    for (const r of rows) {
      const v = r[field]
      if (v == null || String(v).trim() === '') continue
      map.set(String(v), (map.get(String(v)) ?? 0) + 1)
    }
    return [...map.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  const sessions = [...sessionAgg.values()]
    .map((s) => ({ ...s, pages: s.pages }))
    .sort((a, b) => new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime())
    .slice(0, 60)

  return {
    rangeDays: days,
    totalVisits: rows.length,
    uniqueVisitors: sessionVisitors.size,
    activeNow,
    avgDuration: durationCount ? Math.round(totalDuration / durationCount) : 0,
    daily: [...daily.values()],
    browsers: countBy('browser', 6),
    devices: countBy('device_type', 6),
    os: countBy('os', 6),
    countries: countBy('country', 10),
    regions: countBy('region', 10),
    cities: countBy('city', 10),
    pages: countBy('page_path', 10),
    referrers: countBy('referrer', 8),
    sessions,
  }
})