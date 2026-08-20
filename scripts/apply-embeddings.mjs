import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = readFileSync('.env.local', 'utf8')
const url = env.split('\n').find((l) => l.startsWith('SUPABASE_URL='))?.split('=')[1]?.trim()
const key = env.split('\n').find((l) => l.startsWith('SUPABASE_KEY='))?.split('=')[1]?.trim()

const supabase = createClient(url, key)
const embeddings = JSON.parse(readFileSync('.output/embeddings.json', 'utf8'))

for (const { id, embedding } of embeddings) {
  const { error } = await supabase.from('ai_knowledge_chunks').update({ embedding }).eq('id', id)
  if (error) throw error
  console.log(`updated ${id}`)
}
console.log(`done: ${embeddings.length} rows updated`)