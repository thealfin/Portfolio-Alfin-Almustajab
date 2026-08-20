import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export default defineNuxtPlugin(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const lenis = new Lenis({ duration: 1.1, smoothWheel: true, allowNestedScroll: true })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)

  const scrollTo = (target: string) => {
    lenis.scrollTo(target, { offset: -80 })
  }

  return { provide: { lenis, scrollToId: scrollTo } }
})
