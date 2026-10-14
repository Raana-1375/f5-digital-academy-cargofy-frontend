<script setup>
defineProps({
  variant: {
    type: String,
    default: 'total',
    validator: (value) => ['total', 'transit', 'customs', 'delivered'].includes(value),
  },
  label: { type: String, required: true },
  value: { type: Number, default: 0 },
  badge: { type: String, default: '' },
})
</script>

<template>
  <article class="stat-card" :class="`stat-card--${variant}`">
    <div class="stat-card__top">
      <span class="stat-card__icon" aria-hidden="true">
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
          <template v-if="variant === 'total'">
            <rect x="3" y="4" width="18" height="4" rx="1" />
            <path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8" />
            <path d="M10 12h4" />
          </template>
          <template v-else-if="variant === 'transit'">
            <path d="M3 6h11v10H3z" />
            <path d="M14 10h4l3 3v3h-7" />
            <circle cx="7" cy="18" r="2" />
            <circle cx="17" cy="18" r="2" />
          </template>
          <template v-else-if="variant === 'customs'">
            <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
          </template>
          <template v-else>
            <circle cx="12" cy="12" r="9" />
            <path d="M8 12l3 3 5-6" />
          </template>
        </svg>
      </span>
      <span v-if="badge" class="stat-card__badge">{{ badge }}</span>
    </div>
    <p class="stat-card__value">{{ value }}</p>
    <p class="stat-card__label">{{ label }}</p>
  </article>
</template>

<style scoped>
.stat-card {
  background: var(--color-card);
  border-radius: var(--radius-lg);
  padding: 16px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.stat-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.stat-card__icon {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  background: var(--color-icon-bg);
  color: var(--status-transit-text);
}

.stat-card--transit .stat-card__icon {
  background: var(--status-transit-bg);
}

.stat-card--customs .stat-card__icon {
  background: var(--status-customs-bg);
  color: var(--status-customs-text);
}

.stat-card--delivered .stat-card__icon {
  background: var(--status-delivered-bg);
  color: var(--status-delivered-text);
}

.stat-card__badge {
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--color-accent);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
}

.stat-card__value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
}

.stat-card__label {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}
</style>
