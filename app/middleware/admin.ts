export default defineNuxtRouteMiddleware(async () => {
  const { session, ensureSession } = useAuth()
  await ensureSession()
  if (!session.value) return navigateTo('/login')
})