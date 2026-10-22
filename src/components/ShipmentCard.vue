<script setup>
import { computed, ref } from 'vue'
import { getStatusInfo } from '@/utils/shipmentStatus'
import { formatDate } from '@/utils/format'
import { formatPackage, getTransportInfo } from '@/utils/cargo'

const props = defineProps({
  shipment: { type: Object, required: true },
})

const statusInfo = computed(() => getStatusInfo(props.shipment.status))
const transport = computed(() => getTransportInfo(props.shipment.transportMode))
const copied = ref(false)

async function copyTrackingNumber() {
  try {
    await navigator.clipboard.writeText(props.shipment.trackingNumber)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    copied.value = false
  }
}
</script>

<template>
  <article class="shipment-card">
    <span
      class="shipment-card__icon"
      :class="`shipment-card__icon--${statusInfo.tone}`"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <template v-if="statusInfo.tone === 'customs'">
          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
        </template>
        <template v-else-if="statusInfo.tone === 'delivered'">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12l3 3 5-6" />
        </template>
        <template v-else>
          <path d="M21 8l-9-5-9 5v8l9 5 9-5z" />
          <path d="M3 8l9 5 9-5M12 13v8" />
        </template>
      </svg>
    </span>

    <div class="shipment-card__body">
      <div class="shipment-card__header">
        <div class="shipment-card__tracking">
          <span class="shipment-card__number">{{ shipment.trackingNumber }}</span>
          <button
            type="button"
            class="shipment-card__copy"
            :aria-label="copied ? $t('shipment.copied') : $t('shipment.copy')"
            @click="copyTrackingNumber"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V6a2 2 0 0 1 2-2h9" />
            </svg>
          </button>
        </div>
        <span class="shipment-card__status" :class="`shipment-card__status--${statusInfo.tone}`">
          {{ statusInfo.label }}
        </span>
      </div>

      <p class="shipment-card__route">{{ shipment.origin }} → {{ shipment.destination }}</p>
      <p v-if="transport.icon" class="shipment-card__cargo">
        {{ transport.icon }} {{ transport.label }}
        <template v-if="shipment.packageType">
          · {{ formatPackage(shipment.packageType, shipment.quantity) }}
        </template>
        <span v-if="shipment.dangerousGoods" class="shipment-card__danger">⚠️</span>
      </p>

      <div class="shipment-card__footer">
        <span class="shipment-card__date">{{ formatDate(shipment.createdDate) }}</span>
        <router-link :to="`/shipments/${shipment.id}`" class="shipment-card__link">{{
          $t('shipment.view')
        }}</router-link>
      </div>
    </div>
  </article>
</template>

<style scoped>
.shipment-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.shipment-card__icon {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
}

.shipment-card__icon--preparing {
  background: var(--status-preparing-bg);
  color: var(--status-preparing-text);
}

.shipment-card__icon--transit {
  background: var(--status-transit-bg);
  color: var(--status-transit-text);
}

.shipment-card__icon--customs {
  background: var(--status-customs-bg);
  color: var(--status-customs-text);
}

.shipment-card__icon--delivered {
  background: var(--status-delivered-bg);
  color: var(--status-delivered-text);
}

.shipment-card__body {
  flex: 1;
  min-width: 0;
}

.shipment-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.shipment-card__tracking {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.shipment-card__number {
  font-weight: 700;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shipment-card__copy {
  display: grid;
  place-items: center;
  padding: 2px;
  border: none;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
}

.shipment-card__status {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.shipment-card__status--preparing {
  background: var(--status-preparing-bg);
  color: var(--status-preparing-text);
}

.shipment-card__status--transit {
  background: var(--status-transit-bg);
  color: var(--status-transit-text);
}

.shipment-card__status--customs {
  background: var(--status-customs-bg);
  color: var(--status-customs-text);
}

.shipment-card__status--delivered {
  background: var(--status-delivered-bg);
  color: var(--status-delivered-text);
}

.shipment-card__route {
  margin: 6px 0;
  font-size: 0.9rem;
  color: var(--color-text-muted);
}

.shipment-card__cargo {
  margin-bottom: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
}
.shipment-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.shipment-card__date {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.shipment-card__link {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
}
</style>
