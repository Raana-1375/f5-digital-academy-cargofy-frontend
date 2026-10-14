import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { fetchDashboardSummary } from '../services/dashboardService'

export const useDashboardStore = defineStore('dashboard', () => {
  const summary = ref(null)
  const loading = ref(false)
  const error = ref('')

  const recentShipments = computed(() => summary.value?.recentShipments ?? [])
  const needsCustomsAttention = computed(() => (summary.value?.customs ?? 0) > 0)

  async function loadSummary() {
    loading.value = true
    error.value = ''
    try {
      summary.value = await fetchDashboardSummary()
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return { summary, loading, error, recentShipments, needsCustomsAttention, loadSummary }
})
