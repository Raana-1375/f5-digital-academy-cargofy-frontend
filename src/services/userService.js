import { request } from '@/services/api'

// role: 'CLIENT' or 'OPERATOR'. Only operators and admins can call this endpoint.
export function fetchUsersByRole(role) {
  return request(`/users?role=${role}`)
}
