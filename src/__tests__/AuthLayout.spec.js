import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import AuthLayout from '@/components/AuthLayout.vue'

describe('AuthLayout', () => {
  it('renders the page content in the main column', () => {
    const wrapper = mount(AuthLayout, {
      slots: { default: '<section class="auth-card">Form</section>' },
    })

    expect(wrapper.find('.auth-main .auth-card').text()).toBe('Form')
  })

  it('shows the logistics showcase panel with the tagline', () => {
    const wrapper = mount(AuthLayout)
    const panel = wrapper.find('.auth-showcase')

    expect(panel.exists()).toBe(true)
    expect(panel.text()).toContain('tracked end to end')
  })
})
