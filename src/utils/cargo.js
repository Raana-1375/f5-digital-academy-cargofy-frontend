const TRANSPORT_MODES = {
  AIR: { icon: '✈️', label: 'Air' },
  SEA: { icon: '🚢', label: 'Sea' },
  ROAD: { icon: '🚚', label: 'Road' },
}

const PACKAGE_TYPES = {
  PALLET: { icon: '📦', label: 'Pallet', plural: 'Pallets' },
  BOX: { icon: '🧰', label: 'Box', plural: 'Boxes' },
  ENVELOPE: { icon: '✉️', label: 'Envelope', plural: 'Envelopes' },
}

const EMPTY = '—'

export function getTransportInfo(mode) {
  return TRANSPORT_MODES[mode] ?? { icon: '', label: EMPTY }
}

export function formatPackage(packageType, quantity) {
  const info = PACKAGE_TYPES[packageType]
  if (!info || !quantity) return EMPTY
  return `${quantity} × ${quantity === 1 ? info.label : info.plural}`
}

export function formatWeight(weightKg) {
  if (weightKg === null || weightKg === undefined) return EMPTY
  const formatted = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(weightKg)
  return `${formatted} kg`
}

export function formatPrice(price) {
  if (price === null || price === undefined) return EMPTY
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(price)
}
