import { getDictionary } from '@/lib/dictionaries'
import { Locale } from '@/i18n.config'

export async function getTranslations(lang: Locale) {
  const dictionary = await getDictionary(lang)
  return dictionary
}