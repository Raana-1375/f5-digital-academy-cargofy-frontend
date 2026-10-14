const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const TOKEN_KEY = 'cargofy_token'

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const options = { method, headers }
  if (body) {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_URL}${path}`, options)

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(data?.message || 'Something went wrong', response.status, data?.errors)
  }

  return data
}
