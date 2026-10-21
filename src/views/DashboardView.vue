<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import { usePermissions } from '@/composables/usePermissions'
import { formatFullDate } from '@/utils/format'
import heroImage from '@/assets/hero-logistics.jpg'
import AppNav from '@/components/AppNav.vue'
import StatCard from '@/components/StatCard.vue'
import ShipmentCard from '@/components/ShipmentCard.vue'

const auth = useAuthStore()
const dashboard = useDashboardStore()
const { canCreateShipment } = usePermissions()

onMounted(() => {
  dashboard.loadSummary()
})
</script>

<template>
  <div class="dashboard-page">
    <AppNav />

    <main class="dashboard">
      <section class="hero" :style="{ backgroundImage: `url(${heroImage})` }">
        <div class="hero__content">
          <div class="hero__chips">
            <span class="chip chip--date">{{ formatFullDate() }}</span>
            <span class="chip chip--status">
              <span class="chip__dot"></span>
              Systems Nominal
            </span>
          </div>

          <h1 class="hero__title">Welcome, {{ auth.user?.name }}</h1>
          <p class="hero__subtitle">Air, sea and road freight, tracked end to end.</p>

          <router-link v-if="canCreateShipment" to="/shipments/new" class="hero__create">
            + Create New Shipment
          </router-link>
        </div>
      </section>

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
          <StatCard
            class="dashboard__total"
            variant="total"
            label="Total Shipments"
            :value="dashboard.summary.total"
          />
          <StatCard variant="preparing" label="Preparing" :value="dashboard.summary.preparing" />
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

.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 420px;
  padding: 20px;
  margin-bottom: 24px;
  overflow: hidden;
  border-radius: 18px;
  background-color: #0b2a8a;
  background-position: 72% bottom;
  background-repeat: no-repeat;
  background-size: cover;
  color: #fff;
}

.hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(8, 28, 92, 0.92) 0%,
    rgba(8, 28, 92, 0.6) 45%,
    rgba(8, 28, 92, 0) 75%
  );
}

.hero__content {
  position: relative;
}

.hero__chips {
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
  font-weight: 600;
}

.chip--date {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}

.chip--status {
  background: rgba(127, 252, 151, 0.22);
  color: #c9ffd6;
}

.chip__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #7ffc97;
}

.hero__title {
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1.15;
}

.hero__subtitle {
  margin-top: 8px;
  font-size: 0.95rem;
  opacity: 0.88;
}

.hero__create {
  display: block;
  padding: 14px;
  margin-top: 20px;
  border-radius: var(--radius-md);
  background: var(--color-accent);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
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

.dashboard__total {
  grid-column: 1 / -1;
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

  .hero {
    justify-content: center;
    min-height: 340px;
    padding: 32px;
    background-color: #0d50ca;
    background-position: right center;
    background-size: auto 100%;
  }

  .hero::before {
    background: linear-gradient(
      90deg,
      rgba(8, 28, 92, 0.92) 0%,
      rgba(8, 28, 92, 0.92) 40%,
      rgba(8, 28, 92, 0) 70%
    );
  }

  .hero__content {
    max-width: 46%;
  }

  .hero__title {
    font-size: 2.4rem;
  }

  .hero__create {
    display: inline-block;
    padding: 12px 24px;
  }

  .dashboard__stats {
    grid-template-columns: repeat(5, 1fr);
  }

  .dashboard__total {
    grid-column: auto;
  }
}
</style>
