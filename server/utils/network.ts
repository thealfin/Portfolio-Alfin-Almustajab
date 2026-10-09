import type { H3Event } from 'h3'

/**
 * Mendeteksi apakah request berasal dari lingkungan lokal (localhost / 127.0.0.1 / ::1).
 * Memeriksa header Host, Referer, Origin, dan Client IP.
 */
export function isLocalhostRequest(event: H3Event): boolean {
  // 1. Periksa Host / X-Forwarded-Host
  const host = (getHeader(event, 'x-forwarded-host') || getHeader(event, 'host') || '').toLowerCase()
  if (
    host.includes('localhost') ||
    host.includes('127.0.0.1') ||
    host.includes('[::1]') ||
    host.endsWith('.local')
  ) {
    return true
  }

  // 2. Periksa Referer atau Origin
  const referer = (getHeader(event, 'referer') || '').toLowerCase()
  const origin = (getHeader(event, 'origin') || '').toLowerCase()
  if (
    referer.includes('localhost') ||
    referer.includes('127.0.0.1') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1')
  ) {
    return true
  }

  // 3. Periksa Client IP Address
  const forwardedFor = getHeader(event, 'x-forwarded-for')
  const clientIp = (
    getHeader(event, 'cf-connecting-ip') ||
    getHeader(event, 'x-real-ip') ||
    (forwardedFor ? forwardedFor.split(',')[0].trim() : '') ||
    event.node?.req?.socket?.remoteAddress ||
    ''
  ).toLowerCase()

  if (
    clientIp === '127.0.0.1' ||
    clientIp === '::1' ||
    clientIp === '::ffff:127.0.0.1' ||
    clientIp.startsWith('127.') ||
    clientIp === 'localhost'
  ) {
    return true
  }

  return false
}
