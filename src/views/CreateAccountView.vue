<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

import '../assets/auth.css'
import logo from '../assets/logo.png'
import { useAuthStore } from '../stores/auth'
import { validateSignUp } from '../utils/validation'

const router = useRouter()
const auth = useAuthStore()

const roles = [
  { value: 'CLIENT', title: 'Client', description: 'Shipment owner / importer' },
  { value: 'OPERATOR', title: 'Operator', description: 'Freight broker / forwarder' },
]

const form = reactive({
  fullName: '',
  email: '',
  companyName: '',
  role: 'CLIENT',
  password: '',
  confirmPassword: '',
})
const errors = ref({})
const serverError = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)

async function handleSubmit() {
  serverError.value = ''
  errors.value = validateSignUp(form)
  if (Object.keys(errors.value).length > 0) return

  loading.value = true
  try {
    await auth.register({
      name: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
      companyName: form.companyName.trim() || null,
    })
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

      <h1 class="auth-title">Create Account</h1>
      <p class="auth-subtitle">Join Cargofy to manage international freight and customs</p>

      <form class="auth-form" novalidate @submit.prevent="handleSubmit">
        <div class="field">
          <label for="fullName">Full Name</label>
          <input
            id="fullName"
            v-model="form.fullName"
            type="text"
            placeholder="e.g. Alex Morgan"
            autocomplete="name"
            :class="{ invalid: errors.fullName }"
          />
          <p v-if="errors.fullName" class="field-error">{{ errors.fullName }}</p>
        </div>

        <div class="field">
          <label for="email">Email Address</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="alex@globalfreight.com"
            autocomplete="email"
            :class="{ invalid: errors.email }"
          />
          <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
        </div>

        <div class="field">
          <label for="companyName"> Company Name <span class="optional">(optional)</span> </label>
          <input
            id="companyName"
            v-model="form.companyName"
            type="text"
            placeholder="e.g. Acme Logistics Corp"
            autocomplete="organization"
          />
        </div>

        <fieldset class="field role-field">
          <legend>Select your role</legend>
          <div class="role-cards">
            <label
              v-for="option in roles"
              :key="option.value"
              class="role-card"
              :class="{ selected: form.role === option.value }"
            >
              <input v-model="form.role" type="radio" name="role" :value="option.value" />
              <span class="role-title">{{ option.title }}</span>
              <span class="role-description">{{ option.description }}</span>
            </label>
          </div>
          <p v-if="errors.role" class="field-error">{{ errors.role }}</p>
        </fieldset>

        <div class="field">
          <label for="password">Password</label>
          <div class="password-wrapper">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Min. 8 characters"
              autocomplete="new-password"
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

        <div class="field">
          <label for="confirmPassword">Confirm Password</label>
          <div class="password-wrapper">
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="Re-enter password"
              autocomplete="new-password"
              :class="{ invalid: errors.confirmPassword }"
            />
            <button
              type="button"
              class="toggle-password"
              :aria-label="showConfirmPassword ? 'Hide password' : 'Show password'"
              @click="showConfirmPassword = !showConfirmPassword"
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
                <line v-if="showConfirmPassword" x1="3" y1="3" x2="21" y2="21" />
              </svg>
            </button>
          </div>
          <p v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</p>
        </div>

        <p v-if="serverError" class="server-error" role="alert">{{ serverError }}</p>

        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Sign Up →' }}
        </button>
      </form>

      <p class="switch-auth">
        Already have an account?
        <RouterLink to="/login">Sign In</RouterLink>
      </p>
    </section>

    <footer class="auth-footer">
      <p>Calle Comercio 42, Gijón, Spain</p>
      <p>Support: Mon–Fri, 9:00–18:00 · support@cargofy.dev</p>
    </footer>
  </main>
</template>

<style scoped>
.optional {
  float: right;
  font-weight: 400;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.role-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 4px;
}

.role-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 40px 12px 14px;
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  background-color: var(--color-soft);
  cursor: pointer;
}

.role-card input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.role-card::after {
  content: '';
  position: absolute;
  top: 12px;
  right: 14px;
  width: 18px;
  height: 18px;
  border: 2px solid #cbd5e1;
  border-radius: 50%;
  background-color: var(--color-card);
}

.role-card.selected {
  border-color: var(--color-primary);
}

.role-card.selected::after {
  border: 5px solid var(--color-primary);
}

.role-card:focus-within {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.role-title {
  font-weight: 700;
}

.role-description {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

@media (max-width: 480px) {
  .role-cards {
    grid-template-columns: 1fr;
  }
}
</style>
