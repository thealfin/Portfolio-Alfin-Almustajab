<script setup lang="ts">
import { getTechIcon } from '~/utils/techIcons'

const props = defineProps<{
  project?: any
}>()

const emit = defineEmits<{
  (e: 'saved'): void
  (e: 'cancel'): void
}>()

const { createProject, updateProject, listStacks } = useAdmin()

const { t } = useI18n()

const loading = ref(false)
const error = ref<string | null>(null)

// Initial selected stacks
const selectedStacks = ref<string[]>(
  Array.isArray(props.project?.tech_stack)
    ? [...props.project.tech_stack]
    : typeof props.project?.tech_stack === 'string'
      ? props.project.tech_stack.split(',').map((s: string) => s.trim()).filter(Boolean)
      : []
)

// Master tech stack data from /admin/stacks
const masterStacks = ref<any[]>([])
const loadingStacks = ref(false)
const stackSearch = ref('')
const stackCategoryFilter = ref('all')
const customStackInput = ref('')

const fetchMasterStacks = async () => {
  loadingStacks.value = true
  try {
    const { data } = await listStacks()
    masterStacks.value = data || []
  } catch (e) {
    console.error('Failed to load master stacks:', e)
  } finally {
    loadingStacks.value = false
  }
}

const masterStackMap = computed(() => {
  const map = new Map<string, any>()
  for (const s of masterStacks.value) {
    if (s?.name) map.set(s.name.toLowerCase().trim(), s)
  }
  return map
})

const getMasterStack = (name: string) => {
  if (!name) return null
  return masterStackMap.value.get(name.toLowerCase().trim()) ?? null
}

const isStackSelected = (name: string) => {
  if (!name) return false
  const target = name.toLowerCase().trim()
  return selectedStacks.value.some((s) => s.toLowerCase().trim() === target)
}

const toggleStack = (name: string) => {
  const trimmed = name.trim()
  if (!trimmed) return
  const target = trimmed.toLowerCase()
  const idx = selectedStacks.value.findIndex((s) => s.toLowerCase().trim() === target)
  if (idx !== -1) {
    selectedStacks.value.splice(idx, 1)
  } else {
    selectedStacks.value.push(trimmed)
  }
}

const removeStack = (idx: number) => {
  selectedStacks.value.splice(idx, 1)
}

const addCustomStack = () => {
  const val = customStackInput.value.trim()
  if (!val) return
  const items = val.split(',').map((s) => s.trim()).filter(Boolean)
  for (const item of items) {
    const target = item.toLowerCase()
    if (!selectedStacks.value.some((s) => s.toLowerCase().trim() === target)) {
      selectedStacks.value.push(item)
    }
  }
  customStackInput.value = ''
}

const filteredMasterStacks = computed(() => {
  const q = stackSearch.value.trim().toLowerCase()
  return masterStacks.value.filter((s) => {
    const matchSearch = !q || s.name?.toLowerCase().includes(q)
    const matchCat = stackCategoryFilter.value === 'all' || (s.category || 'frontend') === stackCategoryFilter.value
    return matchSearch && matchCat
  })
})

onMounted(() => {
  fetchMasterStacks()
})

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
    tech_stack: selectedStacks.value,
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
  <div class="neu-raised rounded-[24px] p-5 w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col gap-4">
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

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">Client / Klien</label>
          <input v-model="form.client" placeholder="PT. Digital Perkasa" class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
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
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.year') }}</label>
          <input v-model.number="form.year" type="number" class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
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
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.result') }} (ID)</label>
          <textarea v-model="form.result_id" rows="2" class="neu-pressed rounded-[16px] px-5 py-3 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.result') }} (EN)</label>
          <textarea v-model="form.result_en" rows="2" class="neu-pressed rounded-[16px] px-5 py-3 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
        </div>
      </div>

      <!-- INTERACTIVE TECH STACK SELECTOR (CONNECTED DIRECTLY TO ADMIN TECH STACK SECTION) -->
      <div class="flex flex-col gap-3 neu-raised rounded-[20px] p-4 sm:p-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Icon name="ph:cpu-bold" class="text-primary text-lg" />
            <span class="body-md font-bold text-on-surface">{{ t('admin.techStack') }}</span>
            <span class="neu-pressed px-2.5 py-0.5 rounded-full text-[10px] font-bold text-primary">
              {{ selectedStacks.length }} Terpilih
            </span>
          </div>
          <NuxtLink
            to="/admin/stacks"
            target="_blank"
            class="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
            title="Buka menu Tech Stack untuk menambah atau mengubah ikon master"
          >
            <span>Master Tech Stack</span>
            <Icon name="ph:arrow-square-out-bold" class="text-xs" />
          </NuxtLink>
        </div>

        <!-- Selected Stack Badges Row -->
        <div class="flex flex-wrap items-center gap-2 min-h-[44px] p-2.5 neu-pressed rounded-[16px]">
          <div
            v-for="(tech, idx) in selectedStacks"
            :key="tech"
            class="group/item neu-raised px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold text-on-surface hover:text-primary transition-all duration-200"
          >
            <!-- Icon Preview -->
            <img
              v-if="getMasterStack(tech)?.icon_url"
              :src="getMasterStack(tech).icon_url"
              :alt="tech"
              class="w-4 h-4 object-contain"
              loading="lazy"
            />
            <GeminiIcon
              v-else-if="getMasterStack(tech)?.gemini"
              class="w-4 h-4 text-sky-500"
            />
            <Icon
              v-else
              :name="getTechIcon(tech)"
              class="text-base text-primary"
            />
            <span>{{ tech }}</span>
            <button
              type="button"
              class="w-4 h-4 rounded-full flex items-center justify-center hover:bg-error/20 hover:text-error transition-colors"
              :title="'Hapus ' + tech"
              @click.stop="removeStack(idx)"
            >
              <Icon name="ph:x-bold" class="text-[10px]" />
            </button>
          </div>

          <span v-if="!selectedStacks.length" class="text-xs text-on-surface-variant/60 italic pl-1">
            Belum ada tech stack yang dipilih. Klik dari daftar di bawah atau ketik manual.
          </span>
        </div>

        <!-- Master Stacks Picker Matrix -->
        <div class="flex flex-col gap-2 pt-1 border-t border-outline-variant/30">
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            <!-- Search input inside master stacks -->
            <div class="neu-pressed rounded-full flex items-center px-3 py-1.5 gap-2 flex-1 max-w-xs">
              <Icon name="ph:magnifying-glass-bold" class="text-on-surface-variant text-xs" />
              <input
                v-model="stackSearch"
                type="text"
                placeholder="Cari tech stack..."
                class="bg-transparent w-full outline-none text-xs text-on-surface placeholder:text-on-surface-variant/50"
              />
              <button v-if="stackSearch" type="button" @click="stackSearch = ''">
                <Icon name="ph:x-bold" class="text-xs text-on-surface-variant" />
              </button>
            </div>

            <!-- Category filter chips -->
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <button
                v-for="cat in [
                  { id: 'all', label: 'Semua' },
                  { id: 'frontend', label: 'Frontend' },
                  { id: 'backend', label: 'Backend' },
                  { id: 'devops', label: 'DevOps' },
                  { id: 'rag', label: 'RAG' },
                  { id: 'llm', label: 'LLM' },
                ]"
                :key="cat.id"
                type="button"
                class="px-2.5 py-1 rounded-full font-semibold transition-all select-none whitespace-nowrap"
                :class="stackCategoryFilter === cat.id ? 'neu-pressed text-primary font-bold' : 'neu-raised text-on-surface-variant hover:text-on-surface'"
                @click="stackCategoryFilter = cat.id"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>

          <!-- Clickable Master Stack Badges -->
          <div class="max-h-40 overflow-y-auto p-2 neu-pressed rounded-[16px] flex flex-wrap gap-1.5">
            <button
              v-for="s in filteredMasterStacks"
              :key="s.id || s.name"
              type="button"
              class="px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 select-none cursor-pointer"
              :class="isStackSelected(s.name) ? 'neu-accent font-bold shadow-sm' : 'neu-raised text-on-surface-variant hover:text-on-surface'"
              @click="toggleStack(s.name)"
            >
              <img
                v-if="s.icon_url"
                :src="s.icon_url"
                :alt="s.name"
                class="w-3.5 h-3.5 object-contain"
                loading="lazy"
              />
              <GeminiIcon
                v-else-if="s.gemini"
                class="w-3.5 h-3.5"
                :class="isStackSelected(s.name) ? 'text-white' : 'text-sky-500'"
              />
              <Icon
                v-else
                :name="getTechIcon(s.name)"
                class="text-sm"
              />
              <span>{{ s.name }}</span>
              <Icon v-if="isStackSelected(s.name)" name="ph:check-bold" class="text-[10px] ml-0.5" />
            </button>

            <span v-if="!filteredMasterStacks.length && !loadingStacks" class="text-xs text-on-surface-variant p-2 italic w-full text-center">
              Tidak ada tech stack yang cocok dengan "{{ stackSearch }}"
            </span>
            <span v-if="loadingStacks" class="text-xs text-on-surface-variant p-2 italic w-full text-center">
              Memuat master tech stack...
            </span>
          </div>

          <!-- Manual input for custom technology -->
          <div class="flex items-center gap-2 pt-1">
            <div class="flex-1 neu-pressed rounded-full flex items-center px-4 py-2 gap-2">
              <Icon name="ph:plus-circle-bold" class="text-on-surface-variant text-sm" />
              <input
                v-model="customStackInput"
                type="text"
                placeholder="Ketik nama stack custom lalu tekan Enter atau Tambah..."
                class="bg-transparent w-full outline-none body-sm text-on-surface placeholder:text-on-surface-variant/50"
                @keydown.enter.prevent="addCustomStack"
              />
            </div>
            <button
              type="button"
              class="neu-raised px-4 py-2 rounded-full body-sm font-bold text-primary hover:neu-pressed transition-all shrink-0"
              @click="addCustomStack"
            >
              Tambah
            </button>
          </div>
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
            <span class="body-md font-bold text-on-surface">{{ t('admin.mediaGallery') }}</span>
            <span class="neu-pressed px-2.5 py-0.5 rounded-full text-[10px] font-bold text-on-surface-variant">
              {{ media.length }} Item
            </span>
          </div>
          <button
            type="button"
            class="neu-raised px-4 py-1.5 rounded-full text-xs font-bold text-primary flex items-center gap-1.5 hover:neu-pressed transition-all"
            @click="addMedia"
          >
            <Icon name="ph:plus-bold" class="text-xs" />
            {{ t('admin.addMedia') }}
          </button>
        </div>

        <div v-if="media.length" class="flex flex-col gap-3">
          <div
            v-for="(m, i) in media"
            :key="i"
            class="neu-pressed rounded-[18px] p-3.5 flex flex-col sm:flex-row gap-3 items-start sm:items-center"
          >
            <div class="w-16 h-16 rounded-xl neu-raised overflow-hidden shrink-0 flex items-center justify-center bg-surface-container">
              <img
                v-if="m.image_url"
                :src="normalizeMediaUrl(m.image_url)"
                class="w-full h-full object-cover"
                loading="lazy"
                @error="($event.target as HTMLElement).style.display = 'none'"
              />
              <Icon v-else name="ph:image-bold" class="text-on-surface-variant text-xl" />
            </div>
            <div class="flex-1 flex flex-col gap-2 w-full">
              <input
                v-model="m.image_url"
                placeholder="https://lh3.googleusercontent.com/d/..."
                class="neu-raised rounded-full px-4 py-1.5 text-xs bg-transparent focus:outline-none focus:ring-1 focus:ring-primary w-full"
                @blur="m.image_url = normalizeMediaUrl(m.image_url)"
              />
              <input
                v-model="m.caption"
                placeholder="Caption gambar..."
                class="neu-raised rounded-full px-4 py-1.5 text-xs bg-transparent focus:outline-none focus:ring-1 focus:ring-primary w-full"
              />
            </div>
            <button
              type="button"
              class="w-8 h-8 rounded-full neu-raised flex items-center justify-center text-error hover:neu-pressed shrink-0 self-end sm:self-center"
              @click="removeMedia(i)"
            >
              <Icon name="ph:trash-bold" class="text-sm" />
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex items-center gap-3">
          <input id="is_featured" v-model="form.is_featured" type="checkbox" class="w-4 h-4 accent-primary" />
          <label for="is_featured" class="body-md text-on-surface cursor-pointer select-none">{{ t('admin.featured') }}</label>
        </div>
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.sortOrder') }}</label>
          <input v-model.number="form.sort_order" type="number" class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
      </div>

      <p v-if="error" class="body-sm text-error font-medium px-4">{{ error }}</p>

      <div class="flex justify-end gap-3 pt-2">
        <button
          type="button"
          class="neu-raised px-6 py-2.5 rounded-full body-md font-bold text-on-surface-variant hover:text-on-surface transition-all"
          @click="emit('cancel')"
        >
          {{ t('admin.cancel') }}
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="neu-accent px-6 py-2.5 rounded-full body-md font-bold disabled:opacity-50 transition-all flex items-center gap-2"
        >
          <Icon v-if="loading" name="ph:spinner-gap-bold" class="animate-spin text-base" />
          <span>{{ loading ? t('admin.saving') : t('admin.save') }}</span>
        </button>
      </div>
    </form>
  </div>
</template>