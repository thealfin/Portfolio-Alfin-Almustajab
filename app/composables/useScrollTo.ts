export const useScrollTo = () => {
  const router = useRouter()
  const route = useRoute()
  const targetSection = useState<string | null>('target_scroll_section', () => null)

  const scrollTo = async (id: string) => {
    console.log('[useScrollTo] scrollTo called for:', id, 'current route:', route.path)
    // If not on '/', navigate back to '/' cleanly WITHOUT #hash in the URL
    if (route.path !== '/') {
      targetSection.value = id
      try {
        await router.push('/')
        console.log('[useScrollTo] router.push completed. New path:', route.path)
      } catch (err) {
        console.error('[useScrollTo] router.push error:', err)
      }
      return
    }

    // If on '/', smoothly scroll without modifying window.location.hash
    const nuxtApp = useNuxtApp()
    const scrollToId = nuxtApp.$scrollToId as ((target: string) => void) | undefined

    if (id === 'home') {
      const lenis = nuxtApp.$lenis as any
      if (lenis) {
        lenis.resize?.()
        lenis.scrollTo(0, { immediate: false })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      return
    }

    const el = document.getElementById(id)
    if (el) {
      const lenis = nuxtApp.$lenis as any
      if (lenis) {
        const targetY = Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - 80))
        lenis.resize?.()
        lenis.scrollTo(targetY, { duration: 1.2 })
        return
      }
    }

    if (typeof scrollToId === 'function') {
      scrollToId(`#${id}`)
      return
    }
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return { scrollTo, targetSection }
}