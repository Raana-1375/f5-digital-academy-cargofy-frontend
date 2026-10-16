import { ref } from 'vue'
import { defineStore } from 'pinia'

import { changePassword, fetchCurrentUser, updateProfile } from '../services/userService'
import { useAuthStore } from './auth'

export const useAccountStore = defineStore('account', () => {
  const profile = ref(null)
  const loading = ref(false)
  const loadError = ref('')
  const saving = ref(false)
  const saveError = ref('')

  async function loadProfile() {
    loading.value = true
    loadError.value = ''
    try {
      profile.value = await fetchCurrentUser()
    } catch (error) {
      loadError.value = error.message
    } finally {
      loading.value = false
    }
  }

  // Saves name, email and company. Returns true on success, false on failure.
  async function saveProfile({ name, email, companyName }) {
    saving.value = true
    saveError.value = ''
    try {
      const data = await updateProfile(profile.value.id, { name, email, companyName })
      profile.value = data.user
      useAuthStore().updateSession(data)
      return true
    } catch (error) {
      saveError.value = error.message
      return false
    } finally {
      saving.value = false
    }
  }

  // Returns true on success, false on failure.
  async function savePassword({ currentPassword, newPassword }) {
    saving.value = true
    saveError.value = ''
    try {
      await changePassword(profile.value.id, { currentPassword, newPassword })
      return true
    } catch (error) {
      saveError.value = error.message
      return false
    } finally {
      saving.value = false
    }
  }

  function clearSaveError() {
    saveError.value = ''
  }

  return {
    profile,
    loading,
    loadError,
    saving,
    saveError,
    loadProfile,
    saveProfile,
    savePassword,
    clearSaveError,
  }
})
