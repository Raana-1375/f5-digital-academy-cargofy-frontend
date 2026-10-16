import { describe, it, expect, beforeEach, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { h } from 'vue'

import AccountView from '../views/AccountView.vue'

const currentUser = {
  id: 7,
  name: 'Test User',
  email: 'test@cargofy.com',
  role: 'CLIENT',
  companyName: 'Test Co',
}

const stub = { render: () => h('div') }

function jsonResponse(data, ok = true, status = 200) {
  return { ok, status, json: () => Promise.resolve(data) }
}

const noContentResponse = { ok: true, status: 204, json: () => Promise.reject(new Error('empty')) }

async function mountView(...responses) {
  const fetchMock = vi.fn()
  responses.forEach((response) => fetchMock.mockResolvedValueOnce(response))
  vi.stubGlobal('fetch', fetchMock)

  const pinia = createPinia()
  setActivePinia(pinia)
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/account', component: stub },
      { path: '/dashboard', component: stub },
      { path: '/shipments', component: stub },
      { path: '/shipments/new', component: stub },
      { path: '/login', component: stub },
    ],
  })
  router.push('/account')
  await router.isReady()

  const wrapper = mount(AccountView, { global: { plugins: [pinia, router] } })
  await flushPromises()
  return wrapper
}

function findButton(wrapper, label) {
  return wrapper.findAll('button').find((button) => button.text() === label)
}

describe('AccountView', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the current user in the profile form', async () => {
    const wrapper = await mountView(jsonResponse(currentUser))

    expect(wrapper.find('#name').element.value).toBe('Test User')
    expect(wrapper.find('#email').element.value).toBe('test@cargofy.com')
  })

  it('shows an error and loads again when retrying', async () => {
    const wrapper = await mountView(
      jsonResponse({ message: 'Boom' }, false, 500),
      jsonResponse(currentUser),
    )
    expect(wrapper.text()).toContain('Boom')

    await findButton(wrapper, 'Try again').trigger('click')
    await flushPromises()

    expect(wrapper.find('#name').element.value).toBe('Test User')
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('shows the company name on the company tab', async () => {
    const wrapper = await mountView(jsonResponse(currentUser))

    await findButton(wrapper, 'Company Info').trigger('click')

    expect(wrapper.find('#company').element.value).toBe('Test Co')
  })

  it('does not save an invalid email', async () => {
    const wrapper = await mountView(jsonResponse(currentUser))

    await wrapper.find('#email').setValue('abc')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Enter a valid email address')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('saves the profile and shows a confirmation', async () => {
    const updated = { ...currentUser, name: 'New Name' }
    const wrapper = await mountView(
      jsonResponse(currentUser),
      jsonResponse({ user: updated, token: 'new-token' }),
    )

    await wrapper.find('#name').setValue('New Name')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Changes saved')
    expect(fetch.mock.calls[1][0]).toContain('/users/7')
    expect(JSON.parse(fetch.mock.calls[1][1].body).name).toBe('New Name')
    expect(localStorage.getItem('cargofy_token')).toBe('new-token')
  })

  it('shows the backend error when saving fails', async () => {
    const wrapper = await mountView(
      jsonResponse(currentUser),
      jsonResponse({ message: 'Email already in use' }, false, 409),
    )

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Email already in use')
    expect(wrapper.text()).not.toContain('Changes saved')
  })

  it('rejects mismatched new passwords', async () => {
    const wrapper = await mountView(jsonResponse(currentUser))
    await findButton(wrapper, 'Change Password').trigger('click')

    await wrapper.find('#current-password').setValue('Test12345')
    await wrapper.find('#new-password').setValue('Newpass123')
    await wrapper.find('#confirm-password').setValue('Different123')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Passwords do not match')
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('changes the password and clears the fields', async () => {
    const wrapper = await mountView(jsonResponse(currentUser), noContentResponse)
    await findButton(wrapper, 'Change Password').trigger('click')

    await wrapper.find('#current-password').setValue('Test12345')
    await wrapper.find('#new-password').setValue('Newpass123')
    await wrapper.find('#confirm-password').setValue('Newpass123')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Password updated')
    expect(fetch.mock.calls[1][0]).toContain('/users/7/password')
    expect(wrapper.find('#current-password').element.value).toBe('')
    expect(wrapper.find('#new-password').element.value).toBe('')
  })

  it('shows the backend error when the current password is wrong', async () => {
    const wrapper = await mountView(
      jsonResponse(currentUser),
      jsonResponse({ message: 'Current password is incorrect' }, false, 400),
    )
    await findButton(wrapper, 'Change Password').trigger('click')

    await wrapper.find('#current-password').setValue('wrong')
    await wrapper.find('#new-password').setValue('Newpass123')
    await wrapper.find('#confirm-password').setValue('Newpass123')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Current password is incorrect')
    expect(wrapper.text()).not.toContain('Password updated')
  })
})
