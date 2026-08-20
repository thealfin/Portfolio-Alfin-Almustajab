export const useProject = (slug: string) => {
  const { data, error, pending } = useFetch(`/api/projects/${slug}`)
  return { project: data, error, pending }
}
