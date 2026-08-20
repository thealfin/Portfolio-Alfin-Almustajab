export function useSeo(title: string, description: string) {
  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: 'website',
    twitterTitle: title,
    twitterDescription: description,
  })
}
