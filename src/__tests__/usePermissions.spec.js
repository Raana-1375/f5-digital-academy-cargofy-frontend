import { describe, it, expect, vi } from 'vitest'
import { usePermissions } from '@/composables/usePermissions'

const mockAuth = vi.hoisted(() => ({ role: null }))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => mockAuth,
}))

describe('usePermissions', () => {
  it.each(['OPERATOR', 'ADMIN'])('allows %s to create shipments and update status', (role) => {
    mockAuth.role = role
    const { canCreateShipment, canUpdateStatus } = usePermissions()

    expect(canCreateShipment.value).toBe(true)
    expect(canUpdateStatus.value).toBe(true)
  })

  it('does not allow CLIENT to create shipments or update status', () => {
    mockAuth.role = 'CLIENT'
    const { canCreateShipment, canUpdateStatus } = usePermissions()

    expect(canCreateShipment.value).toBe(false)
    expect(canUpdateStatus.value).toBe(false)
  })

  it('does not allow anyone without a role', () => {
    mockAuth.role = null
    const { canCreateShipment, canUpdateStatus } = usePermissions()

    expect(canCreateShipment.value).toBe(false)
    expect(canUpdateStatus.value).toBe(false)
  })
})
