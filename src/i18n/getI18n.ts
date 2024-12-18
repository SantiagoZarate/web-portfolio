import en from './dictionaries/en.json'
import es from './dictionaries/es.json'

const languages = {
  SPANISH: 'es',
  ENGLISH: 'en'
}

export function getI18n(currentLocale: string | undefined) {
  if (!currentLocale) return en
  if (currentLocale === languages.ENGLISH) return en
  if (currentLocale === languages.SPANISH) return es
  return en
}
