<script setup>
import { computed } from 'vue'
import { getStatusInfo } from '@/utils/shipmentStatus'

const STEPS = [
  { tone: 'preparing', labelKey: 'status.preparing', icon: '📦' },
  { tone: 'transit', labelKey: 'status.inTransit', icon: '🚚' },
  { tone: 'customs', labelKey: 'status.customs', icon: '🛃' },
  { tone: 'delivered', labelKey: 'status.delivered', icon: '✅' },
]

const props = defineProps({
  status: { type: String, default: '' },
})

const currentIndex = computed(() => {
  const { tone } = getStatusInfo(props.status)
  return STEPS.findIndex((step) => step.tone === tone)
})

function stepState(index) {
  if (currentIndex.value === STEPS.length - 1 && index === currentIndex.value) return 'done'
  if (index < currentIndex.value) return 'done'
  if (index === currentIndex.value) return 'current'
  return 'upcoming'
}
</script>

<template>
  <ol class="stepper" :aria-label="$t('stepper.label')">
    <li
      v-for="(step, index) in STEPS"
      :key="step.tone"
      class="stepper__step"
      :class="`stepper__step--${stepState(index)}`"
      :aria-current="stepState(index) === 'current' ? 'step' : undefined"
    >
      <span class="stepper__circle" aria-hidden="true">
        {{ stepState(index) === 'done' ? '✓' : step.icon }}
      </span>
      <span class="stepper__label">{{ $t(step.labelKey) }}</span>
    </li>
  </ol>
</template>

<style scoped>
.stepper {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 0;
  padding: 0;
  list-style: none;
}

.stepper__step {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 6px;
  text-align: center;
}

.stepper__step:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 19px;
  left: calc(50% + 24px);
  width: calc(100% - 48px);
  height: 3px;
  border-radius: 2px;
  background: var(--color-soft);
}

.stepper__step--done:not(:last-child)::after {
  background: var(--color-success);
}

.stepper__circle {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-soft);
  font-size: 1.1rem;
  color: var(--color-text-muted);
  filter: grayscale(1);
  opacity: 0.7;
}

.stepper__step--done .stepper__circle {
  background: var(--color-success);
  color: #fff;
  font-weight: 700;
  filter: none;
  opacity: 1;
}

.stepper__step--current .stepper__circle {
  background: var(--color-icon-bg);
  box-shadow: 0 0 0 3px var(--color-primary);
  filter: none;
  opacity: 1;
}

.stepper__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.stepper__step--current .stepper__label {
  color: var(--color-primary);
}

.stepper__step--done .stepper__label {
  color: var(--color-text);
}
</style>
