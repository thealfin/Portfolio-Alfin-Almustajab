function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function safeUrl(url: string): string {
  const trimmed = url.trim()
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed
  return 'https://' + trimmed
}

export function renderChatMessage(text: string): string {
  if (!text) return ''
  let s = escapeHtml(text)

  // Simpan tautan markdown [teks](url) ke dalam placeholder agar tidak ikut terproses oleh regex URL mentah
  const placeholders: string[] = []
  s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_m, label, url) => {
    const idx = placeholders.length
    placeholders.push(`<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer" class="ai-link">${label}</a>`)
    return `\u0000L${idx}\u0000`
  })

  // Bold **teks**
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  // Italic *teks*
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>')

  // URL mentah (https://...) -> link biru bisa diklik
  s = s.replace(/(https?:\/\/[^\s<]+)/g, (url) => {
    const idx = placeholders.length
    placeholders.push(`<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer" class="ai-link">${url}</a>`)
    return `\u0000L${idx}\u0000`
  })

  // Kembalikan placeholder
  s = s.replace(/\u0000L(\d+)\u0000/g, (_m, i) => placeholders[Number(i)] ?? '')

  // Baris baru -> <br> untuk menjaga paragraf
  s = s.replace(/\n/g, '<br />')
  return s
}