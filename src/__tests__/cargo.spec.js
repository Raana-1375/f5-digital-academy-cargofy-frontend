import { describe, expect, it } from 'vitest'
import { formatPackage, formatPrice, formatWeight, getTransportInfo } from '@/utils/cargo'

describe('getTransportInfo', () => {
  it('returns the icon and label for each transport mode', () => {
    expect(getTransportInfo('AIR')).toEqual({ icon: '✈️', label: 'Air' })
    expect(getTransportInfo('SEA')).toEqual({ icon: '🚢', label: 'Sea' })
    expect(getTransportInfo('ROAD')).toEqual({ icon: '🚚', label: 'Road' })
  })

  it('returns a dash for missing or unknown modes', () => {
    expect(getTransportInfo(null)).toEqual({ icon: '', label: '—' })
    expect(getTransportInfo('RAIL')).toEqual({ icon: '', label: '—' })
  })
})

describe('formatPackage', () => {
  it('uses the singular label for a quantity of one', () => {
    expect(formatPackage('PALLET', 1)).toBe('1 × Pallet')
  })

  it('uses the plural label for several units', () => {
    expect(formatPackage('BOX', 10)).toBe('10 × Boxes')
    expect(formatPackage('ENVELOPE', 3)).toBe('3 × Envelopes')
  })

  it('returns a dash when the data is missing', () => {
    expect(formatPackage(null, null)).toBe('—')
    expect(formatPackage('BOX', null)).toBe('—')
  })
})

describe('formatWeight', () => {
  it('formats the weight in kilograms', () => {
    expect(formatWeight(250.5)).toBe('250.5 kg')
    expect(formatWeight(1200)).toBe('1,200 kg')
  })

  it('returns a dash when the weight is missing', () => {
    expect(formatWeight(null)).toBe('—')
    expect(formatWeight(undefined)).toBe('—')
  })
})

describe('formatPrice', () => {
  it('formats the price in euros with two decimals', () => {
    expect(formatPrice(255.4)).toBe('€255.40')
    expect(formatPrice(1505)).toBe('€1,505.00')
  })

  it('returns a dash when the price is missing', () => {
    expect(formatPrice(null)).toBe('—')
  })
})
