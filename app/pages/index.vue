<script setup lang="ts">
const { t } = useI18n()
useSeo(t('projects.title') ?? 'Portofolio', t('hero.tagline') ?? '')

const { data: profile } = await useProfile()
const { data: projects } = await useFetch('/api/projects', {
  key: 'all-projects-list',
  default: () => [],
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] || nuxtApp.static.data[key],
})
const { data: stacks } = await useFetch('/api/stacks', {
  key: 'all-stacks-list',
  default: () => [],
  getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] || nuxtApp.static.data[key],
})
const { thoughts } = await useThoughts()
const { experiences } = await useExperiences()
const { testimonials } = await useTestimonials()
const { certifications } = await useCertifications()

const { targetSection } = useScrollTo()

const scrollToTarget = (sec: string) => {
  const nuxtApp = useNuxtApp()
  const lenis = nuxtApp.$lenis as any

  if (sec === 'home') {
    if (lenis) {
      lenis.resize?.()
      lenis.scrollTo(0, { immediate: false })
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    return true
  }

  const el = document.getElementById(sec)
  if (!el) {
    console.log('[index.vue] scrollToTarget: element not found for', sec)
    return false
  }

  const targetY = Math.max(0, Math.round(el.getBoundingClientRect().top + window.scrollY - 80))
  console.log('[index.vue] scrollToTarget:', sec, 'targetY:', targetY)

  if (lenis) {
    lenis.resize?.()
    lenis.scrollTo(targetY, { duration: 1.2 })
  } else {
    window.scrollTo({ top: targetY, behavior: 'smooth' })
  }
  return true
}

onMounted(() => {
  console.log('[index.vue] onMounted targetSection:', targetSection.value)
  if (targetSection.value) {
    const sec = targetSection.value
    targetSection.value = null

    nextTick(() => {
      scrollToTarget(sec)
      setTimeout(() => scrollToTarget(sec), 300)
      setTimeout(() => scrollToTarget(sec), 800)
    })
  }
})
</script>

<template>
  <div class="relative">
    <div class="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      <div class="absolute top-0 right-10 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] mix-blend-multiply opacity-50" />
      <div class="absolute top-40 left-[-100px] w-[400px] h-[400px] bg-secondary/10 rounded-full blur-[80px] mix-blend-multiply opacity-30" />
    </div>

    <HeroSection :profile="profile" />

    <div class="container-portfolio flex flex-col gap-9 md:gap-12 py-9 md:py-12">
      <AboutSection :profile="profile" />
      <ProjectsSection :projects="projects" :stacks="stacks" />
      <GithubActivitySection />
      <ExperienceSection :experiences="experiences" :certifications="certifications" />
      <StackSection :stacks="stacks" />
      <ThoughtsSection :thoughts="thoughts" />
      <TestimonialsSection :testimonials="testimonials" />
      <ContactSection />
    </div>
  </div>
</template>