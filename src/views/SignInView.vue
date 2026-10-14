<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

import '../assets/auth.css'
import logo from '../assets/logo.png'
import { useAuthStore } from '../stores/auth'
import { validateSignIn } from '../utils/validation'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({ email: '', password: '' })
const errors = ref({})
const serverError = ref('')
const showPassword = ref(false)
const loading = ref(false)

async function handleSubmit() {
  serverError.value = ''
  errors.value = validateSignIn(form)
  if (Object.keys(errors.value).length > 0) return

  loading.value = true
  try {
    await auth.login({ email: form.email.trim(), password: form.password })
    router.push('/dashboard')
  } catch (error) {
    serverError.value = error.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <img :src="logo" alt="Cargofy" class="auth-logo" />

      <h1 class="auth-title">Sign In</h1>
      <p class="auth-subtitle">Enter your credentials to track and manage shipments</p>

      <form class="auth-form" novalidate @submit.prevent="handleSubmit">
        <div class="field">
          <label for="email">Email Address</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="name@company.com"
            autocomplete="email"
            :class="{ invalid: errors.email }"
          />
          <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
        </div>

        <div class="field">
          <label for="password">Password</label>
          <div class="password-wrapper">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              autocomplete="current-password"
              :class="{ invalid: errors.password }"
            />
            <button
              type="button"
              class="toggle-password"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
                <line v-if="showPassword" x1="3" y1="3" x2="21" y2="21" />
              </svg>
            </button>
          </div>
          <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
        </div>

        <p v-if="serverError" class="server-error" role="alert">{{ serverError }}</p>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign In →' }}
        </button>
      </form>

      <div class="divider"><span>OR</span></div>

      <RouterLink to="/register" class="btn btn-soft">Create Account</RouterLink>
    </section>

    <footer class="auth-footer">
      <p>Calle Comercio 42, Gijón, Spain</p>
      <p>Support: Mon–Fri, 9:00–18:00 · support@cargofy.dev</p>
    </footer>
  </main>
</template>
