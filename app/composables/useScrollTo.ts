export const useScrollTo = () => {
  const scrollTo = (id: string) => {
    const nuxtApp = useNuxtApp()
    const scrollToId = nuxtApp.$scrollToId as ((target: string) => void) | undefined
    const target = `#${id}`
    if (typeof scrollToId === 'function') {
      scrollToId(target)
      return
    }
    document.querySelector(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return { scrollTo }
}