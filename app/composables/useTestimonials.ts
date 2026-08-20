export const useTestimonials = () => {
  const { data, error, pending } = useFetch('/api/testimonials')
  return { testimonials: data, error, pending }
}
