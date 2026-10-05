export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const query = getQuery(event)
  const days = Math.min(365, Math.max(1, Math.round(Number(query.days ?? 7)) || 7))
  const selectedDomain = query.domain ? String(query.domain).toLowerCase().trim() : 'all'

  const supabase = useSupabaseServerAsUser(event)
  const since = new Date(Date.now() - days * 86400000).toISOString()

  const { data, error } = await supabase
    .from('visitor_analytics')
    .select(`
      id,
      session_id,
      session_started_at,
      page_path,
      referrer,
      browser,
      browser_version,
      os,
      device_type,
      user_agent,
      ip_address,
      country,
      region,
      city,
      latitude,
      longitude,
      language,
      screen_size,
      duration_seconds,
      last_active_at,
      created_at
    `)
    .gte('created_at', since)
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  const allRows = data ?? []

  const extractDomain = (url?: string | null): string => {
    if (!url) return 'allfine.my.id'
    try {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const u = new URL(url)
        return u.hostname.replace(/^www\./, '')
      }
    } catch {}
    if (url.includes('vercel.app')) return 'portfolio-alfin-six.vercel.app'
    if (url.includes('allfine.my.id')) return 'allfine.my.id'
    return 'allfine.my.id'
  }

  const cleanPath = (url?: string | null): string => {
    if (!url) return '/'
    try {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const u = new URL(url)
        return u.pathname + (u.search || '')
      }
    } catch {}
    return url.startsWith('/') ? url : `/${url}`
  }

  // Ringkasan per Domain (sebelum filter jika filter diterapkan)
  const domainStatsMap = new Map<string, {
    domain: string
    label: string
    visits: number
    visitors: Set<string>
    totalDuration: number
    durationCount: number
    activeSessions: Set<string>
  }>()

  // Pastikan 2 domain utama selalu ada dalam ringkasan
  const defaultDomains = [
    { domain: 'allfine.my.id', label: 'allfine.my.id' },
    { domain: 'portfolio-alfin-six.vercel.app', label: 'portfolio-alfin-six.vercel.app' },
  ]
  for (const d of defaultDomains) {
    domainStatsMap.set(d.domain, {
      domain: d.domain,
      label: d.label,
      visits: 0,
      visitors: new Set(),
      totalDuration: 0,
      durationCount: 0,
      activeSessions: new Set(),
    })
  }

  const now = Date.now()
  for (const r of allRows) {
    const d = extractDomain(r.page_path)
    let entry = domainStatsMap.get(d)
    if (!entry) {
      entry = {
        domain: d,
        label: d,
        visits: 0,
        visitors: new Set(),
        totalDuration: 0,
        durationCount: 0,
        activeSessions: new Set(),
      }
      domainStatsMap.set(d, entry)
    }

    entry.visits++
    if (r.session_id) entry.visitors.add(r.session_id)
    if (Number(r.duration_seconds) > 0) {
      entry.totalDuration += Number(r.duration_seconds)
      entry.durationCount++
    }

    const lastTime = r.last_active_at
      ? new Date(r.last_active_at).getTime()
      : r.created_at
        ? new Date(r.created_at).getTime()
        : 0
    if (r.session_id && now - lastTime < 5 * 60000) {
      entry.activeSessions.add(r.session_id)
    }
  }

  const domainBreakdown = [...domainStatsMap.values()].map((d) => ({
    domain: d.domain,
    label: d.label,
    visits: d.visits,
    uniqueVisitors: d.visitors.size,
    avgDuration: d.durationCount ? Math.round(d.totalDuration / d.durationCount) : 0,
    activeNow: d.activeSessions.size,
  }))

  // Filter baris jika user memilih domain tertentu
  const rows = selectedDomain === 'all'
    ? allRows
    : allRows.filter((r) => extractDomain(r.page_path) === selectedDomain)

  // Daily Trend
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
      const pageClean = cleanPath(r.page_path)
      const domain = extractDomain(r.page_path)

      if (!agg) {
        agg = {
          session_id: r.session_id,
          domain,
          browser: r.browser,
          browser_version: r.browser_version,
          os: r.os,
          device_type: r.device_type,
          country: r.country,
          region: r.region,
          city: r.city,
          latitude: r.latitude,
          longitude: r.longitude,
          language: r.language,
          screen_size: r.screen_size,
          referrer: r.referrer,
          user_agent: r.user_agent,
          ip_address: r.ip_address,
          pages: [],
          duration_seconds: Number(r.duration_seconds ?? 0),
          session_started_at: r.session_started_at || r.created_at,
          last_active_at: r.last_active_at || r.created_at,
          created_at: r.created_at,
        }
        sessionAgg.set(r.session_id, agg)
      }

      if (pageClean && !agg.pages.includes(pageClean)) {
        agg.pages.push(pageClean)
      }

      agg.duration_seconds = Math.max(agg.duration_seconds, Number(r.duration_seconds ?? 0))

      const curLast = new Date(agg.last_active_at).getTime()
      const rowLast = r.last_active_at ? new Date(r.last_active_at).getTime() : 0
      if (rowLast > curLast) {
        agg.last_active_at = r.last_active_at
      }

      const curStart = new Date(agg.session_started_at).getTime()
      const rowStart = r.session_started_at ? new Date(r.session_started_at).getTime() : 0
      if (rowStart < curStart && rowStart > 0) {
        agg.session_started_at = r.session_started_at
      }
    }

    if (Number(r.duration_seconds) > 0) {
      totalDuration += Number(r.duration_seconds)
      durationCount++
    }
  }

  for (const [key, set] of daySessionSet) {
    const day = daily.get(key)
    if (day) day.visitors = set.size
  }

  // Active Sessions (< 5 min inactivity)
  const activeSessionSet = new Set<string>()
  for (const r of rows) {
    if (!r.session_id) continue
    const lastActive = r.last_active_at
      ? new Date(r.last_active_at).getTime()
      : r.created_at
        ? new Date(r.created_at).getTime()
        : 0
    if (now - lastActive < 5 * 60000) {
      activeSessionSet.add(r.session_id)
    }
  }

  const countBy = (field: string, limit = 8) => {
    const map = new Map<string, number>()
    for (const r of rows) {
      let v = r[field]
      if (field === 'page_path') v = cleanPath(v)
      if (v == null || String(v).trim() === '') continue
      map.set(String(v), (map.get(String(v)) ?? 0) + 1)
    }
    return [...map.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  const sessions = [...sessionAgg.values()]
    .map((s) => ({
      ...s,
      is_active: now - new Date(s.last_active_at).getTime() < 5 * 60000,
    }))
    .sort((a, b) => new Date(b.last_active_at).getTime() - new Date(a.last_active_at).getTime())
    .slice(0, 100)

  return {
    rangeDays: days,
    selectedDomain,
    domainBreakdown,
    totalVisits: rows.length,
    uniqueVisitors: sessionVisitors.size,
    activeNow: activeSessionSet.size,
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
    screenSizes: countBy('screen_size', 6),
    languages: countBy('language', 6),
    sessions,
  }
})