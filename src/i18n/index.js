import { createI18n } from 'vue-i18n'
import en from './locales/en'
import es from './locales/es'

export const SUPPORTED_LOCALES = ['en', 'es']
const STORAGE_KEY = 'cargofy_locale'

function getInitialLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (SUPPORTED_LOCALES.includes(saved)) return saved
  } catch {
    // Storage can be unavailable (private mode); fall back to English.
  }
  return 'en'
}

const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: 'en',
  messages: { en, es },
})

document.documentElement.lang = i18n.global.locale.value

export function setLocale(locale) {
  if (!SUPPORTED_LOCALES.includes(locale)) return
  i18n.global.locale.value = locale
  document.documentElement.lang = locale
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {
    // The choice still applies for this session.
  }
}

const LOCALE_TAGS = { en: 'en-US', es: 'es-ES' }

// BCP 47 tag used by Intl for dates and numbers in the current language.
export function getLocaleTag() {
  return LOCALE_TAGS[i18n.global.locale.value] ?? 'en-US'
}
export default i18n
