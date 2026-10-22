<script setup>
import { computed } from 'vue'
import { getStatusInfo } from '@/utils/shipmentStatus'
import { formatDate } from '@/utils/format'
import { formatPackage, formatWeight, getTransportInfo } from '@/utils/cargo'

const props = defineProps({
  shipment: { type: Object, required: true },
})

const statusInfo = computed(() => getStatusInfo(props.shipment.status))
const transport = computed(() => getTransportInfo(props.shipment.transportMode))
</script>

<template>
  <article class="list-item">
    <div class="list-item__header">
      <div class="list-item__tracking">
        <span
          class="list-item__icon"
          :class="`list-item__icon--${statusInfo.tone}`"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            width="18"
            height="18"
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
        <span class="list-item__number">{{ shipment.trackingNumber }}</span>
      </div>
      <span class="list-item__status" :class="`list-item__status--${statusInfo.tone}`">
        {{ statusInfo.label }}
      </span>
    </div>

    <div class="list-item__route">
      <div>
        <span class="list-item__label">{{ $t('shipment.origin') }}</span>
        <p class="list-item__place">{{ shipment.origin }}</p>
      </div>
      <span class="list-item__arrow" aria-hidden="true">→</span>
      <div class="list-item__destination">
        <span class="list-item__label">{{ $t('shipment.destination') }}</span>
        <p class="list-item__place">{{ shipment.destination }}</p>
      </div>
    </div>

    <div class="list-item__cargo">
      <span v-if="transport.icon" class="list-item__chip">
        {{ transport.icon }} {{ transport.label }}
      </span>
      <span v-if="shipment.packageType" class="list-item__chip">
        {{ formatPackage(shipment.packageType, shipment.quantity) }}
      </span>
      <span v-if="shipment.weightKg" class="list-item__chip">
        {{ formatWeight(shipment.weightKg) }}
      </span>
      <span v-if="shipment.dangerousGoods" class="list-item__chip list-item__chip--danger">
        ⚠️ {{ $t('shipment.dangerous') }}
      </span>
    </div>

    <div class="list-item__meta">
      <div>
        <span class="list-item__label">{{ $t('shipment.client') }}</span>
        <p>{{ shipment.clientName || '—' }}</p>
      </div>
      <div>
        <span class="list-item__label">{{ $t('shipment.created') }}</span>
        <p>{{ formatDate(shipment.createdDate) || '—' }}</p>
      </div>
      <div>
        <span class="list-item__label">{{ $t('shipment.estArrival') }}</span>
        <p>{{ formatDate(shipment.estimatedDelivery) || '—' }}</p>
      </div>
    </div>

    <div class="list-item__footer">
      <router-link :to="`/shipments/${shipment.id}`" class="list-item__link"
        >{{ $t('shipment.viewDetails') }} ›</router-link
      >
    </div>
  </article>
</template>

<style scoped>
.list-item {
  padding: 16px;
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.list-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.list-item__tracking {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.list-item__icon {
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
}

.list-item__icon--preparing {
  background: var(--status-preparing-bg);
  color: var(--status-preparing-text);
}

.list-item__icon--transit {
  background: var(--status-transit-bg);
  color: var(--status-transit-text);
}

.list-item__icon--customs {
  background: var(--status-customs-bg);
  color: var(--status-customs-text);
}

.list-item__icon--delivered {
  background: var(--status-delivered-bg);
  color: var(--status-delivered-text);
}

.list-item__number {
  font-weight: 700;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-item__status {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.list-item__status--preparing {
  background: var(--status-preparing-bg);
  color: var(--status-preparing-text);
}

.list-item__status--transit {
  background: var(--status-transit-bg);
  color: var(--status-transit-text);
}

.list-item__status--customs {
  background: var(--status-customs-bg);
  color: var(--status-customs-text);
}

.list-item__status--delivered {
  background: var(--status-delivered-bg);
  color: var(--status-delivered-text);
}

.list-item__route {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
  border-radius: var(--radius-md);
  background: var(--color-soft);
}

.list-item__destination {
  text-align: right;
}

.list-item__arrow {
  color: var(--color-primary);
  font-weight: 700;
}

.list-item__label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.list-item__place {
  font-weight: 600;
  color: var(--color-text);
}
.list-item__cargo {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 12px;
}

.list-item__cargo:empty {
  display: none;
}

.list-item__chip {
  padding: 2px 10px;
  border-radius: 999px;
  background: var(--color-soft);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text);
}

.list-item__chip--danger {
  background: #fef2f2;
  color: #b91c1c;
}

.list-item__meta {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  font-size: 0.85rem;
  color: var(--color-text);
}

.list-item__footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

.list-item__link {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
}
</style>
