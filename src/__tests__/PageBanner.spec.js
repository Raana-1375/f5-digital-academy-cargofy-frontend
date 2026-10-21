import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PageBanner from '@/components/PageBanner.vue'

describe('PageBanner', () => {
  it('shows the title and the subtitle', () => {
    const wrapper = mount(PageBanner, {
      props: { title: 'Shipments', subtitle: 'Global multi-modal active freight' },
    })

    expect(wrapper.find('h1').text()).toBe('Shipments')
    expect(wrapper.text()).toContain('Global multi-modal active freight')
  })

  it('omits the subtitle when none is given', () => {
    const wrapper = mount(PageBanner, { props: { title: 'Shipments' } })

    expect(wrapper.find('.page-banner__subtitle').exists()).toBe(false)
  })

  it('renders extra content passed in the slot', () => {
    const wrapper = mount(PageBanner, {
      props: { title: 'Shipments' },
      slots: { default: '<button type="button">+ New Shipment</button>' },
    })

    expect(wrapper.find('button').text()).toBe('+ New Shipment')
  })
})
