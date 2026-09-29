export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) return

  const router = nuxtApp.$router
  const sessionKey = 'aa_visitor_sid'
  let sessionId = ''
  try {
    sessionId = localStorage.getItem(sessionKey) || ''
  } catch {}

  if (!sessionId) {
    sessionId =
      (globalThis.crypto?.randomUUID?.() as string | undefined) ??
      `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    try {
      localStorage.setItem(sessionKey, sessionId)
    } catch {}
  }

  const startTime = Date.now()
  let geoPromise: Promise<any> | null = null

  const fetchGeo = () => {
    if (!geoPromise) {
      geoPromise = fetch('https://ipwho.is/')
        .then((r) => r.json())
        .then((d) => (d && d.success !== false ? d : null))
        .catch(() => null)
    }
    return geoPromise
  }

  const parseUA = (ua: string) => {
    const browser = /Edg\//.test(ua)
      ? 'Edge'
      : /OPR\//.test(ua) || /Opera/.test(ua)
        ? 'Opera'
        : /Firefox\//.test(ua)
          ? 'Firefox'
          : /Chrome\//.test(ua)
            ? 'Chrome'
            : /Safari\//.test(ua)
              ? 'Safari'
              : /MSIE|Trident/.test(ua)
                ? 'Internet Explorer'
                : 'Unknown'
    const os = /Windows/.test(ua)
      ? 'Windows'
      : /Android/.test(ua)
        ? 'Android'
        : /iPhone|iPad|iPod/.test(ua)
          ? 'iOS'
          : /Mac OS X/.test(ua)
            ? 'macOS'
            : /Linux/.test(ua)
              ? 'Linux'
              : 'Unknown'
    const device = /iPad/.test(ua)
      ? 'Tablet'
      : /Mobile|Android|iPhone/.test(ua)
        ? 'Mobile'
        : 'Desktop'
    return { browser, os, device }
  }

  const track = async (path: string) => {
    if (!sessionId) return
    if (path.startsWith('/admin') || path.startsWith('/login')) return

    const { browser, os, device } = parseUA(navigator.userAgent)
    const body: Record<string, any> = {
      session_id: sessionId,
      page_path: path,
      referrer: document.referrer || null,
      browser,
      os,
      device_type: device,
      user_agent: navigator.userAgent,
      language: navigator.language,
      screen_size: `${window.screen?.width ?? 0}x${window.screen?.height ?? 0}`,
      session_started_at: new Date(startTime).toISOString(),
    }

    const geo = await fetchGeo()
    if (geo) {
      body.country = geo.country ?? null
      body.region = geo.region ?? null
      body.city = geo.city ?? null
      body.ip_address = geo.ip ?? null
    }

    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        keepalive: true,
      }).catch(() => {})
    } catch {}
  }

  const sendHeartbeat = () => {
    if (!sessionId) return
    const duration = Math.round((Date.now() - startTime) / 1000)
    try {
      fetch('/api/analytics/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, duration }),
        keepalive: true,
      }).catch(() => {})
    } catch {}
  }

  const start = () => {
    const initial = router.currentRoute.value.fullPath
    track(initial)
    const heartbeat = setInterval(sendHeartbeat, 30000)
    router.afterEach((to) => track(to.fullPath))
    window.addEventListener('beforeunload', sendHeartbeat, { once: true })
    ;(nuxtApp as any)._analyticsCleanup = () => clearInterval(heartbeat)
  }

  if (document.readyState === 'complete') start()
  else window.addEventListener('load', start, { once: true })
})