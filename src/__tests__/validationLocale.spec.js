import { afterEach, describe, expect, it } from 'vitest'
import { validateNewShipment, validateSignIn } from '@/utils/validation'
import { setLocale } from '@/i18n'

describe('validation messages by language', () => {
  afterEach(() => setLocale('en'))

  it('returns English messages by default', () => {
    const errors = validateSignIn({ email: '', password: '' })

    expect(errors.email).toBe('Email is required')
    expect(errors.password).toBe('Password is required')
  })

  it('returns Spanish messages when the language is Spanish', () => {
    setLocale('es')

    const errors = validateSignIn({ email: '', password: '' })

    expect(errors.email).toBe('El correo electrónico es obligatorio')
    expect(errors.password).toBe('La contraseña es obligatoria')
  })

  it('fills in the limits of the messages with parameters', () => {
    setLocale('es')

    const errors = validateNewShipment({
      origin: 'A',
      destination: 'B',
      transportMode: 'AIR',
      packageType: 'BOX',
      quantity: 1,
      weightKg: 1,
      note: 'x'.repeat(301),
    })

    expect(errors.note).toBe('Las notas admiten como máximo 300 caracteres')
  })
})
