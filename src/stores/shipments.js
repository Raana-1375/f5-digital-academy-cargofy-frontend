import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchShipments } from '@/services/shipmentService'
import { fetchDashboardSummary } from '@/services/dashboardService'

const PAGE_SIZE = 10

export const useShipmentsStore = defineStore('shipments', () => {
  const shipments = ref([])
  const counts = ref(null)
  const status = ref('')
  const search = ref('')
  const page = ref(0)
  const loading = ref(false)
  const error = ref('')

  let latestRequest = 0

  const hasPrevious = computed(() => page.value > 0)
  const hasNext = computed(() => shipments.value.length === PAGE_SIZE)

  const statusCounts = computed(() => {
    if (!counts.value) return null
    return {
      ALL: counts.value.total,
      IN_TRANSIT: counts.value.inTransit,
      CUSTOMS: counts.value.customs,
      PREPARING: counts.value.preparing,
      DELIVERED: counts.value.delivered,
    }
  })

  // The total is only known when no search text is applied
  const total = computed(() => {
    if (search.value || !statusCounts.value) return null
    return statusCounts.value[status.value || 'ALL']
  })

  const rangeStart = computed(() => (shipments.value.length ? page.value * PAGE_SIZE + 1 : 0))
  const rangeEnd = computed(() => page.value * PAGE_SIZE + shipments.value.length)

  async function loadCounts() {
    try {
      counts.value = await fetchDashboardSummary()
    } catch {
      counts.value = null
    }
  }

  async function loadShipments() {
    const requestId = ++latestRequest
    loading.value = true
    error.value = ''
    try {
      const result = await fetchShipments({
        status: status.value,
        search: search.value,
        page: page.value,
        size: PAGE_SIZE,
      })
      if (requestId !== latestRequest) return
      shipments.value = result
    } catch (err) {
      if (requestId !== latestRequest) return
      error.value = err.message
    } finally {
      if (requestId === latestRequest) loading.value = false
    }
  }

  function init() {
    loadCounts()
    return loadShipments()
  }

  function setStatus(value) {
    status.value = value
    page.value = 0
    return loadShipments()
  }

  function setSearch(value) {
    search.value = value.trim()
    page.value = 0
    return loadShipments()
  }

  function nextPage() {
    if (!hasNext.value) return
    page.value++
    return loadShipments()
  }

  function previousPage() {
    if (!hasPrevious.value) return
    page.value--
    return loadShipments()
  }

  return {
    shipments,
    status,
    search,
    page,
    loading,
    error,
    hasPrevious,
    hasNext,
    statusCounts,
    total,
    rangeStart,
    rangeEnd,
    init,
    loadShipments,
    setStatus,
    setSearch,
    nextPage,
    previousPage,
  }
})
