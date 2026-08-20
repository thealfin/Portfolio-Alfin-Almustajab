<script setup lang="ts">
const props = defineProps<{
  testimonial?: any
}>()

const emit = defineEmits<{
  (e: 'saved'): void
  (e: 'cancel'): void
}>()

const { createTestimonial, updateTestimonial } = useAdmin()

const { t } = useI18n()

const loading = ref(false)
const error = ref<string | null>(null)

const form = reactive({
  author_name: props.testimonial?.author_name ?? '',
  author_role: props.testimonial?.author_role ?? '',
  author_company: props.testimonial?.author_company ?? '',
  relationship_type: props.testimonial?.relationship_type ?? 'Client',
  quote_id: props.testimonial?.quote_id ?? '',
  quote_en: props.testimonial?.quote_en ?? '',
  rating: props.testimonial?.rating ?? 5,
  avatar_url: props.testimonial?.avatar_url ?? '',
  sort_order: props.testimonial?.sort_order ?? 0,
})

const normalizeMediaUrl = (url: string) => {
  const u = (url ?? '').trim()
  const m = u.match(/drive\.google\.com\/file\/d\/([^/?]+)/)
  return m ? `https://lh3.googleusercontent.com/d/${m[1]}` : u
}

const setRating = (star: number, half: boolean) => {
  form.rating = half ? star - 0.5 : star
}

const ratingLabel = computed(() => (form.rating % 1 === 0 ? form.rating.toFixed(0) : form.rating.toFixed(1)))

const submit = async () => {
  loading.value = true
  error.value = null
  if (!form.author_name.trim() || !form.quote_id.trim()) {
    error.value = t('admin.testimonialRequired')
    loading.value = false
    return
  }
  const payload = {
    author_name: form.author_name.trim(),
    author_role: form.author_role.trim() || null,
    author_company: form.author_company.trim() || null,
    relationship_type: form.relationship_type,
    quote_id: form.quote_id.trim(),
    quote_en: form.quote_en.trim() || null,
    rating: form.rating,
    avatar_url: normalizeMediaUrl(form.avatar_url) || null,
    sort_order: Number(form.sort_order) || 0,
  }
  try {
    if (props.testimonial?.id) await updateTestimonial(props.testimonial.id, payload)
    else await createTestimonial(payload)
    emit('saved')
  } catch (e: any) {
    error.value = e?.response?.data?.statusMessage ?? e?.message ?? 'Gagal menyimpan testimoni'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="neu-raised rounded-[24px] p-5 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h2 class="headline-lg text-on-surface">{{ testimonial ? t('admin.editTestimonial') : t('admin.addTestimonial') }}</h2>
      <button class="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-on-surface-variant hover:text-on-surface" @click="emit('cancel')">
        <Icon name="ph:x-bold" class="text-lg" />
      </button>
    </div>

    <form class="flex flex-col gap-4" @submit.prevent="submit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.testimonialName') }}</label>
          <input v-model="form.author_name" required placeholder="Nama klien" class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.testimonialRole') }}</label>
          <input v-model="form.author_role" placeholder="Pimpinan Pesantren" class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.testimonialCompany') }}</label>
          <input v-model="form.author_company" placeholder="Yayasan Al Hikmah" class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.testimonialRelation') }}</label>
          <select v-model="form.relationship_type" class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary">
            <option value="Client">Client</option>
            <option value="Colleague">Colleague</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.contentId') }}</label>
          <textarea
            v-model="form.quote_id"
            rows="5"
            required
            placeholder="Pesan testimoni (Indonesia)..."
            class="neu-pressed rounded-[16px] px-5 py-3 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.contentEn') }}</label>
          <textarea
            v-model="form.quote_en"
            rows="5"
            placeholder="Testimonial message (English)..."
            class="neu-pressed rounded-[16px] px-5 py-3 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.testimonialRating') }}</label>
          <div class="neu-pressed rounded-[16px] px-5 py-3 flex items-center gap-3">
            <div class="flex items-center gap-0.5">
              <span
                v-for="i in 5"
                :key="i"
                class="cursor-pointer text-2xl leading-none select-none"
                @click="setRating(i, false)"
                @mousemove="(e) => { const r = ($event.currentTarget as HTMLElement).getBoundingClientRect(); setRating(i, (e.clientX - r.left) < r.width / 2) }"
              >
                <Icon
                  :name="form.rating >= i ? 'ph:star-fill' : (form.rating >= i - 0.5 ? 'ph:star-half-fill' : 'ph:star')"
                  class="text-primary"
                />
              </span>
            </div>
            <span class="title-md text-on-surface font-bold">{{ ratingLabel }} / 5</span>
          </div>
          <p class="body-md text-on-surface-variant/70 ml-4">{{ t('admin.testimonialRatingHint') }}</p>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.testimonialSort') }}</label>
          <input v-model.number="form.sort_order" type="number" min="0" class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.testimonialAvatar') }} <span class="text-primary">(Google Foto / Drive)</span></label>
        <input
          v-model="form.avatar_url"
          type="url"
          class="neu-pressed rounded-[16px] px-5 py-3 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
          :placeholder="'https://lh3.googleusercontent.com/d/...'"
          @blur="form.avatar_url = normalizeMediaUrl(form.avatar_url)"
        />
        <p class="body-md text-on-surface-variant/70 ml-4">{{ t('admin.coverImageHint') }}</p>
      </div>

      <div v-if="form.avatar_url" class="flex items-center gap-3">
        <img :src="normalizeMediaUrl(form.avatar_url)" :alt="form.author_name || 'avatar'" class="w-16 h-16 object-cover rounded-full neu-pressed p-1" loading="lazy" />
        <span class="text-[11px] text-on-surface-variant">{{ t('admin.coverPreview') }}</span>
      </div>

      <p v-if="error" class="body-md text-error">{{ error }}</p>

      <div class="flex gap-3 pt-1">
        <button type="button" class="flex-1 neu-raised py-2.5 rounded-full body-md text-on-surface-variant font-bold hover:neu-pressed transition-all duration-300" @click="emit('cancel')">
          {{ t('admin.cancel') }}
        </button>
        <button type="submit" :disabled="loading" class="flex-1 neu-accent py-2.5 rounded-full body-md text-on-primary font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
          <Icon name="ph:floppy-disk-bold" class="text-base" />
          {{ t('admin.save') }}
        </button>
      </div>
    </form>
  </div>
</template>