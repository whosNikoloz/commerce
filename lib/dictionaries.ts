import type { Locale } from '../i18n.config'

const dictionaries = {
  en: () => import('@/public/locales/en.json').then((module) => module.default),
  ka: () => import('@/public/locales/ka.json').then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => dictionaries[locale]()