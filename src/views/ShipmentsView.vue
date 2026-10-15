<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useShipmentsStore } from '@/stores/shipments'
import AppNav from '@/components/AppNav.vue'
import ShipmentListItem from '@/components/ShipmentListItem.vue'
import { usePermissions } from '@/composables/usePermissions'

const store = useShipmentsStore()
const searchText = ref(store.search)
const { canCreateShipment } = usePermissions()
let searchTimer = null

const tabs = [
  { label: 'All', value: '', key: 'ALL' },
  { label: 'In Transit', value: 'IN_TRANSIT', key: 'IN_TRANSIT' },
  { label: 'Customs', value: 'CUSTOMS', key: 'CUSTOMS' },
  { label: 'Preparing', value: 'PREPARING', key: 'PREPARING' },
  { label: 'Delivered', value: 'DELIVERED', key: 'DELIVERED' },
]

function onSearchInput() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => store.setSearch(searchText.value), 300)
}

onMounted(() => {
  store.init()
})

onBeforeUnmount(() => {
  clearTimeout(searchTimer)
})
</script>

<template>
  <div class="shipments-page">
    <AppNav />

    <main class="shipments">
      <div class="shipments__header">
        <div>
          <h1>Shipments</h1>
          <p>Global multi-modal active freight</p>
        </div>
        <router-link v-if="canCreateShipment" to="/shipments/new" class="shipments__create">
          + New Shipment
        </router-link>
      </div>

      <label class="shipments__search">
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
        <input
          v-model="searchText"
          type="search"
          placeholder="Search by tracking number..."
          aria-label="Search by tracking number"
          @input="onSearchInput"
        />
      </label>

      <div class="shipments__tabs" role="group" aria-label="Filter by status">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="shipments__tab"
          :class="{ 'shipments__tab--active': store.status === tab.value }"
          :aria-pressed="store.status === tab.value"
          @click="store.setStatus(tab.value)"
        >
          {{ tab.label }}
          <span v-if="store.statusCounts">({{ store.statusCounts[tab.key] }})</span>
        </button>
      </div>

      <p v-if="store.loading" class="shipments__message">Loading...</p>

      <div
        v-else-if="store.error"
        class="shipments__message shipments__message--error"
        role="alert"
      >
        <p>{{ store.error }}</p>
        <button type="button" @click="store.loadShipments()">Try again</button>
      </div>

      <p v-else-if="store.shipments.length === 0" class="shipments__message">No shipments found.</p>

      <template v-else>
        <div class="shipments__list">
          <ShipmentListItem
            v-for="shipment in store.shipments"
            :key="shipment.id"
            :shipment="shipment"
          />
        </div>

        <div class="shipments__pagination">
          <div class="shipments__pager">
            <button type="button" :disabled="!store.hasPrevious" @click="store.previousPage()">
              ← Previous
            </button>
            <button type="button" :disabled="!store.hasNext" @click="store.nextPage()">
              Next →
            </button>
          </div>
          <p class="shipments__range">
            Showing {{ store.rangeStart }}-{{ store.rangeEnd }}
            <template v-if="store.total !== null">of {{ store.total }}</template>
            shipments
          </p>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.shipments-page {
  min-height: 100vh;
  background: var(--color-bg);
}

.shipments {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px 96px;
}

.shipments__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.shipments__header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
}

.shipments__header p {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.shipments__create {
  padding: 10px 16px;
  border-radius: var(--radius-md);
  background: var(--color-accent);
  color: #fff;
  font-weight: 600;
  white-space: nowrap;
  text-decoration: none;
}

.shipments__search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  margin-bottom: 12px;
  border-radius: var(--radius-md);
  background: var(--color-card);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
  color: var(--color-text-muted);
}

.shipments__search input {
  flex: 1;
  padding: 12px 0;
  border: none;
  outline: none;
  background: transparent;
  font: inherit;
  color: var(--color-text);
}

.shipments__tabs {
  display: flex;
  gap: 8px;
  padding-bottom: 4px;
  margin-bottom: 16px;
  overflow-x: auto;
}

.shipments__tab {
  padding: 6px 14px;
  border: none;
  border-radius: 999px;
  background: var(--color-soft);
  color: var(--color-text-muted);
  font: inherit;
  font-size: 0.85rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
}

.shipments__tab--active {
  background: var(--color-primary);
  color: #fff;
}

.shipments__list {
  display: grid;
  gap: 12px;
}

.shipments__message {
  padding: 24px 0;
  color: var(--color-text-muted);
  text-align: center;
}

.shipments__message--error {
  color: #b91c1c;
}

.shipments__message--error button {
  margin-top: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: #fff;
  cursor: pointer;
}

.shipments__pagination {
  padding: 16px;
  margin-top: 16px;
  border-radius: var(--radius-lg);
  background: var(--color-card);
  text-align: center;
}

.shipments__pager {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 8px;
}

.shipments__pager button {
  padding: 10px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-icon-bg);
  color: var(--color-text);
  font: inherit;
  font-weight: 500;
  cursor: pointer;
}

.shipments__pager button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.shipments__range {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

@media (min-width: 768px) {
  .shipments {
    padding-top: 88px;
    padding-bottom: 32px;
  }

  .shipments__list {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
