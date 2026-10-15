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

function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  }
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

  it('sends the new status and note, then reloads the shipment', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: 7 }))
      .mockResolvedValueOnce(jsonResponse({ ...detail, status: 'IN_TRANSIT' }))
    vi.stubGlobal('fetch', fetchMock)
    const store = useShipmentDetailStore()
    store.shipment = detail

    const updated = await store.updateStatus(7, { status: 'IN_TRANSIT', note: 'Left port' })

    expect(updated).toBe(true)
    expect(String(fetchMock.mock.calls[0][0])).toContain('/shipments/7/status')
    expect(fetchMock.mock.calls[0][1].method).toBe('POST')
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      status: 'IN_TRANSIT',
      note: 'Left port',
    })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(store.status).toBe('IN_TRANSIT')
    expect(store.updating).toBe(false)
    expect(store.updateError).toBe('')
  })

  it('keeps the shipment visible while it reloads after an update', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ id: 7 }))
      .mockResolvedValueOnce(jsonResponse(detail))
    vi.stubGlobal('fetch', fetchMock)
    const store = useShipmentDetailStore()
    store.shipment = detail

    await store.updateStatus(7, { status: 'DELIVERED', note: '' })

    expect(store.loading).toBe(false)
    expect(store.shipment).not.toBeNull()
  })

  it('returns false and stores the error when the update fails', async () => {
    const fetchMock = mockFetch({ message: 'Access denied' }, { ok: false, status: 403 })
    const store = useShipmentDetailStore()
    store.shipment = detail

    const updated = await store.updateStatus(7, { status: 'DELIVERED', note: '' })

    expect(updated).toBe(false)
    expect(store.updateError).toBe('Access denied')
    expect(store.updating).toBe(false)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
