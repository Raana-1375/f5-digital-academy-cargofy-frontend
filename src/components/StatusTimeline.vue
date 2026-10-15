<script setup>
import { getStatusInfo } from '@/utils/shipmentStatus'
import { formatDate } from '@/utils/format'

defineProps({
  history: { type: Array, default: () => [] },
})

function formatTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <section class="timeline">
    <div class="timeline__header">
      <h2>Shipment History</h2>
      <span v-if="history.length">
        {{ history.length }} {{ history.length === 1 ? 'Update' : 'Updates' }}
      </span>
    </div>

    <p v-if="history.length === 0" class="timeline__empty">No status updates yet.</p>

    <ol v-else class="timeline__list">
      <li
        v-for="(entry, index) in history"
        :key="`${entry.status}-${entry.updatedDate}`"
        class="timeline__item"
        :class="{ 'timeline__item--current': index === history.length - 1 }"
      >
        <span class="timeline__dot" aria-hidden="true"></span>

        <div class="timeline__row">
          <p class="timeline__status">
            {{ getStatusInfo(entry.status).label }}
            <span v-if="index === history.length - 1" class="timeline__badge">Current</span>
          </p>
          <span class="timeline__date">{{ formatDate(entry.updatedDate) }}</span>
        </div>

        <p class="timeline__meta">
          {{ formatTime(entry.updatedDate) }}
          <template v-if="entry.updatedByName">• {{ entry.updatedByName }}</template>
        </p>

        <p v-if="entry.note" class="timeline__note">{{ entry.note }}</p>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.timeline {
  padding: 16px;
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.timeline__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.timeline__header h2 {
  font-size: 1.1rem;
  color: var(--color-text);
}

.timeline__header span {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.timeline__empty {
  color: var(--color-text-muted);
}

.timeline__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.timeline__item {
  position: relative;
  padding: 0 0 20px 28px;
}

.timeline__item::before {
  content: '';
  position: absolute;
  top: 18px;
  bottom: 0;
  left: 7px;
  width: 2px;
  background: var(--color-success);
}

.timeline__item:last-child {
  padding-bottom: 0;
}

.timeline__item:last-child::before {
  display: none;
}

.timeline__dot {
  position: absolute;
  top: 3px;
  left: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-success);
}

.timeline__item--current .timeline__dot {
  background: var(--color-primary);
  box-shadow: 0 0 0 4px var(--color-icon-bg);
}

.timeline__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.timeline__status {
  font-weight: 600;
  color: var(--color-text);
}

.timeline__item--current .timeline__status {
  color: var(--color-primary);
}

.timeline__badge {
  margin-left: 6px;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  background: var(--color-icon-bg);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.timeline__date {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.timeline__meta {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.timeline__note {
  padding: 8px 12px;
  margin-top: 8px;
  border-radius: var(--radius-sm);
  background: var(--color-soft);
  font-size: 0.9rem;
  color: var(--color-text);
}
</style>
