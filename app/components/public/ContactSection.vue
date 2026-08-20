<script setup lang="ts">
import { motion } from 'motion-v'

const { t } = useI18n()
const { sending, error, success, send } = useContact()

const form = reactive({ name: '', email: '', message: '' })

const submit = async () => {
  await send({ ...form })
  if (success.value) {
    form.name = ''
    form.email = ''
    form.message = ''
  }
}

const socials = [
  { name: 'LinkedIn', icon: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/linkedin/default.svg', url: 'https://www.linkedin.com/in/alfin-almustajab-630501374/' },
  { name: 'GitHub', icon: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/github/default.svg', url: 'https://github.com/thealfin' },
  { name: 'Email', icon: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/gmail/default.svg', url: 'mailto:kangalfin95@gmail.com' },
  { name: 'WhatsApp', icon: 'https://cdn.jsdelivr.net/gh/glincker/thesvg@main/public/icons/whatsapp/default.svg', url: 'https://wa.me/6285789824597' },
]
</script>

<template>
  <motion.section
    id="contact"
    class="w-full relative z-10"
    :initial="{ opacity: 0, y: 40 }"
    :while-in-view="{ opacity: 1, y: 0 }"
    :viewport="{ once: true, margin: '-80px' }"
    :transition="{ duration: 0.7 }"
  >
    <div class="w-full flex flex-col lg:flex-row gap-10">
      <div class="flex-1 flex flex-col gap-8">
        <div class="flex flex-col gap-4">
          <h1 class="display-lg text-on-surface">{{ t('contact.title') }}</h1>
          <p class="body-lg text-on-surface-variant max-w-md">{{ t('contact.subtitle') }}</p>
        </div>

        <div class="flex flex-col gap-6">
          <a class="group flex items-center gap-5" href="mailto:kangalfin95@gmail.com">
            <div class="w-14 h-14 rounded-full neu-raised flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
              <Icon name="ph:envelope-simple-bold" class="text-xl" />
            </div>
            <div class="flex flex-col">
              <span class="label-caps text-on-surface-variant mb-1">{{ t('contact.emailLabel') }}</span>
              <span class="title-md text-on-surface group-hover:text-primary transition-colors">kangalfin95@gmail.com</span>
            </div>
          </a>

          <a class="group flex items-center gap-5" href="https://wa.me/6285789824597" target="_blank" rel="noopener">
            <div class="w-14 h-14 rounded-full neu-raised flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
              <svg
                viewBox="0 0 24 24"
                class="w-6 h-6 fill-current"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>
            <div class="flex flex-col">
              <span class="label-caps text-on-surface-variant mb-1">{{ t('contact.whatsappLabel') }}</span>
              <span class="title-md text-on-surface group-hover:text-primary transition-colors">+62 857-8982-4597</span>
            </div>
          </a>

          <div class="group flex items-center gap-5">
            <div class="w-14 h-14 rounded-full neu-raised flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
              <Icon name="ph:map-pin-bold" class="text-xl" />
            </div>
            <div class="flex flex-col">
              <span class="label-caps text-on-surface-variant mb-1">{{ t('contact.locationLabel') }}</span>
              <span class="title-md text-on-surface">Indonesia</span>
            </div>
          </div>

          <div class="flex items-center gap-5 pt-2">
            <a
              v-for="s in socials"
              :key="s.name"
              :href="s.url"
              target="_blank"
              rel="noopener"
              class="w-12 h-12 rounded-full neu-raised flex items-center justify-center hover:scale-110 transition-all duration-300"
              :aria-label="s.name"
            >
              <img :src="s.icon" :alt="s.name" class="w-5 h-5" loading="lazy" />
            </a>
          </div>
        </div>
      </div>

      <div class="flex-1 w-full">
        <div class="neu-raised rounded-[24px] p-6 md:p-8 h-full relative">
          <form v-if="!success" class="flex flex-col gap-5" @submit.prevent="submit">
            <div class="flex flex-col gap-1.5">
              <label class="label-caps text-on-surface-variant ml-4" for="name">{{ t('contact.name') }}</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                required
                class="neu-pressed rounded-full px-6 py-3 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                :placeholder="t('contact.name')"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="label-caps text-on-surface-variant ml-4" for="email">{{ t('contact.email') }}</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                required
                class="neu-pressed rounded-full px-6 py-3 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-on-surface-variant/50"
                placeholder="masukan email anda"
              />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="label-caps text-on-surface-variant ml-4" for="message">{{ t('contact.message') }}</label>
              <textarea
                id="message"
                v-model="form.message"
                required
                rows="4"
                class="neu-pressed rounded-card px-6 py-4 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none placeholder:text-on-surface-variant/50"
                :placeholder="t('contact.message')"
              />
            </div>

            <p v-if="error" class="body-md text-error">{{ error }}</p>

            <div class="mt-2 flex justify-end">
              <button
                type="submit"
                :disabled="sending"
                class="neu-accent rounded-full px-8 py-3 flex items-center gap-4 hover:scale-105 active:scale-95 transition-transform duration-300 disabled:opacity-70"
              >
                <span class="body-lg font-bold tracking-wide text-on-primary">{{ sending ? t('contact.sending') : t('contact.sendMessage') }}</span>
                <Icon :name="sending ? 'ph:circle-notch-bold' : 'ph:paper-plane-right-fill'" class="text-on-primary text-lg" :class="sending ? 'animate-spin' : ''" />
              </button>
            </div>
          </form>

          <div v-else class="flex flex-col items-center justify-center gap-5 py-12">
            <div class="w-20 h-20 rounded-full neu-raised flex items-center justify-center text-primary">
              <Icon name="ph:check-circle-fill" class="text-[40px]" />
            </div>
            <h3 class="headline-lg text-on-surface">{{ t('contact.successTitle') }}</h3>
            <p class="body-md text-on-surface-variant">{{ t('contact.successBody') }}</p>
            <button
              class="mt-3 neu-raised rounded-full px-6 py-2.5 font-bold text-primary hover:scale-105 active:scale-95 transition-transform"
              @click="success = false"
            >
              {{ t('contact.sendAnother') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </motion.section>
</template>