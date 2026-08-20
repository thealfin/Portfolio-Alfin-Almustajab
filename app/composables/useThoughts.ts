export const useThoughts = async () => {
  const { data, error } = await useFetch('/api/thoughts')
  return { thoughts: data, error }
}