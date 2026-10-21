import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { h } from 'vue'
import NewShipmentView from '@/views/NewShipmentView.vue'

const stub = { render: () => h('div') }

const clients = [{ id: 1, name: 'Acme Buyer', companyName: 'Acme' }]
const operators = [{ id: 2, name: 'Marta', companyName: null }]

function jsonResponse(body, { ok = true, status = 200 } = {}) {
  return Promise.resolve({
    ok,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  })
}

function mockApi({ createResponse } = {}) {
  const fetchMock = vi.fn((url, options) => {
    if (options?.method === 'POST') {
      return createResponse ?? jsonResponse({ id: 42 })
    }
    if (String(url).includes('role=CLIENT')) return jsonResponse(clients)
    if (String(url).includes('role=OPERATOR')) return jsonResponse(operators)
    return jsonResponse([])
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function postCalls(fetchMock) {
  return fetchMock.mock.calls.filter(([, options]) => options?.method === 'POST')
}

async function mountForm() {
  const pinia = createPinia()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/shipments/new', component: NewShipmentView },
      { path: '/shipments/:id', component: stub },
      { path: '/shipments', component: stub },
      { path: '/dashboard', component: stub },
      { path: '/account', component: stub },
    ],
  })
  router.push('/shipments/new')
  await router.isReady()

  const wrapper = mount(NewShipmentView, { global: { plugins: [pinia, router] } })
  await flushPromises()
  return { wrapper, router }
}

async function fillRequiredFields(wrapper) {
  await wrapper.find('#origin').setValue('Vigo, ES')
  await wrapper.find('#destination').setValue('Oslo, NO')
  await wrapper.find('#transportMode').setValue('SEA')
  await wrapper.find('#packageType').setValue('BOX')
  await wrapper.find('#quantity').setValue('10')
  await wrapper.find('#weightKg').setValue('250.5')
}

describe('NewShipmentView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('loads the client and operator options', async () => {
    mockApi()
    const { wrapper } = await mountForm()

    expect(wrapper.find('#client').text()).toContain('Acme Buyer – Acme')
    expect(wrapper.find('#operator').text()).toContain('Marta')
  })

  it('offers the transport modes and package types', async () => {
    mockApi()
    const { wrapper } = await mountForm()

    expect(wrapper.find('#transportMode').text()).toContain('Air')
    expect(wrapper.find('#transportMode').text()).toContain('Sea')
    expect(wrapper.find('#transportMode').text()).toContain('Road')
    expect(wrapper.find('#packageType').text()).toContain('Pallet')
    expect(wrapper.find('#packageType').text()).toContain('Box')
    expect(wrapper.find('#packageType').text()).toContain('Envelope')
  })

  it('shows required errors and does not send the request when the form is empty', async () => {
    const fetchMock = mockApi()
    const { wrapper } = await mountForm()

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Origin is required')
    expect(wrapper.text()).toContain('Destination is required')
    expect(wrapper.text()).toContain('Transport mode is required')
    expect(wrapper.text()).toContain('Package type is required')
    expect(wrapper.text()).toContain('Quantity is required')
    expect(wrapper.text()).toContain('Weight is required')
    expect(postCalls(fetchMock)).toHaveLength(0)
  })

  it('rejects notes that are too long without sending the request', async () => {
    const fetchMock = mockApi()
    const { wrapper } = await mountForm()
    await fillRequiredFields(wrapper)

    await wrapper.find('#note').setValue('a'.repeat(301))
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Notes must be at most 300 characters')
    expect(postCalls(fetchMock)).toHaveLength(0)
  })

  it('rejects an invalid HS code without sending the request', async () => {
    const fetchMock = mockApi()
    const { wrapper } = await mountForm()
    await fillRequiredFields(wrapper)

    await wrapper.find('#hsCode').setValue('123')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('HS code must contain 6 to 10 digits')
    expect(postCalls(fetchMock)).toHaveLength(0)
  })

  it('creates the shipment and redirects to its detail page', async () => {
    const fetchMock = mockApi()
    const { wrapper, router } = await mountForm()
    await fillRequiredFields(wrapper)
    await wrapper.find('#client').setValue('1')
    await wrapper.find('#operator').setValue('2')
    await wrapper.find('#delivery').setValue('2026-11-05')
    await wrapper.find('#goodsDescription').setValue('Bottled olive oil')
    await wrapper.find('#hsCode').setValue('220600')
    await wrapper.find('#dangerousGoods').setValue(true)
    await wrapper.find('#note').setValue('Handle with care')

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const calls = postCalls(fetchMock)
    expect(calls).toHaveLength(1)
    expect(JSON.parse(calls[0][1].body)).toEqual({
      origin: 'Vigo, ES',
      destination: 'Oslo, NO',
      clientId: 1,
      assignedOperatorId: 2,
      estimatedDelivery: '2026-11-05T00:00:00',
      transportMode: 'SEA',
      packageType: 'BOX',
      quantity: 10,
      weightKg: 250.5,
      goodsDescription: 'Bottled olive oil',
      dangerousGoods: true,
      hsCode: '220600',
      note: 'Handle with care',
    })
    expect(router.currentRoute.value.fullPath).toBe('/shipments/42')
  })

  it('sends null for empty optional fields and false for dangerous goods', async () => {
    const fetchMock = mockApi()
    const { wrapper } = await mountForm()
    await fillRequiredFields(wrapper)

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const body = JSON.parse(postCalls(fetchMock)[0][1].body)
    expect(body.goodsDescription).toBeNull()
    expect(body.hsCode).toBeNull()
    expect(body.note).toBeNull()
    expect(body.estimatedDelivery).toBeNull()
    expect(body.dangerousGoods).toBe(false)
  })

  it('shows the server error message when creating fails', async () => {
    mockApi({
      createResponse: jsonResponse({ message: 'Client not found' }, { ok: false, status: 404 }),
    })
    const { wrapper } = await mountForm()
    await fillRequiredFields(wrapper)

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('.new__error').text()).toContain('Client not found')
  })

  it('links the cancel button back to the shipments list', async () => {
    mockApi()
    const { wrapper } = await mountForm()

    expect(wrapper.find('.btn--secondary').attributes('href')).toBe('/shipments')
  })
})
