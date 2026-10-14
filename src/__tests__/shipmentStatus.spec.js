import { describe, it, expect } from 'vitest'

import { getStatusInfo } from '../utils/shipmentStatus'

describe('getStatusInfo', () => {
  it.each([
    ['PREPARING', 'Preparing', 'preparing'],
    ['CUSTOMS', 'Customs', 'customs'],
    ['IN_TRANSIT', 'In Transit', 'transit'],
    ['DELIVERED', 'Delivered', 'delivered'],
  ])('maps %s to a label and a tone', (status, label, tone) => {
    expect(getStatusInfo(status)).toEqual({ label, tone })
  })

  it('falls back to the raw value for an unknown status', () => {
    expect(getStatusInfo('LOST')).toEqual({ label: 'LOST', tone: 'preparing' })
  })
})
