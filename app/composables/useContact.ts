export const useContact = () => {
  const { api } = useApi()
  const sending = ref(false)
  const error = ref<string | null>(null)
  const success = ref(false)

  const send = async (payload: { name: string; email: string; message: string }) => {
    sending.value = true
    error.value = null
    success.value = false
    try {
      await api.post('/contact', payload)
      success.value = true
    } catch (e: any) {
      error.value = e?.response?.data?.statusMessage ?? 'Terjadi kesalahan, coba lagi.'
    } finally {
      sending.value = false
    }
  }

  return { sending, error, success, send }
}
