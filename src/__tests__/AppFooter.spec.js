import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { h } from 'vue'
import AppFooter from '@/components/AppFooter.vue'

const stub = { render: () => h('div') }

async function mountFooter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/dashboard', component: stub },
      { path: '/shipments', component: stub },
      { path: '/account', component: stub },
    ],
  })
  router.push('/dashboard')
  await router.isReady()

  return mount(AppFooter, { global: { plugins: [router] } })
}

describe('AppFooter', () => {
  it('shows the brand and the short description', async () => {
    const wrapper = await mountFooter()

    expect(wrapper.text()).toContain('Cargofy')
    expect(wrapper.text()).toContain('International shipment tracking')
  })

  it('shows the contact information', async () => {
    const wrapper = await mountFooter()

    expect(wrapper.text()).toContain('Calle Comercio 42, Gijón')
    expect(wrapper.text()).toContain('Mon–Fri, 9:00–18:00')
    expect(wrapper.text()).toContain('support@cargofy.dev')
  })

  it('links to the main sections', async () => {
    const wrapper = await mountFooter()
    const hrefs = wrapper.findAll('nav a').map((link) => link.attributes('href'))

    expect(hrefs).toEqual(['/dashboard', '/shipments', '/account'])
  })

  it('shows the current year in the copyright line', async () => {
    const wrapper = await mountFooter()

    expect(wrapper.text()).toContain(`© ${new Date().getFullYear()} Cargofy`)
  })
})
