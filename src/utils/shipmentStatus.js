import i18n from '@/i18n'

const STATUS_TONES = {
  PREPARING: 'preparing',
  CUSTOMS: 'customs',
  IN_TRANSIT: 'transit',
  DELIVERED: 'delivered',
}

// Labels come from the i18n messages so they follow the selected language.
const STATUS_LABEL_KEYS = {
  PREPARING: 'status.preparing',
  CUSTOMS: 'status.customs',
  IN_TRANSIT: 'status.inTransit',
  DELIVERED: 'status.delivered',
}

export function getStatusInfo(status) {
  const key = STATUS_LABEL_KEYS[status]
  if (!key) return { label: status, tone: 'preparing' }

  return { label: i18n.global.t(key), tone: STATUS_TONES[status] }
}

// Statuses in shipment lifecycle order, used by the status select.
// The label is a getter so it is read again (in the current language) every time.
export const STATUS_OPTIONS = ['PREPARING', 'IN_TRANSIT', 'CUSTOMS', 'DELIVERED'].map((value) => ({
  value,
  get label() {
    return getStatusInfo(value).label
  },
}))
