import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { h } from 'vue'
import DashboardView from '@/views/DashboardView.vue'
import { useAuthStore } from '@/stores/auth'

const stub = { render: () => h('div') }

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/dashboard', component: DashboardView },
      { path: '/shipments', component: stub },
      { path: '/shipments/new', component: stub },
      { path: '/shipments/:id', component: stub },
      { path: '/account', component: stub },
    ],
  })
}

function mockSummary(summary) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => summary,
      text: async () => JSON.stringify(summary),
    }),
  )
}

async function mountDashboard() {
  const pinia = createPinia()
  const auth = useAuthStore(pinia)
  auth.user = { name: 'Rana Test', email: 'rana@test.com', role: 'CLIENT' }

  const router = createTestRouter()
  router.push('/dashboard')
  await router.isReady()

  const wrapper = mount(DashboardView, { global: { plugins: [pinia, router] } })
  await flushPromises()
  return wrapper
}

const baseSummary = {
  total: 5,
  preparing: 1,
  customs: 1,
  inTransit: 2,
  delivered: 1,
  recentShipments: [
    {
      id: 1,
      trackingNumber: 'CGF-0001',
      origin: 'Madrid',
      destination: 'Shanghai',
      status: 'IN_TRANSIT',
      createdDate: '2026-10-10T10:00:00',
    },
  ],
}

describe('DashboardView', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllGlobals()
  })

  it('shows the welcome message with the user name', async () => {
    mockSummary(baseSummary)
    const wrapper = await mountDashboard()

    expect(wrapper.text()).toContain('Welcome, Rana Test')
  })

  it('shows the summary counts in the stat cards', async () => {
    mockSummary(baseSummary)
    const wrapper = await mountDashboard()
    const values = wrapper.findAll('.stat-card__value').map((el) => el.text())
    const labels = wrapper.findAll('.stat-card__label').map((el) => el.text())

    expect(labels).toEqual([
      'Total Shipments',
      'Preparing',
      'In Transit',
      'In Customs',
      'Delivered',
    ])
    expect(values).toEqual(['5', '1', '2', '1', '1'])
  })

  it('shows the Action badge only when shipments are in customs', async () => {
    mockSummary(baseSummary)
    const withCustoms = await mountDashboard()
    expect(withCustoms.find('.stat-card__badge').exists()).toBe(true)

    mockSummary({ ...baseSummary, customs: 0 })
    const withoutCustoms = await mountDashboard()
    expect(withoutCustoms.find('.stat-card__badge').exists()).toBe(false)
  })

  it('renders the recent shipments', async () => {
    mockSummary(baseSummary)
    const wrapper = await mountDashboard()

    expect(wrapper.text()).toContain('CGF-0001')
    expect(wrapper.text()).toContain('Madrid → Shanghai')
    expect(wrapper.text()).toContain('In Transit')
  })

  it('shows an empty message when there are no shipments', async () => {
    mockSummary({ ...baseSummary, total: 0, recentShipments: [] })
    const wrapper = await mountDashboard()

    expect(wrapper.text()).toContain('No shipments yet.')
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
    const wrapper = await mountDashboard()

    expect(wrapper.find('[role="alert"]').text()).toContain('Server exploded')
    expect(wrapper.find('[role="alert"] button').exists()).toBe(true)
  })
})
