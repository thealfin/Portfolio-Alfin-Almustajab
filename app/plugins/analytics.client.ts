export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) return

  const router = nuxtApp.$router

  // Sesi per-kunjungan berbasis sessionStorage
  const sessionKey = 'aa_sess_id'
  const startKey = 'aa_sess_start'
  let sessionId = ''
  let startTime = Date.now()

  try {
    const existingId = sessionStorage.getItem(sessionKey)
    const existingStart = Number(sessionStorage.getItem(startKey))
    if (existingId && existingStart && !Number.isNaN(existingStart)) {
      sessionId = existingId
      startTime = existingStart
    } else {
      sessionId =
        (globalThis.crypto?.randomUUID?.() as string | undefined) ??
        `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
      sessionStorage.setItem(sessionKey, sessionId)
      sessionStorage.setItem(startKey, String(startTime))
    }
  } catch {
    sessionId = `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
  }

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

  // Parse User Agent untuk deteksi browser, versi browser, OS, dan tipe perangkat
  const parseUA = (ua: string) => {
    let browser = 'Unknown'
    let browserVersion = ''

    if (/Edg\/([0-9.]+)/.test(ua)) {
      browser = 'Edge'
      browserVersion = ua.match(/Edg\/([0-9.]+)/)?.[1]?.split('.')[0] || ''
    } else if (/OPR\/([0-9.]+)/.test(ua) || /Opera/.test(ua)) {
      browser = 'Opera'
      browserVersion = ua.match(/OPR\/([0-9.]+)/)?.[1]?.split('.')[0] || ''
    } else if (/SamsungBrowser\/([0-9.]+)/.test(ua)) {
      browser = 'Samsung Internet'
      browserVersion = ua.match(/SamsungBrowser\/([0-9.]+)/)?.[1]?.split('.')[0] || ''
    } else if (/Chrome\/([0-9.]+)/.test(ua)) {
      browser = 'Chrome'
      browserVersion = ua.match(/Chrome\/([0-9.]+)/)?.[1]?.split('.')[0] || ''
    } else if (/Firefox\/([0-9.]+)/.test(ua)) {
      browser = 'Firefox'
      browserVersion = ua.match(/Firefox\/([0-9.]+)/)?.[1]?.split('.')[0] || ''
    } else if (/Version\/([0-9.]+).*Safari/.test(ua) || /Safari/.test(ua)) {
      browser = 'Safari'
      browserVersion = ua.match(/Version\/([0-9.]+)/)?.[1]?.split('.')[0] || ''
    } else if (/MSIE|Trident/.test(ua)) {
      browser = 'Internet Explorer'
      browserVersion = ua.match(/(?:MSIE |rv:)([0-9.]+)/)?.[1]?.split('.')[0] || ''
    }

    let os = 'Unknown'
    if (/Windows NT 10.0/.test(ua)) os = 'Windows 10/11'
    else if (/Windows NT 6.3/.test(ua)) os = 'Windows 8.1'
    else if (/Windows NT 6.1/.test(ua)) os = 'Windows 7'
    else if (/Windows/.test(ua)) os = 'Windows'
    else if (/Android/.test(ua)) os = 'Android'
    else if (/iPhone/.test(ua)) os = 'iOS (iPhone)'
    else if (/iPad/.test(ua)) os = 'iOS (iPad)'
    else if (/Mac OS X/.test(ua)) os = 'macOS'
    else if (/Linux/.test(ua)) os = 'Linux'

    const isTablet = /iPad|Tablet|PlayBook/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))
    const isMobile = !isTablet && /Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    const device = isTablet ? 'Tablet' : isMobile ? 'Mobile' : 'Desktop'

    return { browser, browserVersion, os, device }
  }

  // Hitung durasi aktif
  let lastActiveAt = Date.now()
  const markActive = () => {
    lastActiveAt = Date.now()
  }

  if (typeof window !== 'undefined') {
    ['mousemove', 'keydown', 'scroll', 'touchstart', 'click'].forEach((evt) => {
      window.addEventListener(evt, markActive, { passive: true })
    })
  }

  const getDurationSeconds = () => {
    // Jika tidak ada interaksi lebih dari 30 menit, batasi durasi
    const idleSeconds = Math.max(0, Math.round((Date.now() - lastActiveAt) / 1000))
    const totalElapsed = Math.max(0, Math.round((Date.now() - startTime) / 1000))
    if (idleSeconds > 1800) {
      return Math.max(0, totalElapsed - (idleSeconds - 1800))
    }
    return totalElapsed
  }

  const getFullPageUrl = (path: string) => {
    try {
      const origin = window.location.origin
      return `${origin}${path.startsWith('/') ? path : '/' + path}`
    } catch {
      return path
    }
  }

  const track = async (path: string) => {
    if (!sessionId) return
    if (path.startsWith('/admin') || path.startsWith('/login')) return

    const { browser, browserVersion, os, device } = parseUA(navigator.userAgent)
    const fullUrl = getFullPageUrl(path)

    const body: Record<string, any> = {
      session_id: sessionId,
      page_path: fullUrl,
      referrer: document.referrer || null,
      browser,
      browser_version: browserVersion || null,
      os,
      device_type: device,
      user_agent: navigator.userAgent,
      language: navigator.language || 'id-ID',
      screen_size: `${window.screen?.width ?? 0}x${window.screen?.height ?? 0}`,
      session_started_at: new Date(startTime).toISOString(),
    }

    const geo = await fetchGeo()
    if (geo) {
      body.country = geo.country ?? null
      body.region = geo.region ?? null
      body.city = geo.city ?? null
      body.latitude = typeof geo.latitude === 'number' ? geo.latitude : null
      body.longitude = typeof geo.longitude === 'number' ? geo.longitude : null
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
    const duration = getDurationSeconds()
    const payload = JSON.stringify({
      session_id: sessionId,
      duration,
      last_active_at: new Date(lastActiveAt).toISOString(),
    })

    try {
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const blob = new Blob([payload], { type: 'application/json' })
        const sent = navigator.sendBeacon('/api/analytics/heartbeat', blob)
        if (sent) return
      }
    } catch {}

    try {
      fetch('/api/analytics/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {})
    } catch {}
  }

  const start = () => {
    const initial = router.currentRoute.value.fullPath
    track(initial)

    // Detak jantung berkala: 5s, 15s, 30s, 60s, lalu setiap 30s
    const quickTimers: any[] = []
    quickTimers.push(setTimeout(sendHeartbeat, 5000))
    quickTimers.push(setTimeout(sendHeartbeat, 15000))
    quickTimers.push(setTimeout(sendHeartbeat, 30000))
    quickTimers.push(setTimeout(sendHeartbeat, 60000))

    const heartbeatInterval = setInterval(sendHeartbeat, 30000)

    router.afterEach((to) => {
      track(to.fullPath)
      sendHeartbeat()
    })

    // Tangkap saat tab diminimalkan / ditutup
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendHeartbeat()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    window.addEventListener('pagehide', sendHeartbeat)
    window.addEventListener('beforeunload', sendHeartbeat)

    ;(nuxtApp as any)._analyticsCleanup = () => {
      quickTimers.forEach(clearTimeout)
      clearInterval(heartbeatInterval)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      window.removeEventListener('pagehide', sendHeartbeat)
      window.removeEventListener('beforeunload', sendHeartbeat)
    }
  }

  if (document.readyState === 'complete') {
    start()
  } else {
    window.addEventListener('load', start, { once: true })
  }
})