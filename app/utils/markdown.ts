import { marked } from 'marked'
import hljs from 'highlight.js'

// Slugify function for headings anchor navigation
export function slugifyText(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]*>/g, '') // remove HTML tags if any
    .replace(/[^\w\s-]/g, '') // remove special characters
    .trim()
    .replace(/\s+/g, '-')
}

// Official Google Material Symbol (Outlined): content_copy & check
export const ICON_COPY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" class="copy-svg shrink-0" aria-hidden="true"><path d="M9 18q-.825 0-1.412-.587Q7 16.825 7 16V4q0-.825.588-1.413Q8.175 2 9 2h9q.825 0 1.413.587Q20 3.175 20 4v12q0 .825-.587 1.413Q18.825 18 18 18Zm0-2h9V4H9v12Zm-4 6q-.825 0-1.412-.587Q3 20.825 3 20V6h2v14h11v2H5Zm4-6V4v12Z"/></svg>`

export const ICON_CHECK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor" class="check-svg shrink-0 text-emerald-400" aria-hidden="true"><path d="m9.55 15.15 8.475-8.475q.3-.3.7-.3t.7.3q.3.3.3.713 0 .412-.3.712l-9.175 9.2q-.3.3-.7.3t-.7-.3L4.55 12.3q-.3-.3-.288-.712.013-.413.313-.713.3-.3.713-.3t.712.3Z"/></svg>`

// Custom renderer for marked to output WordPress / editorial style markup
const renderer = {
  heading({ tokens, depth }: { tokens: any[]; depth: number }) {
    const text = this.parser.parseInline(tokens)
    const id = slugifyText(text)
    return `<h${depth} id="${id}" class="article-h${depth} group relative">${text}<a href="#${id}" class="anchor-link opacity-0 group-hover:opacity-60 transition-opacity ml-2 text-primary" aria-label="Link to section">#</a></h${depth}>\n`
  },

  code({ text, lang }: { text: string; lang?: string }) {
    const language = (lang || '').trim().toLowerCase()
    const validLang = language && hljs.getLanguage(language) ? language : ''
    
    let highlighted: string
    if (validLang) {
      try {
        highlighted = hljs.highlight(text, { language: validLang }).value
      } catch {
        highlighted = hljs.highlightAuto(text).value
      }
    } else {
      try {
        highlighted = hljs.highlightAuto(text).value
      } catch {
        highlighted = text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
      }
    }

    const displayLang = (validLang || language || 'CODE').toUpperCase()
    const encoded = encodeURIComponent(text)

    return `
<div class="code-block-wrapper my-6 rounded-2xl overflow-hidden neu-raised border border-outline-variant/30 bg-[#111622] text-[#e2e8f0] font-mono text-[13px] shadow-lg">
  <div class="code-block-header flex items-center justify-between px-4 py-2.5 bg-[#171d2b] border-b border-white/10 select-none">
    <div class="flex items-center gap-2">
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-full bg-[#ef4444]/80 inline-block"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-[#f59e0b]/80 inline-block"></span>
        <span class="w-2.5 h-2.5 rounded-full bg-[#10b981]/80 inline-block"></span>
      </div>
      <span class="ml-2 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-white/10 text-primary-fixed-dim">${displayLang}</span>
    </div>
    <button type="button" class="copy-code-btn flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-sans font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 transition-all cursor-pointer active:scale-95" data-code="${encoded}">
      <span class="copy-icon flex items-center justify-center">${ICON_COPY_SVG}</span>
      <span class="copy-label">Salin</span>
    </button>
  </div>
  <div class="code-block-body p-4 overflow-x-auto text-[13px] leading-relaxed custom-scrollbar">
    <pre class="m-0 p-0 bg-transparent"><code class="hljs ${validLang ? 'language-' + validLang : ''}">${highlighted}</code></pre>
  </div>
</div>\n`
  },

  table(token: any) {
    let headerHtml = '<tr>'
    if (typeof token.header === 'string') {
      headerHtml = token.header
    } else if (Array.isArray(token.header)) {
      for (const cell of token.header) {
        const cellContent = typeof cell === 'string'
          ? cell
          : (cell.tokens ? this.parser.parseInline(cell.tokens) : (cell.text || ''))
        const alignAttr = cell.align ? ` style="text-align: ${cell.align}"` : ''
        headerHtml += `<th${alignAttr}>${cellContent}</th>`
      }
      headerHtml += '</tr>'
    }

    let bodyHtml = ''
    if (typeof token.rows === 'string') {
      bodyHtml = token.rows
    } else if (Array.isArray(token.rows)) {
      for (const row of token.rows) {
        if (typeof row === 'string') {
          bodyHtml += row
        } else if (Array.isArray(row)) {
          bodyHtml += '<tr>'
          for (const cell of row) {
            const cellContent = typeof cell === 'string'
              ? cell
              : (cell.tokens ? this.parser.parseInline(cell.tokens) : (cell.text || ''))
            const alignAttr = cell.align ? ` style="text-align: ${cell.align}"` : ''
            bodyHtml += `<td${alignAttr}>${cellContent}</td>`
          }
          bodyHtml += '</tr>'
        }
      }
    }

    return `
<div class="table-responsive-wrapper my-6 overflow-x-auto neu-raised rounded-2xl p-2 border border-outline-variant/30 bg-surface-card">
  <table class="article-table w-full text-left text-sm border-collapse">
    <thead>${headerHtml}</thead>
    <tbody>${bodyHtml}</tbody>
  </table>
</div>\n`
  },



  blockquote({ tokens }: { tokens: any[] }) {
    const quote = this.parser.parse(tokens)
    return `<blockquote class="article-blockquote my-6 pl-5 pr-4 py-3.5 border-l-4 border-primary bg-primary/5 rounded-r-2xl italic text-on-surface/90">${quote}</blockquote>\n`
  },

  link({ href, title, tokens }: { href: string; title?: string | null; tokens: any[] }) {
    const text = this.parser.parseInline(tokens)
    const titleAttr = title ? ` title="${title}"` : ''
    const isExternal = href.startsWith('http://') || href.startsWith('https://')
    const targetRel = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''
    return `<a href="${href}" class="article-link text-primary font-semibold underline underline-offset-4 hover:text-primary-strong transition-colors"${titleAttr}${targetRel}>${text}</a>`
  },

  hr() {
    return `<hr class="article-hr my-8 border-0 h-[1px] bg-gradient-to-r from-transparent via-outline-variant/60 to-transparent" />\n`
  },
}

marked.use({
  gfm: true,
  breaks: true,
  renderer,
})

/**
 * Parse markdown text into editorial HTML
 */
export function renderMarkdown(content: string): string {
  if (!content) return ''
  try {
    return marked.parse(content) as string
  } catch (err) {
    console.error('Error rendering markdown:', err)
    return content.replace(/\n/g, '<br>')
  }
}

/**
 * Extract Table of Contents items (H2 and H3) from Markdown text
 */
export function extractTableOfContents(content: string): Array<{ id: string; text: string; depth: number }> {
  if (!content) return []
  const toc: Array<{ id: string; text: string; depth: number }> = []
  const headingRegex = /^(#{2,3})\s+(.+)$/gm
  let match: RegExpExecArray | null

  while ((match = headingRegex.exec(content)) !== null) {
    const depth = match[1].length
    const rawText = match[2].trim()
    const cleanText = rawText.replace(/\*\*|__|\*|_|`|\[.*?\]\(.*?\)/g, '').trim()
    const id = slugifyText(cleanText)
    toc.push({ id, text: cleanText, depth })
  }

  return toc
}
