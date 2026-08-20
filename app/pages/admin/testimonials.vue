<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { listTestimonials, deleteTestimonial } = useAdmin()

const { t } = useI18n()

const testimonials = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const editing = ref<any | null>(null)
const showForm = ref(false)
const search = ref('')

const broken = ref<Set<string>>(new Set())
const onImgError = (name: string) => {
  broken.value = new Set(broken.value).add(name)
}

const fetchTestimonials = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await listTestimonials()
    testimonials.value = data
  } catch (e: any) {
    error.value = e?.response?.data?.statusMessage ?? e?.message ?? 'Gagal memuat testimoni'
  } finally {
    loading.value = false
  }
}

onMounted(fetchTestimonials)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return testimonials.value
  return testimonials.value.filter((s) =>
    s.author_name?.toLowerCase().includes(q) ||
    s.author_company?.toLowerCase().includes(q) ||
    s.quote_id?.toLowerCase().includes(q)
  )
})

const openCreate = () => {
  editing.value = null
  showForm.value = true
}

const openEdit = (t: any) => {
  editing.value = t
  showForm.value = true
}

const onSaved = async () => {
  showForm.value = false
  await fetchTestimonials()
}

const removeTestimonial = async (t: any) => {
  if (!confirm(`Hapus testimoni dari "${t.author_name}"?`)) return
  try {
    await deleteTestimonial(t.id)
    await fetchTestimonials()
  } catch (e: any) {
    error.value = e?.response?.data?.statusMessage ?? 'Gagal menghapus'
  }
}

const starIcon = (rating: number, i: number) => {
  if (rating >= i) return 'ph:star-fill'
  if (rating >= i - 0.5) return 'ph:star-half-fill'
  return 'ph:star'
}

const ratingLabel = (rating: number) => (rating % 1 === 0 ? rating.toFixed(0) : rating.toFixed(1))
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
      <div class="flex flex-col gap-1.5">
        <h1 class="headline-lg text-on-surface">{{ t('admin.testimonialsTitle') }}</h1>
        <p class="body-md text-on-surface-variant">{{ t('admin.testimonialsSubtitle') }}</p>
      </div>
      <button
        class="neu-raised px-6 py-2.5 rounded-full flex items-center gap-2.5 text-primary hover:neu-pressed transition-all duration-300"
        @click="openCreate"
      >
        <Icon name="ph:plus-bold" class="text-base" />
        <span class="body-md font-bold">{{ t('admin.addTestimonial') }}</span>
      </button>
    </div>

    <div class="flex flex-col md:flex-row gap-3 items-center">
      <div class="flex-1 neu-pressed rounded-full flex items-center px-5 py-2.5 gap-3">
        <Icon name="ph:magnifying-glass-bold" class="text-on-surface-variant text-lg" />
        <input
          v-model="search"
          type="text"
          :placeholder="t('admin.searchTestimonial')"
          class="bg-transparent w-full outline-none body-md text-on-surface placeholder:text-on-surface-variant/50"
        />
      </div>
    </div>

    <p v-if="error" class="body-md text-error">{{ error }}</p>
    <p v-if="loading" class="body-md text-on-surface-variant">{{ t('admin.loading') }}</p>
    <p v-if="!loading && !testimonials.length" class="body-md text-on-surface-variant">{{ t('admin.testimonialEmpty') }}</p>

    <div class="flex flex-col gap-4 w-full">
      <div
        v-for="s in filtered"
        :key="s.id"
        class="neu-raised rounded-[18px] p-4 flex flex-col md:flex-row gap-4 items-start md:items-center hover:scale-[1.01] transition-transform duration-300"
      >
        <div class="w-14 h-14 rounded-full neu-raised flex items-center justify-center shrink-0 overflow-hidden">
          <img
            v-if="s.avatar_url && !broken.has(s.id)"
            :src="s.avatar_url"
            :alt="s.author_name"
            class="w-full h-full object-cover"
            loading="lazy"
            @error="onImgError(s.id)"
          />
          <span v-else class="title-md font-extrabold text-primary">{{ s.author_name?.charAt(0) }}</span>
        </div>

        <div class="flex-1 min-w-0 flex flex-col gap-1">
          <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span class="title-md text-on-surface font-bold">{{ s.author_name }}</span>
            <span class="label-caps flex items-center gap-1.5" :class="s.relationship_type === 'Client' ? 'text-[#005bb2]' : 'text-on-surface-variant'">
              <Icon name="ph:user-circle-bold" class="text-xs" />
              {{ s.relationship_type }}
            </span>
          </div>
          <p class="body-md text-on-surface-variant">
            <template v-if="s.author_role">{{ s.author_role }}</template>
            <template v-if="s.author_role && s.author_company"> · </template>
            <template v-if="s.author_company">{{ s.author_company }}</template>
          </p>
          <div class="flex items-center gap-2 mt-0.5">
            <div class="flex items-center gap-0.5">
              <Icon v-for="i in 5" :key="i" :name="starIcon(s.rating, i)" class="text-sm text-primary" />
            </div>
            <span class="label-caps text-on-surface-variant">{{ ratingLabel(s.rating) }} / 5</span>
          </div>
          <p class="body-md text-on-surface/80 leading-relaxed line-clamp-2 mt-1">
            “{{ s.quote_id || s.quote_en }}”
          </p>
          <span class="label-caps text-on-surface-variant mt-0.5">#{{ s.sort_order }}</span>
        </div>

        <div class="flex gap-3 pt-1 md:pt-0 md:pl-4 w-full md:w-auto">
          <button
            class="flex-1 md:flex-none neu-raised px-5 py-2.5 rounded-full text-primary body-md font-bold flex items-center justify-center gap-2 hover:neu-pressed transition-all duration-300"
            @click="openEdit(s)"
          >
            <Icon name="ph:pencil-simple-bold" class="text-base" />
            {{ t('admin.edit') }}
          </button>
          <button
            class="flex-1 md:flex-none neu-raised px-5 py-2.5 rounded-full text-error body-md font-bold flex items-center justify-center gap-2 hover:neu-pressed transition-all duration-300"
            @click="removeTestimonial(s)"
          >
            <Icon name="ph:trash-bold" class="text-base" />
            {{ t('admin.delete') }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showForm"
      class="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="showForm = false"
    >
      <TestimonialsForm
        :testimonial="editing"
        @saved="onSaved"
        @cancel="showForm = false"
      />
    </div>
  </div>
</template>