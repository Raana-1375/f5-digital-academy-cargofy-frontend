import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchShipmentDetail, updateShipmentStatus } from '@/services/shipmentService'

export const useShipmentDetailStore = defineStore('shipmentDetail', () => {
  const shipment = ref(null)
  const loading = ref(false)
  const error = ref('')
  const updating = ref(false)
  const updateError = ref('')

  let latestRequest = 0

  // Status changes in chronological order (oldest first)
  const history = computed(() => {
    const entries = shipment.value?.history ?? []
    return [...entries].sort((a, b) => new Date(a.updatedDate) - new Date(b.updatedDate))
  })

  // Use the status from the API, or fall back to the latest history entry
  const status = computed(() => {
    if (!shipment.value) return ''
    if (shipment.value.status) return shipment.value.status
    return history.value.at(-1)?.status ?? ''
  })

  // With silent: true the current shipment stays visible while it reloads
  async function loadShipment(id, { silent = false } = {}) {
    const requestId = ++latestRequest
    if (!silent) {
      loading.value = true
      shipment.value = null
    }
    error.value = ''
    try {
      const result = await fetchShipmentDetail(id)
      if (requestId !== latestRequest) return
      shipment.value = result
    } catch (err) {
      if (requestId !== latestRequest) return
      error.value = err.message
    } finally {
      if (requestId === latestRequest) loading.value = false
    }
  }

  // Returns true when the status was updated, so the view can close the form
  async function updateStatus(id, { status, note }) {
    updating.value = true
    updateError.value = ''
    try {
      await updateShipmentStatus(id, { status, note })
      await loadShipment(id, { silent: true })
      return true
    } catch (err) {
      updateError.value = err.message
      return false
    } finally {
      updating.value = false
    }
  }

  return {
    shipment,
    loading,
    error,
    updating,
    updateError,
    history,
    status,
    loadShipment,
    updateStatus,
  }
})
