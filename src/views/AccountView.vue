<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useAccountStore } from '@/stores/account'
import { validatePasswordChange, validateProfile } from '@/utils/validation'
import AppNav from '@/components/AppNav.vue'
import PageBanner from '@/components/PageBanner.vue'

const account = useAccountStore()

const TABS = [
  { id: 'profile', label: 'Profile Info' },
  { id: 'company', label: 'Company Info' },
  { id: 'password', label: 'Change Password' },
]

const activeTab = ref('profile')
const form = reactive({ name: '', email: '', companyName: '' })
const passwordForm = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const errors = ref({})
const successMessage = ref('')

function fillForm() {
  form.name = account.profile.name
  form.email = account.profile.email
  form.companyName = account.profile.companyName ?? ''
}

async function load() {
  await account.loadProfile()
  if (account.profile) fillForm()
}

function selectTab(id) {
  activeTab.value = id
  errors.value = {}
  successMessage.value = ''
  account.clearSaveError()
  if (account.profile) fillForm()
}

async function submitProfile() {
  successMessage.value = ''
  account.clearSaveError()
  errors.value = validateProfile(form)
  if (Object.keys(errors.value).length > 0) return

  const ok = await account.saveProfile({
    name: form.name.trim(),
    email: form.email.trim(),
    companyName: form.companyName.trim(),
  })
  if (ok) {
    fillForm()
    successMessage.value = 'Changes saved'
  }
}

async function submitPassword() {
  successMessage.value = ''
  account.clearSaveError()
  errors.value = validatePasswordChange(passwordForm)
  if (Object.keys(errors.value).length > 0) return

  const ok = await account.savePassword({
    currentPassword: passwordForm.currentPassword,
    newPassword: passwordForm.newPassword,
  })
  if (ok) {
    passwordForm.currentPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    successMessage.value = 'Password updated'
  }
}

onMounted(load)
</script>

<template>
  <div class="account-page">
    <AppNav />

    <main class="account">
      <PageBanner
        title="Account & Settings"
        subtitle="Manage your profile, company details and password."
      />

      <p v-if="account.loading" class="account__status">Loading your account...</p>

      <div v-else-if="account.loadError" class="account__status" role="alert">
        <p class="account__error">{{ account.loadError }}</p>
        <button type="button" class="btn btn--secondary" @click="load">Try again</button>
      </div>

      <template v-else-if="account.profile">
        <div class="tabs" role="tablist">
          <button
            v-for="tab in TABS"
            :key="tab.id"
            type="button"
            role="tab"
            class="tabs__tab"
            :class="{ 'tabs__tab--active': activeTab === tab.id }"
            :aria-selected="activeTab === tab.id"
            @click="selectTab(tab.id)"
          >
            {{ tab.label }}
          </button>
        </div>

        <form
          v-if="activeTab !== 'password'"
          class="account__form"
          novalidate
          @submit.prevent="submitProfile"
        >
          <template v-if="activeTab === 'profile'">
            <div class="field">
              <label for="name">Full Name</label>
              <input
                id="name"
                v-model="form.name"
                type="text"
                autocomplete="name"
                :aria-invalid="!!errors.name"
              />
              <p v-if="errors.name" class="field__error">{{ errors.name }}</p>
            </div>

            <div class="field">
              <label for="email">Email Address</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                :aria-invalid="!!errors.email"
              />
              <p v-if="errors.email" class="field__error">{{ errors.email }}</p>
            </div>
          </template>

          <div v-else class="field">
            <label for="company">Company Name</label>
            <input
              id="company"
              v-model="form.companyName"
              type="text"
              autocomplete="organization"
            />
          </div>

          <p v-if="account.saveError" class="account__error" role="alert">
            {{ account.saveError }}
          </p>
          <p v-if="successMessage" class="account__success" role="status">{{ successMessage }}</p>

          <button type="submit" class="btn btn--primary" :disabled="account.saving">
            {{ account.saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </form>

        <form v-else class="account__form" novalidate @submit.prevent="submitPassword">
          <div class="field">
            <label for="current-password">Current Password</label>
            <input
              id="current-password"
              v-model="passwordForm.currentPassword"
              type="password"
              autocomplete="current-password"
              :aria-invalid="!!errors.currentPassword"
            />
            <p v-if="errors.currentPassword" class="field__error">{{ errors.currentPassword }}</p>
          </div>

          <div class="field">
            <label for="new-password">New Password</label>
            <input
              id="new-password"
              v-model="passwordForm.newPassword"
              type="password"
              autocomplete="new-password"
              :aria-invalid="!!errors.newPassword"
            />
            <p v-if="errors.newPassword" class="field__error">{{ errors.newPassword }}</p>
          </div>

          <div class="field">
            <label for="confirm-password">Confirm New Password</label>
            <input
              id="confirm-password"
              v-model="passwordForm.confirmPassword"
              type="password"
              autocomplete="new-password"
              :aria-invalid="!!errors.confirmPassword"
            />
            <p v-if="errors.confirmPassword" class="field__error">{{ errors.confirmPassword }}</p>
          </div>

          <p v-if="account.saveError" class="account__error" role="alert">
            {{ account.saveError }}
          </p>
          <p v-if="successMessage" class="account__success" role="status">{{ successMessage }}</p>

          <button type="submit" class="btn btn--primary" :disabled="account.saving">
            {{ account.saving ? 'Saving...' : 'Update Password' }}
          </button>
        </form>
      </template>
    </main>
  </div>
</template>

<style scoped>
.account-page {
  min-height: 100vh;
  background: var(--color-bg);
}

.account {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 16px 96px;
}

.account__status {
  display: grid;
  gap: 12px;
  color: var(--color-text-muted);
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.tabs__tab {
  padding: 8px 12px;
  border: none;
  border-radius: 999px;
  background: var(--color-soft);
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-muted);
  white-space: nowrap;
  cursor: pointer;
}

.tabs__tab--active {
  background: var(--color-primary);
  color: #fff;
}

.account__form {
  display: grid;
  gap: 16px;
  padding: 16px;
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.field {
  display: grid;
  gap: 6px;
}

.field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
}

.field input {
  width: 100%;
  padding: 12px;
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  background: var(--color-soft);
  font: inherit;
  color: var(--color-text);
}

.field input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.field [aria-invalid='true'] {
  border-color: #b91c1c;
}

.field__error,
.account__error {
  font-size: 0.85rem;
  color: #b91c1c;
}

.account__success {
  font-size: 0.85rem;
  font-weight: 600;
  color: #15803d;
}

.btn {
  padding: 12px;
  border: none;
  border-radius: var(--radius-md);
  font: inherit;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
}

.btn--secondary {
  background: var(--color-soft);
  color: var(--color-primary);
}

.btn--primary {
  background: var(--color-accent);
  color: #fff;
}

.btn--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (min-width: 768px) {
  .account {
    padding-top: 88px;
    padding-bottom: 32px;
  }

  .account__form {
    padding: 24px;
  }
}
</style>
