<script setup lang="ts">
interface Greeting {
  text: string
  lang: string
  isArabic?: boolean
  isCJK?: boolean
  isHindi?: boolean
}

const greetings: Greeting[] = [
  { text: 'hello', lang: 'English' },
  { text: 'halo', lang: 'Indonesia' },
  { text: 'مرحباً', lang: 'Arabic', isArabic: true },
  { text: '你好', lang: 'Chinese', isCJK: true },
  { text: '안녕하세요', lang: 'Korean', isCJK: true },
  { text: 'Привет', lang: 'Russian' },
  { text: 'नमस्ते', lang: 'Hindi', isHindi: true },
  { text: 'hola', lang: 'Español' },
  { text: 'bonjour', lang: 'Français' },
  { text: 'ciao', lang: 'Italiano' },
  { text: 'こんにちは', lang: 'Japanese', isCJK: true },
  { text: 'WELCOME', lang: 'With allfine, everything can will be fine.' },
]

const currentIndex = ref(0)
const currentGreeting = computed(() => greetings[currentIndex.value] ?? greetings[0])

const progress = ref(0)
const isExiting = ref(false)
const isDestroyed = ref(false)

let timer: ReturnType<typeof setInterval> | null = null
let counterInterval: ReturnType<typeof setInterval> | null = null

const formattedProgress = computed(() => {
  return String(Math.min(100, Math.floor(progress.value))).padStart(3, '0')
})

const dismissPreloader = () => {
  if (isExiting.value) return
  isExiting.value = true

  // Unlock body scroll
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }

  setTimeout(() => {
    isDestroyed.value = true
  }, 850)
}

onMounted(() => {
  // Lock body scroll during preloader
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden'
  }

  // 1. Progress Counter (0 to 100 in ~2.8 seconds)
  const duration = 2800
  const stepTime = 25
  const totalSteps = duration / stepTime
  let step = 0

  counterInterval = setInterval(() => {
    step++
    progress.value = Math.min(100, (step / totalSteps) * 100)

    if (step >= totalSteps) {
      if (counterInterval) clearInterval(counterInterval)
      setTimeout(dismissPreloader, 180)
    }
  }, stepTime)

  // 2. Greeting switcher (~230ms per greeting)
  const greetingInterval = Math.floor(duration / greetings.length)
  timer = setInterval(() => {
    if (currentIndex.value < greetings.length - 1) {
      currentIndex.value++
    }
  }, greetingInterval)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
  if (counterInterval) clearInterval(counterInterval)
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <div
    v-if="!isDestroyed"
    :class="[
      'fixed inset-0 z-[9999] isolate flex flex-col justify-between w-full h-full p-6 sm:p-10 select-none overflow-hidden overscroll-none touch-none bg-[#09111e] text-white transition-transform duration-700 ease-[cubic-bezier(0.76,0,0.24,1)]',
      isExiting ? '-translate-y-full pointer-events-none' : 'translate-y-0'
    ]"
    role="dialog"
    aria-modal="true"
    aria-label="Welcome Loading Screen"
  >
    <!-- Background subtle ambient glow -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-primary/20 rounded-full blur-[140px]" />
    </div>

    <!-- Top Bar: Portfolio Header & Indicator -->
    <div class="relative z-10 w-full flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="w-2 h-2 rounded-full bg-primary animate-ping" />
        <span class="label-caps tracking-[0.3em] text-white/70 text-[10px] sm:text-xs uppercase">
          Alfin Almustajab &bull; Portfolio
        </span>
      </div>
      <div class="hidden sm:flex items-center gap-2">
        <span class="text-[10px] font-mono tracking-widest text-white/50 uppercase">INITIALIZING EXPERIENCE</span>
      </div>
    </div>

    <!-- Center: Apple Hello Multilingual Greeting Signature -->
    <div class="relative z-10 w-full flex flex-col items-center justify-center my-auto min-h-[160px] text-center px-4">
      <Transition name="hello-slide" mode="out-in">
        <div
          :key="currentGreeting.text"
          class="flex flex-col items-center justify-center text-center transform-gpu"
        >
          <p
            :class="[
              'text-5xl sm:text-7xl md:text-8xl tracking-tight leading-none text-white drop-shadow-[0_8px_32px_rgba(58,123,213,0.4)]',
              currentGreeting.isArabic ? 'font-apple-arabic py-2 font-bold' : currentGreeting.isCJK ? 'font-sans font-extrabold tracking-widest text-4xl sm:text-6xl md:text-7xl' : currentGreeting.isHindi ? 'font-sans font-bold text-4xl sm:text-6xl md:text-7xl' : 'font-apple-hello font-bold'
            ]"
            :dir="currentGreeting.isArabic ? 'rtl' : 'ltr'"
          >
            {{ currentGreeting.text }}
          </p>
          <span
            :class="[
              'mt-3 text-[11px] sm:text-xs tracking-wider transition-all duration-300',
              currentGreeting.text === 'WELCOME'
                ? 'text-sky-300 font-semibold normal-case'
                : 'label-caps text-white/50 uppercase tracking-[0.35em]'
            ]"
          >
            {{ currentGreeting.lang }}
          </span>
        </div>
      </Transition>
    </div>

    <!-- Bottom Bar: Status & Counter (Inspired by izaditya.my.id) -->
    <div class="relative z-10 w-full flex items-end justify-between">
      <div class="flex flex-col gap-1">
        <span class="label-caps text-white/40 tracking-[0.25em] text-[9px] uppercase">CREATIVE CRAFTSMANSHIP</span>
        <span class="text-xs text-white/70 font-mono hidden sm:inline">Crafting high-performance web solutions</span>
      </div>

      <!-- Live Counter Display -->
      <div class="flex items-baseline font-mono select-none">
        <span class="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-white tabular-nums">
          {{ formattedProgress }}
        </span>
        <span class="text-lg sm:text-2xl text-primary font-bold ml-1">%</span>
      </div>
    </div>

    <!-- Bottom Edge Animated Progress Bar -->
    <div class="absolute inset-x-0 bottom-0 h-[3px] bg-white/10">
      <div
        class="h-full bg-gradient-to-r from-primary via-primary-strong to-white origin-left transition-transform duration-75 ease-out shadow-[0_0_12px_rgba(58,123,213,0.8)]"
        :style="{ transform: `scaleX(${progress / 100})` }"
      />
    </div>
  </div>
</template>

<style scoped>
.hello-slide-enter-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.hello-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.7, 0, 0.84, 0);
}

.hello-slide-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.92);
  filter: blur(8px);
}

.hello-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(1.05);
  filter: blur(6px);
}
</style>
