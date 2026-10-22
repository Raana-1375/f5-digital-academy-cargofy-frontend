<script setup>
import { useI18n } from 'vue-i18n'
import { SUPPORTED_LOCALES, setLocale } from '@/i18n'

const { locale, t } = useI18n()
</script>

<template>
  <div class="lang-switch" role="group" :aria-label="t('language.label')">
    <button
      v-for="code in SUPPORTED_LOCALES"
      :key="code"
      type="button"
      class="lang-switch__option"
      :class="{ 'lang-switch__option--active': locale === code }"
      :aria-pressed="locale === code"
      @click="setLocale(code)"
    >
      {{ code.toUpperCase() }}
    </button>
  </div>
</template>

<style scoped>
.lang-switch {
  display: inline-flex;
  padding: 3px;
  border-radius: 999px;
  background: var(--color-soft);
}

.lang-switch__option {
  padding: 4px 11px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--color-text-muted);
  font: inherit;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
}

.lang-switch__option--active {
  background: var(--color-primary);
  color: #fff;
}
</style>
