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

// 2-Button Filter System State
const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

onClickOutside(dropdownRef, () => {
  dropdownOpen.value = false
})

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && dropdownOpen.value) {
    dropdownOpen.value = false
  }
}

watch(showForm, (v) => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = v ? 'hidden' : ''
  }
})

onMounted(() => {
  fetchThoughts()
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})


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

const categoryList = computed(() => {
  const set = new Set<string>()
  thoughts.value.forEach((th) => (th.category ?? []).forEach((c: string) => {
    if (c) set.add(c)
  }))
  return Array.from(set).sort().map((c) => ({
    label: c,
    value: c,
    count: thoughts.value.filter((th) => (th.category ?? []).includes(c)).length,
  }))
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
      <!-- 2-Button Filter System (Admin Thoughts/Monolog) -->
      <div class="flex items-center gap-3 shrink-0 flex-wrap">
        <!-- Button 1: Semua (All) with kotak-kotak icon -->
        <button
          type="button"
          class="px-5 py-2.5 rounded-full body-md transition-all duration-300 flex items-center gap-2.5 cursor-pointer"
          :class="filter === 'Semua'
            ? 'neu-pressed text-primary font-bold shadow-inner'
            : 'neu-raised text-on-surface-variant hover:text-on-surface hover:scale-105 active:scale-95'"
          @click="filter = 'Semua'; dropdownOpen = false"
        >
          <Icon name="ph:squares-four-bold" class="text-base" />
          <span>Semua</span>
          <span
            class="neu-pressed px-2 py-0.5 rounded-full text-[11px] font-bold"
            :class="filter === 'Semua' ? 'text-primary' : 'text-on-surface-variant'"
          >
            {{ thoughts.length }}
          </span>
        </button>

        <!-- Button 2: Option Dropdown Filter Tag -->
        <div ref="dropdownRef" class="relative">
          <button
            type="button"
            class="px-5 py-2.5 rounded-full body-md transition-all duration-300 flex items-center gap-2.5 cursor-pointer"
            :class="filter !== 'Semua'
              ? 'neu-pressed text-primary font-bold shadow-inner'
              : 'neu-raised text-on-surface-variant hover:text-on-surface hover:scale-105 active:scale-95'"
            @click="dropdownOpen = !dropdownOpen"
          >
            <Icon name="ph:funnel-bold" class="text-base" />
            <span v-if="filter === 'Semua'">Filter Kategori</span>
            <span v-else class="flex items-center gap-1.5 font-bold">
              <span class="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>{{ filter }}</span>
            </span>
            <Icon
              name="ph:caret-down-bold"
              class="text-xs transition-transform duration-300"
              :class="dropdownOpen ? 'rotate-180' : ''"
            />
          </button>

          <!-- Floating Dropdown Popover -->
          <Transition
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-2 scale-95"
            enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0 scale-100"
            leave-to-class="opacity-0 translate-y-2 scale-95"
          >
            <div
              v-if="dropdownOpen"
              class="absolute right-0 md:left-0 mt-2 w-64 max-h-72 overflow-y-auto neu-island bg-surface-card rounded-2xl p-2 shadow-2xl border border-outline-variant/30 flex flex-col gap-1 z-50 backdrop-blur-xl"
            >
              <button
                v-for="cat in categoryList"
                :key="cat.value"
                type="button"
                class="w-full px-3.5 py-2 rounded-xl text-left body-sm flex items-center justify-between transition-all duration-200 cursor-pointer"
                :class="filter === cat.value
                  ? 'neu-pressed text-primary font-bold'
                  : 'hover:neu-pressed text-on-surface-variant hover:text-on-surface'"
                @click="filter = cat.value; dropdownOpen = false"
              >
                <span class="truncate">{{ cat.label }}</span>
                <div class="flex items-center gap-2 shrink-0">
                  <span class="neu-pressed px-2 py-0.5 rounded-full text-[10px] font-bold text-on-surface-variant">
                    {{ cat.count }}
                  </span>
                  <Icon v-if="filter === cat.value" name="ph:check-bold" class="text-xs text-primary" />
                </div>
              </button>
            </div>
          </Transition>
        </div>
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
            <NuxtLink :to="'/thoughts/' + th.slug" target="_blank" class="body-sm text-primary hover:underline flex items-center gap-1">
              <span>/thoughts/{{ th.slug }}</span>
              <Icon name="ph:arrow-square-out-bold" class="text-xs" />
            </NuxtLink>
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
        <div class="flex gap-2 pt-1 mt-auto">
          <NuxtLink
            :to="'/thoughts/' + th.slug"
            target="_blank"
            class="flex-1 neu-raised py-2.5 rounded-full text-primary body-sm font-bold flex items-center justify-center gap-1.5 hover:neu-pressed transition-all duration-300"
          >
            <Icon name="ph:arrow-square-out-bold" class="text-base" />
            <span>Lihat</span>
          </NuxtLink>
          <button
            class="flex-1 neu-raised py-2.5 rounded-full text-primary body-sm font-bold flex items-center justify-center gap-1.5 hover:neu-pressed transition-all duration-300"
            @click="openEdit(th)"
          >
            <Icon name="ph:pencil-simple-bold" class="text-base" />
            {{ t('admin.edit') }}
          </button>
          <button
            class="neu-raised w-10 h-10 rounded-full text-error body-sm font-bold flex items-center justify-center hover:neu-pressed transition-all duration-300 shrink-0"
            @click="removeThought(th)"
          >
            <Icon name="ph:trash-bold" class="text-base" />
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