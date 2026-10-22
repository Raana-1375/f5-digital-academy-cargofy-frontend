<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

import AuthLayout from '../components/AuthLayout.vue'
import logo from '../assets/logo.png'
import { useAuthStore } from '../stores/auth'
import { validateSignUp } from '../utils/validation'

const OPERATOR_COMPANY = 'Cargofy'

const router = useRouter()
const auth = useAuthStore()

const roles = [
  {
    value: 'CLIENT',
    titleKey: 'signUp.roleClient',
    descriptionKey: 'signUp.roleClientDescription',
  },
  {
    value: 'OPERATOR',
    titleKey: 'signUp.roleOperator',
    descriptionKey: 'signUp.roleOperatorDescription',
  },
]

const form = reactive({
  fullName: '',
  email: '',
  companyName: '',
  role: 'CLIENT',
  operatorAccessCode: '',
  password: '',
  confirmPassword: '',
})
const errors = ref({})
const serverError = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)

const isOperator = computed(() => form.role === 'OPERATOR')

// Operators always belong to Cargofy; clients type their own company.
watch(
  () => form.role,
  (role, previousRole) => {
    if (role === 'OPERATOR') {
      form.companyName = OPERATOR_COMPANY
    } else if (previousRole === 'OPERATOR') {
      form.companyName = ''
      form.operatorAccessCode = ''
    }
  },
)

async function handleSubmit() {
  serverError.value = ''
  errors.value = validateSignUp(form)
  if (Object.keys(errors.value).length > 0) return

  const details = {
    name: form.fullName.trim(),
    email: form.email.trim(),
    password: form.password,
    role: form.role,
    companyName: form.companyName.trim() || null,
  }
  if (isOperator.value) {
    details.operatorAccessCode = form.operatorAccessCode.trim()
  }

  loading.value = true
  try {
    await auth.register(details)
    router.push('/dashboard')
  } catch (error) {
    serverError.value = error.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <section class="auth-card">
      <img :src="logo" alt="Cargofy" class="auth-logo" />

      <h1 class="auth-title">{{ $t('signUp.title') }}</h1>
      <p class="auth-subtitle">{{ $t('signUp.subtitle') }}</p>

      <form class="auth-form" novalidate @submit.prevent="handleSubmit">
        <div class="field">
          <label for="fullName">{{ $t('signUp.fullName') }}</label>
          <input
            id="fullName"
            v-model="form.fullName"
            type="text"
            :placeholder="$t('signUp.fullNamePlaceholder')"
            autocomplete="name"
            :class="{ invalid: errors.fullName }"
          />
          <p v-if="errors.fullName" class="field-error">{{ errors.fullName }}</p>
        </div>

        <div class="field">
          <label for="email">{{ $t('auth.email') }}</label>
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
          <label for="companyName">
            {{ $t('signUp.companyName') }}
            <span v-if="!isOperator" class="optional">{{ $t('signUp.optional') }}</span>
          </label>
          <input
            id="companyName"
            v-model="form.companyName"
            type="text"
            :placeholder="$t('signUp.companyPlaceholder')"
            autocomplete="organization"
            :readonly="isOperator"
            :class="{ locked: isOperator }"
          />
          <p v-if="isOperator" class="field-hint">{{ $t('signUp.operatorCompanyHint') }}</p>
        </div>

        <fieldset class="field role-field">
          <legend>{{ $t('signUp.selectRole') }}</legend>
          <div class="role-cards">
            <label
              v-for="option in roles"
              :key="option.value"
              class="role-card"
              :class="{ selected: form.role === option.value }"
            >
              <input v-model="form.role" type="radio" name="role" :value="option.value" />
              <span class="role-title">{{ $t(option.titleKey) }}</span>
              <span class="role-description">{{ $t(option.descriptionKey) }}</span>
            </label>
          </div>
          <p v-if="errors.role" class="field-error">{{ errors.role }}</p>
        </fieldset>

        <div v-if="isOperator" class="field">
          <label for="operatorAccessCode">{{ $t('signUp.accessCode') }}</label>
          <input
            id="operatorAccessCode"
            v-model="form.operatorAccessCode"
            type="password"
            :placeholder="$t('signUp.accessCodePlaceholder')"
            autocomplete="off"
            :class="{ invalid: errors.operatorAccessCode }"
          />
          <p v-if="errors.operatorAccessCode" class="field-error">
            {{ errors.operatorAccessCode }}
          </p>
          <p v-else class="field-hint">{{ $t('signUp.accessCodeHint') }}</p>
        </div>

        <div class="field">
          <label for="password">{{ $t('auth.password') }}</label>
          <div class="password-wrapper">
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              :placeholder="$t('signUp.passwordPlaceholder')"
              autocomplete="new-password"
              :class="{ invalid: errors.password }"
            />
            <button
              type="button"
              class="toggle-password"
              :aria-label="showPassword ? $t('auth.hidePassword') : $t('auth.showPassword')"
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
          <label for="confirmPassword">{{ $t('signUp.confirmPassword') }}</label>
          <div class="password-wrapper">
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              :placeholder="$t('signUp.confirmPlaceholder')"
              autocomplete="new-password"
              :class="{ invalid: errors.confirmPassword }"
            />
            <button
              type="button"
              class="toggle-password"
              :aria-label="showConfirmPassword ? $t('auth.hidePassword') : $t('auth.showPassword')"
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
          {{ loading ? $t('signUp.submitting') : $t('signUp.submit') }}
        </button>
      </form>

      <p class="switch-auth">
        {{ $t('signUp.haveAccount') }}
        <RouterLink to="/login">{{ $t('auth.signIn.title') }}</RouterLink>
      </p>
    </section>

    <footer class="auth-footer">
      <p>{{ $t('auth.address') }}</p>
      <p>{{ $t('footer.support') }} · support@cargofy.dev</p>
    </footer>
  </AuthLayout>
</template>

<style scoped>
.optional {
  float: right;
  font-weight: 400;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.locked {
  background-color: var(--color-soft);
  cursor: not-allowed;
}

.field-hint {
  margin-top: 4px;
  font-size: 0.8rem;
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
