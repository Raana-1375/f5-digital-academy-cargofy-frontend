import { request } from './api'

export function fetchDashboardSummary() {
  return request('/dashboard/summary')
}
