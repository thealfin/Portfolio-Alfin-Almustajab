<script setup lang="ts">
const props = defineProps<{
  stack?: any
}>()

const emit = defineEmits<{
  (e: 'saved'): void
  (e: 'cancel'): void
}>()

const { createStack, updateStack } = useAdmin()

const { t } = useI18n()

const loading = ref(false)
const error = ref<string | null>(null)

const form = reactive({
  name: props.stack?.name ?? '',
  icon_url: props.stack?.icon_url ?? '',
  sort_order: props.stack?.sort_order ?? 0,
  is_active: props.stack?.is_active ?? true,
  gemini: props.stack?.gemini ?? false,
})

const submit = async () => {
  loading.value = true
  error.value = null
  if (!form.name.trim()) {
    error.value = t('stackName') + ' wajib diisi.'
    loading.value = false
    return
  }
  const payload = {
    name: form.name.trim(),
    icon_url: form.icon_url.trim() || null,
    sort_order: Number(form.sort_order) || 0,
    is_active: form.is_active,
    gemini: form.gemini,
  }
  try {
    if (props.stack?.id) await updateStack(props.stack.id, payload)
    else await createStack(payload)
    emit('saved')
  } catch (e: any) {
    error.value = e?.response?.data?.statusMessage ?? e?.message ?? 'Gagal menyimpan tech stack'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="neu-raised rounded-[24px] p-5 w-full max-w-xl max-h-[90vh] overflow-y-auto flex flex-col gap-4">
    <div class="flex items-center justify-between">
      <h2 class="headline-lg text-on-surface">{{ stack ? t('admin.editStack') : t('admin.addStack') }}</h2>
      <button class="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-on-surface-variant hover:text-on-surface" @click="emit('cancel')">
        <Icon name="ph:x-bold" class="text-lg" />
      </button>
    </div>

    <form class="flex flex-col gap-4" @submit.prevent="submit">
      <div class="flex flex-col gap-1.5">
        <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.stackName') }}</label>
        <input v-model="form.name" required placeholder="Vue" class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>

      <div class="flex flex-col gap-1.5">
        <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.stackIconUrl') }}</label>
        <input
          v-model="form.icon_url"
          placeholder="https://cdn.simpleicons.org/tailwindcss"
          :disabled="form.gemini"
          class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-40"
        />
        <p class="body-md text-on-surface-variant/70 ml-4">{{ t('admin.stackIconHint') }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.stackSort') }}</label>
          <input v-model.number="form.sort_order" type="number" min="0" class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary" />
        </div>
        <div class="flex items-end pb-1">
          <label class="flex items-center gap-3 neu-pressed rounded-full px-5 py-3 cursor-pointer select-none">
            <input v-model="form.is_active" type="checkbox" class="accent-primary w-4 h-4" />
            <span class="body-md font-bold text-on-surface">{{ t('admin.stackActive') }}</span>
          </label>
        </div>
      </div>

      <div class="flex items-center justify-between neu-pressed rounded-[16px] px-5 py-3">
        <label class="body-md font-bold text-on-surface cursor-pointer select-none">
          {{ t('admin.stackGemini') }}
        </label>
        <input v-model="form.gemini" type="checkbox" class="accent-primary w-4 h-4" />
      </div>

      <div class="flex items-center gap-3 neu-raised rounded-[16px] px-5 py-3">
        <span class="w-10 h-10 rounded-full neu-raised flex items-center justify-center shrink-0">
          <GeminiIcon v-if="form.gemini" class="w-5 h-5 text-[#1a73e8]" />
          <img v-else-if="form.icon_url" :src="form.icon_url" :alt="form.name || 'icon'" class="w-5 h-5 object-contain" loading="lazy" />
          <span v-else class="body-md font-extrabold text-on-surface-variant">{{ form.name?.charAt(0) || '?' }}</span>
        </span>
        <span class="label-caps text-on-surface-variant">{{ t('admin.stackPreview') }}</span>
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