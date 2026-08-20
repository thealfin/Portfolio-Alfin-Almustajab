export const useExperiences = () => {
  const { data, error, pending } = useFetch('/api/experiences')
  return { experiences: data, error, pending }
}
