<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createShipment } from '@/services/shipmentService'
import { fetchUsersByRole } from '@/services/userService'
import {
  GOODS_DESCRIPTION_MAX_LENGTH,
  NOTE_MAX_LENGTH,
  validateNewShipment,
} from '@/utils/validation'
import AppNav from '@/components/AppNav.vue'
import PageBanner from '@/components/PageBanner.vue'

const router = useRouter()

const form = reactive({
  origin: '',
  destination: '',
  clientId: '',
  operatorId: '',
  estimatedDelivery: '',
  transportMode: '',
  packageType: '',
  quantity: '',
  weightKg: '',
  goodsDescription: '',
  dangerousGoods: false,
  hsCode: '',
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
      transportMode: form.transportMode,
      packageType: form.packageType,
      quantity: Number(form.quantity),
      weightKg: Number(form.weightKg),
      goodsDescription: form.goodsDescription.trim() || null,
      dangerousGoods: form.dangerousGoods,
      hsCode: form.hsCode.trim() || null,
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
      <PageBanner
        :title="$t('banner.newShipment.title')"
        :subtitle="$t('banner.newShipment.subtitle')"
      />

      <form class="new__form" novalidate @submit.prevent="submit">
        <div class="field">
          <label for="origin">
            {{ $t('newShipment.origin') }}
            <span class="required">{{ $t('newShipment.required') }}</span>
          </label>
          <input
            id="origin"
            v-model="form.origin"
            type="text"
            :placeholder="$t('newShipment.originPlaceholder')"
            :aria-invalid="!!errors.origin"
          />
          <p v-if="errors.origin" class="field__error">{{ errors.origin }}</p>
        </div>

        <div class="field">
          <label for="destination">
            {{ $t('newShipment.destination') }}
            <span class="required">{{ $t('newShipment.required') }}</span>
          </label>
          <input
            id="destination"
            v-model="form.destination"
            type="text"
            :placeholder="$t('newShipment.destinationPlaceholder')"
            :aria-invalid="!!errors.destination"
          />
          <p v-if="errors.destination" class="field__error">{{ errors.destination }}</p>
        </div>

        <h2 class="new__section">{{ $t('newShipment.cargoSection') }}</h2>

        <div class="field-row">
          <div class="field">
            <label for="transportMode">
              {{ $t('newShipment.transportMode') }}
              <span class="required">{{ $t('newShipment.required') }}</span>
            </label>
            <select
              id="transportMode"
              v-model="form.transportMode"
              :aria-invalid="!!errors.transportMode"
            >
              <option value="">{{ $t('newShipment.selectMode') }}</option>
              <option value="AIR">{{ $t('newShipment.modeAir') }}</option>
              <option value="SEA">{{ $t('newShipment.modeSea') }}</option>
              <option value="ROAD">{{ $t('newShipment.modeRoad') }}</option>
            </select>
            <p v-if="errors.transportMode" class="field__error">{{ errors.transportMode }}</p>
          </div>

          <div class="field">
            <label for="packageType">
              {{ $t('newShipment.packageType') }}
              <span class="required">{{ $t('newShipment.required') }}</span>
            </label>
            <select
              id="packageType"
              v-model="form.packageType"
              :aria-invalid="!!errors.packageType"
            >
              <option value="">{{ $t('newShipment.selectPackage') }}</option>
              <option value="PALLET">{{ $t('newShipment.packagePallet') }}</option>
              <option value="BOX">{{ $t('newShipment.packageBox') }}</option>
              <option value="ENVELOPE">{{ $t('newShipment.packageEnvelope') }}</option>
            </select>
            <p v-if="errors.packageType" class="field__error">{{ errors.packageType }}</p>
          </div>
        </div>

        <div class="field-row">
          <div class="field">
            <label for="quantity">
              {{ $t('newShipment.quantity') }}
              <span class="required">{{ $t('newShipment.required') }}</span>
            </label>
            <input
              id="quantity"
              v-model.number="form.quantity"
              type="number"
              min="1"
              step="1"
              :placeholder="$t('newShipment.quantityPlaceholder')"
              :aria-invalid="!!errors.quantity"
            />
            <p v-if="errors.quantity" class="field__error">{{ errors.quantity }}</p>
          </div>

          <div class="field">
            <label for="weightKg">
              {{ $t('newShipment.weight') }}
              <span class="required">{{ $t('newShipment.required') }}</span>
            </label>
            <input
              id="weightKg"
              v-model.number="form.weightKg"
              type="number"
              min="0"
              step="0.01"
              :placeholder="$t('newShipment.weightPlaceholder')"
              :aria-invalid="!!errors.weightKg"
            />
            <p v-if="errors.weightKg" class="field__error">{{ errors.weightKg }}</p>
          </div>
        </div>

        <div class="field">
          <label for="goodsDescription">
            {{ $t('newShipment.goods') }}
            <span class="optional">{{ $t('newShipment.optional') }}</span>
            <span
              class="counter"
              :class="{
                'counter--over': form.goodsDescription.length > GOODS_DESCRIPTION_MAX_LENGTH,
              }"
            >
              {{ form.goodsDescription.length }}/{{ GOODS_DESCRIPTION_MAX_LENGTH }}
            </span>
          </label>
          <input
            id="goodsDescription"
            v-model="form.goodsDescription"
            type="text"
            :placeholder="$t('newShipment.goodsPlaceholder')"
            :aria-invalid="!!errors.goodsDescription"
          />
          <p v-if="errors.goodsDescription" class="field__error">{{ errors.goodsDescription }}</p>
        </div>

        <div class="field">
          <label for="hsCode">
            {{ $t('newShipment.hsCode') }}
            <span class="optional">{{ $t('newShipment.optional') }}</span>
          </label>
          <input
            id="hsCode"
            v-model="form.hsCode"
            type="text"
            inputmode="numeric"
            :placeholder="$t('newShipment.hsCodePlaceholder')"
            :aria-invalid="!!errors.hsCode"
          />
          <p v-if="errors.hsCode" class="field__error">{{ errors.hsCode }}</p>
        </div>

        <label class="check" for="dangerousGoods">
          <input id="dangerousGoods" v-model="form.dangerousGoods" type="checkbox" />
          <span>{{ $t('newShipment.dangerous') }}</span>
        </label>

        <p v-if="form.dangerousGoods" class="new__warning" role="alert">
          {{ $t('newShipment.dangerousWarning') }}
        </p>

        <h2 class="new__section">{{ $t('newShipment.assignmentSection') }}</h2>

        <div class="field">
          <label for="client">
            {{ $t('newShipment.client') }}
            <span class="optional">{{ $t('newShipment.optional') }}</span>
          </label>
          <select id="client" v-model="form.clientId">
            <option value="">{{ $t('newShipment.selectClient') }}</option>
            <option v-for="client in clients" :key="client.id" :value="client.id">
              {{ optionLabel(client) }}
            </option>
          </select>
        </div>

        <div class="field">
          <label for="operator">
            {{ $t('newShipment.operator') }}
            <span class="optional">{{ $t('newShipment.optional') }}</span>
          </label>
          <select id="operator" v-model="form.operatorId">
            <option value="">{{ $t('newShipment.selectOperator') }}</option>
            <option v-for="operator in operators" :key="operator.id" :value="operator.id">
              {{ optionLabel(operator) }}
            </option>
          </select>
        </div>

        <p v-if="optionsError" class="field__error" role="alert">
          {{ $t('newShipment.optionsError', { error: optionsError }) }}
        </p>

        <div class="field">
          <label for="delivery">
            {{ $t('newShipment.delivery') }}
            <span class="optional">{{ $t('newShipment.optional') }}</span>
          </label>
          <input id="delivery" v-model="form.estimatedDelivery" type="date" />
        </div>

        <div class="field">
          <label for="note">
            {{ $t('newShipment.notes') }}
            <span class="optional">{{ $t('newShipment.optional') }}</span>
            <span class="counter" :class="{ 'counter--over': form.note.length > NOTE_MAX_LENGTH }">
              {{ form.note.length }}/{{ NOTE_MAX_LENGTH }}
            </span>
          </label>
          <textarea
            id="note"
            v-model="form.note"
            rows="4"
            :placeholder="$t('newShipment.notesPlaceholder')"
            :aria-invalid="!!errors.note"
          ></textarea>
          <p v-if="errors.note" class="field__error">{{ errors.note }}</p>
        </div>

        <p v-if="submitError" class="new__error" role="alert">{{ submitError }}</p>

        <div class="new__actions">
          <router-link to="/shipments" class="btn btn--secondary">{{
            $t('newShipment.cancel')
          }}</router-link>
          <button type="submit" class="btn btn--primary" :disabled="submitting">
            {{ submitting ? $t('newShipment.creating') : $t('newShipment.create') }}
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

.new__form {
  display: grid;
  gap: 16px;
  padding: 16px;
  background: var(--color-card);
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.new__section {
  padding-top: 8px;
  border-top: 1px solid var(--color-soft);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
}

.field {
  display: grid;
  gap: 6px;
}

.field-row {
  display: grid;
  gap: 16px;
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

.check {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border-radius: var(--radius-md);
  background: var(--color-soft);
  font-weight: 600;
  color: var(--color-text);
  cursor: pointer;
}

.new__warning {
  padding: 12px;
  border-radius: var(--radius-md);
  background: #fef2f2;
  font-size: 0.9rem;
  font-weight: 600;
  color: #b91c1c;
}

.check input {
  width: 18px;
  height: 18px;
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

  .field-row {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
