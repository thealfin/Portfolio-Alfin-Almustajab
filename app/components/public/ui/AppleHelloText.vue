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
const isRevealed = ref(false)

let timer: ReturnType<typeof setInterval> | null = null

const startCycling = () => {
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    currentIndex.value = (currentIndex.value + 1) % greetings.length
  }, 2200)
}

onMounted(() => {
  setTimeout(() => {
    isRevealed.value = true
    startCycling()
  }, 300)
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<template>
  <div class="relative flex flex-col items-center justify-center min-h-[90px] sm:min-h-[120px] select-none text-center">
    <Transition name="hello-morph" mode="out-in">
      <div
        :key="currentGreeting.text"
        class="flex flex-col items-center justify-center"
      >
        <h2
          :class="[
            'text-5xl sm:text-7xl md:text-8xl tracking-tight leading-none text-on-surface transform-gpu drop-shadow-[0_4px_16px_rgba(0,0,0,0.06)]',
            currentGreeting.isArabic ? 'font-apple-arabic py-2 font-bold' : currentGreeting.isCJK ? 'font-sans font-extrabold tracking-widest text-4xl sm:text-6xl md:text-7xl' : currentGreeting.isHindi ? 'font-sans font-bold text-4xl sm:text-6xl md:text-7xl' : 'font-apple-hello font-bold'
          ]"
          :dir="currentGreeting.isArabic ? 'rtl' : 'ltr'"
        >
          <span class="bg-gradient-to-r from-on-surface via-primary-strong to-primary bg-clip-text text-transparent">
            {{ currentGreeting.text }}
          </span>
        </h2>
        <span
          :class="[
            'mt-2 transition-opacity duration-300 text-[10px] sm:text-xs',
            currentGreeting.text === 'WELCOME'
              ? 'text-primary font-semibold tracking-wide normal-case'
              : 'label-caps text-on-surface-variant/60 tracking-[0.25em] uppercase'
          ]"
        >
          {{ currentGreeting.lang }}
        </span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.hello-morph-enter-active {
  transition: all 0.55s cubic-bezier(0.16, 1, 0.3, 1);
}

.hello-morph-leave-active {
  transition: all 0.4s cubic-bezier(0.7, 0, 0.84, 0);
}

.hello-morph-enter-from {
  opacity: 0;
  transform: translateY(18px) scale(0.92);
  filter: blur(8px);
}

.hello-morph-leave-to {
  opacity: 0;
  transform: translateY(-16px) scale(1.06);
  filter: blur(6px);
}
</style>
