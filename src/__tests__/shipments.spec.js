import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { useShipmentsStore } from '@/stores/shipments'

const summary = { total: 25, preparing: 5, customs: 3, inTransit: 12, delivered: 5 }

function makeShipments(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    trackingNumber: `TRK-${i + 1}`,
  }))
}

function mockApi(list = []) {
  const fetchMock = vi.fn((url) => {
    const body = String(url).includes('/dashboard/summary') ? summary : list
    return Promise.resolve({
      ok: true,
      status: 200,
      json: async () => body,
      text: async () => JSON.stringify(body),
    })
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function lastUrl(fetchMock) {
  return String(fetchMock.mock.calls.at(-1)[0])
}

describe('shipments store', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
    setActivePinia(createPinia())
  })

  it('loads the shipments and the status counts on init', async () => {
    mockApi(makeShipments(3))
    const store = useShipmentsStore()

    await store.init()
    await flushPromises()

    expect(store.shipments).toHaveLength(3)
    expect(store.statusCounts.ALL).toBe(25)
    expect(store.statusCounts.IN_TRANSIT).toBe(12)
    expect(store.total).toBe(25)
  })

  it('sends the status filter and goes back to the first page', async () => {
    const fetchMock = mockApi(makeShipments(10))
    const store = useShipmentsStore()
    await store.init()
    await store.nextPage()
    expect(store.page).toBe(1)

    await store.setStatus('CUSTOMS')

    expect(store.page).toBe(0)
    expect(lastUrl(fetchMock)).toContain('status=CUSTOMS')
    expect(lastUrl(fetchMock)).toContain('page=0')
    expect(store.total).toBe(3)
  })

  it('sends the trimmed search text and hides the total', async () => {
    const fetchMock = mockApi(makeShipments(2))
    const store = useShipmentsStore()
    await store.init()
    await flushPromises()

    await store.setSearch('  trk-1  ')

    expect(lastUrl(fetchMock)).toContain('search=trk-1')
    expect(store.total).toBeNull()
  })

  it('only goes to the next page when the current page is full', async () => {
    const fetchMock = mockApi(makeShipments(3))
    const store = useShipmentsStore()
    await store.init()
    const callsBefore = fetchMock.mock.calls.length

    await store.nextPage()

    expect(store.hasNext).toBe(false)
    expect(store.page).toBe(0)
    expect(fetchMock.mock.calls.length).toBe(callsBefore)
  })

  it('moves between pages and never goes below the first page', async () => {
    mockApi(makeShipments(10))
    const store = useShipmentsStore()
    await store.init()

    await store.nextPage()
    expect(store.page).toBe(1)
    expect(store.rangeStart).toBe(11)
    expect(store.rangeEnd).toBe(20)

    await store.previousPage()
    await store.previousPage()
    expect(store.page).toBe(0)
  })

  it('stores the error message when loading fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server exploded' }),
        text: async () => JSON.stringify({ message: 'Server exploded' }),
      }),
    )
    const store = useShipmentsStore()

    await store.init()
    await flushPromises()

    expect(store.error).toBe('Server exploded')
    expect(store.loading).toBe(false)
  })
})
