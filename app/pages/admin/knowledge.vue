<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

const { listKnowledge, createKnowledge, updateKnowledge, deleteKnowledge, getAiSettings, updateAiSettings } = useAdmin()

const { t } = useI18n()

const chunks = ref<any[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const showModal = ref(false)
const editing = ref<any | null>(null)

const form = ref({ source: '', content: '' })

const settings = ref<any | null>(null)
const showSettings = ref(false)
const settingsSaving = ref(false)
const settingsForm = ref({ persona: '', instructions: '', memory_enabled: true })

const fetchSettings = async () => {
  try {
    const { data } = await getAiSettings()
    settings.value = data
    settingsForm.value = {
      persona: data?.persona ?? '',
      instructions: data?.instructions ?? '',
      memory_enabled: data?.memory_enabled ?? true,
    }
  } catch {
    settings.value = null
  }
}

const openSettings = () => {
  settingsForm.value = {
    persona: settings.value?.persona ?? '',
    instructions: settings.value?.instructions ?? '',
    memory_enabled: settings.value?.memory_enabled ?? true,
  }
  showSettings.value = true
}

const closeSettings = () => {
  if (settingsSaving.value) return
  showSettings.value = false
}

const submitSettings = async () => {
  if (!settingsForm.value.persona.trim() && !settingsForm.value.instructions.trim()) {
    error.value = t('admin.aiSettingsRequired')
    return
  }
  settingsSaving.value = true
  error.value = null
  try {
    const { data } = await updateAiSettings(settingsForm.value)
    settings.value = data
    closeSettings()
  } catch (e: any) {
    error.value = e?.response?.data?.statusMessage ?? e?.message ?? 'Gagal menyimpan pengaturan AI'
  } finally {
    settingsSaving.value = false
  }
}

const fetchChunks = async () => {
  loading.value = true
  error.value = null
  try {
    const { data } = await listKnowledge()
    chunks.value = data
  } catch (e: any) {
    error.value = e?.response?.data?.statusMessage ?? e?.message ?? 'Gagal memuat knowledge'
  } finally {
    loading.value = false
  }
}

onMounted(fetchChunks)
onMounted(fetchSettings)

const openCreate = () => {
  editing.value = null
  form.value = { source: '', content: '' }
  showModal.value = true
}

const openEdit = (c: any) => {
  editing.value = c
  form.value = { source: c.source ?? '', content: c.content ?? '' }
  showModal.value = true
}

const closeModal = () => {
  if (saving.value) return
  showModal.value = false
  editing.value = null
}

const submit = async () => {
  if (!form.value.content.trim()) {
    error.value = t('admin.knowledgeContentRequired')
    return
  }
  saving.value = true
  error.value = null
  try {
    if (editing.value) {
      await updateKnowledge(editing.value.id, form.value)
    } else {
      await createKnowledge(form.value)
    }
    await fetchChunks()
    closeModal()
  } catch (e: any) {
    error.value = e?.response?.data?.statusMessage ?? e?.message ?? 'Gagal menyimpan'
  } finally {
    saving.value = false
  }
}

const removeChunk = async (c: any) => {
  if (!confirm(`${t('admin.delete')} "${c.source || '—'}"?`)) return
  try {
    await deleteKnowledge(c.id)
    await fetchChunks()
  } catch (e: any) {
    error.value = e?.response?.data?.statusMessage ?? 'Gagal menghapus'
  }
}

const sourceIcon = (c: any) => {
  const s = (c.source ?? '').toLowerCase()
  if (s.startsWith('http')) return 'ph:globe-bold'
  if (s.includes('faq')) return 'ph:question-bold'
  if (s.includes('project')) return 'ph:squares-four-bold'
  if (s.includes('experience')) return 'ph:briefcase-bold'
  if (s.includes('education')) return 'ph:graduation-cap-bold'
  if (s.includes('profile')) return 'ph:user-bold'
  return 'ph:note-pencil-bold'
}

const sourceTint = (c: any) => {
  const s = (c.source ?? '').toLowerCase()
  if (s.startsWith('http')) return 'text-primary'
  if (s.includes('faq')) return 'text-[#F59E0B]'
  if (s.includes('project')) return 'text-[#8B5CF6]'
  if (s.includes('experience')) return 'text-[#10B981]'
  if (s.includes('education')) return 'text-[#14B8A6]'
  if (s.includes('profile')) return 'text-[#EF4444]'
  return 'text-on-surface-variant'
}

const formatDate = (iso?: string) => formatWibDate(iso)

const formatTime = (iso?: string) => (iso ? formatWibTime(iso) : '')
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <div class="flex flex-col gap-2">
      <h1 class="headline-lg text-on-surface">{{ t('admin.knowledgeTitle') }}</h1>
      <p class="body-md text-on-surface-variant max-w-2xl">{{ t('admin.knowledgeSubtitle') }}</p>
    </div>

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <span class="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-primary">
          <Icon name="ph:book-open-bold" class="text-lg" />
        </span>
        <div class="flex flex-col">
          <span class="title-md text-on-surface">{{ chunks.length }} {{ t('admin.knowledgeItems') }}</span>
          <span class="text-[11px] text-on-surface-variant">{{ t('admin.knowledgeTotalHint') }}</span>
        </div>
      </div>
      <button
        class="neu-raised rounded-full px-6 py-2.5 flex items-center gap-2.5 text-primary hover:neu-pressed active:scale-95 transition-all duration-300 w-fit shrink-0"
        @click="openCreate"
      >
        <span class="w-6 h-6 rounded-full neu-accent flex items-center justify-center text-on-primary">
          <Icon name="ph:plus-bold" class="text-base" />
        </span>
        <span class="body-md font-bold">{{ t('admin.knowledgeAdd') }}</span>
      </button>
    </div>

    <p v-if="error" class="body-md text-error">{{ error }}</p>
    <p v-if="loading" class="body-md text-on-surface-variant">{{ t('admin.loading') }}</p>

    <div class="neu-raised rounded-[18px] p-5 flex flex-col w-full min-w-0">
      <template v-if="chunks.length">
        <!-- Table Header -->
        <div class="grid grid-cols-12 gap-3 px-2 pb-4 text-on-surface-variant label-caps uppercase tracking-wider border-b border-surface-variant/60">
          <div class="col-span-2">Source</div>
          <div class="col-span-5">Content Snippet</div>
          <div class="col-span-3">Created At</div>
          <div class="col-span-2 text-right">Status</div>
        </div>

        <!-- Data Rows -->
        <div class="flex flex-col">
          <div
            v-for="c in chunks"
            :key="c.id"
            class="grid grid-cols-12 gap-3 items-center px-2 py-3.5 rounded-[16px] hover:bg-surface-container transition-colors group"
          >
            <div class="col-span-2 flex items-center gap-2.5 min-w-0">
              <span class="w-8 h-8 neu-raised rounded-full flex items-center justify-center shrink-0" :class="sourceTint(c)">
                <Icon :name="sourceIcon(c)" class="text-base" />
              </span>
              <span class="body-md text-on-surface truncate">{{ c.source || '—' }}</span>
            </div>
            <div class="col-span-5 pr-4 min-w-0">
              <p class="body-md text-on-surface-variant line-clamp-2">{{ c.content }}</p>
            </div>
            <div class="col-span-3 flex flex-col">
              <span class="body-md text-on-surface">{{ formatDate(c.created_at) }}</span>
              <span class="body-md text-on-surface-variant text-[13px]">{{ formatTime(c.created_at) }}</span>
            </div>
            <div class="col-span-2 flex items-center justify-end gap-2">
              <div class="neu-pressed px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                <span class="body-md text-on-surface text-[13px]">Active</span>
              </div>
              <button
                class="w-8 h-8 flex items-center justify-center neu-raised rounded-full text-on-surface-variant hover:text-primary transition-colors"
                :aria-label="t('admin.edit')"
                @click="openEdit(c)"
              >
                <Icon name="ph:pencil-simple-bold" class="text-base" />
              </button>
              <button
                class="w-8 h-8 flex items-center justify-center neu-raised rounded-full text-on-surface-variant hover:text-error transition-colors"
                :aria-label="t('admin.delete')"
                @click="removeChunk(c)"
              >
                <Icon name="ph:trash-bold" class="text-base" />
              </button>
            </div>
          </div>
        </div>
      </template>

      <div v-else-if="!loading" class="flex flex-col items-center justify-center gap-4 text-center py-12">
        <span class="w-12 h-12 rounded-full border-2 border-dashed border-outline-variant/50 flex items-center justify-center text-outline/50">
          <Icon name="ph:book-open-bold" class="text-2xl" />
        </span>
        <p class="body-md text-on-surface-variant">{{ t('admin.knowledgeEmpty') }}</p>
      </div>
    </div>

    <!-- AI Styling & Personality -->
    <div class="neu-raised rounded-[18px] p-5 flex flex-col w-full min-w-0">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div class="flex items-center gap-3">
          <span class="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-[#8B5CF6]">
            <Icon name="ph:magic-wand-bold" class="text-lg" />
          </span>
          <div class="flex flex-col">
            <span class="title-md text-on-surface">{{ t('admin.aiSettingsTitle') }}</span>
            <span class="text-[11px] text-on-surface-variant">{{ t('admin.aiSettingsSubtitle') }}</span>
          </div>
        </div>
        <button
          class="neu-raised rounded-full px-5 py-2.5 flex items-center gap-2.5 text-primary hover:neu-pressed active:scale-95 transition-all duration-300 w-fit shrink-0"
          @click="openSettings"
        >
          <span class="w-6 h-6 rounded-full neu-accent flex items-center justify-center text-on-primary">
            <Icon name="ph:pencil-simple-bold" class="text-sm" />
          </span>
          <span class="body-md font-bold">{{ t('admin.aiSettingsEdit') }}</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="neu-pressed rounded-[16px] p-4 flex flex-col gap-2.5">
          <div class="flex items-center gap-2.5">
            <span class="w-8 h-8 neu-raised rounded-full flex items-center justify-center text-[#8B5CF6]">
              <Icon name="ph:brain-bold" class="text-base" />
            </span>
            <span class="label-caps text-on-surface-variant uppercase tracking-wider">{{ t('admin.aiSettingsPersona') }}</span>
          </div>
          <p class="body-md text-on-surface-variant leading-relaxed line-clamp-4">
            {{ settings?.persona || t('admin.aiSettingsEmpty') }}
          </p>
        </div>

        <div class="neu-pressed rounded-[16px] p-4 flex flex-col gap-2.5">
          <div class="flex items-center gap-2.5">
            <span class="w-8 h-8 neu-raised rounded-full flex items-center justify-center text-[#10B981]">
              <Icon name="ph:chat-circle-text-bold" class="text-base" />
            </span>
            <span class="label-caps text-on-surface-variant uppercase tracking-wider">{{ t('admin.aiSettingsInstructions') }}</span>
          </div>
          <p class="body-md text-on-surface-variant leading-relaxed line-clamp-4">
            {{ settings?.instructions || t('admin.aiSettingsEmpty') }}
          </p>
        </div>

        <div class="neu-pressed rounded-[16px] p-4 flex flex-col gap-2.5">
          <div class="flex items-center gap-2.5">
            <span class="w-8 h-8 neu-raised rounded-full flex items-center justify-center text-primary">
              <Icon name="ph:database-bold" class="text-base" />
            </span>
            <span class="label-caps text-on-surface-variant uppercase tracking-wider">{{ t('admin.aiSettingsMemory') }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full" :class="settings?.memory_enabled ? 'bg-[#10B981]' : 'bg-outline/50'" />
            <span class="body-md text-on-surface">
              {{ settings?.memory_enabled ? t('admin.enabled') : t('admin.disabled') }}
            </span>
          </div>
          <p class="body-md text-on-surface-variant leading-relaxed">{{ t('admin.aiSettingsMemoryHint') }}</p>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="closeModal"
    >
      <div class="w-full max-w-2xl neu-raised bg-surface rounded-[24px] p-6 flex flex-col gap-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between">
          <h3 class="headline-lg text-on-surface">{{ editing ? t('admin.knowledgeEdit') : t('admin.knowledgeAdd') }}</h3>
          <button class="w-10 h-10 neu-raised rounded-full flex items-center justify-center text-on-surface-variant hover:text-error transition-colors" @click="closeModal">
            <Icon name="ph:x-bold" class="text-lg" />
          </button>
        </div>

        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label class="label-caps text-on-surface-variant uppercase tracking-wider">{{ t('admin.knowledgeSource') }}</label>
            <input
              v-model="form.source"
              type="text"
              class="w-full neu-pressed rounded-[16px] bg-transparent px-5 py-3 body-md text-on-surface outline-none focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-on-surface-variant/50"
              :placeholder="t('admin.knowledgeSourcePlaceholder')"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="label-caps text-on-surface-variant uppercase tracking-wider">
              {{ t('admin.knowledgeContent') }} <span class="text-error">*</span>
            </label>
            <textarea
              v-model="form.content"
              rows="6"
              class="w-full neu-pressed rounded-[16px] bg-transparent px-5 py-3 body-md text-on-surface outline-none focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-on-surface-variant/50 resize-none"
              :placeholder="t('admin.knowledgeContentPlaceholder')"
            />
          </div>

          <p class="text-[11px] text-on-surface-variant flex items-center gap-2">
            <Icon name="ph:sparkle-bold" class="text-primary" />
            {{ t('admin.knowledgeEmbedHint') }}
          </p>
        </div>

        <div class="flex justify-end items-center gap-4 mt-1">
          <button class="body-md text-on-surface-variant hover:text-on-surface transition-colors px-4 py-2" @click="closeModal">
            {{ t('admin.cancel') }}
          </button>
          <button
            class="body-md font-bold px-6 py-2.5 rounded-full bg-primary text-on-primary shadow-lg hover:scale-95 active:scale-95 transition-all flex items-center gap-2"
            :disabled="saving"
            @click="submit"
          >
            <Icon v-if="saving" name="ph:circle-notch-bold" class="text-lg animate-spin" />
            <Icon v-else name="ph:magic-wand-bold" class="text-lg" />
            {{ editing ? t('admin.save') : t('admin.knowledgeProcess') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal AI Settings -->
    <div
      v-if="showSettings"
      class="fixed inset-0 z-50 bg-inverse-surface/40 backdrop-blur-sm flex items-center justify-center p-4"
      @click.self="closeSettings"
    >
      <div class="w-full max-w-2xl neu-raised bg-surface rounded-[24px] p-6 flex flex-col gap-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between">
          <h3 class="headline-lg text-on-surface">{{ t('admin.aiSettingsTitle') }}</h3>
          <button class="w-10 h-10 neu-raised rounded-full flex items-center justify-center text-on-surface-variant hover:text-error transition-colors" @click="closeSettings">
            <Icon name="ph:x-bold" class="text-lg" />
          </button>
        </div>

        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label class="label-caps text-on-surface-variant uppercase tracking-wider">{{ t('admin.aiSettingsPersona') }}</label>
            <textarea
              v-model="settingsForm.persona"
              rows="6"
              class="w-full neu-pressed rounded-[16px] bg-transparent px-5 py-3 body-md text-on-surface outline-none focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-on-surface-variant/50 resize-none"
              :placeholder="t('admin.aiSettingsPersonaPlaceholder')"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label class="label-caps text-on-surface-variant uppercase tracking-wider">{{ t('admin.aiSettingsInstructions') }}</label>
            <textarea
              v-model="settingsForm.instructions"
              rows="5"
              class="w-full neu-pressed rounded-[16px] bg-transparent px-5 py-3 body-md text-on-surface outline-none focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-on-surface-variant/50 resize-none"
              :placeholder="t('admin.aiSettingsInstructionsPlaceholder')"
            />
          </div>

          <button
            class="flex items-center gap-4 w-full neu-pressed rounded-[16px] px-5 py-3 transition-colors"
            @click="settingsForm.memory_enabled = !settingsForm.memory_enabled"
          >
            <span
              class="relative w-10 h-6 rounded-full transition-colors shrink-0"
              :class="settingsForm.memory_enabled ? 'bg-primary' : 'bg-outline-variant'"
            >
              <span
                class="absolute top-1 w-4 h-4 rounded-full bg-surface-card shadow transition-all"
                :class="settingsForm.memory_enabled ? 'left-5' : 'left-1'"
              />
            </span>
            <span class="flex flex-col items-start">
              <span class="body-md font-bold text-on-surface">{{ t('admin.aiSettingsMemory') }}</span>
              <span class="text-[11px] text-on-surface-variant">{{ t('admin.aiSettingsMemoryHint') }}</span>
            </span>
          </button>

          <p class="text-[11px] text-on-surface-variant flex items-center gap-2">
            <Icon name="ph:sparkle-bold" class="text-primary" />
            {{ t('admin.aiSettingsHint') }}
          </p>
        </div>

        <div class="flex justify-end items-center gap-4 mt-1">
          <button class="body-md text-on-surface-variant hover:text-on-surface transition-colors px-4 py-2" @click="closeSettings">
            {{ t('admin.cancel') }}
          </button>
          <button
            class="body-md font-bold px-6 py-2.5 rounded-full bg-primary text-on-primary shadow-lg hover:scale-95 active:scale-95 transition-all flex items-center gap-2"
            :disabled="settingsSaving"
            @click="submitSettings"
          >
            <Icon v-if="settingsSaving" name="ph:circle-notch-bold" class="text-lg animate-spin" />
            <Icon v-else name="ph:floppy-disk-bold" class="text-lg" />
            {{ t('admin.save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>