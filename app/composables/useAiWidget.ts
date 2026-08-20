export const useAiWidget = () => {
  const open = useState<boolean>('ai-widget-open', () => false)
  const openChat = () => { open.value = true }
  const closeChat = () => { open.value = false }
  return { open, openChat, closeChat }
}
