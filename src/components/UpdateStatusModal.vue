<script setup>
import { ref } from 'vue'
import { STATUS_OPTIONS } from '@/utils/shipmentStatus'
import { NOTE_MAX_LENGTH } from '@/utils/validation'

const props = defineProps({
  currentStatus: { type: String, default: '' },
  submitting: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['submit', 'cancel'])

const status = ref(props.currentStatus)
const note = ref('')

function onSubmit() {
  if (status.value === props.currentStatus) return
  emit('submit', { status: status.value, note: note.value.trim() })
}
</script>

<template>
  <div class="modal" @click.self="emit('cancel')" @keydown.esc="emit('cancel')">
    <form
      class="modal__dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="update-status-title"
      @submit.prevent="onSubmit"
    >
      <h2 id="update-status-title">Update Status</h2>

      <label class="field">
        <span class="field__label">New status</span>
        <select v-model="status" class="field__input">
          <option v-for="option in STATUS_OPTIONS" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </label>

      <label class="field">
        <span class="field__label">Note (optional)</span>
        <textarea
          v-model="note"
          class="field__input"
          rows="3"
          :maxlength="NOTE_MAX_LENGTH"
          placeholder="Add details about this change..."
        ></textarea>
        <span class="field__counter">{{ note.length }}/{{ NOTE_MAX_LENGTH }}</span>
      </label>

      <p v-if="error" class="modal__error" role="alert">{{ error }}</p>

      <div class="modal__actions">
        <button
          type="button"
          class="btn btn--secondary"
          :disabled="submitting"
          @click="emit('cancel')"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="btn btn--primary"
          :disabled="submitting || status === currentStatus"
        >
          {{ submitting ? 'Saving...' : 'Confirm' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 16px;
  background: rgba(15, 23, 42, 0.5);
}

.modal__dialog {
  display: grid;
  gap: 16px;
  width: 100%;
  max-width: 420px;
  padding: 24px;
  border-radius: var(--radius-lg);
  background: var(--color-card);
}

.modal__dialog h2 {
  font-size: 1.2rem;
  color: var(--color-text);
}

.field {
  display: grid;
  gap: 6px;
}

.field__label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
}

.field__input {
  padding: 10px 12px;
  border: 1px solid #cbd5e1;
  border-radius: var(--radius-sm);
  background: var(--color-card);
  font: inherit;
  color: var(--color-text);
}

.field__input:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 1px;
}

textarea.field__input {
  resize: vertical;
}

.field__counter {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  text-align: right;
}

.modal__error {
  color: #b91c1c;
  font-size: 0.9rem;
}

.modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.btn {
  padding: 10px 18px;
  border: none;
  border-radius: var(--radius-md);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.btn--primary {
  background: var(--color-primary);
  color: #fff;
}

.btn--secondary {
  background: var(--color-soft);
  color: var(--color-text);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
