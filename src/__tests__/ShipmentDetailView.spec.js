import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { h } from 'vue'
import ShipmentDetailView from '@/views/ShipmentDetailView.vue'

const stub = { render: () => h('div') }

const permissions = vi.hoisted(() => ({ staff: false }))

vi.mock('@/composables/usePermissions', async () => {
  const { computed } = await import('vue')
  return {
    usePermissions: () => ({
      canCreateShipment: computed(() => permissions.staff),
      canUpdateStatus: computed(() => permissions.staff),
    }),
  }
})

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

function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return {
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  }
}

function mockFetch(body, { ok = true, status = 200 } = {}) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(body, { ok, status })))
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
    permissions.staff = false
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

  it('hides the Update Status button from clients', async () => {
    mockFetch(detail)
    const wrapper = await mountDetail()

    expect(wrapper.find('.detail__update').exists()).toBe(false)
  })

  it('shows the Update Status button to operators and admins', async () => {
    permissions.staff = true
    mockFetch(detail)
    const wrapper = await mountDetail()

    expect(wrapper.find('.detail__update').text()).toBe('Update Status')
  })

  it('opens the status form and closes it on cancel', async () => {
    permissions.staff = true
    mockFetch(detail)
    const wrapper = await mountDetail()

    await wrapper.find('.detail__update').trigger('click')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)

    await wrapper.find('.btn--secondary').trigger('click')
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('updates the status and closes the form after confirming', async () => {
    permissions.staff = true
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(detail))
      .mockResolvedValueOnce(jsonResponse({ id: 7 }))
      .mockResolvedValueOnce(jsonResponse({ ...detail, status: 'DELIVERED' }))
    vi.stubGlobal('fetch', fetchMock)
    const wrapper = await mountDetail()

    await wrapper.find('.detail__update').trigger('click')
    await wrapper.find('select').setValue('DELIVERED')
    await wrapper.find('textarea').setValue('Arrived')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      status: 'DELIVERED',
      note: 'Arrived',
    })
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
    expect(wrapper.find('.badge').text()).toBe('Delivered')
  })

  it('keeps the form open and shows the error when the update fails', async () => {
    permissions.staff = true
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(detail))
      .mockResolvedValueOnce(jsonResponse({ message: 'Access denied' }, { ok: false, status: 403 }))
    vi.stubGlobal('fetch', fetchMock)
    const wrapper = await mountDetail()

    await wrapper.find('.detail__update').trigger('click')
    await wrapper.find('select').setValue('DELIVERED')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
    expect(wrapper.find('.modal__error').text()).toBe('Access denied')
  })
})
