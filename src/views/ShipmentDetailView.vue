<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useShipmentDetailStore } from '@/stores/shipmentDetail'
import { getStatusInfo } from '@/utils/shipmentStatus'
import { formatDate } from '@/utils/format'
import { formatPackage, formatPrice, formatWeight, getTransportInfo } from '@/utils/cargo'
import AppNav from '@/components/AppNav.vue'
import PageBanner from '@/components/PageBanner.vue'
import { usePermissions } from '@/composables/usePermissions'
import UpdateStatusModal from '@/components/UpdateStatusModal.vue'
import StatusTimeline from '@/components/StatusTimeline.vue'
import ProgressStepper from '@/components/ProgressStepper.vue'

const route = useRoute()
const store = useShipmentDetailStore()
const copied = ref(false)
const { canUpdateStatus } = usePermissions()
const showStatusModal = ref(false)

const statusInfo = computed(() => getStatusInfo(store.status))
const transport = computed(() => getTransportInfo(store.shipment?.transportMode))

async function copyTrackingNumber() {
  try {
    await navigator.clipboard.writeText(store.shipment.trackingNumber)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    copied.value = false
  }
}

function openStatusModal() {
  store.updateError = ''
  showStatusModal.value = true
}

async function submitStatus(payload) {
  const updated = await store.updateStatus(route.params.id, payload)
  if (updated) showStatusModal.value = false
}

onMounted(() => {
  store.loadShipment(route.params.id)
})

watch(
  () => route.params.id,
  (id) => {
    if (id) store.loadShipment(id)
  },
)
</script>

<template>
  <div class="detail-page">
    <AppNav />

    <main class="detail">
      <router-link to="/shipments" class="detail__back">{{ $t('detail.back') }}</router-link>

      <PageBanner :title="$t('banner.detail.title')" :subtitle="$t('banner.detail.subtitle')" />

      <p v-if="store.loading" class="detail__message">{{ $t('common.loading') }}</p>

      <div v-else-if="store.error" class="detail__message detail__message--error" role="alert">
        <p>{{ store.error }}</p>
        <button type="button" @click="store.loadShipment(route.params.id)">
          {{ $t('common.tryAgain') }}
        </button>
      </div>

      <div v-else-if="store.shipment" class="detail__grid">
        <div class="detail__column">
          <section class="card">
            <div class="tracking">
              <div>
                <span class="label">{{ $t('detail.trackingNumber') }}</span>
                <p class="tracking__number">
                  {{ store.shipment.trackingNumber }}
                  <button
                    type="button"
                    class="tracking__copy"
                    :aria-label="copied ? $t('shipment.copied') : $t('shipment.copy')"
                    @click="copyTrackingNumber"
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
                      <rect x="9" y="9" width="11" height="11" rx="2" />
                      <path d="M5 15V6a2 2 0 0 1 2-2h9" />
                    </svg>
                  </button>
                </p>
              </div>
              <span v-if="statusInfo.label" class="badge" :class="`badge--${statusInfo.tone}`">
                {{ statusInfo.label }}
              </span>
            </div>
            <button
              v-if="canUpdateStatus"
              type="button"
              class="detail__update"
              @click="openStatusModal"
            >
              {{ $t('detail.updateStatus') }}
            </button>
          </section>
          <section class="card">
            <ProgressStepper :status="store.status" />
          </section>

          <section class="card route">
            <div class="route__stop">
              <span class="route__dot route__dot--origin"></span>
              <div>
                <span class="label">{{ $t('shipment.origin') }}</span>
                <p class="route__place">{{ store.shipment.origin }}</p>
              </div>
            </div>
            <div class="route__stop">
              <span class="route__dot"></span>
              <div>
                <span class="label">{{ $t('shipment.destination') }}</span>
                <p class="route__place">{{ store.shipment.destination }}</p>
              </div>
            </div>
          </section>

          <section class="card">
            <h2>{{ $t('detail.cargoDetails') }}</h2>
            <dl class="info">
              <div class="info__row">
                <dt>{{ $t('detail.transportMode') }}</dt>
                <dd>{{ transport.icon }} {{ transport.label }}</dd>
              </div>
              <div class="info__row">
                <dt>{{ $t('detail.packages') }}</dt>
                <dd>
                  {{ formatPackage(store.shipment.packageType, store.shipment.quantity) }}
                </dd>
              </div>
              <div class="info__row">
                <dt>{{ $t('detail.totalWeight') }}</dt>
                <dd>{{ formatWeight(store.shipment.weightKg) }}</dd>
              </div>
              <div class="info__row">
                <dt>{{ $t('detail.goods') }}</dt>
                <dd>{{ store.shipment.goodsDescription || '—' }}</dd>
              </div>
              <div class="info__row">
                <dt>{{ $t('detail.hsCode') }}</dt>
                <dd>{{ store.shipment.hsCode || '—' }}</dd>
              </div>
              <div
                class="info__row"
                :class="{ 'info__row--danger': store.shipment.dangerousGoods }"
              >
                <dt>{{ $t('detail.dangerousGoods') }}</dt>
                <dd>{{ store.shipment.dangerousGoods ? $t('detail.yes') : $t('detail.no') }}</dd>
              </div>
              <div class="info__row info__row--price">
                <dt>{{ $t('detail.estimatedPrice') }}</dt>
                <dd>{{ formatPrice(store.shipment.estimatedPrice) }}</dd>
              </div>
            </dl>
          </section>

          <section class="card">
            <h2>{{ $t('detail.shipmentInfo') }}</h2>
            <dl class="info">
              <div class="info__row">
                <dt>{{ $t('shipment.client') }}</dt>
                <dd>{{ store.shipment.clientName || '—' }}</dd>
              </div>
              <div class="info__row">
                <dt>{{ $t('detail.assignedOperator') }}</dt>
                <dd>{{ store.shipment.assignedOperatorName || '—' }}</dd>
              </div>
              <div class="info__row">
                <dt>{{ $t('detail.estDelivery') }}</dt>
                <dd>{{ formatDate(store.shipment.estimatedDelivery) || '—' }}</dd>
              </div>
              <div class="info__row">
                <dt>{{ $t('shipment.created') }}</dt>
                <dd>{{ formatDate(store.shipment.createdDate) || '—' }}</dd>
              </div>
              <div v-if="store.shipment.note" class="info__row">
                <dt>{{ $t('detail.notes') }}</dt>
                <dd>{{ store.shipment.note }}</dd>
              </div>
            </dl>
          </section>
        </div>

        <div class="detail__column">
          <StatusTimeline :history="store.history" />
        </div>
      </div>

      <UpdateStatusModal
        v-if="showStatusModal"
        :current-status="store.status"
        :submitting="store.updating"
        :error="store.updateError"
        @submit="submitStatus"
        @cancel="showStatusModal = false"
      />
    </main>
  </div>
</template>

<style scoped>
.detail-page {
  min-height: 100vh;
  background: var(--color-bg);
}

.detail {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px 96px;
}

.detail__back {
  display: inline-block;
  margin-bottom: 16px;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
}

.detail__grid {
  display: grid;
  gap: 16px;
}

.detail__column {
  display: grid;
  align-content: start;
  gap: 16px;
}

.card {
  padding: 16px;
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.card h2 {
  margin-bottom: 12px;
  font-size: 1.1rem;
  color: var(--color-text);
}

.label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.tracking {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.tracking__number {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text);
}

.tracking__copy {
  display: grid;
  place-items: center;
  padding: 2px;
  border: none;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
}

.detail__update {
  width: 100%;
  padding: 12px;
  margin-top: 16px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-accent);
  color: #fff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.badge {
  padding: 2px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge--preparing {
  background: var(--status-preparing-bg);
  color: var(--status-preparing-text);
}

.badge--transit {
  background: var(--status-transit-bg);
  color: var(--status-transit-text);
}

.badge--customs {
  background: var(--status-customs-bg);
  color: var(--status-customs-text);
}

.badge--delivered {
  background: var(--status-delivered-bg);
  color: var(--status-delivered-text);
}

.route {
  display: grid;
  gap: 16px;
}

.route__stop {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.route__dot {
  width: 14px;
  height: 14px;
  margin-top: 4px;
  border-radius: 50%;
  background: #cbd5e1;
}

.route__dot--origin {
  background: var(--color-success);
}

.route__place {
  font-weight: 600;
  color: var(--color-text);
}

.info {
  display: grid;
  gap: 8px;
  margin: 0;
}

.info__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--color-soft);
}

.info__row dt {
  color: var(--color-text-muted);
}

.info__row dd {
  margin: 0;
  font-weight: 500;
  color: var(--color-text);
  text-align: right;
}

.info__row--danger {
  background: #fef2f2;
}

.info__row--danger dd {
  color: #b91c1c;
  font-weight: 700;
}

.info__row--price dd {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-primary);
}

.detail__message {
  padding: 24px 0;
  color: var(--color-text-muted);
  text-align: center;
}

.detail__message--error {
  color: #b91c1c;
}

.detail__message--error button {
  margin-top: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: #fff;
  cursor: pointer;
}

@media (min-width: 768px) {
  .detail {
    padding-top: 88px;
    padding-bottom: 32px;
  }

  .detail__grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
