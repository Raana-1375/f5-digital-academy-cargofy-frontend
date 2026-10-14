<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import { formatFullDate } from '@/utils/format'
import AppNav from '@/components/AppNav.vue'
import StatCard from '@/components/StatCard.vue'
import ShipmentCard from '@/components/ShipmentCard.vue'

const auth = useAuthStore()
const dashboard = useDashboardStore()

onMounted(() => {
  dashboard.loadSummary()
})
</script>

<template>
  <div class="dashboard-page">
    <AppNav />

    <main class="dashboard">
      <div class="dashboard__chips">
        <span class="chip chip--date">{{ formatFullDate() }}</span>
        <span class="chip chip--status">
          <span class="chip__dot"></span>
          Systems Nominal
        </span>
      </div>

      <h1 class="dashboard__title">Welcome, {{ auth.user?.name }}</h1>

      <router-link to="/shipments/new" class="dashboard__create">+ Create New Shipment</router-link>

      <p v-if="dashboard.loading" class="dashboard__message">Loading...</p>

      <div
        v-else-if="dashboard.error"
        class="dashboard__message dashboard__message--error"
        role="alert"
      >
        <p>{{ dashboard.error }}</p>
        <button type="button" @click="dashboard.loadSummary()">Try again</button>
      </div>

      <template v-else-if="dashboard.summary">
        <section class="dashboard__stats">
          <StatCard variant="total" label="Total Shipments" :value="dashboard.summary.total" />
          <StatCard variant="transit" label="In Transit" :value="dashboard.summary.inTransit" />
          <StatCard
            variant="customs"
            label="In Customs"
            :value="dashboard.summary.customs"
            :badge="dashboard.needsCustomsAttention ? 'Action' : ''"
          />
          <StatCard variant="delivered" label="Delivered" :value="dashboard.summary.delivered" />
        </section>

        <section class="dashboard__recent">
          <div class="dashboard__recent-header">
            <h2>Recent Shipments</h2>
            <router-link to="/shipments">View all ({{ dashboard.summary.total }})</router-link>
          </div>

          <p v-if="dashboard.recentShipments.length === 0" class="dashboard__message">
            No shipments yet.
          </p>
          <div v-else class="dashboard__list">
            <ShipmentCard
              v-for="shipment in dashboard.recentShipments"
              :key="shipment.id"
              :shipment="shipment"
            />
          </div>
        </section>
      </template>
    </main>
  </div>
</template>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  background: var(--color-bg);
}

.dashboard {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 16px 96px;
}

.dashboard__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
}

.chip--date {
  background: #e7eefe;
  color: var(--color-text);
}

.chip--status {
  background: #d4e7e1;
  color: var(--color-success);
}

.chip__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);
}

.dashboard__title {
  margin-bottom: 16px;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
}

.dashboard__create {
  display: block;
  padding: 14px;
  margin-bottom: 24px;
  border-radius: var(--radius-md);
  background: var(--color-accent);
  color: #fff;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
}

.dashboard__stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.dashboard__recent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.dashboard__recent-header h2 {
  font-size: 1.15rem;
  color: var(--color-text);
}

.dashboard__recent-header a {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-primary);
  text-decoration: none;
}

.dashboard__list {
  display: grid;
  gap: 12px;
}

.dashboard__message {
  padding: 24px 0;
  color: var(--color-text-muted);
  text-align: center;
}

.dashboard__message--error {
  color: #b91c1c;
}

.dashboard__message--error button {
  margin-top: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-primary);
  color: #fff;
  cursor: pointer;
}

@media (min-width: 768px) {
  .dashboard {
    padding-top: 88px;
    padding-bottom: 32px;
  }

  .dashboard__create {
    display: inline-block;
    padding: 12px 24px;
  }

  .dashboard__stats {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
