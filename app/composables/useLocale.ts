export function useLocale() {
  const { locale } = useI18n()

  const pick = (obj: Record<string, any> | null | undefined, field: string): string => {
    if (!obj) return ''
    const key = locale.value === 'en' ? `${field}_en` : `${field}_id`
    return obj[key] ?? obj[field] ?? ''
  }

  const pickArray = (obj: Record<string, any> | null | undefined, field: string): string[] => {
    if (!obj) return []
    const key = locale.value === 'en' ? `${field}_en` : `${field}_id`
    const value = obj[key] ?? obj[field]
    return Array.isArray(value) ? value : []
  }

  return { pick, pickArray, locale }
}
