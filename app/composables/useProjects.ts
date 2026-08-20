export const useProjects = () => {
  const { api } = useApi()
  const projects = ref<any[]>([])
  const loading = ref(false)

  const fetchProjects = async (params: Record<string, any> = {}) => {
    loading.value = true
    try {
      const { data } = await api.get('/projects', { params })
      projects.value = data
    } finally {
      loading.value = false
    }
  }
  return { projects, loading, fetchProjects }
}

export const useFeaturedProjects = async () => {
  const { data, error } = await useFetch('/api/projects?featured=true')
  return { projects: data, error }
}
