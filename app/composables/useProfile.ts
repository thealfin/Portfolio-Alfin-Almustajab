export const useProfile = () => {
  const { data, error, pending } = useFetch('/api/profile')
  return { profile: data, error, pending }
}
