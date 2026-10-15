import { request } from '@/services/api'

export function fetchShipments({ status, search, page = 0, size = 10 } = {}) {
  const params = new URLSearchParams({ page, size })
  if (status) params.set('status', status)
  if (search) params.set('search', search)
  return request(`/shipments?${params}`)
}

export function fetchShipmentDetail(id) {
  return request(`/shipments/${id}`)
}

export function createShipment(payload) {
  return request('/shipments', { method: 'POST', body: payload })
}
