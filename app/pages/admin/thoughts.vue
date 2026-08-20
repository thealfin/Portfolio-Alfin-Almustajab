<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { listThoughts, createThought, updateThought, deleteThought } = useAdmin()
const { pick } = useLocale()

const { t, locale } = useI18n()

const thoughts = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const editing = ref<any | null>(null)
const showForm = ref(false)
const search = ref('')
const filter = ref('Semua')

const fetchThoughts = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await listThoughts()
    thoughts.value = data
  } catch (e: any) {
    error.value = e?.response?.data?.statusMessage ?? e?.message ?? 'Gagal memuat tulisan'
  } finally {
    loading.value = false
  }
}

onMounted(fetchThoughts)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return thoughts.value.filter((th) => {
    const matchesSearch =
      !q ||
      th.title_id?.toLowerCase().includes(q) ||
      th.title_en?.toLowerCase().includes(q) ||
      th.slug?.toLowerCase().includes(q)
    const matchesFilter =
      filter.value === 'Semua' || (th.category ?? []).includes(filter.value)
    return matchesSearch && matchesFilter
  })
})

const categories = computed(() => {
  const set = new Set<string>()
  thoughts.value.forEach((th) => (th.category ?? []).forEach((c: string) => set.add(c)))
  return Array.from(set)
})

const openCreate = () => {
  editing.value = null
  showForm.value = true
}

const openEdit = (th: any) => {
  editing.value = th
  showForm.value = true
}

const onSaved = async () => {
  showForm.value = false
  await fetchThoughts()
}

const removeThought = async (th: any) => {
  if (!confirm(`Hapus tulisan "${th.title_id}"?`)) return
  try {
    await deleteThought(th.id)
    await fetchThoughts()
  } catch (e: any) {
    error.value = e?.response?.data?.statusMessage ?? 'Gagal menghapus'
  }
}

const titleOf = (th: any) => (locale.value === 'en' ? th.title_en || th.title_id : th.title_id)

const cover = (th: any) =>
  th.cover_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(titleOf(th) ?? 'AA')}&background=0EA5E9&color=fff&size=200`
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
      <div class="flex flex-col gap-1.5">
        <h1 class="headline-lg text-on-surface">{{ t('admin.thoughtsTitle') }}</h1>
        <p class="body-md text-on-surface-variant">{{ t('admin.thoughtsSubtitle') }}</p>
      </div>
      <button
        class="neu-raised px-6 py-2.5 rounded-full flex items-center gap-2.5 text-primary hover:neu-pressed transition-all duration-300"
        @click="openCreate"
      >
        <Icon name="ph:plus-bold" class="text-base" />
        <span class="body-md font-bold">{{ t('admin.addThought') }}</span>
      </button>
    </div>

    <div class="flex flex-col xl:flex-row gap-4">
      <div class="flex-1 neu-pressed rounded-full flex items-center px-5 py-2.5 gap-3">
        <Icon name="ph:magnifying-glass-bold" class="text-on-surface-variant text-lg" />
        <input
          v-model="search"
          type="text"
          :placeholder="t('admin.searchThought')"
          class="bg-transparent w-full outline-none body-md text-on-surface placeholder:text-on-surface-variant/50"
        />
      </div>
      <div class="flex flex-wrap gap-3 items-center">
        <button
          class="neu-pressed rounded-full px-5 py-2.5 body-md text-primary font-bold transition-all duration-300"
          @click="filter = 'Semua'"
        >
          Semua
        </button>
        <button
          v-for="c in categories"
          :key="c"
          class="rounded-full px-5 py-2.5 body-md transition-all duration-300"
          :class="filter === c ? 'neu-pressed text-primary font-bold' : 'neu-raised text-on-surface-variant hover:text-primary'"
          @click="filter = c"
        >
          {{ c }}
        </button>
      </div>
    </div>

    <p v-if="error" class="body-md text-error">{{ error }}</p>
    <p v-if="loading" class="body-md text-on-surface-variant">{{ t('admin.loading') }}</p>
    <p v-if="!loading && !thoughts.length" class="body-md text-on-surface-variant">{{ t('admin.thoughtEmpty') }}</p>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
      <div
        v-for="th in filtered"
        :key="th.id"
        class="neu-raised rounded-[18px] p-4 flex flex-col gap-4 hover:scale-[1.01] transition-transform duration-500"
      >
        <div class="neu-pressed p-3 rounded-[16px]">
          <img :src="cover(th)" :alt="titleOf(th)" class="w-full h-36 object-cover rounded-xl" loading="lazy" />
        </div>
        <div class="flex flex-col gap-3 flex-1">
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="c in (th.category ?? []).slice(0, 3)"
              :key="c"
              class="neu-pressed px-2.5 py-1 rounded-full label-caps text-primary"
            >
              {{ c }}
            </span>
          </div>
          <div class="flex flex-col gap-1">
            <h3 class="title-md text-on-surface line-clamp-1">{{ titleOf(th) }}</h3>
            <span class="body-md text-on-surface-variant">/{{ th.slug }}</span>
          </div>
          <div class="flex items-center gap-3 mt-auto">
            <span
              class="body-md font-bold flex items-center gap-1.5"
              :class="th.is_published ? 'text-[#10B981]' : 'text-on-surface-variant'"
            >
              <Icon :name="th.is_published ? 'ph:eye-bold' : 'ph:eye-slash-bold'" class="text-sm" />
              {{ th.is_published ? t('admin.active') : t('admin.disabled') }}
            </span>
            <span class="ml-auto label-caps text-on-surface-variant flex items-center gap-1.5">
              <Icon name="ph:eye-bold" class="text-sm" />
              {{ th.views_count ?? 0 }}
            </span>
          </div>
        </div>
        <div class="flex gap-3 pt-1 mt-auto">
          <button
            class="flex-1 neu-raised py-2.5 rounded-full text-primary body-md font-bold flex items-center justify-center gap-2 hover:neu-pressed transition-all duration-300"
            @click="openEdit(th)"
          >
            <Icon name="ph:pencil-simple-bold" class="text-base" />
            {{ t('admin.edit') }}
          </button>
          <button
            class="flex-1 neu-raised py-2.5 rounded-full text-error body-md font-bold flex items-center justify-center gap-2 hover:neu-pressed transition-all duration-300"
            @click="removeThought(th)"
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
      <ThoughtForm
        :thought="editing"
        @saved="onSaved"
        @cancel="showForm = false"
      />
    </div>
  </div>
</template>