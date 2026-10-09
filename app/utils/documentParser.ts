import TurndownService from 'turndown'
import mammoth from 'mammoth'
import { slugifyText } from './markdown'

export interface ParsedDocument {
  title: string
  slug: string
  category: string[]
  read_time_minutes: number
  content: string
}

// Inisialisasi Turndown untuk konversi HTML ke Markdown rapi
const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
  emDelimiter: '_',
  bulletListMarker: '-',
})

// Rule konversi Table HTML ke GFM Markdown Table
turndownService.addRule('table', {
  filter: 'table',
  replacement: function (content, node: any) {
    const rows = Array.from(node.querySelectorAll('tr')) as HTMLElement[]
    if (!rows.length) return ''

    let md = '\n\n'
    const headerRow = rows[0]
    const headerCells = Array.from(headerRow.querySelectorAll('th,td')).map(c => c.textContent?.trim().replace(/\|/g, '\\|') || '')
    md += '| ' + headerCells.join(' | ') + ' |\n'
    md += '| ' + headerCells.map(() => '---').join(' | ') + ' |\n'

    for (let i = 1; i < rows.length; i++) {
      const cells = Array.from(rows[i].querySelectorAll('td,th')).map(c => c.textContent?.trim().replace(/\|/g, '\\|') || '')
      md += '| ' + cells.join(' | ') + ' |\n'
    }
    return md + '\n\n'
  },
})


// Ekstrak metadata cerdas dari teks Markdown atau HTML
function extractMetadata(text: string, defaultTitle = 'Artikel Baru'): {
  title: string
  slug: string
  category: string[]
  read_time_minutes: number
} {
  let title = ''
  let slug = ''
  const categories: string[] = []

  // 1. Ekstrak Judul dari SEO info atau Heading # pertama
  const seoTitleMatch = text.match(/\*\*(?:Judul\s*SEO(?:\s*\(title\s*tag\))?|Judul)\s*:\*\*\s*(.+)/i)
    || text.match(/(?:Judul\s*SEO|Judul)\s*:\s*(.+)/i)
  if (seoTitleMatch && seoTitleMatch[1]) {
    title = seoTitleMatch[1].trim()
  } else {
    const h1Match = text.match(/^#\s+(.+)$/m)
    if (h1Match && h1Match[1]) {
      title = h1Match[1].trim()
    }
  }

  if (!title) {
    title = defaultTitle
  }

  // 2. Ekstrak Slug
  const slugMatch = text.match(/\*\*(?:Slug\s*URL|Slug)\s*:\*\*\s*(.+)/i)
    || text.match(/(?:Slug\s*URL|Slug)\s*:\s*(.+)/i)
  if (slugMatch && slugMatch[1]) {
    slug = slugMatch[1].trim().replace(/^\/+/, '').replace(/\/+$/, '')
  } else {
    slug = slugifyText(title)
  }

  // 3. Ekstrak Kategori / Kata Kunci
  const catMatch = text.match(/\*\*(?:Kata\s*kunci\s*utama|Kategori|Fokus\s*keyword)\s*:\*\*\s*(.+)/i)
    || text.match(/(?:Kata\s*kunci\s*utama|Kategori|Fokus\s*keyword)\s*:\s*(.+)/i)
  if (catMatch && catMatch[1]) {
    const rawCats = catMatch[1].split(/[,|]/)
    for (const c of rawCats) {
      const trimmed = c.trim()
      if (trimmed && !categories.includes(trimmed)) {
        categories.push(trimmed)
      }
    }
  }

  // Default kategori jika tidak ditemukan
  if (categories.length === 0) {
    categories.push('Teknologi', 'Web Development')
  }

  // 4. Hitung Estimasi Waktu Baca (rata-rata 200 kata per menit)
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const read_time_minutes = Math.max(1, Math.ceil(words / 200))

  return { title, slug, category: categories, read_time_minutes }
}

/**
 * Parse uploaded file (.md, .markdown, .html, .htm, .docx) into structured Markdown & metadata
 */
export async function parseUploadedDocument(file: File): Promise<ParsedDocument> {
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  const baseName = file.name.replace(/\.[^/.]+$/, '').trim()

  let rawContent = ''

  if (extension === 'md' || extension === 'markdown') {
    // 1. Format Markdown
    rawContent = await file.text()
  } else if (extension === 'html' || extension === 'htm') {
    // 2. Format HTML
    const htmlText = await file.text()
    
    // Bersihkan doctype dan ekstrak artikel jika ada
    let cleanHtml = htmlText
    if (typeof window !== 'undefined' && window.DOMParser) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlText, 'text/html')
      const articleEl = doc.querySelector('article') || doc.querySelector('main') || doc.body
      cleanHtml = articleEl ? articleEl.innerHTML : htmlText
    }

    rawContent = turndownService.turndown(cleanHtml)
  } else if (extension === 'docx') {
    // 3. Format Word (.docx)
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.convertToHtml({ arrayBuffer })
    const htmlFromDocx = result.value || ''
    rawContent = turndownService.turndown(htmlFromDocx)
  } else {
    // Fallback: baca sebagai teks biasa
    rawContent = await file.text()
  }

  const metadata = extractMetadata(rawContent, baseName)

  return {
    title: metadata.title,
    slug: metadata.slug,
    category: metadata.category,
    read_time_minutes: metadata.read_time_minutes,
    content: rawContent,
  }
}
