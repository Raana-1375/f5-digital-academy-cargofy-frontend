import { describe, it, expect } from 'vitest'

import { formatDate, formatFullDate } from '../utils/format'

describe('formatDate', () => {
  it('formats a date as month, day and year', () => {
    expect(formatDate('2024-10-24T10:30:00')).toBe('Oct 24, 2024')
  })

  it('returns an empty string when there is no date', () => {
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
  })
})

describe('formatFullDate', () => {
  it('includes the weekday', () => {
    expect(formatFullDate('2024-10-24T10:30:00')).toBe('Thursday, Oct 24, 2024')
  })

  it('uses the current date when no value is given', () => {
    expect(formatFullDate()).toMatch(/^\w+, \w{3} \d{1,2}, \d{4}$/)
  })
})
