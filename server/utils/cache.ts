interface CacheEntry<T> {
  data: T
  expiry: number
}

const memoryCache = new Map<string, CacheEntry<any>>()

/**
 * Helper cache in-memory untuk endpoint server
 * Menghilangkan beban query database berulang ke Supabase.
 */
export async function fetchWithCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const now = Date.now()
  const cached = memoryCache.get(key)
  if (cached && cached.expiry > now) {
    return cached.data
  }

  const fresh = await fetcher()
  memoryCache.set(key, {
    data: fresh,
    expiry: now + ttlSeconds * 1000,
  })
  return fresh
}

/**
 * Invalidate cache berdasarkan prefix atau seluruhnya
 */
export function invalidateCache(keyPrefix?: string) {
  if (!keyPrefix) {
    memoryCache.clear()
    return
  }
  for (const k of memoryCache.keys()) {
    if (k.startsWith(keyPrefix)) {
      memoryCache.delete(k)
    }
  }
}
