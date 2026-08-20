export const useCertifications = () => {
  const { data, error, pending } = useFetch('/api/certifications')
  return { certifications: data, error, pending }
}
