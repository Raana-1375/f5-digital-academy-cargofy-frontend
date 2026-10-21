import { describe, expect, it } from 'vitest'
import {
  GOODS_DESCRIPTION_MAX_LENGTH,
  NOTE_MAX_LENGTH,
  validateNewShipment,
} from '@/utils/validation'

const validData = {
  origin: 'Vigo, ES',
  destination: 'Oslo, NO',
  note: '',
  transportMode: 'SEA',
  packageType: 'BOX',
  quantity: 10,
  weightKg: 250.5,
  goodsDescription: '',
  hsCode: '',
}

function validate(overrides = {}) {
  return validateNewShipment({ ...validData, ...overrides })
}

describe('validateNewShipment', () => {
  it('returns no errors for valid data', () => {
    expect(validate()).toEqual({})
  })

  it('requires an origin', () => {
    const errors = validate({ origin: '   ' })

    expect(errors.origin).toBe('Origin is required')
    expect(errors.destination).toBeUndefined()
  })

  it('requires a destination', () => {
    expect(validate({ destination: '' }).destination).toBe('Destination is required')
  })

  it('requires a transport mode', () => {
    expect(validate({ transportMode: '' }).transportMode).toBe('Transport mode is required')
  })

  it('requires a package type', () => {
    expect(validate({ packageType: '' }).packageType).toBe('Package type is required')
  })

  it('requires a quantity', () => {
    expect(validate({ quantity: '' }).quantity).toBe('Quantity is required')
  })

  it('rejects a quantity below 1 or with decimals', () => {
    expect(validate({ quantity: 0 }).quantity).toBe('Quantity must be at least 1')
    expect(validate({ quantity: 1.5 }).quantity).toBe('Quantity must be at least 1')
  })

  it('requires a weight', () => {
    expect(validate({ weightKg: '' }).weightKg).toBe('Weight is required')
  })

  it('rejects a weight of zero or less', () => {
    expect(validate({ weightKg: 0 }).weightKg).toBe('Weight must be greater than 0')
    expect(validate({ weightKg: -3 }).weightKg).toBe('Weight must be greater than 0')
  })

  it('rejects a goods description longer than the maximum length', () => {
    const goodsDescription = 'a'.repeat(GOODS_DESCRIPTION_MAX_LENGTH + 1)

    expect(validate({ goodsDescription }).goodsDescription).toContain(
      String(GOODS_DESCRIPTION_MAX_LENGTH),
    )
  })

  it('accepts an empty HS code and valid HS codes', () => {
    expect(validate({ hsCode: '' }).hsCode).toBeUndefined()
    expect(validate({ hsCode: '220600' }).hsCode).toBeUndefined()
    expect(validate({ hsCode: '2206001234' }).hsCode).toBeUndefined()
  })

  it('rejects invalid HS codes', () => {
    const message = 'HS code must contain 6 to 10 digits'

    expect(validate({ hsCode: '12345' }).hsCode).toBe(message)
    expect(validate({ hsCode: '12345678901' }).hsCode).toBe(message)
    expect(validate({ hsCode: '22060A' }).hsCode).toBe(message)
  })

  it('rejects notes longer than the maximum length', () => {
    const note = 'a'.repeat(NOTE_MAX_LENGTH + 1)

    expect(validate({ note }).note).toContain(String(NOTE_MAX_LENGTH))
  })

  it('accepts a note with exactly the maximum length', () => {
    const note = 'a'.repeat(NOTE_MAX_LENGTH)

    expect(validate({ note }).note).toBeUndefined()
  })
})
