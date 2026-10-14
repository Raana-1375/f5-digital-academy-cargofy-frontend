<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

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

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 24px 16px;
}

.auth-card {
  width: 100%;
  max-width: 480px;
  padding: 40px 32px;
  background-color: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 30px rgba(15, 23, 42, 0.08);
}

.auth-logo {
  width: 180px;
  margin: 0 auto 24px;
}

.auth-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
}

.auth-subtitle {
  margin-top: 8px;
  text-align: center;
  color: var(--color-text-muted);
}

.auth-form {
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field label {
  font-weight: 600;
}

.field input {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background-color: var(--color-soft);
  color: var(--color-text);
}

.field input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.field input.invalid {
  border-color: #dc2626;
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  padding-right: 48px;
}

.toggle-password {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  display: flex;
  padding: 4px;
  border: none;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
}

.field-error,
.server-error {
  font-size: 0.875rem;
  color: #dc2626;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 52px;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background-color: var(--color-primary);
  color: #ffffff;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-soft {
  background-color: var(--color-soft);
  color: var(--color-primary);
}

.divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 24px 0;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #e2e8f0;
}

.auth-footer {
  text-align: center;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

@media (max-width: 480px) {
  .auth-card {
    padding: 32px 20px;
  }
}
</style>
