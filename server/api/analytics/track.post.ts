export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const supabase = useSupabaseServer()

  const str = (v: any, max = 100) => (v == null ? null : String(v).slice(0, max).trim() || null)

  const ip = (
    getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim() ||
    getHeader(event, 'x-real-ip') ||
    body.ip_address ||
    null
  )

  const lat = getHeader(event, 'x-vercel-ip-latitude')
  const lng = getHeader(event, 'x-vercel-ip-longitude')

  const row = {
    session_id: str(body.session_id, 100),
    page_path: str(body.page_path, 500),
    referrer: str(body.referrer, 500),
    browser: str(body.browser, 100),
    browser_version: str(body.browser_version, 50),
    os: str(body.os, 100),
    device_type: str(body.device_type, 50),
    user_agent: str(body.user_agent, 500),
    ip_address: str(ip, 64),
    country: str(getHeader(event, 'x-vercel-ip-country') || body.country, 100),
    region: str(getHeader(event, 'x-vercel-ip-country-region') || body.region, 100),
    city: str(getHeader(event, 'x-vercel-ip-city') || body.city, 100),
    latitude: lat ? Number(lat) : null,
    longitude: lng ? Number(lng) : null,
    language: str(body.language, 30),
    screen_size: str(body.screen_size, 30),
    session_started_at: body.session_started_at || new Date().toISOString(),
    last_active_at: new Date().toISOString(),
  }

  const { error } = await supabase.from('visitor_analytics').insert(row)
  if (error) throw createError({ statusCode: 500, statusMessage: error.message })
  return { success: true }
})