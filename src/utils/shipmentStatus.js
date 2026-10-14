const STATUS_INFO = {
  PREPARING: { label: 'Preparing', tone: 'preparing' },
  CUSTOMS: { label: 'Customs', tone: 'customs' },
  IN_TRANSIT: { label: 'In Transit', tone: 'transit' },
  DELIVERED: { label: 'Delivered', tone: 'delivered' },
}

export function getStatusInfo(status) {
  return STATUS_INFO[status] ?? { label: status, tone: 'preparing' }
}
