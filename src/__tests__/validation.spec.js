import { describe, it, expect } from 'vitest'
import { isValidEmail, isValidPassword, validateSignIn, validateSignUp } from '../utils/validation'

describe('isValidEmail', () => {
  it('accepts a valid email', () => {
    expect(isValidEmail('name@company.com')).toBe(true)
  })

  it('rejects an email without domain', () => {
    expect(isValidEmail('name@')).toBe(false)
  })
})

describe('isValidPassword', () => {
  it('accepts a password with 8 characters', () => {
    expect(isValidPassword('12345678')).toBe(true)
  })

  it('rejects a password shorter than 8 characters', () => {
    expect(isValidPassword('1234567')).toBe(false)
  })
})

describe('validateSignIn', () => {
  it('returns no errors for valid data', () => {
    expect(validateSignIn({ email: 'name@company.com', password: 'secret' })).toEqual({})
  })

  it('returns errors for empty fields', () => {
    const errors = validateSignIn({ email: '', password: '' })
    expect(errors.email).toBe('Email is required')
    expect(errors.password).toBe('Password is required')
  })
})

describe('validateSignUp', () => {
  const validData = {
    fullName: 'Alex Morgan',
    email: 'alex@company.com',
    password: 'password123',
    confirmPassword: 'password123',
    role: 'CLIENT',
  }

  it('returns no errors for valid data', () => {
    expect(validateSignUp(validData)).toEqual({})
  })

  it('requires a full name and a role', () => {
    const errors = validateSignUp({ ...validData, fullName: ' ', role: '' })
    expect(errors.fullName).toBe('Full name is required')
    expect(errors.role).toBe('Select your role')
  })

  it('rejects a short password', () => {
    const errors = validateSignUp({ ...validData, password: 'short', confirmPassword: 'short' })
    expect(errors.password).toBe('Password must be at least 8 characters')
  })

  it('rejects mismatched passwords', () => {
    const errors = validateSignUp({ ...validData, confirmPassword: 'different123' })
    expect(errors.confirmPassword).toBe('Passwords do not match')
  })
})
