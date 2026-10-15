<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createShipment } from '@/services/shipmentService'
import { fetchUsersByRole } from '@/services/userService'
import { NOTE_MAX_LENGTH, validateNewShipment } from '@/utils/validation'
import AppNav from '@/components/AppNav.vue'

const router = useRouter()

const form = reactive({
  origin: '',
  destination: '',
  clientId: '',
  operatorId: '',
  estimatedDelivery: '',
  note: '',
})
const errors = ref({})
const submitError = ref('')
const optionsError = ref('')
const submitting = ref(false)
const clients = ref([])
const operators = ref([])

function optionLabel(user) {
  return user.companyName ? `${user.name} – ${user.companyName}` : user.name
}

async function loadOptions() {
  try {
    const [clientList, operatorList] = await Promise.all([
      fetchUsersByRole('CLIENT'),
      fetchUsersByRole('OPERATOR'),
    ])
    clients.value = clientList
    operators.value = operatorList
  } catch (err) {
    optionsError.value = err.message
  }
}

async function submit() {
  submitError.value = ''
  errors.value = validateNewShipment(form)
  if (Object.keys(errors.value).length > 0) return

  submitting.value = true
  try {
    const created = await createShipment({
      origin: form.origin.trim(),
      destination: form.destination.trim(),
      clientId: form.clientId ? Number(form.clientId) : null,
      assignedOperatorId: form.operatorId ? Number(form.operatorId) : null,
      estimatedDelivery: form.estimatedDelivery ? `${form.estimatedDelivery}T00:00:00` : null,
      note: form.note.trim() || null,
    })
    router.push(`/shipments/${created.id}`)
  } catch (err) {
    submitError.value = err.message
  } finally {
    submitting.value = false
  }
}

onMounted(loadOptions)
</script>

<template>
  <div class="new-page">
    <AppNav />

    <main class="new">
      <header class="new__header">
        <h1>Book Shipment</h1>
        <p>Enter the route, client assignment and dispatch schedule.</p>
      </header>

      <form class="new__form" novalidate @submit.prevent="submit">
        <div class="field">
          <label for="origin">Origin Port / Hub <span class="required">Required</span></label>
          <input
            id="origin"
            v-model="form.origin"
            type="text"
            placeholder="e.g. Port of Hamburg (DEHAM)"
            :aria-invalid="!!errors.origin"
          />
          <p v-if="errors.origin" class="field__error">{{ errors.origin }}</p>
        </div>

        <div class="field">
          <label for="destination">
            Destination Port / Hub <span class="required">Required</span>
          </label>
          <input
            id="destination"
            v-model="form.destination"
            type="text"
            placeholder="e.g. Port of New York & New Jersey (USNYC)"
            :aria-invalid="!!errors.destination"
          />
          <p v-if="errors.destination" class="field__error">{{ errors.destination }}</p>
        </div>

        <div class="field">
          <label for="client">Client <span class="optional">(Optional)</span></label>
          <select id="client" v-model="form.clientId">
            <option value="">Select client</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">
              {{ optionLabel(client) }}
            </option>
          </select>
        </div>

        <div class="field">
          <label for="operator">Assigned Operator <span class="optional">(Optional)</span></label>
          <select id="operator" v-model="form.operatorId">
            <option value="">Select freight broker / operator</option>
            <option v-for="operator in operators" :key="operator.id" :value="operator.id">
              {{ optionLabel(operator) }}
            </option>
          </select>
        </div>

        <p v-if="optionsError" class="field__error" role="alert">
          Could not load clients and operators: {{ optionsError }}
        </p>

        <div class="field">
          <label for="delivery">
            Estimated Delivery Date <span class="optional">(Optional)</span>
          </label>
          <input id="delivery" v-model="form.estimatedDelivery" type="date" />
        </div>

        <div class="field">
          <label for="note">
            Cargo Description &amp; Notes <span class="optional">(Optional)</span>
            <span class="counter" :class="{ 'counter--over': form.note.length > NOTE_MAX_LENGTH }">
              {{ form.note.length }}/{{ NOTE_MAX_LENGTH }}
            </span>
          </label>
          <textarea
            id="note"
            v-model="form.note"
            rows="4"
            placeholder="Special handling instructions, container number, reefer temperature requirements..."
            :aria-invalid="!!errors.note"
          ></textarea>
          <p v-if="errors.note" class="field__error">{{ errors.note }}</p>
        </div>

        <p v-if="submitError" class="new__error" role="alert">{{ submitError }}</p>

        <div class="new__actions">
          <router-link to="/shipments" class="btn btn--secondary">Cancel</router-link>
          <button type="submit" class="btn btn--primary" :disabled="submitting">
            {{ submitting ? 'Creating...' : 'Create Shipment' }}
          </button>
        </div>
      </form>
    </main>
  </div>
</template>

<style scoped>
.new-page {
  min-height: 100vh;
  background: var(--color-bg);
}

.new {
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 16px 96px;
}

.new__header h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-text);
}

.new__header p {
  margin-bottom: 16px;
  color: var(--color-text-muted);
}

.new__form {
  display: grid;
  gap: 16px;
  padding: 16px;
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.field {
  display: grid;
  gap: 6px;
}

.field label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text);
}

.required {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--color-primary);
}

.optional {
  font-weight: 400;
  color: var(--color-text-muted);
}

.counter {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--color-text-muted);
}

.counter--over {
  color: #b91c1c;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  background: var(--color-soft);
  font: inherit;
  color: var(--color-text);
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.field [aria-invalid='true'] {
  border-color: #b91c1c;
}

.field textarea {
  resize: vertical;
}

.field__error,
.new__error {
  font-size: 0.85rem;
  color: #b91c1c;
}

.new__actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 12px;
}

.btn {
  padding: 12px;
  border: none;
  border-radius: var(--radius-md);
  font: inherit;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
}

.btn--secondary {
  background: var(--color-soft);
  color: var(--color-primary);
}

.btn--primary {
  background: var(--color-accent);
  color: #fff;
}

.btn--primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (min-width: 768px) {
  .new {
    padding-top: 88px;
    padding-bottom: 32px;
  }

  .new__form {
    padding: 24px;
  }
}
</style>
