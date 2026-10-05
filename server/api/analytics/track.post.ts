export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}))
  const supabase = useSupabaseServer()

  const str = (v: any, max = 500) => (v == null ? null : String(v).slice(0, max).trim() || null)

  const host = getHeader(event, 'x-forwarded-host') || getHeader(event, 'host') || ''
  const proto = getHeader(event, 'x-forwarded-proto') || 'https'

  let pagePath = str(body.page_path, 500)
  if (pagePath && !pagePath.startsWith('http')) {
    pagePath = `${proto}://${host}${pagePath.startsWith('/') ? pagePath : '/' + pagePath}`
  }

  const ip = (
    getHeader(event, 'cf-connecting-ip') ||
    getHeader(event, 'x-real-ip') ||
    getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
    body.ip_address ||
    null
  )

  const latHeader = getHeader(event, 'x-vercel-ip-latitude')
  const lngHeader = getHeader(event, 'x-vercel-ip-longitude')
  const lat = latHeader ? Number(latHeader) : typeof body.latitude === 'number' ? body.latitude : null
  const lng = lngHeader ? Number(lngHeader) : typeof body.longitude === 'number' ? body.longitude : null

  const country = getHeader(event, 'x-vercel-ip-country') || getHeader(event, 'cf-ipcountry') || body.country
  const region = getHeader(event, 'x-vercel-ip-country-region') || body.region
  const city = getHeader(event, 'x-vercel-ip-city') || body.city

  const nowIso = new Date().toISOString()
  const startedAt = body.session_started_at || nowIso

  const row = {
    session_id: str(body.session_id, 100),
    page_path: pagePath,
    referrer: str(body.referrer, 500),
    browser: str(body.browser, 100),
    browser_version: str(body.browser_version, 50),
    os: str(body.os, 100),
    device_type: str(body.device_type, 50),
    user_agent: str(body.user_agent, 500),
    ip_address: str(ip, 64),
    country: str(country, 100),
    region: str(region, 100),
    city: str(city, 100),
    latitude: lat,
    longitude: lng,
    language: str(body.language, 30),
    screen_size: str(body.screen_size, 30),
    duration_seconds: 0,
    session_started_at: startedAt,
    last_active_at: nowIso,
  }

  const { data, error } = await supabase
    .from('visitor_analytics')
    .insert(row)
    .select('id')
    .single()

  if (error) {
    console.error('[analytics/track] Supabase insert error:', error.message)
    throw createError({ statusCode: 500, statusMessage: error.message })
  }

  return { success: true, id: data?.id }
})