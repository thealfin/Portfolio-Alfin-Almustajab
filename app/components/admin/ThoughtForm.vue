<script setup lang="ts">
import { parseUploadedDocument } from '~/utils/documentParser'
import { renderMarkdown, ICON_COPY_SVG, ICON_CHECK_SVG } from '~/utils/markdown'



const props = defineProps<{
  thought?: any
}>()

const emit = defineEmits<{
  (e: 'saved'): void
  (e: 'cancel'): void
}>()

const { createThought, updateThought, translateThought } = useAdmin()
const { t } = useI18n()

const loading = ref(false)
const error = ref<string | null>(null)
const activeTab = ref<'id' | 'en' | 'preview' | 'settings'>('id')
const previewLang = ref<'id' | 'en'>('id')

const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadingFile = ref(false)
const fileSuccessMsg = ref<string | null>(null)

const translating = ref(false)
const translateSuccessMsg = ref<string | null>(null)

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

// Handler Trigger Upload File
const triggerFileUpload = () => {
  fileInputRef.value?.click()
}

// Handler Parsing File (.md, .html, .docx)
const onFileChange = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploadingFile.value = true
  fileSuccessMsg.value = null
  error.value = null

  try {
    const parsed = await parseUploadedDocument(file)
    form.title_id = parsed.title
    form.slug = parsed.slug
    form.category = parsed.category.join(', ')
    form.read_time_minutes = parsed.read_time_minutes
    form.content_id = parsed.content

    fileSuccessMsg.value = `Berhasil mengimpor "${file.name}"! Judul, slug, kategori (${parsed.category.join(', ')}), dan estimasi waktu baca (${parsed.read_time_minutes} menit) otomatis terisi.`
    activeTab.value = 'id'
  } catch (err: any) {
    error.value = `Gagal membaca file: ${err?.message || err}`
  } finally {
    uploadingFile.value = false
    input.value = ''
  }
}

// Handler Auto Generate English with Gemini AI
const runAiTranslate = async () => {
  if (!form.title_id.trim() || !form.content_id.trim()) {
    error.value = 'Judul dan konten bahasa Indonesia wajib diisi terlebih dahulu untuk menghasilkan terjemahan AI.'
    activeTab.value = 'id'
    return
  }

  translating.value = true
  translateSuccessMsg.value = null
  error.value = null

  try {
    const res = await translateThought({
      title_id: form.title_id,
      content_id: form.content_id,
    })

    if (res.data?.title_en && res.data?.content_en) {
      form.title_en = res.data.title_en
      form.content_en = res.data.content_en
      translateSuccessMsg.value = 'Artikel berhasil diterjemahkan ke Bahasa Inggris oleh Gemini AI! Struktur Markdown & kode program dipertahankan.'
      activeTab.value = 'en'
    }
  } catch (err: any) {
    error.value = err?.response?.data?.statusMessage ?? err?.message ?? 'Gagal menghasilkan terjemahan AI'
  } finally {
    translating.value = false
  }
}

// Live Preview
const previewTitle = computed(() => {
  return previewLang.value === 'en'
    ? (form.title_en || form.title_id)
    : (form.title_id || form.title_en)
})

const previewContent = computed(() => {
  return previewLang.value === 'en'
    ? (form.content_en || form.content_id)
    : (form.content_id || form.content_en)
})

const previewHtml = computed(() => {
  return renderMarkdown(previewContent.value)
})

const handlePreviewClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  const copyBtn = target.closest('.copy-code-btn') as HTMLElement
  if (copyBtn) {
    const rawCode = decodeURIComponent(copyBtn.dataset.code || '')
    if (rawCode) {
      navigator.clipboard.writeText(rawCode).then(() => {
        const label = copyBtn.querySelector('.copy-label')
        const icon = copyBtn.querySelector('.copy-icon')
        if (label) label.textContent = 'Disalin!'
        if (icon) icon.innerHTML = ICON_CHECK_SVG
        copyBtn.classList.add('text-emerald-400', 'bg-white/25')
        setTimeout(() => {
          if (label) label.textContent = 'Salin'
          if (icon) icon.innerHTML = ICON_COPY_SVG
          copyBtn.classList.remove('text-emerald-400', 'bg-white/25')
        }, 2000)
      })
    }
  }
}

const wordCountId = computed(() => form.content_id.trim().split(/\s+/).filter(Boolean).length)
const wordCountEn = computed(() => form.content_en.trim().split(/\s+/).filter(Boolean).length)

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
  <div class="neu-raised rounded-[28px] p-6 w-full max-w-5xl max-h-[92vh] flex flex-col gap-4 overflow-hidden border border-outline-variant/30 shadow-2xl bg-surface-card">
    <!-- Header -->
    <div class="flex items-center justify-between gap-3 shrink-0 pb-2 border-b border-outline-variant/40">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full neu-pressed flex items-center justify-center text-primary font-bold text-lg">
          <Icon name="ph:article-bold" />
        </div>
        <div>
          <h2 class="title-md font-bold text-on-surface">{{ thought ? t('admin.editThought') : t('admin.addThought') }}</h2>
          <p class="body-sm text-on-surface-variant">Editor Artikel Markdown & Auto Translate AI</p>
        </div>
      </div>

      <div class="flex items-center gap-2.5">
        <!-- Hidden File Input (.md, .html, .docx) -->
        <input
          ref="fileInputRef"
          type="file"
          accept=".md,.markdown,.html,.htm,.docx"
          class="hidden"
          @change="onFileChange"
        />

        <!-- Action Button: Upload Document -->
        <button
          type="button"
          :disabled="uploadingFile"
          class="neu-raised px-4 py-2 rounded-full body-sm font-bold text-primary hover:neu-pressed transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
          @click="triggerFileUpload"
        >
          <Icon :name="uploadingFile ? 'ph:spinner-bold' : 'ph:file-arrow-up-bold'" :class="uploadingFile ? 'animate-spin' : ''" class="text-base" />
          <span>{{ uploadingFile ? 'Membaca...' : 'Unggah File (.md, .docx, .html)' }}</span>
        </button>

        <!-- Close Button -->
        <button
          type="button"
          class="w-9 h-9 rounded-full neu-raised flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
          @click="emit('cancel')"
        >
          <Icon name="ph:x-bold" class="text-base" />
        </button>
      </div>
    </div>

    <!-- Alert / Toast Messages -->
    <div v-if="fileSuccessMsg" class="px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3 text-xs text-emerald-600 font-medium shrink-0 animate-fadeIn">
      <div class="flex items-center gap-2">
        <Icon name="ph:check-circle-bold" class="text-base shrink-0 text-emerald-500" />
        <span>{{ fileSuccessMsg }}</span>
      </div>
      <button type="button" class="cursor-pointer text-emerald-500 hover:text-emerald-700" @click="fileSuccessMsg = null">
        <Icon name="ph:x-bold" class="text-xs" />
      </button>
    </div>

    <div v-if="translateSuccessMsg" class="px-4 py-2.5 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-between gap-3 text-xs text-primary font-medium shrink-0 animate-fadeIn">
      <div class="flex items-center gap-2">
        <Icon name="ph:sparkle-bold" class="text-base shrink-0 text-primary animate-pulse" />
        <span>{{ translateSuccessMsg }}</span>
      </div>
      <button type="button" class="cursor-pointer text-primary hover:text-primary-strong" @click="translateSuccessMsg = null">
        <Icon name="ph:x-bold" class="text-xs" />
      </button>
    </div>

    <div v-if="error" class="px-4 py-2.5 rounded-2xl bg-error/10 border border-error/30 flex items-center justify-between gap-3 text-xs text-error font-medium shrink-0">
      <div class="flex items-center gap-2">
        <Icon name="ph:warning-circle-bold" class="text-base shrink-0 text-error" />
        <span>{{ error }}</span>
      </div>
      <button type="button" class="cursor-pointer text-error hover:opacity-80" @click="error = null">
        <Icon name="ph:x-bold" class="text-xs" />
      </button>
    </div>

    <!-- Tab Bar -->
    <div class="flex items-center justify-between gap-2 border-b border-outline-variant/30 pb-2 shrink-0 flex-wrap">
      <div class="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          class="px-4 py-2 rounded-full body-sm font-bold transition-all cursor-pointer flex items-center gap-2"
          :class="activeTab === 'id' ? 'neu-pressed text-primary shadow-inner' : 'neu-raised text-on-surface-variant hover:text-on-surface'"
          @click="activeTab = 'id'"
        >
          <span>🇮🇩 Bahasa Indonesia</span>
          <span class="neu-pressed px-2 py-0.5 rounded-full text-[10px] font-mono text-on-surface-variant">
            {{ wordCountId }} kata
          </span>
        </button>

        <button
          type="button"
          class="px-4 py-2 rounded-full body-sm font-bold transition-all cursor-pointer flex items-center gap-2"
          :class="activeTab === 'en' ? 'neu-pressed text-primary shadow-inner' : 'neu-raised text-on-surface-variant hover:text-on-surface'"
          @click="activeTab = 'en'"
        >
          <span>🇬🇧 English (AI)</span>
          <span class="neu-pressed px-2 py-0.5 rounded-full text-[10px] font-mono text-on-surface-variant">
            {{ wordCountEn }} words
          </span>
        </button>

        <button
          type="button"
          class="px-4 py-2 rounded-full body-sm font-bold transition-all cursor-pointer flex items-center gap-2"
          :class="activeTab === 'preview' ? 'neu-pressed text-primary shadow-inner' : 'neu-raised text-on-surface-variant hover:text-on-surface'"
          @click="activeTab = 'preview'"
        >
          <Icon name="ph:eye-bold" class="text-sm" />
          <span>👁️ Live Preview</span>
        </button>

        <button
          type="button"
          class="px-4 py-2 rounded-full body-sm font-bold transition-all cursor-pointer flex items-center gap-2"
          :class="activeTab === 'settings' ? 'neu-pressed text-primary shadow-inner' : 'neu-raised text-on-surface-variant hover:text-on-surface'"
          @click="activeTab = 'settings'"
        >
          <Icon name="ph:gear-six-bold" class="text-sm" />
          <span>⚙️ Pengaturan & SEO</span>
        </button>
      </div>

      <!-- Quick AI Trigger Button -->
      <button
        type="button"
        :disabled="translating"
        class="neu-accent px-4 py-2 rounded-full body-sm font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-60 shadow-md"
        @click="runAiTranslate"
      >
        <Icon :name="translating ? 'ph:spinner-bold' : 'ph:sparkle-bold'" :class="translating ? 'animate-spin' : 'animate-pulse'" class="text-base" />
        <span>{{ translating ? 'Menerjemahkan via Gemini...' : '✨ Generate English (AI)' }}</span>
      </button>
    </div>

    <!-- Main Content Form / Tab Body -->
    <form class="flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-1" @submit.prevent="submit">
      <!-- TAB 1: INDONESIA -->
      <div v-show="activeTab === 'id'" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-3">{{ t('admin.titleId') }}</label>
          <input
            v-model="form.title_id"
            required
            placeholder="Judul artikel berbahasa Indonesia..."
            class="neu-pressed rounded-full px-5 py-3 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary font-bold text-on-surface"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <div class="flex items-center justify-between ml-3 mr-2">
            <label class="label-caps text-on-surface-variant">{{ t('admin.contentId') }} (Markdown)</label>
            <span class="text-[11px] text-on-surface-variant">Mendukung format: Heading #, Tabel, Blok Kode ```, List -, Kutipan ></span>
          </div>
          <textarea
            v-model="form.content_id"
            rows="16"
            required
            :placeholder="t('admin.contentPlaceholder')"
            class="neu-pressed rounded-[20px] p-5 font-mono text-[13px] bg-transparent focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed text-on-surface custom-scrollbar resize-y"
          />
        </div>
      </div>

      <!-- TAB 2: ENGLISH (AI) -->
      <div v-show="activeTab === 'en'" class="flex flex-col gap-4">
        <div class="neu-raised rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap bg-primary/5 border border-primary/20">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full neu-pressed flex items-center justify-center text-primary text-lg shrink-0">
              <Icon name="ph:translate-bold" />
            </div>
            <div>
              <p class="body-sm font-bold text-on-surface">Terjemahan AI Berkelanjutan (Google Gemini)</p>
              <p class="text-[11px] text-on-surface-variant">Menerjemahkan artikel ke bahasa Inggris baku dengan menjaga seluruh sintaksis kode dan tabel Markdown.</p>
            </div>
          </div>
          <button
            type="button"
            :disabled="translating"
            class="neu-accent px-4 py-2 rounded-full body-sm font-bold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
            @click="runAiTranslate"
          >
            <Icon :name="translating ? 'ph:spinner-bold' : 'ph:sparkle-bold'" :class="translating ? 'animate-spin' : ''" class="text-base" />
            <span>{{ translating ? 'Sedang Memproses...' : 'Terjemahkan Sekarang' }}</span>
          </button>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-3">{{ t('admin.titleEn') }}</label>
          <input
            v-model="form.title_en"
            placeholder="English article title..."
            class="neu-pressed rounded-full px-5 py-3 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary font-bold text-on-surface"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-3">{{ t('admin.contentEn') }} (Markdown)</label>
          <textarea
            v-model="form.content_en"
            rows="14"
            :placeholder="t('admin.contentPlaceholder')"
            class="neu-pressed rounded-[20px] p-5 font-mono text-[13px] bg-transparent focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed text-on-surface custom-scrollbar resize-y"
          />
        </div>
      </div>

      <!-- TAB 3: LIVE PREVIEW -->
      <div v-show="activeTab === 'preview'" class="flex flex-col gap-4">
        <div class="flex items-center justify-between px-2 flex-wrap gap-2">
          <span class="body-sm font-bold text-on-surface-variant">Pratinjau Editorial WordPress & Highlighting:</span>
          <div class="flex items-center gap-1 neu-pressed p-1 rounded-full text-xs font-bold">
            <button
              type="button"
              class="px-3 py-1 rounded-full transition-all cursor-pointer"
              :class="previewLang === 'id' ? 'neu-accent shadow-sm' : 'text-on-surface-variant hover:text-on-surface'"
              @click="previewLang = 'id'"
            >
              🇮🇩 Versi ID
            </button>
            <button
              type="button"
              class="px-3 py-1 rounded-full transition-all cursor-pointer"
              :class="previewLang === 'en' ? 'neu-accent shadow-sm' : 'text-on-surface-variant hover:text-on-surface'"
              @click="previewLang = 'en'"
            >
              🇬🇧 English
            </button>
          </div>
        </div>

        <div class="neu-pressed rounded-[24px] p-6 md:p-8 bg-surface-card border border-outline-variant/30 min-h-[400px]">
          <div v-if="!previewContent.trim()" class="p-10 text-center text-on-surface-variant body-md">
            Belum ada konten untuk ditampilkan. Silakan unggah atau ketik teks pada tab Bahasa Indonesia atau English.
          </div>
          <div v-else class="max-w-3xl mx-auto flex flex-col gap-6">
            <h1 class="display-lg text-on-surface leading-tight font-extrabold">{{ previewTitle }}</h1>
            <div
              class="article-editorial"
              @click="handlePreviewClick"
              v-html="previewHtml"
            />
          </div>
        </div>
      </div>

      <!-- TAB 4: PENGATURAN & SEO -->
      <div v-show="activeTab === 'settings'" class="flex flex-col gap-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.slug') }}</label>
            <input
              v-model="form.slug"
              required
              :placeholder="t('admin.slugPlaceholder')"
              class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary font-mono text-xs"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.thoughtCategory') }}</label>
            <input
              v-model="form.category"
              placeholder="AI, RAG, Web Development, Supabase"
              class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="label-caps text-on-surface-variant ml-4">{{ t('admin.coverImage') }} <span class="text-primary">(Link Gambar / Google Drive)</span></label>
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
            <input
              v-model.number="form.read_time_minutes"
              type="number"
              min="1"
              class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="label-caps text-on-surface-variant ml-4">Alt Text Gambar</label>
          <input
            v-model="form.image_alt_text"
            placeholder="Deskripsi gambar untuk aksesibilitas dan SEO..."
            class="neu-pressed rounded-full px-5 py-2.5 body-md bg-transparent focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div v-if="form.cover_image_url" class="flex items-center gap-4 neu-pressed p-3 rounded-2xl">
          <img :src="normalizeMediaUrl(form.cover_image_url)" :alt="form.image_alt_text || form.title_id" class="w-24 h-24 object-cover rounded-xl neu-raised" loading="lazy" />
          <div class="flex flex-col">
            <span class="body-sm font-bold text-on-surface">{{ t('admin.coverPreview') }}</span>
            <span class="text-[11px] text-on-surface-variant truncate max-w-sm">{{ form.cover_image_url }}</span>
          </div>
        </div>

        <label class="flex items-center gap-3 neu-pressed rounded-full px-5 py-3 cursor-pointer mt-2">
          <input v-model="form.is_published" type="checkbox" class="accent-primary w-4 h-4 rounded cursor-pointer" />
          <span class="body-md font-bold text-on-surface">{{ t('admin.isPublished') }}</span>
        </label>
      </div>

      <!-- Bottom Action Buttons (Sticky at bottom of form) -->
      <div class="flex items-center gap-3 mt-4 pt-3 border-t border-outline-variant/40 shrink-0">
        <button
          type="button"
          class="flex-1 neu-raised py-3 rounded-full text-on-surface-variant font-bold hover:neu-pressed transition-all cursor-pointer"
          @click="emit('cancel')"
        >
          {{ t('admin.cancel') }}
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="flex-1 neu-accent py-3 rounded-full flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-transform disabled:opacity-70 cursor-pointer shadow-lg"
        >
          <Icon :name="loading ? 'ph:spinner-bold' : 'ph:floppy-disk-bold'" :class="loading ? 'animate-spin' : ''" class="text-lg" />
          <span class="body-md font-bold">{{ loading ? 'Menyimpan...' : t('admin.save') }}</span>
        </button>
      </div>
    </form>
  </div>
</template>