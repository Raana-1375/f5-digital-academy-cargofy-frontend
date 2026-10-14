import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { useAuthStore } from '../stores/auth'

const authResponse = {
  token: 'jwt-token',
  email: 'alex@company.com',
  name: 'Alex Morgan',
  role: 'CLIENT',
}

const registerDetails = {
  name: 'Alex Morgan',
  email: 'alex@company.com',
  password: 'password123',
  role: 'CLIENT',
  companyName: 'Acme Logistics',
}

function mockFetch(ok, data) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      status: ok ? 200 : 401,
      json: () => Promise.resolve(data),
    }),
  )
}

describe('auth store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('starts logged out', () => {
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBeNull()
  })

  it('stores the session after a successful login', async () => {
    mockFetch(true, authResponse)
    const auth = useAuthStore()

    await auth.login({ email: 'alex@company.com', password: 'password123' })

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.role).toBe('CLIENT')
    expect(auth.user.name).toBe('Alex Morgan')
    expect(localStorage.getItem('cargofy_token')).toBe('jwt-token')
  })

  it('throws and stays logged out when the login fails', async () => {
    mockFetch(false, { message: 'Invalid email or password' })
    const auth = useAuthStore()

    await expect(auth.login({ email: 'a@b.com', password: 'wrong' })).rejects.toThrow(
      'Invalid email or password',
    )
    expect(auth.isAuthenticated).toBe(false)
  })

  it('starts a session after a successful registration', async () => {
    mockFetch(true, authResponse)
    const auth = useAuthStore()

    await auth.register(registerDetails)

    expect(auth.isAuthenticated).toBe(true)
    expect(auth.user.email).toBe('alex@company.com')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('logs in after registration when the response has no token', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce({ ok: true, status: 201, json: () => Promise.resolve({}) })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(authResponse),
        }),
    )
    const auth = useAuthStore()

    await auth.register(registerDetails)

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(auth.isAuthenticated).toBe(true)
  })

  it('throws and stays logged out when the registration fails', async () => {
    mockFetch(false, { message: 'Email already in use' })
    const auth = useAuthStore()

    await expect(auth.register(registerDetails)).rejects.toThrow('Email already in use')
    expect(auth.isAuthenticated).toBe(false)
  })

  it('clears the session on logout', async () => {
    mockFetch(true, authResponse)
    const auth = useAuthStore()
    await auth.login({ email: 'alex@company.com', password: 'password123' })

    auth.logout()

    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBeNull()
    expect(localStorage.getItem('cargofy_token')).toBeNull()
  })
})
