import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { h } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

import SignInView from '../views/SignInView.vue'

const authResponse = {
  token: 'jwt-token',
  email: 'alex@company.com',
  name: 'Alex Morgan',
  role: 'CLIENT',
}

function mockFetch(ok, data) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      status: ok ? 200 : 401,
      json: () => Promise.resolve(data),
    }),
  )
}

async function mountView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', component: SignInView },
      { path: '/register', component: { render: () => h('div', 'Register page') } },
      { path: '/dashboard', component: { render: () => h('div', 'Dashboard page') } },
    ],
  })
  router.push('/login')
  await router.isReady()

  const wrapper = mount(SignInView, { global: { plugins: [createPinia(), router] } })
  return { wrapper, router }
}

async function fillAndSubmit(wrapper, email, password) {
  await wrapper.find('#email').setValue(email)
  await wrapper.find('#password').setValue(password)
  await wrapper.find('form').trigger('submit')
  await flushPromises()
}

describe('SignInView', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the sign in form', async () => {
    const { wrapper } = await mountView()

    expect(wrapper.find('h1').text()).toBe('Sign In')
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toContain('Sign In')
  })

  it('shows validation errors and does not call the API for an empty form', async () => {
    mockFetch(true, authResponse)
    const { wrapper } = await mountView()

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('Email is required')
    expect(wrapper.text()).toContain('Password is required')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('toggles the password visibility', async () => {
    const { wrapper } = await mountView()
    const input = wrapper.find('#password')

    expect(input.attributes('type')).toBe('password')

    await wrapper.find('.toggle-password').trigger('click')
    expect(input.attributes('type')).toBe('text')

    await wrapper.find('.toggle-password').trigger('click')
    expect(input.attributes('type')).toBe('password')
  })

  it('shows the server error when the login fails', async () => {
    mockFetch(false, { message: 'Invalid email or password' })
    const { wrapper } = await mountView()

    await fillAndSubmit(wrapper, 'alex@company.com', 'wrong-password')

    expect(wrapper.find('.server-error').text()).toBe('Invalid email or password')
  })

  it('redirects to the dashboard after a successful login', async () => {
    mockFetch(true, authResponse)
    const { wrapper, router } = await mountView()

    await fillAndSubmit(wrapper, 'alex@company.com', 'password123')

    expect(router.currentRoute.value.path).toBe('/dashboard')
    expect(localStorage.getItem('cargofy_token')).toBe('jwt-token')
  })
})
