import { afterEach, describe, expect, it } from 'vitest'
import { formatDate, formatFullDate } from '@/utils/format'
import { setLocale } from '@/i18n'

describe('date formatting by language', () => {
  afterEach(() => setLocale('en'))

  it('formats dates in English by default', () => {
    expect(formatDate('2026-10-22T10:00:00')).toBe('Oct 22, 2026')
  })

  it('formats dates in Spanish when the language changes', () => {
    setLocale('es')

    expect(formatDate('2026-10-22T10:00:00')).toBe('22 oct 2026')
  })

  it('writes the full date with the long month in Spanish', () => {
    setLocale('es')

    expect(formatFullDate('2026-10-22T10:00:00')).toBe('jueves, 22 de octubre de 2026')
  })
})
