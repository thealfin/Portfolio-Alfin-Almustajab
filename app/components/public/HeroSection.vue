<script setup lang="ts">
import { motion } from 'motion-v'
import LiquidCanvas from './ui/LiquidCanvas.vue'

const props = defineProps<{
  profile: any
}>()

const { y } = useWindowScroll()

// Introduction text that dissolves and disperses as user scrolls down
const HERO_INTRO = "An interactive digital showcase curating high-performance web engineering, human centric design, and scalable modern architectures."

// Scroll dispersal calculation for Main Tagline (bubar, blur, and disperse upward)
const taglineDispersalStyle = computed(() => {
  const scrollOffset = y.value
  const progress = Math.min(Math.max(scrollOffset / 280, 0), 1)

  return {
    opacity: Math.max(0, 1 - progress * 1.3),
    filter: `blur(${progress * 14}px)`,
    transform: `translateY(-${progress * 35}px) scale(${1 + progress * 0.06})`,
    letterSpacing: `${progress * 0.12}em`,
    pointerEvents: (progress > 0.7 ? 'none' : 'auto') as any,
    transition: 'filter 0.08s linear, transform 0.08s linear, letter-spacing 0.08s linear, opacity 0.08s linear',
  }
})

// Scroll dispersal calculation for Static Role Subtitle ("With allfine, everything can will be fine.")
const roleDispersalStyle = computed(() => {
  const scrollOffset = y.value
  const progress = Math.min(Math.max(scrollOffset / 220, 0), 1)

  return {
    opacity: Math.max(0, 1 - progress * 1.35),
    filter: `blur(${progress * 10}px)`,
    transform: `translateY(-${progress * 25}px)`,
    transition: 'filter 0.08s linear, transform 0.08s linear, opacity 0.08s linear',
  }
})

// Scroll dispersal calculation for Bottom Intro Text
const introDispersalStyle = computed(() => {
  const scrollOffset = y.value
  const progress = Math.min(Math.max(scrollOffset / 200, 0), 1)

  return {
    opacity: Math.max(0, 1 - progress * 1.4),
    filter: `blur(${progress * 16}px)`,
    transform: `translateY(-${progress * 45}px) scale(${1 + progress * 0.12})`,
    letterSpacing: `${progress * 0.28}em`,
    pointerEvents: (progress > 0.75 ? 'none' : 'auto') as any,
    transition: 'filter 0.08s linear, transform 0.08s linear, letter-spacing 0.08s linear, opacity 0.08s linear',
  }
})
</script>

<template>
  <section
    id="home"
    class="relative w-full min-h-[95vh] md:min-h-screen flex flex-col justify-between items-center overflow-hidden px-5 md:px-8 pt-24 pb-14 scroll-mt-24 select-none"
  >
    <!-- 1. Three.js Deep Liquid Silk Blue Canvas (Background ala new.studio - Runs Continuously) -->
    <LiquidCanvas />

    <!-- Subtle Radial Vignette for contrast -->
    <div
      class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,18,48,0.2)_0%,rgba(0,12,32,0.45)_65%,rgba(0,8,22,0.75)_100%)] pointer-events-none z-[1]"
    />

    <!-- Top Spacer for vertical balance -->
    <div class="w-full h-4 md:h-10 z-10" />

    <!-- 2. Central Editorial Content (Crisp White Typography ala new.studio) -->
    <div class="relative z-10 max-w-4xl mx-auto flex flex-col items-center text-center gap-5 sm:gap-6 my-auto">
      <!-- Main Tagline with Scroll Dispersal Animation & Line Break -->
      <motion.h1
        :style="taglineDispersalStyle"
        class="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-extrabold text-white leading-[1.2] tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)] will-change-transform"
        :initial="{ opacity: 0, y: 25 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.9, delay: 0.1 }"
      >
        <span class="font-serif italic font-normal text-white/95">Take a moment to discover meaningful craftsmanship</span>
        <br class="hidden sm:inline" />
        <span class="block sm:inline sm:mt-1.5">And let’s bring your vision to life seamlessly</span>
      </motion.h1>

      <br>
      <br>
      <br>
      <br>
      <!-- Static Tagline Subtitle: "With allfine, everything can will be fine." -->
      <motion.p
        :style="roleDispersalStyle"
        class="text-center font-bold text-sky-200 text-lg sm:text-2xl md:text-3xl tracking-wide drop-shadow-[0_2px_16px_rgba(0,0,0,0.5)] mt-1"
        :initial="{ opacity: 0, y: 15 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.8, delay: 0.25 }"
      >
        With allfine, everything can will be fine
      </motion.p>
    </div>

    <!-- 3. Bottom Introduction Text (Scroll-Dispersal Dissolution Effect) -->
    <div class="relative z-10 w-full max-w-2xl mx-auto text-center mt-8 mb-2">
      <p
        :style="introDispersalStyle"
        class="body-lg text-white/85 font-medium px-4 leading-relaxed will-change-transform drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
      >
        {{ HERO_INTRO }}
      </p>

      <!-- Scroll Indicator -->
      <div
        :style="{ opacity: Math.max(0, 1 - y / 100) }"
        class="flex flex-col items-center gap-1.5 mt-5 text-white/50 transition-opacity duration-200"
      >
        <span class="label-caps tracking-[0.25em] text-[8px] text-white/70">SCROLL TO DISCOVER</span>
        <div class="w-4 h-7 rounded-full border border-white/40 flex justify-center p-1">
          <span class="w-1 h-1.5 rounded-full bg-white animate-bounce" />
        </div>
      </div>
    </div>

    <!-- 4. Soft Bottom Transition Edge into surface-base (Seamless blend without grey overlay) -->
    <div
      class="absolute inset-x-0 bottom-0 h-24 sm:h-32 pointer-events-none z-[2]"
      style="background: linear-gradient(to top, var(--surface-base) 0%, transparent 100%);"
    />
  </section>
</template>