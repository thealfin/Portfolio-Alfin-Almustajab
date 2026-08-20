const COOKIE = 'ai_user_id'

export function useAiUserId() {
  const cookie = useCookie<string | null>(COOKIE, { maxAge: 60 * 60 * 24 * 365 })

  const get = () => {
    if (cookie.value) return cookie.value
    const id = crypto.randomUUID()
    cookie.value = id
    return id
  }

  return { userId: get, clear: () => { cookie.value = null } }
}