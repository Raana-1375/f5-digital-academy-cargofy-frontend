import i18n, { getLocaleTag } from '@/i18n'

const TRANSPORT_ICONS = { AIR: '✈️', SEA: '🚢', ROAD: '🚚' }
const PACKAGE_KEYS = { PALLET: 'pallet', BOX: 'box', ENVELOPE: 'envelope' }

const EMPTY = '—'

export function getTransportInfo(mode) {
  const icon = TRANSPORT_ICONS[mode]
  if (!icon) return { icon: '', label: EMPTY }

  return { icon, label: i18n.global.t(`transport.${mode.toLowerCase()}`) }
}

export function formatPackage(packageType, quantity) {
  const key = PACKAGE_KEYS[packageType]
  if (!key || !quantity) return EMPTY

  // The message holds "singular | plural"; the quantity picks one.
  return `${quantity} × ${i18n.global.t(`package.${key}`, quantity)}`
}

export function formatWeight(weightKg) {
  if (weightKg === null || weightKg === undefined) return EMPTY
  const formatted = new Intl.NumberFormat(getLocaleTag(), { maximumFractionDigits: 2 }).format(
    weightKg,
  )
  return `${formatted} kg`
}

export function formatPrice(price) {
  if (price === null || price === undefined) return EMPTY
  return new Intl.NumberFormat(getLocaleTag(), { style: 'currency', currency: 'EUR' }).format(price)
}
