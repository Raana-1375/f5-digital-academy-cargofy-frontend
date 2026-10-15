import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { h } from 'vue'
import ShipmentDetailView from '@/views/ShipmentDetailView.vue'

const stub = { render: () => h('div') }

const detail = {
  id: 7,
  trackingNumber: 'TRK-123',
  origin: 'Madrid',
  destination: 'Oslo',
  createdDate: '2026-10-10T09:00:00',
  estimatedDelivery: '2026-10-29T12:00:00',
  clientName: 'Acme',
  assignedOperatorName: 'Marta',
  note: null,
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
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      status,
      json: async () => body,
      text: async () => JSON.stringify(body),
    }),
  )
}

async function mountDetail() {
  const pinia = createPinia()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/shipments/:id', component: ShipmentDetailView },
      { path: '/shipments', component: stub },
      { path: '/shipments/new', component: stub },
      { path: '/dashboard', component: stub },
      { path: '/account', component: stub },
    ],
  })
  router.push('/shipments/7')
  await router.isReady()

  const wrapper = mount(ShipmentDetailView, { global: { plugins: [pinia, router] } })
  await flushPromises()
  return wrapper
}

describe('ShipmentDetailView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('shows the shipment information', async () => {
    mockFetch(detail)
    const wrapper = await mountDetail()
    const text = wrapper.text()

    expect(text).toContain('TRK-123')
    expect(text).toContain('Madrid')
    expect(text).toContain('Oslo')
    expect(text).toContain('Acme')
    expect(text).toContain('Marta')
    expect(text).toContain('Oct 29, 2026')
  })

  it('shows the status history in chronological order with notes', async () => {
    mockFetch(detail)
    const wrapper = await mountDetail()
    const items = wrapper.findAll('.timeline__item')

    expect(items).toHaveLength(2)
    expect(items[0].text()).toContain('Preparing')
    expect(items[1].text()).toContain('Customs')
    expect(items[1].text()).toContain('Cleared')
  })

  it('marks the latest status as current', async () => {
    mockFetch(detail)
    const wrapper = await mountDetail()
    const badges = wrapper.findAll('.timeline__badge')

    expect(badges).toHaveLength(1)
    expect(wrapper.findAll('.timeline__item')[1].text()).toContain('Current')
  })

  it('shows the latest status as the shipment status', async () => {
    mockFetch(detail)
    const wrapper = await mountDetail()

    expect(wrapper.find('.badge').text()).toBe('Customs')
  })

  it('shows a dash when the client and operator are missing', async () => {
    mockFetch({ ...detail, clientName: null, assignedOperatorName: null })
    const wrapper = await mountDetail()
    const values = wrapper.findAll('.info__row dd').map((el) => el.text())

    expect(values[0]).toBe('—')
    expect(values[1]).toBe('—')
  })

  it('links back to the shipments list', async () => {
    mockFetch(detail)
    const wrapper = await mountDetail()

    expect(wrapper.find('.detail__back').attributes('href')).toBe('/shipments')
  })

  it('shows an error message and a retry button when loading fails', async () => {
    mockFetch({ message: 'Shipment not found' }, { ok: false, status: 404 })
    const wrapper = await mountDetail()

    expect(wrapper.find('[role="alert"]').text()).toContain('Shipment not found')
    expect(wrapper.find('[role="alert"] button').exists()).toBe(true)
  })
})
