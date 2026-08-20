<script setup lang="ts">
const props = defineProps<{
  project?: any
}>()

const emit = defineEmits<{
  (e: 'saved'): void
  (e: 'cancel'): void
}>()

const { createProject, updateProject } = useAdmin()

const { t } = useI18n()

const loading = ref(false)
const error = ref<string | null>(null)

const form = reactive({
  title: props.project?.title ?? '',
  slug: props.project?.slug ?? '',
  client: props.project?.client ?? '',
  status: props.project?.status ?? 'Completed',
  category: (props.project?.category ?? []).join(', '),
  summary_id: props.project?.summary_id ?? '',
  summary_en: props.project?.summary_en ?? '',
  role_description_id: props.project?.role_description_id ?? '',
  role_description_en: props.project?.role_description_en ?? '',
  challenge_id: props.project?.challenge_id ?? '',
  challenge_en: props.project?.challenge_en ?? '',
  result_id: props.project?.result_id ?? '',
  result_en: props.project?.result_en ?? '',
  tech_stack: (props.project?.tech_stack ?? []).join(', '),
  live_url: props.project?.live_url ?? '',
  repo_url: props.project?.repo_url ?? '',
  cover_image_url: props.project?.cover_image_url ?? '',
  year: props.project?.year ?? new Date().getFullYear(),
  is_featured: props.project?.is_featured ?? false,
  sort_order: props.project?.sort_order ?? 0,
})

const media = ref<{ image_url: string; caption: string; sort_order: number }[]>(
  (props.project?.project_media ?? []).map((m: any) => ({
    image_url: m.image_url ?? '',
    caption: m.caption ?? '',
    sort_order: Number(m.sort_order ?? 0),
  })),
)

// Ubah link share Google Drive (drive.google.com/file/d/{id}/view) menjadi link Google Foto
const normalizeMediaUrl = (url: string) => {
  const u = (url ?? '').trim()
  const m = u.match(/drive\.google\.com\/file\/d\/([^/?]+)/)
  return m ? `https://lh3.googleusercontent.com/d/${m[1]}` : u
}

const addMedia = () => {
  media.value.push({ image_url: '', caption: '', sort_order: media.value.length })
}

const removeMedia = (i: number) => {
  media.value.splice(i, 1)
}

const submit = async () => {
  loading.value = true
  error.value = null
  const payload = {
    title: form.title,
    slug: form.slug,
    client: form.client,
    status: form.status,
    category: form.category.split(',').map((s: string) => s.trim()).filter(Boolean),
    summary_id: form.summary_id,
    summary_en: form.summary_en,
    role_description_id: form.role_description_id,
    role_description_en: form.role_description_en,
    challenge_id: form.challenge_id,
    challenge_en: form.challenge_en,
    result_id: form.result_id,
    result_en: form.result_en,
    tech_stack: form.tech_stack.split(',').map((s: string) => s.trim()).filter(Boolean),
    live_url: form.live_url,
    repo_url: form.repo_url,
    cover_image_url: normalizeMediaUrl(form.cover_image_url),
    year: Number(form.year),
    is_featured: form.is_featured,
    sort_order: Number(form.sort_order),
    project_media: media.value
      .map((m) => ({
        image_url: normalizeMediaUrl(m.image_url),
        caption: m.caption || null,
        sort_order: Number(m.sort_order ?? 0),
      }))
      .filter((m) => m.image_url),
  }
  try {
    if (props.project?.id) await updateProject(props.project.id, payload)
    else await createProject(payload)
    emit('saved')
  } catch (e: any) {
    error.value = e?.response?.data?.statusMessage ?? e?.message ?? 'Gagal menyimpan proyek'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="neu-raised rounded-[24px] p-5 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h2 class="headline-lg text-on-surface">{{ project ? t('admin.editProject') : t('admin.addProject') }}</h2>
      <button class="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-on-surface-variant hover:text-on-surface" @click="emit('cancel')">
        <Icon name="ph:x-bold" class="text-lg" />
      </button>
    </div>

    <form class="flex flex-col gap-4" @submit.prevent="submit">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.title') }}</label>
          <input v-model="form.title" required class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">Slug</label>
          <input v-model="form.slug" required class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">Client / Klien</label>
          <input v-model="form.client" placeholder="PT. Digital Teknologi Perkasa" class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.status') }}</label>
          <select
            v-model="form.status"
            class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
          >
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.category') }}</label>
        <input v-model="form.category" placeholder="Company Profile, Admin Panel" class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">Summary (ID)</label>
          <textarea v-model="form.summary_id" rows="2" class="neu-pressed rounded-[16px] px-5 py-3 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">Summary (EN)</label>
          <textarea v-model="form.summary_en" rows="2" class="neu-pressed rounded-[16px] px-5 py-3 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">Role (ID)</label>
          <textarea v-model="form.role_description_id" rows="2" class="neu-pressed rounded-[16px] px-5 py-3 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">Role (EN)</label>
          <textarea v-model="form.role_description_en" rows="2" class="neu-pressed rounded-[16px] px-5 py-3 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.challenge') }} (ID)</label>
          <textarea v-model="form.challenge_id" rows="2" class="neu-pressed rounded-[16px] px-5 py-3 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.challenge') }} (EN)</label>
          <textarea v-model="form.challenge_en" rows="2" class="neu-pressed rounded-[16px] px-5 py-3 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.result') }} (ID)</label>
          <textarea v-model="form.result_id" rows="2" class="neu-pressed rounded-[16px] px-5 py-3 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.result') }} (EN)</label>
          <textarea v-model="form.result_en" rows="2" class="neu-pressed rounded-[16px] px-5 py-3 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.techStack') }}</label>
          <input v-model="form.tech_stack" placeholder="Vue, Nuxt, Tailwind" class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.year') }}</label>
          <input v-model.number="form.year" type="number" class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">Live URL</label>
          <input v-model="form.live_url" class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">Repo URL</label>
          <input v-model="form.repo_url" class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      <!-- Cover Image: link Google Foto / Drive -->
      <div class="flex flex-col gap-2">
        <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.coverImage') }} <span class="text-primary">(Google Foto / Drive)</span></label>
        <input
          v-model="form.cover_image_url"
          type="url"
          class="neu-pressed rounded-[16px] px-5 py-3 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
          :placeholder="'https://lh3.googleusercontent.com/d/...'"
          @blur="form.cover_image_url = normalizeMediaUrl(form.cover_image_url)"
        />
        <p class="text-[11px] text-on-surface-variant flex items-center gap-1.5 ml-4">
          <Icon name="ph:link-bold" class="text-sm text-primary" />
          {{ t('admin.coverImageHint') }}
        </p>
        <div v-if="form.cover_image_url" class="flex items-center gap-3">
          <img :src="normalizeMediaUrl(form.cover_image_url)" :alt="form.title" class="w-24 h-24 object-cover rounded-2xl neu-pressed p-1" loading="lazy" />
          <span class="text-[11px] text-on-surface-variant">{{ t('admin.coverPreview') }}</span>
        </div>
      </div>

      <!-- Media Galeri (project_media) -->
      <div class="flex flex-col gap-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <Icon name="ph:images-bold" class="text-primary text-lg" />
            <span class="label-caps text-on-surface-variant uppercase tracking-wider">{{ t('admin.mediaGallery') }}</span>
          </div>
          <button
            type="button"
            class="neu-raised rounded-full px-3.5 py-1.5 flex items-center gap-1.5 text-primary text-[12px] font-bold hover:neu-pressed transition-all"
            @click="addMedia"
          >
            <Icon name="ph:plus-bold" class="text-sm" />
            {{ t('admin.addMedia') }}
          </button>
        </div>
        <p class="text-[11px] text-on-surface-variant ml-1">{{ t('admin.mediaGalleryHint') }}</p>

        <div v-if="media.length" class="flex flex-col gap-3">
          <div
            v-for="(m, i) in media"
            :key="i"
            class="neu-pressed rounded-[16px] p-3 flex flex-col sm:flex-row sm:items-center gap-3"
          >
            <div class="flex items-center justify-center w-16 h-16 rounded-[12px] overflow-hidden neu-raised shrink-0">
              <img
                v-if="m.image_url"
                :src="normalizeMediaUrl(m.image_url)"
                :alt="m.caption || `media-${i + 1}`"
                class="w-full h-full object-cover"
                loading="lazy"
              />
              <Icon v-else name="ph:image-bold" class="text-2xl text-outline/50" />
            </div>
            <div class="flex flex-col gap-2 flex-1 min-w-0">
              <input
                v-model="m.image_url"
                type="url"
                class="w-full bg-transparent body-md text-on-surface outline-none placeholder:text-on-surface-variant/50 text-[13px]"
                :placeholder="t('admin.mediaImageUrl')"
                @blur="m.image_url = normalizeMediaUrl(m.image_url)"
              />
              <div class="flex items-center gap-2">
                <input
                  v-model="m.caption"
                  type="text"
                  class="w-full bg-transparent body-md text-on-surface-variant outline-none placeholder:text-on-surface-variant/40 text-[12px]"
                  :placeholder="t('admin.mediaCaption')"
                />
                <input
                  v-model.number="m.sort_order"
                  type="number"
                  class="w-14 bg-transparent body-md text-on-surface outline-none text-center text-[12px]"
                  :title="t('admin.sortOrder')"
                />
                <button
                  type="button"
                  class="w-8 h-8 rounded-full neu-raised flex items-center justify-center text-on-surface-variant hover:text-error transition-colors shrink-0"
                  :aria-label="t('admin.removeMedia')"
                  @click="removeMedia(i)"
                >
                  <Icon name="ph:x-bold" class="text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="border-2 border-dashed border-outline-variant/40 rounded-[16px] p-4 flex items-center justify-center gap-2 text-on-surface-variant text-[13px]">
          <Icon name="ph:images-bold" class="text-outline" />
          {{ t('admin.mediaEmpty') }}
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
        <label class="flex items-center gap-3 neu-pressed rounded-full px-5 py-2.5 cursor-pointer">
          <input v-model="form.is_featured" type="checkbox" class="accent-[#005bb2]" />
          <span class="body-md text-on-surface">{{ t('admin.isFeatured') }}</span>
        </label>
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.sortOrder') }}</label>
          <input v-model.number="form.sort_order" type="number" class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>

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