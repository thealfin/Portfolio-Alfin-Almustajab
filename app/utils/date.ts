export const WIB_TIMEZONE = 'Asia/Jakarta'

const dateFormatterCache = new Map<string, Intl.DateTimeFormat>()

function getFormatter(locale: string, options: Intl.DateTimeFormatOptions) {
  const key = `${locale}|${JSON.stringify(options)}`
  let fmt = dateFormatterCache.get(key)
  if (!fmt) {
    fmt = new Intl.DateTimeFormat(locale, { ...options, timeZone: WIB_TIMEZONE })
    dateFormatterCache.set(key, fmt)
  }
  return fmt
}

export function formatWibDate(iso?: string | null, locale = 'id-ID') {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return getFormatter(locale, { day: '2-digit', month: 'short', year: 'numeric' }).format(d)
}

export function formatWibTime(iso?: string | null, locale = 'id-ID') {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return getFormatter(locale, { hour: '2-digit', minute: '2-digit' }).format(d)
}

export function formatWibMonthYear(iso?: string | null, locale = 'id-ID') {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return getFormatter(locale, { month: 'short', year: 'numeric' }).format(d)
}

export function formatWibRelative(iso?: string | null, t?: (key: string, params?: Record<string, unknown>) => string) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return t ? t('time.now') : 'now'
  if (mins < 60) return t ? t('time.minutesAgo', { n: mins }) : `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return t ? t('time.hoursAgo', { n: hours }) : `${hours} hr ago`
  const days = Math.floor(hours / 24)
  return t ? t('time.daysAgo', { n: days }) : `${days} d ago`
}