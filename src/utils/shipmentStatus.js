const STATUS_INFO = {
  PREPARING: { label: 'Preparing', tone: 'preparing' },
  CUSTOMS: { label: 'Customs', tone: 'customs' },
  IN_TRANSIT: { label: 'In Transit', tone: 'transit' },
  DELIVERED: { label: 'Delivered', tone: 'delivered' },
}

// Statuses in shipment lifecycle order, used by the status select
export const STATUS_OPTIONS = ['PREPARING', 'IN_TRANSIT', 'CUSTOMS', 'DELIVERED'].map((value) => ({
  value,
  label: STATUS_INFO[value].label,
}))

export function getStatusInfo(status) {
  return STATUS_INFO[status] ?? { label: status, tone: 'preparing' }
}
