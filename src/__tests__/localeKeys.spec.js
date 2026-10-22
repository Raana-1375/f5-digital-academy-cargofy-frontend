import { describe, expect, it } from 'vitest'
import en from '@/i18n/locales/en'
import es from '@/i18n/locales/es'

function flatten(object, prefix = '') {
  return Object.entries(object).flatMap(([key, value]) =>
    typeof value === 'object' && value !== null
      ? flatten(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  )
}

describe('language dictionaries', () => {
  it('have the same keys in English and Spanish', () => {
    expect(flatten(es).sort()).toEqual(flatten(en).sort())
  })

  it('use the same placeholders in both languages', () => {
    const placeholders = (text) => (text.match(/\{\w+\}/g) ?? []).sort().join(',')
    const get = (object, path) => path.split('.').reduce((value, key) => value[key], object)

    const mismatched = flatten(en).filter(
      (key) => placeholders(get(es, key)) !== placeholders(get(en, key)),
    )

    expect(mismatched).toEqual([])
  })
})
