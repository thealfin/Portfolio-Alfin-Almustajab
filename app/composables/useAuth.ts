import { api } from './useApi'

const session = ref<any>(null)
let initialized = false

export function useAuth() {
  const { $supabase } = useNuxtApp()

  const refreshSession = async () => {
    const { data } = await $supabase.auth.getSession()
    session.value = data.session
    return session.value
  }

  const ensureSession = async () => {
    if (session.value) return session.value
    return refreshSession()
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await $supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    session.value = data.session
    return data
  }

  const signOut = async () => {
    await $supabase.auth.signOut()
    session.value = null
  }

  if (!initialized && import.meta.client) {
    initialized = true
    $supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession
    })
  }

  return { session, refreshSession, ensureSession, signIn, signOut }
}