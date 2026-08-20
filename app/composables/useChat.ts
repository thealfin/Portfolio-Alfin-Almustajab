import { api } from './useApi'

export function useChat() {
  const messages = ref<{ role: 'user' | 'assistant'; content: string }[]>([])
  const loading = ref(false)

  const send = async (text: string) => {
    messages.value.push({ role: 'user', content: text })
    loading.value = true
    try {
      const sessionId = useCookie('ai_session_id').value ?? crypto.randomUUID()
      useCookie('ai_session_id').value = sessionId
      const { userId } = useAiUserId()
      const { data } = await api.post('/chat', { message: text, sessionId, userId: userId() })
      messages.value.push({ role: 'assistant', content: data.answer })
    } finally {
      loading.value = false
    }
  }

  return { messages, loading, send }
}
