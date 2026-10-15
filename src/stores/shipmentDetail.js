import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchShipmentDetail } from '@/services/shipmentService'

export const useShipmentDetailStore = defineStore('shipmentDetail', () => {
  const shipment = ref(null)
  const loading = ref(false)
  const error = ref('')

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

  async function loadShipment(id) {
    const requestId = ++latestRequest
    loading.value = true
    error.value = ''
    shipment.value = null
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

  return { shipment, loading, error, history, status, loadShipment }
})
