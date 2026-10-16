import { request } from '@/services/api'

// role: 'CLIENT' or 'OPERATOR'. Only operators and admins can call this endpoint.
export function fetchUsersByRole(role) {
  return request(`/users?role=${role}`)
}

// Returns the authenticated user: { id, name, email, role, companyName }
export function fetchCurrentUser() {
  return request('/users/me')
}

// Returns { user, token }. The token is new because the email may have changed.
export function updateProfile(id, { name, email, companyName }) {
  return request(`/users/${id}`, {
    method: 'PUT',
    body: { name, email, companyName },
  })
}

// Returns nothing (204). Fails if the current password is wrong or the new one is the same.
export function changePassword(id, { currentPassword, newPassword }) {
  return request(`/users/${id}/password`, {
    method: 'PUT',
    body: { currentPassword, newPassword },
  })
}
