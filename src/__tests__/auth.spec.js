import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { useAuthStore } from '../stores/auth'

const authResponse = {
  token: 'jwt-token',
  email: 'alex@company.com',
  name: 'Alex Morgan',
  role: 'CLIENT',
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
