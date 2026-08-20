<script setup lang="ts">
const props = defineProps<{
  thought?: any
}>()

const emit = defineEmits<{
  (e: 'saved'): void
  (e: 'cancel'): void
}>()

const { createThought, updateThought } = useAdmin()

const { t } = useI18n()

const loading = ref(false)
const error = ref<string | null>(null)

const form = reactive({
  slug: props.thought?.slug ?? '',
  title_id: props.thought?.title_id ?? '',
  title_en: props.thought?.title_en ?? '',
  category: (props.thought?.category ?? []).join(', '),
  content_id: props.thought?.content_id ?? '',
  content_en: props.thought?.content_en ?? '',
  cover_image_url: props.thought?.cover_image_url ?? '',
  image_alt_text: props.thought?.image_alt_text ?? '',
  read_time_minutes: props.thought?.read_time_minutes ?? 1,
  is_published: props.thought?.is_published ?? true,
})

const normalizeMediaUrl = (url: string) => {
  const u = (url ?? '').trim()
  const m = u.match(/drive\.google\.com\/file\/d\/([^/?]+)/)
  return m ? `https://lh3.googleusercontent.com/d/${m[1]}` : u
}

const submit = async () => {
  loading.value = true
  error.value = null
  const payload = {
    slug: form.slug.trim(),
    title_id: form.title_id.trim(),
    title_en: form.title_en.trim() || null,
    category: form.category.split(',').map((s: string) => s.trim()).filter(Boolean),
    content_id: form.content_id,
    content_en: form.content_en.trim() || null,
    cover_image_url: normalizeMediaUrl(form.cover_image_url) || null,
    image_alt_text: form.image_alt_text.trim() || null,
    read_time_minutes: Number(form.read_time_minutes) || 1,
    is_published: form.is_published,
  }
  try {
    if (props.thought?.id) await updateThought(props.thought.id, payload)
    else await createThought(payload)
    emit('saved')
  } catch (e: any) {
    error.value = e?.response?.data?.statusMessage ?? e?.message ?? 'Gagal menyimpan tulisan'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="neu-raised rounded-[24px] p-5 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h2 class="headline-lg text-on-surface">{{ thought ? t('admin.editThought') : t('admin.addThought') }}</h2>
      <button class="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-on-surface-variant hover:text-on-surface" @click="emit('cancel')">
        <Icon name="ph:x-bold" class="text-lg" />
      </button>
    </div>

    <form class="flex flex-col gap-4" @submit.prevent="submit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.titleId') }}</label>
          <input v-model="form.title_id" required class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.titleEn') }}</label>
          <input v-model="form.title_en" class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.slug') }}</label>
          <input v-model="form.slug" required :placeholder="t('admin.slugPlaceholder')" class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.thoughtCategory') }}</label>
          <input v-model="form.category" placeholder="AI, Front-End" class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.contentId') }}</label>
          <textarea
            v-model="form.content_id"
            rows="8"
            required
            :placeholder="t('admin.contentPlaceholder')"
            class="neu-pressed rounded-[16px] px-5 py-3 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.contentEn') }}</label>
          <textarea
            v-model="form.content_en"
            rows="8"
            :placeholder="t('admin.contentPlaceholder')"
            class="neu-pressed rounded-[16px] px-5 py-3 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.coverImage') }} <span class="text-primary">(Google Foto / Drive)</span></label>
          <input
            v-model="form.cover_image_url"
            type="url"
            class="neu-pressed rounded-[16px] px-5 py-3 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
            :placeholder="'https://lh3.googleusercontent.com/d/...'"
            @blur="form.cover_image_url = normalizeMediaUrl(form.cover_image_url)"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.readTime') }}</label>
          <input v-model.number="form.read_time_minutes" type="number" min="1" class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="label-caps text-on-surface-variant ml-4">Alt Text</label>
        <input v-model="form.image_alt_text" class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>

      <div v-if="form.cover_image_url" class="flex items-center gap-3">
        <img :src="normalizeMediaUrl(form.cover_image_url)" :alt="form.image_alt_text || form.title_id" class="w-24 h-24 object-cover rounded-2xl neu-pressed p-1" loading="lazy" />
        <span class="text-[11px] text-on-surface-variant">{{ t('admin.coverPreview') }}</span>
      </div>

      <label class="flex items-center gap-3 neu-pressed rounded-full px-5 py-2.5 cursor-pointer">
        <input v-model="form.is_published" type="checkbox" class="accent-[#005bb2]" />
        <span class="body-md text-on-surface">{{ t('admin.isPublished') }}</span>
      </label>

      <p v-if="error" class="body-md text-error">{{ error }}</p>

      <div class="flex gap-3 mt-1">
        <button type="button" class="flex-1 neu-raised py-3 rounded-full text-on-surface-variant font-bold hover:neu-pressed transition-all" @click="emit('cancel')">
          {{ t('admin.cancel') }}
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="flex-1 neu-accent py-3 rounded-full flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-70"
        >
          <span class="body-lg font-bold">{{ loading ? '...' : t('admin.save') }}</span>
        </button>
      </div>
    </form>
  </div>
</template>