<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { listProjects, createProject, updateProject, deleteProject } = useAdmin()
const { pick } = useLocale()

const { t } = useI18n()

const projects = ref<any[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const editing = ref<any | null>(null)
const showForm = ref(false)
const search = ref('')
const filter = ref('Semua')

const fetchProjects = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await listProjects()
    projects.value = data
  } catch (e: any) {
    error.value = e?.response?.data?.statusMessage ?? e?.message ?? 'Gagal memuat proyek'
  } finally {
    loading.value = false
  }
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  return projects.value.filter((p) => {
    const matchesSearch =
      !q ||
      p.title?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q)
    const matchesFilter =
      filter.value === 'Semua' || (p.category ?? []).includes(filter.value)
    return matchesSearch && matchesFilter
  })
})

const categories = computed(() => {
  const set = new Set<string>()
  projects.value.forEach((p) => (p.category ?? []).forEach((c: string) => set.add(c)))
  return Array.from(set)
})

const openCreate = () => {
  editing.value = null
  showForm.value = true
}

const openEdit = (p: any) => {
  editing.value = p
  showForm.value = true
}

const onSaved = async () => {
  showForm.value = false
  await fetchProjects()
}

const removeProject = async (p: any) => {
  if (!confirm(`Hapus proyek "${p.title}"?`)) return
  try {
    await deleteProject(p.id)
    await fetchProjects()
  } catch (e: any) {
    error.value = e?.response?.data?.statusMessage ?? 'Gagal menghapus'
  }
}

const cover = (p: any) => p.cover_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.title ?? 'AA')}&background=005bb2&color=fff&size=200`

const detail = ref<any>(null)
const detailOpen = ref(false)
const detailLoading = ref(false)

const openDetail = async (p: any) => {
  detailLoading.value = true
  detailOpen.value = true
  document.body.style.overflow = 'hidden'
  try {
    const { api } = useApi()
    const { data } = await api.get(`/projects/${p.slug}`)
    detail.value = data
  } catch {
    detail.value = p
  } finally {
    detailLoading.value = false
  }
}

const closeDetail = () => {
  detailOpen.value = false
  detail.value = null
  document.body.style.overflow = ''
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && detailOpen.value) closeDetail()
}

onMounted(() => {
  fetchProjects()
  document.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})

const statusClass = (status?: string) => {
  const map: Record<string, string> = {
    Completed: 'text-[#10B981] bg-[#10B981]/10',
    'In Progress': 'text-[#0EA5E9] bg-[#0EA5E9]/10',
    'On Hold': 'text-[#F59E0B] bg-[#F59E0B]/10',
    Archived: 'text-on-surface-variant bg-on-surface-variant/10',
  }
  return map[status ?? ''] ?? 'text-primary bg-primary/10'
}
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
      <div class="flex flex-col gap-1.5">
        <h1 class="headline-lg text-on-surface">{{ t('admin.portfolio') }}</h1>
        <p class="body-md text-on-surface-variant">{{ t('admin.portfolioSubtitle') }}</p>
      </div>
      <button
        class="neu-raised px-6 py-2.5 rounded-full flex items-center gap-2.5 text-primary hover:neu-pressed transition-all duration-300"
        @click="openCreate"
      >
        <Icon name="ph:plus-bold" class="text-base" />
        <span class="body-md font-bold">{{ t('admin.addProject') }}</span>
      </button>
    </div>

    <div class="flex flex-col xl:flex-row gap-4">
      <div class="flex-1 neu-pressed rounded-full flex items-center px-5 py-2.5 gap-3">
        <Icon name="ph:magnifying-glass-bold" class="text-on-surface-variant text-lg" />
        <input
          v-model="search"
          type="text"
          :placeholder="t('admin.searchProject')"
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

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
      <div
        v-for="p in filtered"
        :key="p.id"
        class="neu-raised rounded-[18px] p-4 flex flex-col gap-4 hover:scale-[1.01] transition-transform duration-500"
      >
        <button class="neu-pressed p-3 rounded-[16px] text-left w-full" @click="openDetail(p)">
          <img :src="cover(p)" :alt="p.title" class="w-full h-36 object-cover rounded-xl" loading="lazy" />
        </button>
        <div class="flex flex-col gap-3 flex-1">
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="c in (p.category ?? []).slice(0, 3)"
              :key="c"
              class="neu-pressed px-2.5 py-1 rounded-full label-caps text-primary"
            >
              {{ c }}
            </span>
          </div>
          <div class="flex flex-col gap-1">
            <h3 class="title-md text-on-surface line-clamp-1">{{ p.title }}</h3>
            <span class="body-md text-primary font-bold">{{ p.year }}</span>
            <span v-if="p.client" class="body-md text-on-surface-variant line-clamp-1">Klien: {{ p.client }}</span>
          </div>
          <p class="body-md text-on-surface-variant line-clamp-2">
            {{ pick(p, 'summary') }}
          </p>
          <div class="flex items-center gap-2 mt-auto">
            <span
              v-if="p.status"
              class="px-2.5 py-1 rounded-full label-caps text-[9px] font-bold"
              :class="statusClass(p.status)"
            >
              {{ p.status }}
            </span>
            <span class="ml-auto label-caps text-on-surface-variant flex items-center gap-1.5">
              <Icon name="ph:eye-bold" class="text-sm" />
              {{ t('admin.viewDetail') }}
            </span>
          </div>
        </div>
        <div class="flex gap-3 pt-1 mt-auto">
          <button
            class="flex-1 neu-raised py-2.5 rounded-full text-primary body-md font-bold flex items-center justify-center gap-2 hover:neu-pressed transition-all duration-300"
            @click="openDetail(p)"
          >
            <Icon name="ph:magnifying-glass-plus-bold" class="text-base" />
            {{ t('admin.viewDetail') }}
          </button>
          <button
            class="flex-1 neu-raised py-2.5 rounded-full text-primary body-md font-bold flex items-center justify-center gap-2 hover:neu-pressed transition-all duration-300"
            @click="openEdit(p)"
          >
            <Icon name="ph:pencil-simple-bold" class="text-base" />
            {{ t('admin.edit') }}
          </button>
          <button
            class="flex-1 neu-raised py-2.5 rounded-full text-error body-md font-bold flex items-center justify-center gap-2 hover:neu-pressed transition-all duration-300"
            @click="removeProject(p)"
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
      <ProjectForm
        :project="editing"
        @saved="onSaved"
        @cancel="showForm = false"
      />
    </div>

    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="detailOpen" class="fixed inset-0 z-[120]" role="dialog" aria-modal="true">
          <div class="absolute inset-0 bg-surface-base/70 backdrop-blur-xl backdrop-saturate-150" @click="closeDetail" />

          <div class="absolute inset-[20px] neu-raised rounded-[20px] overflow-hidden flex flex-col bg-surface-card">
            <div class="flex items-center justify-between gap-3 px-6 py-4 border-b border-outline-variant/50 bg-surface-card shrink-0">
              <div class="flex items-center gap-3 min-w-0">
                <button
                  class="w-10 h-10 rounded-full neu-pressed flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors shrink-0"
                  :aria-label="t('admin.closeDetail')"
                  @click="closeDetail"
                >
                  <Icon name="ph:x-bold" class="text-xl" />
                </button>
                <h2 class="title-md text-on-surface truncate">{{ detail?.title ?? '' }}</h2>
              </div>
              <button
                v-if="detail?.id"
                class="neu-raised rounded-full px-4 py-2 body-md font-bold text-primary flex items-center gap-2 hover:neu-pressed transition-all shrink-0"
                @click="openEdit(detail)"
              >
                <Icon name="ph:pencil-simple-bold" class="text-sm" />
                {{ t('admin.edit') }}
              </button>
            </div>

            <div class="flex-1 min-h-0 overflow-y-auto">
              <div v-if="detailLoading" class="p-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div class="lg:col-span-8 flex flex-col gap-6">
                  <div class="neu-pressed rounded-card p-3 h-[360px] md:h-[480px] animate-pulse" />
                  <div v-for="i in 3" :key="i" class="neu-raised rounded-card p-6 h-24 animate-pulse" />
                </div>
                <div class="lg:col-span-4 neu-raised rounded-card p-8 h-96 animate-pulse" />
              </div>

              <div v-else-if="detail" class="w-full max-w-7xl mx-auto flex flex-col gap-12 px-6 md:px-10 py-8 pb-16">
                <div class="flex flex-col gap-5 w-full max-w-4xl">
                  <h1 class="display-lg text-on-surface">{{ detail.title }}</h1>
                  <div class="flex flex-wrap gap-4">
                    <span
                      v-for="cat in (detail.category ?? [])"
                      :key="cat"
                      class="px-4 py-2 rounded-full neu-pressed text-primary label-caps"
                    >
                      {{ cat }}
                    </span>
                    <span v-if="detail.year" class="px-4 py-2 rounded-full neu-pressed text-on-surface-variant label-caps">
                      {{ detail.year }}
                    </span>
                  </div>
                </div>

                <div class="w-full h-[360px] md:h-[560px] neu-raised rounded-card p-4 relative overflow-hidden group">
                  <div class="w-full h-full rounded-[16px] overflow-hidden bg-surface-container flex items-center justify-center">
                    <img
                      v-if="detail.cover_image_url"
                      :src="detail.cover_image_url"
                      :alt="detail.title"
                      class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span v-else class="text-7xl text-primary/15 font-extrabold select-none">{{ detail.title?.charAt(0) }}</span>
                  </div>
                </div>

                <div class="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 relative items-start">
                  <div class="lg:col-span-8 flex flex-col gap-12">
                    <div v-if="pick(detail, 'summary')" class="flex flex-col gap-4">
                      <h2 class="title-md text-on-surface">Summary</h2>
                      <p class="body-lg text-on-surface-variant leading-relaxed">{{ pick(detail, 'summary') }}</p>
                    </div>
                    <div v-if="pick(detail, 'challenge')" class="flex flex-col gap-4">
                      <h2 class="title-md text-on-surface">{{ t('projectDetail.challenge') }}</h2>
                      <p class="body-lg text-on-surface-variant leading-relaxed">{{ pick(detail, 'challenge') }}</p>
                    </div>
                    <div v-if="pick(detail, 'result')" class="flex flex-col gap-4">
                      <h2 class="title-md text-on-surface">{{ t('admin.result') }}</h2>
                      <p class="body-lg text-on-surface-variant leading-relaxed">{{ pick(detail, 'result') }}</p>
                    </div>
                    <div v-if="pick(detail, 'role_description')" class="flex flex-col gap-4">
                      <h2 class="title-md text-on-surface">{{ t('projectDetail.role') }}</h2>
                      <p class="body-lg text-on-surface-variant leading-relaxed">{{ pick(detail, 'role_description') }}</p>
                    </div>
                    <div class="flex flex-col gap-4">
                      <h2 class="title-md text-on-surface">{{ t('projectDetail.techStack') }}</h2>
                      <div class="flex flex-wrap gap-4 mt-2">
                        <div
                          v-for="tech in (detail.tech_stack ?? [])"
                          :key="tech"
                          class="neu-raised px-6 py-4 rounded-[16px] flex items-center gap-3"
                        >
                          <Icon name="ph:code-bold" class="text-primary" />
                          <span class="body-md text-on-surface font-bold">{{ tech }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="lg:col-span-4 lg:sticky lg:top-8 flex flex-col gap-8 neu-raised p-8 rounded-card">
                    <h3 class="title-md text-on-surface pb-4 relative">
                      {{ t('projectDetail.details') }}
                      <span class="absolute bottom-0 left-0 w-12 h-1 bg-primary rounded-full" />
                    </h3>
                    <div class="flex flex-col gap-4">
                      <div class="flex justify-between items-center py-2">
                        <span class="label-caps text-on-surface-variant">{{ t('projectDetail.client') }}</span>
                        <span class="body-md text-on-surface font-bold text-right">{{ detail.client || '—' }}</span>
                      </div>
                      <div class="flex justify-between items-center py-2">
                        <span class="label-caps text-on-surface-variant">{{ t('projectDetail.year') }}</span>
                        <span class="body-md text-on-surface font-bold">{{ detail.year }}</span>
                      </div>
                      <div class="flex justify-between items-center py-2">
                        <span class="label-caps text-on-surface-variant">{{ t('projectDetail.status') }}</span>
                        <span
                          class="body-md font-bold px-3 py-1 rounded-full flex items-center gap-1.5"
                          :class="statusClass(detail.status)"
                        >
                          <span class="w-1.5 h-1.5 rounded-full bg-current" />
                          {{ detail.status || t('projectDetail.unknownStatus') }}
                        </span>
                      </div>
                    </div>
                    <div class="flex flex-col gap-4 mt-2">
                      <a
                        v-if="detail.live_url"
                        :href="detail.live_url"
                        target="_blank"
                        rel="noopener"
                        class="w-full py-4 rounded-full neu-accent flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-transform group"
                      >
                        <span class="body-md font-bold text-on-primary">{{ t('projectDetail.viewLive') }}</span>
                        <Icon name="ph:arrow-right-bold" class="text-on-primary text-xl group-hover:translate-x-1 transition-transform" />
                      </a>
                      <a
                        v-if="detail.repo_url"
                        :href="detail.repo_url"
                        target="_blank"
                        rel="noopener"
                        class="w-full py-4 rounded-full neu-raised flex items-center justify-center gap-2 hover:text-primary transition-colors"
                      >
                        <span class="body-md font-bold">{{ t('projectDetail.githubRepo') }}</span>
                        <Icon name="ph:arrow-square-out-bold" class="text-xl" />
                      </a>
                    </div>
                  </div>
                </div>

                <div v-if="(detail.project_media ?? []).length" class="w-full flex flex-col gap-8 mt-8">
                  <h2 class="title-md text-on-surface">{{ t('projectDetail.gallery') }}</h2>
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div
                      v-for="m in detail.project_media"
                      :key="m.id"
                      class="neu-raised rounded-card p-3 aspect-square group cursor-pointer"
                    >
                      <div class="w-full h-full rounded-[16px] overflow-hidden">
                        <img
                          :src="m.image_url"
                          :alt="m.caption ?? detail.title"
                          loading="lazy"
                          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>