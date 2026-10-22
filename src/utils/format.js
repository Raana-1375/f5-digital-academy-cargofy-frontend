import i18n from '@/i18n'

const LOCALE_TAGS = { en: 'en-US', es: 'es-ES' }
const FULL_DATE_MONTH = { en: 'short', es: 'long' }

// Reading the locale ref here makes templates re-render when the language changes.
function currentLanguage() {
  return i18n.global.locale.value
}

export function formatDate(value) {
  if (!value) return ''

  return new Date(value).toLocaleDateString(LOCALE_TAGS[currentLanguage()] ?? 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatFullDate(value = new Date()) {
  const language = currentLanguage()

  return new Date(value).toLocaleDateString(LOCALE_TAGS[language] ?? 'en-US', {
    weekday: 'long',
    month: FULL_DATE_MONTH[language] ?? 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
