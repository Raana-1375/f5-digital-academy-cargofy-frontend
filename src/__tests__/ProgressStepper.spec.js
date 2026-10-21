import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ProgressStepper from '@/components/ProgressStepper.vue'

function states(status) {
  const wrapper = mount(ProgressStepper, { props: { status } })
  return wrapper.findAll('.stepper__step').map((step) => {
    if (step.classes('stepper__step--done')) return 'done'
    if (step.classes('stepper__step--current')) return 'current'
    return 'upcoming'
  })
}

describe('ProgressStepper', () => {
  it('shows the four lifecycle steps in order', () => {
    const wrapper = mount(ProgressStepper, { props: { status: 'PREPARING' } })
    const labels = wrapper.findAll('.stepper__label').map((label) => label.text())

    expect(labels).toEqual(['Preparing', 'In Transit', 'Customs', 'Delivered'])
  })

  it('marks the first step as current when preparing', () => {
    expect(states('PREPARING')).toEqual(['current', 'upcoming', 'upcoming', 'upcoming'])
  })

  it('marks earlier steps as done when in transit', () => {
    expect(states('IN_TRANSIT')).toEqual(['done', 'current', 'upcoming', 'upcoming'])
  })

  it('marks the customs step as current', () => {
    expect(states('CUSTOMS')).toEqual(['done', 'done', 'current', 'upcoming'])
  })

  it('marks every step as done when delivered', () => {
    expect(states('DELIVERED')).toEqual(['done', 'done', 'done', 'done'])
  })

  it('flags the current step for assistive technology', () => {
    const wrapper = mount(ProgressStepper, { props: { status: 'CUSTOMS' } })
    const current = wrapper.findAll('[aria-current="step"]')

    expect(current).toHaveLength(1)
    expect(current[0].text()).toContain('Customs')
  })
})
