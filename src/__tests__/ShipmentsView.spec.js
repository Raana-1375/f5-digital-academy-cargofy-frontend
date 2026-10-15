import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { h } from 'vue'
import ShipmentsView from '@/views/ShipmentsView.vue'

const stub = { render: () => h('div') }
const summary = { total: 25, preparing: 5, customs: 3, inTransit: 12, delivered: 5 }

function makeShipments(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    trackingNumber: `TRK-${i + 1}`,
    origin: 'Madrid',
    destination: 'Oslo',
    status: 'PREPARING',
    createdDate: '2026-10-10T10:00:00',
    estimatedDelivery: null,
    clientName: 'Acme',
  }))
}

function mockApi(list) {
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

async function mountShipments() {
  const pinia = createPinia()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/shipments', component: ShipmentsView },
      { path: '/dashboard', component: stub },
      { path: '/shipments/new', component: stub },
      { path: '/shipments/:id', component: stub },
      { path: '/account', component: stub },
    ],
  })
  router.push('/shipments')
  await router.isReady()

  const wrapper = mount(ShipmentsView, { global: { plugins: [pinia, router] } })
  await flushPromises()
  return wrapper
}

describe('ShipmentsView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the shipments returned by the API', async () => {
    mockApi(makeShipments(2))
    const wrapper = await mountShipments()

    expect(wrapper.text()).toContain('TRK-1')
    expect(wrapper.text()).toContain('TRK-2')
    expect(wrapper.text()).toContain('Madrid')
  })

  it('shows the status counts in the filter tabs', async () => {
    mockApi(makeShipments(2))
    const wrapper = await mountShipments()
    const tabs = wrapper.findAll('.shipments__tab').map((tab) => tab.text())

    expect(tabs).toContain('All (25)')
    expect(tabs).toContain('Customs (3)')
  })

  it('filters by status when a tab is clicked', async () => {
    const fetchMock = mockApi(makeShipments(2))
    const wrapper = await mountShipments()

    await wrapper.findAll('.shipments__tab')[2].trigger('click')
    await flushPromises()

    expect(lastUrl(fetchMock)).toContain('status=CUSTOMS')
    expect(wrapper.findAll('.shipments__tab')[2].classes()).toContain('shipments__tab--active')
  })

  it('searches by tracking number after the user stops typing', async () => {
    const fetchMock = mockApi(makeShipments(1))
    const wrapper = await mountShipments()

    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    await wrapper.find('.shipments__search input').setValue('trk-1')
    vi.advanceTimersByTime(300)
    vi.useRealTimers()
    await flushPromises()

    expect(lastUrl(fetchMock)).toContain('search=trk-1')
  })

  it('shows an empty message when there are no shipments', async () => {
    mockApi([])
    const wrapper = await mountShipments()

    expect(wrapper.text()).toContain('No shipments found.')
  })

  it('disables Previous on the first page and enables Next on a full page', async () => {
    mockApi(makeShipments(10))
    const wrapper = await mountShipments()
    const [previous, next] = wrapper.findAll('.shipments__pager button')

    expect(previous.attributes('disabled')).toBeDefined()
    expect(next.attributes('disabled')).toBeUndefined()
    expect(wrapper.text()).toContain('Showing 1-10 of 25 shipments')
  })

  it('shows an error message and a retry button when loading fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server exploded' }),
        text: async () => JSON.stringify({ message: 'Server exploded' }),
      }),
    )
    const wrapper = await mountShipments()

    expect(wrapper.find('[role="alert"]').text()).toContain('Server exploded')
    expect(wrapper.find('[role="alert"] button').exists()).toBe(true)
  })
})
