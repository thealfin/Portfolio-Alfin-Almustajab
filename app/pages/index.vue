<script setup lang="ts">
const { t } = useI18n()
useSeo(t('projects.title') ?? 'Portofolio', t('hero.tagline') ?? '')

const { data: profile } = await useProfile()
const { data: projects } = await useFetch('/api/projects')
const { data: stacks } = await useFetch('/api/stacks')
const { thoughts } = await useThoughts()
const { experiences } = await useExperiences()
const { testimonials } = await useTestimonials()
const { certifications } = await useCertifications()
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
      <ProjectsSection :projects="projects" />
      <GithubActivitySection />
      <ExperienceSection :experiences="experiences" :certifications="certifications" />
      <StackSection :stacks="stacks" />
      <ThoughtsSection :thoughts="thoughts" />
      <TestimonialsSection :testimonials="testimonials" />
      <ContactSection />
    </div>
  </div>
</template>