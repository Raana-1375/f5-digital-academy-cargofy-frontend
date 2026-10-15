import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import UpdateStatusModal from '@/components/UpdateStatusModal.vue'

function mountModal(props = {}) {
  return mount(UpdateStatusModal, { props: { currentStatus: 'PREPARING', ...props } })
}

describe('UpdateStatusModal', () => {
  it('starts with the current status selected and Confirm disabled', () => {
    const wrapper = mountModal()

    expect(wrapper.find('select').element.value).toBe('PREPARING')
    expect(wrapper.find('.btn--primary').attributes('disabled')).toBeDefined()
  })

  it('lists every status option', () => {
    const wrapper = mountModal()
    const labels = wrapper.findAll('option').map((option) => option.text())

    expect(labels).toEqual(['Preparing', 'In Transit', 'Customs', 'Delivered'])
  })

  it('enables Confirm once a different status is selected', async () => {
    const wrapper = mountModal()

    await wrapper.find('select').setValue('IN_TRANSIT')

    expect(wrapper.find('.btn--primary').attributes('disabled')).toBeUndefined()
  })

  it('does not submit when the status has not changed', async () => {
    const wrapper = mountModal()

    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toBeUndefined()
  })

  it('emits submit with the new status and a trimmed note', async () => {
    const wrapper = mountModal()

    await wrapper.find('select').setValue('CUSTOMS')
    await wrapper.find('textarea').setValue('  Waiting for inspection  ')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([
      [{ status: 'CUSTOMS', note: 'Waiting for inspection' }],
    ])
  })

  it('allows submitting without a note', async () => {
    const wrapper = mountModal()

    await wrapper.find('select').setValue('DELIVERED')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.emitted('submit')).toEqual([[{ status: 'DELIVERED', note: '' }]])
  })

  it('shows how many characters the note has', async () => {
    const wrapper = mountModal()

    await wrapper.find('textarea').setValue('Hello')

    expect(wrapper.find('.field__counter').text()).toBe('5/300')
  })

  it('emits cancel from the Cancel button, the overlay and the Escape key', async () => {
    const wrapper = mountModal()

    await wrapper.find('.btn--secondary').trigger('click')
    await wrapper.find('.modal').trigger('click')
    await wrapper.find('.modal').trigger('keydown', { key: 'Escape' })

    expect(wrapper.emitted('cancel')).toHaveLength(3)
  })

  it('shows the error message', () => {
    const wrapper = mountModal({ error: 'Access denied' })

    expect(wrapper.find('[role="alert"]').text()).toBe('Access denied')
  })

  it('disables the buttons and shows progress while saving', () => {
    const wrapper = mountModal({ submitting: true })

    expect(wrapper.find('.btn--primary').text()).toBe('Saving...')
    expect(wrapper.find('.btn--primary').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.btn--secondary').attributes('disabled')).toBeDefined()
  })
})
