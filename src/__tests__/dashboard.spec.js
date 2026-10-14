import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { useDashboardStore } from '../stores/dashboard'

const summary = {
  total: 128,
  preparing: 8,
  customs: 7,
  inTransit: 42,
  delivered: 71,
  recentShipments: [
    {
      id: 1,
      trackingNumber: 'CRG-89241',
      origin: 'Hamburg, DE',
      destination: 'New York, US',
      status: 'IN_TRANSIT',
      createdDate: '2024-10-24T10:30:00',
    },
  ],
}

function mockFetch(ok, data) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      status: ok ? 200 : 403,
      json: () => Promise.resolve(data),
    }),
  )
}

describe('dashboard store', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('starts empty', () => {
    const dashboard = useDashboardStore()

    expect(dashboard.summary).toBeNull()
    expect(dashboard.loading).toBe(false)
    expect(dashboard.recentShipments).toEqual([])
    expect(dashboard.needsCustomsAttention).toBe(false)
  })

  it('loads the summary from the API', async () => {
    mockFetch(true, summary)
    const dashboard = useDashboardStore()

    await dashboard.loadSummary()

    expect(fetch.mock.calls[0][0]).toContain('/dashboard/summary')
    expect(dashboard.summary.total).toBe(128)
    expect(dashboard.recentShipments).toHaveLength(1)
    expect(dashboard.loading).toBe(false)
    expect(dashboard.error).toBe('')
  })

  it('flags customs attention only when there are shipments in customs', async () => {
    mockFetch(true, summary)
    const dashboard = useDashboardStore()
    await dashboard.loadSummary()
    expect(dashboard.needsCustomsAttention).toBe(true)

    mockFetch(true, { ...summary, customs: 0 })
    await dashboard.loadSummary()
    expect(dashboard.needsCustomsAttention).toBe(false)
  })

  it('keeps the error message when the request fails', async () => {
    mockFetch(false, { message: 'Access denied' })
    const dashboard = useDashboardStore()

    await dashboard.loadSummary()

    expect(dashboard.error).toBe('Access denied')
    expect(dashboard.summary).toBeNull()
    expect(dashboard.loading).toBe(false)
  })
})
