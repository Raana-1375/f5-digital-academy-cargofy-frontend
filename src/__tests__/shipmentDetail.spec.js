import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useShipmentDetailStore } from '@/stores/shipmentDetail'

const detail = {
  id: 7,
  trackingNumber: 'TRK-123',
  origin: 'Madrid',
  destination: 'Oslo',
  clientName: 'Acme',
  assignedOperatorName: 'Marta',
  history: [
    {
      status: 'CUSTOMS',
      updatedDate: '2026-10-12T10:00:00',
      updatedByName: 'Marta',
      note: 'Cleared',
    },
    { status: 'PREPARING', updatedDate: '2026-10-10T09:00:00', updatedByName: 'Marta', note: null },
  ],
}

function mockFetch(body, { ok = true, status = 200 } = {}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

describe('shipment detail store', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
    setActivePinia(createPinia())
  })

  it('loads the shipment detail by id', async () => {
    const fetchMock = mockFetch(detail)
    const store = useShipmentDetailStore()

    await store.loadShipment(7)

    expect(String(fetchMock.mock.calls[0][0])).toContain('/shipments/7')
    expect(store.shipment.trackingNumber).toBe('TRK-123')
    expect(store.loading).toBe(false)
  })

  it('returns the history in chronological order', async () => {
    mockFetch(detail)
    const store = useShipmentDetailStore()

    await store.loadShipment(7)

    expect(store.history.map((entry) => entry.status)).toEqual(['PREPARING', 'CUSTOMS'])
  })

  it('uses the status from the API when it is present', async () => {
    mockFetch({ ...detail, status: 'IN_TRANSIT' })
    const store = useShipmentDetailStore()

    await store.loadShipment(7)

    expect(store.status).toBe('IN_TRANSIT')
  })

  it('falls back to the latest history status when the API has none', async () => {
    mockFetch(detail)
    const store = useShipmentDetailStore()

    await store.loadShipment(7)

    expect(store.status).toBe('CUSTOMS')
  })

  it('stores the error message when loading fails', async () => {
    mockFetch({ message: 'Shipment not found' }, { ok: false, status: 404 })
    const store = useShipmentDetailStore()

    await store.loadShipment(99)

    expect(store.error).toBe('Shipment not found')
    expect(store.shipment).toBeNull()
    expect(store.loading).toBe(false)
  })
})
