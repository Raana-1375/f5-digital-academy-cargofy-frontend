import { describe, expect, it } from 'vitest'
import { NOTE_MAX_LENGTH, validateNewShipment } from '@/utils/validation'

describe('validateNewShipment', () => {
  it('returns no errors for valid data', () => {
    const errors = validateNewShipment({ origin: 'Vigo, ES', destination: 'Oslo, NO', note: '' })

    expect(errors).toEqual({})
  })

  it('requires an origin', () => {
    const errors = validateNewShipment({ origin: '   ', destination: 'Oslo, NO', note: '' })

    expect(errors.origin).toBe('Origin is required')
    expect(errors.destination).toBeUndefined()
  })

  it('requires a destination', () => {
    const errors = validateNewShipment({ origin: 'Vigo, ES', destination: '', note: '' })

    expect(errors.destination).toBe('Destination is required')
  })

  it('rejects notes longer than the maximum length', () => {
    const note = 'a'.repeat(NOTE_MAX_LENGTH + 1)
    const errors = validateNewShipment({ origin: 'Vigo, ES', destination: 'Oslo, NO', note })

    expect(errors.note).toContain(String(NOTE_MAX_LENGTH))
  })

  it('accepts a note with exactly the maximum length', () => {
    const note = 'a'.repeat(NOTE_MAX_LENGTH)
    const errors = validateNewShipment({ origin: 'Vigo, ES', destination: 'Oslo, NO', note })

    expect(errors.note).toBeUndefined()
  })
})
