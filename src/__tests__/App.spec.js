import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import App from '../App.vue'

describe('App', () => {
  it('renders the current route', async () => {
    const Home = { template: '<p>Home page</p>' }
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: Home }],
    })
    router.push('/')
    await router.isReady()

    const wrapper = mount(App, { global: { plugins: [router] } })
    expect(wrapper.text()).toContain('Home page')
  })
})
