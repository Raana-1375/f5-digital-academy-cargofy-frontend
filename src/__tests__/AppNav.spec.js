import { beforeEach, describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { h } from 'vue'
import AppNav from '@/components/AppNav.vue'
import { useAuthStore } from '@/stores/auth'

const stub = { render: () => h('div') }

async function mountNav(role) {
  const pinia = createPinia()
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/dashboard', component: stub },
      { path: '/shipments', component: stub },
      { path: '/shipments/new', component: stub },
      { path: '/account', component: stub },
      { path: '/login', component: stub },
    ],
  })
  router.push('/dashboard')
  await router.isReady()

  const auth = useAuthStore(pinia)
  auth.token = 'jwt-token'
  auth.user = { name: 'Alex', email: 'alex@company.com', role }
  localStorage.setItem('cargofy_token', 'jwt-token')
  localStorage.setItem('cargofy_user', JSON.stringify(auth.user))

  const wrapper = mount(AppNav, { global: { plugins: [pinia, router] } })
  return { wrapper, router, auth }
}

describe('AppNav', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the brand logo linking to the dashboard', async () => {
    const { wrapper } = await mountNav('CLIENT')
    const brand = wrapper.find('.app-nav__brand')

    expect(brand.attributes('href')).toBe('/dashboard')
    expect(brand.find('img').attributes('alt')).toBe('Cargofy')
  })

  it('hides the create shipment button from clients', async () => {
    const { wrapper } = await mountNav('CLIENT')

    expect(wrapper.find('.app-nav__fab').exists()).toBe(false)
  })

  it('shows the create shipment button to operators', async () => {
    const { wrapper } = await mountNav('OPERATOR')

    expect(wrapper.find('.app-nav__fab').attributes('href')).toBe('/shipments/new')
  })

  it('signs the user out and goes to the sign in page', async () => {
    const { wrapper, router, auth } = await mountNav('CLIENT')

    await wrapper.find('.app-nav__button').trigger('click')
    await flushPromises()

    expect(auth.isAuthenticated).toBe(false)
    expect(auth.user).toBeNull()
    expect(localStorage.getItem('cargofy_token')).toBeNull()
    expect(localStorage.getItem('cargofy_user')).toBeNull()
    expect(router.currentRoute.value.path).toBe('/login')
  })
})
