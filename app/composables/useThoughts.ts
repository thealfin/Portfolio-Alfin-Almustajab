export const useThoughts = async () => {
  const { data, error } = await useFetch('/api/thoughts', {
    key: 'all-thoughts-list',
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] || nuxtApp.static.data[key],
  })
  return { thoughts: data, error }
}