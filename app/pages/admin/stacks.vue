<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { listStacks, deleteStack } = useAdmin()

const { t } = useI18n()

const stacks = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const editing = ref<any | null>(null)
const showForm = ref(false)
const search = ref('')

const fetchStacks = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await listStacks()
    stacks.value = data
  } catch (e: any) {
    error.value = e?.response?.data?.statusMessage ?? e?.message ?? 'Gagal memuat tech stack'
  } finally {
    loading.value = false
  }
}

onMounted(fetchStacks)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return stacks.value
  return stacks.value.filter((s) => s.name?.toLowerCase().includes(q))
})

const openCreate = () => {
  editing.value = null
  showForm.value = true
}

const openEdit = (s: any) => {
  editing.value = s
  showForm.value = true
}

const onSaved = async () => {
  showForm.value = false
  await fetchStacks()
}

const removeStack = async (s: any) => {
  if (!confirm(`Hapus tech stack "${s.name}"?`)) return
  try {
    await deleteStack(s.id)
    await fetchStacks()
  } catch (e: any) {
    error.value = e?.response?.data?.statusMessage ?? 'Gagal menghapus'
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
      <div class="flex flex-col gap-1.5">
        <h1 class="headline-lg text-on-surface">{{ t('admin.stacksTitle') }}</h1>
        <p class="body-md text-on-surface-variant">{{ t('admin.stacksSubtitle') }}</p>
      </div>
      <button
        class="neu-raised px-6 py-2.5 rounded-full flex items-center gap-2.5 text-primary hover:neu-pressed transition-all duration-300"
        @click="openCreate"
      >
        <Icon name="ph:plus-bold" class="text-base" />
        <span class="body-md font-bold">{{ t('admin.addStack') }}</span>
      </button>
    </div>

    <div class="flex flex-col md:flex-row gap-3 items-center">
      <div class="flex-1 neu-pressed rounded-full flex items-center px-5 py-2.5 gap-3">
        <Icon name="ph:magnifying-glass-bold" class="text-on-surface-variant text-lg" />
        <input
          v-model="search"
          type="text"
          :placeholder="t('admin.searchStack')"
          class="bg-transparent w-full outline-none body-md text-on-surface placeholder:text-on-surface-variant/50"
        />
      </div>
    </div>

    <p v-if="error" class="body-md text-error">{{ error }}</p>
    <p v-if="loading" class="body-md text-on-surface-variant">{{ t('admin.loading') }}</p>
    <p v-if="!loading && !stacks.length" class="body-md text-on-surface-variant">{{ t('admin.stackEmpty') }}</p>

    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
      <div
        v-for="s in filtered"
        :key="s.id"
        class="neu-raised rounded-[18px] p-4 flex flex-col items-center gap-3 hover:scale-[1.01] transition-transform duration-500"
      >
        <div class="w-14 h-14 rounded-full neu-raised flex items-center justify-center shrink-0">
          <GeminiIcon v-if="s.gemini" class="w-6 h-6 text-[#1a73e8]" />
          <img v-else-if="s.icon_url" :src="s.icon_url" :alt="s.name" class="w-6 h-6 object-contain" loading="lazy" />
          <span v-else class="body-lg font-extrabold text-on-surface-variant">{{ s.name?.charAt(0) }}</span>
        </div>
        <div class="flex flex-col items-center gap-1">
          <span class="title-md text-on-surface text-center">{{ s.name }}</span>
          <span class="label-caps flex items-center gap-1.5" :class="s.is_active ? 'text-[#10B981]' : 'text-on-surface-variant'">
            <Icon :name="s.is_active ? 'ph:eye-bold' : 'ph:eye-slash-bold'" class="text-xs" />
            {{ s.is_active ? t('admin.active') : t('admin.disabled') }}
          </span>
          <span class="label-caps text-on-surface-variant">#{{ s.sort_order }}</span>
        </div>
        <div class="flex gap-3 pt-1 w-full">
          <button
            class="flex-1 neu-raised py-2.5 rounded-full text-primary body-md font-bold flex items-center justify-center gap-2 hover:neu-pressed transition-all duration-300"
            @click="openEdit(s)"
          >
            <Icon name="ph:pencil-simple-bold" class="text-base" />
            {{ t('admin.edit') }}
          </button>
          <button
            class="flex-1 neu-raised py-2.5 rounded-full text-error body-md font-bold flex items-center justify-center gap-2 hover:neu-pressed transition-all duration-300"
            @click="removeStack(s)"
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
      <StackForm
        :stack="editing"
        @saved="onSaved"
        @cancel="showForm = false"
      />
    </div>
  </div>
</template>