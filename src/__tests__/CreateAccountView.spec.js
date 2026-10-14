import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { h } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'

import CreateAccountView from '../views/CreateAccountView.vue'

const authResponse = {
  token: 'jwt-token',
  email: 'alex@company.com',
  name: 'Alex Morgan',
  role: 'OPERATOR',
}

function mockFetch(ok, data) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      status: ok ? 201 : 400,
      json: () => Promise.resolve(data),
    }),
  )
}

async function mountView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', component: { render: () => h('div', 'Login page') } },
      { path: '/register', component: CreateAccountView },
      { path: '/dashboard', component: { render: () => h('div', 'Dashboard page') } },
    ],
  })
  router.push('/register')
  await router.isReady()

  const wrapper = mount(CreateAccountView, { global: { plugins: [createPinia(), router] } })
  return { wrapper, router }
}

async function fillForm(wrapper, values) {
  await wrapper.find('#fullName').setValue(values.fullName)
  await wrapper.find('#email').setValue(values.email)
  await wrapper.find('#companyName').setValue(values.companyName)
  await wrapper.find('#password').setValue(values.password)
  await wrapper.find('#confirmPassword').setValue(values.confirmPassword)
}

const validValues = {
  fullName: 'Alex Morgan',
  email: 'alex@company.com',
  companyName: '',
  password: 'password123',
  confirmPassword: 'password123',
}

describe('CreateAccountView', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders all the registration fields with the client role selected', async () => {
    const { wrapper } = await mountView()

    expect(wrapper.find('h1').text()).toBe('Create Account')
    expect(wrapper.find('#fullName').exists()).toBe(true)
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#companyName').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
    expect(wrapper.find('#confirmPassword').exists()).toBe(true)

    const cards = wrapper.findAll('.role-card')
    expect(cards).toHaveLength(2)
    expect(cards[0].classes()).toContain('selected')
    expect(cards[1].classes()).not.toContain('selected')
  })

  it('switches the selected role card', async () => {
    const { wrapper } = await mountView()

    await wrapper.findAll('input[type="radio"]')[1].setValue()

    const cards = wrapper.findAll('.role-card')
    expect(cards[1].classes()).toContain('selected')
    expect(cards[0].classes()).not.toContain('selected')
  })

  it('shows validation errors and does not call the API for an empty form', async () => {
    mockFetch(true, authResponse)
    const { wrapper } = await mountView()

    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('Full name is required')
    expect(wrapper.text()).toContain('Email is required')
    expect(wrapper.text()).toContain('Password is required')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('shows an error when the passwords do not match', async () => {
    mockFetch(true, authResponse)
    const { wrapper } = await mountView()

    await fillForm(wrapper, { ...validValues, confirmPassword: 'different123' })
    await wrapper.find('form').trigger('submit')

    expect(wrapper.text()).toContain('Passwords do not match')
    expect(fetch).not.toHaveBeenCalled()
  })

  it('shows the server error when the registration fails', async () => {
    mockFetch(false, { message: 'Email already in use' })
    const { wrapper } = await mountView()

    await fillForm(wrapper, validValues)
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.find('.server-error').text()).toBe('Email already in use')
  })

  it('sends the registration data and redirects to the dashboard', async () => {
    mockFetch(true, authResponse)
    const { wrapper, router } = await mountView()

    await fillForm(wrapper, validValues)
    await wrapper.findAll('input[type="radio"]')[1].setValue()
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const [url, options] = fetch.mock.calls[0]
    expect(url).toContain('/auth/register')
    expect(JSON.parse(options.body)).toEqual({
      name: 'Alex Morgan',
      email: 'alex@company.com',
      password: 'password123',
      role: 'OPERATOR',
      companyName: null,
    })
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })
})
