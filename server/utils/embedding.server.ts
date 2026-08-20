export async function embedText(text: string) {
  const config = useRuntimeConfig()
  if (!config.geminiApiKey) return null
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${config.geminiApiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-001',
        content: { parts: [{ text }] },
      }),
    },
  )
  const json = await res.json()
  return json?.embedding?.values ?? null
}