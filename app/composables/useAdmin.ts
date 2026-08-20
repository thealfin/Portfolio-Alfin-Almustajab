import { api } from './useApi'

export function useAdmin() {
  const { $supabase } = useNuxtApp()
  const token = ref<string | null>(null)

  async function call(method: 'get' | 'post' | 'patch' | 'delete', url: string, data?: any) {
    const { data: session } = await $supabase.auth.getSession()
    const accessToken = token.value ?? session?.session?.access_token
    return api({ method, url, data, headers: { Authorization: `Bearer ${accessToken}` } })
  }

  const stats = () => call('get', '/admin/stats')
  const activity = (days = 7) => call('get', `/admin/activity?days=${days}`)
  const analytics = (days = 7) => call('get', `/admin/analytics?days=${days}`)
  const listProjects = () => call('get', '/admin/projects')
  const createProject = (p: any) => call('post', '/admin/projects', p)
  const updateProject = (id: string, p: any) => call('patch', `/admin/projects/${id}`, p)
  const deleteProject = (id: string) => call('delete', `/admin/projects/${id}`)
  const chatLogs = () => call('get', '/admin/chat-logs')
  const listKnowledge = () => call('get', '/admin/knowledge')
  const createKnowledge = (k: any) => call('post', '/admin/knowledge', k)
  const updateKnowledge = (id: string, k: any) => call('patch', `/admin/knowledge/${id}`, k)
  const deleteKnowledge = (id: string) => call('delete', `/admin/knowledge/${id}`)
  const getAiSettings = () => call('get', '/admin/ai-settings')
  const updateAiSettings = (s: any) => call('put', '/admin/ai-settings', s)
  const listMessages = () => call('get', '/admin/messages')
  const updateMessage = (id: string, isRead: boolean) => call('patch', `/admin/messages/${id}`, { is_read: isRead })
  const deleteMessage = (id: string) => call('delete', `/admin/messages/${id}`)
  const archiveChatLog = (sessionId: string, archived: boolean) => call('patch', `/admin/chat-logs/${encodeURIComponent(sessionId)}`, { archived })
  const getSecurity = () => call('get', '/admin/security')
  const changePassword = (payload: { currentPassword: string; newPassword: string; confirmPassword: string }) => call('put', '/admin/security/password', payload)
  const listThoughts = () => call('get', '/admin/thoughts')
  const createThought = (t: any) => call('post', '/admin/thoughts', t)
  const updateThought = (id: string, t: any) => call('patch', `/admin/thoughts/${id}`, t)
  const deleteThought = (id: string) => call('delete', `/admin/thoughts/${id}`)
  const listStacks = () => call('get', '/admin/stacks')
  const createStack = (s: any) => call('post', '/admin/stacks', s)
  const updateStack = (id: string, s: any) => call('patch', `/admin/stacks/${id}`, s)
  const deleteStack = (id: string) => call('delete', `/admin/stacks/${id}`)

  return { call, stats, activity, analytics, listProjects, createProject, updateProject, deleteProject, chatLogs, listKnowledge, createKnowledge, updateKnowledge, deleteKnowledge, getAiSettings, updateAiSettings, listMessages, updateMessage, deleteMessage, archiveChatLog, getSecurity, changePassword, listThoughts, createThought, updateThought, deleteThought, listStacks, createStack, updateStack, deleteStack }
}
