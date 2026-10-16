import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { request, TOKEN_KEY } from '../services/api'

const USER_KEY = 'cargofy_user'

function loadUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem(TOKEN_KEY))
  const user = ref(loadUser())

  const isAuthenticated = computed(() => !!token.value)
  const role = computed(() => user.value?.role ?? null)

  function setSession(authResponse) {
    token.value = authResponse.token
    user.value = {
      email: authResponse.email,
      name: authResponse.name,
      role: authResponse.role,
    }
    localStorage.setItem(TOKEN_KEY, token.value)
    localStorage.setItem(USER_KEY, JSON.stringify(user.value))
  }

  // Called after a profile update: the backend returns a new token
  // because the email (the token subject) may have changed.
  function updateSession({ token: newToken, user: updatedUser }) {
    token.value = newToken
    user.value = {
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    }
    localStorage.setItem(TOKEN_KEY, token.value)
    localStorage.setItem(USER_KEY, JSON.stringify(user.value))
  }

  async function login(credentials) {
    const data = await request('/auth/login', { method: 'POST', body: credentials })
    setSession(data)
  }

  async function register(details) {
    const data = await request('/auth/register', { method: 'POST', body: details })

    if (data?.token) {
      setSession(data)
    } else {
      await login({ email: details.email, password: details.password })
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }

  return { token, user, isAuthenticated, role, login, register, updateSession, logout }
})
