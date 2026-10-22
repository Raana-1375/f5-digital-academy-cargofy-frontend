import { afterEach, describe, expect, it } from 'vitest'
import { formatPackage, formatPrice, formatWeight, getTransportInfo } from '@/utils/cargo'
import { setLocale } from '@/i18n'

describe('cargo labels by language', () => {
  afterEach(() => setLocale('en'))

  it('translates the transport mode', () => {
    setLocale('es')

    expect(getTransportInfo('SEA').label).toBe('Marítimo')
  })

  it('translates and pluralizes the package type', () => {
    setLocale('es')

    expect(formatPackage('BOX', 1)).toBe('1 × Caja')
    expect(formatPackage('BOX', 10)).toBe('10 × Cajas')
  })

  it('uses the decimal comma for weights and prices in Spanish', () => {
    setLocale('es')

    expect(formatWeight(250.5)).toBe('250,5 kg')
    expect(formatPrice(255.4)).toContain('255,40')
  })
})
