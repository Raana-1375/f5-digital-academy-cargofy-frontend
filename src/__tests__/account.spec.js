import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { useAccountStore } from '../stores/account'
import { useAuthStore } from '../stores/auth'

const currentUser = {
  id: 7,
  name: 'Test User',
  email: 'test@cargofy.com',
  role: 'CLIENT',
  companyName: 'Test Co',
}

function jsonResponse(data, ok = true, status = 200) {
  return { ok, status, json: () => Promise.resolve(data) }
}

describe('account store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('loads the current user', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(currentUser)))
    const account = useAccountStore()

    await account.loadProfile()

    expect(account.profile).toEqual(currentUser)
    expect(account.loadError).toBe('')
    expect(account.loading).toBe(false)
  })

  it('stores an error when the user cannot be loaded', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ message: 'Boom' }, false, 500)))
    const account = useAccountStore()

    await account.loadProfile()

    expect(account.profile).toBeNull()
    expect(account.loadError).toBe('Boom')
    expect(account.loading).toBe(false)
  })

  it('saves the profile and refreshes the auth session', async () => {
    const updated = { ...currentUser, name: 'New Name', email: 'new@cargofy.com' }
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(currentUser))
        .mockResolvedValueOnce(jsonResponse({ user: updated, token: 'new-token' })),
    )
    const account = useAccountStore()
    await account.loadProfile()

    const ok = await account.saveProfile({
      name: 'New Name',
      email: 'new@cargofy.com',
      companyName: 'Test Co',
    })

    expect(ok).toBe(true)
    expect(account.profile.name).toBe('New Name')
    expect(useAuthStore().token).toBe('new-token')
    expect(localStorage.getItem('cargofy_token')).toBe('new-token')
    expect(fetch.mock.calls[1][0]).toContain('/users/7')
    expect(fetch.mock.calls[1][1].method).toBe('PUT')
  })

  it('returns false and stores the error when saving the profile fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(currentUser))
        .mockResolvedValueOnce(jsonResponse({ message: 'Email already in use' }, false, 409)),
    )
    const account = useAccountStore()
    await account.loadProfile()

    const ok = await account.saveProfile({
      name: 'Test User',
      email: 'taken@cargofy.com',
      companyName: 'Test Co',
    })

    expect(ok).toBe(false)
    expect(account.saveError).toBe('Email already in use')
    expect(account.saving).toBe(false)
  })

  it('changes the password', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(currentUser))
        .mockResolvedValueOnce({ ok: true, status: 204, json: () => Promise.reject(new Error()) }),
    )
    const account = useAccountStore()
    await account.loadProfile()

    const ok = await account.savePassword({
      currentPassword: 'Test12345',
      newPassword: 'Newpass123',
    })

    expect(ok).toBe(true)
    expect(fetch.mock.calls[1][0]).toContain('/users/7/password')
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({
      currentPassword: 'Test12345',
      newPassword: 'Newpass123',
    })
  })

  it('returns false and stores the error when the current password is wrong', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(jsonResponse(currentUser))
        .mockResolvedValueOnce(
          jsonResponse({ message: 'Current password is incorrect' }, false, 400),
        ),
    )
    const account = useAccountStore()
    await account.loadProfile()

    const ok = await account.savePassword({ currentPassword: 'wrong', newPassword: 'Newpass123' })

    expect(ok).toBe(false)
    expect(account.saveError).toBe('Current password is incorrect')
  })

  it('clears the save error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ message: 'Boom' }, false, 500)))
    const account = useAccountStore()
    await account.loadProfile()
    account.saveError = 'Something failed'

    account.clearSaveError()

    expect(account.saveError).toBe('')
  })
})
