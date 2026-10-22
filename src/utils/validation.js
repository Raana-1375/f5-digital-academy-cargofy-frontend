import i18n from '@/i18n'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const MIN_PASSWORD_LENGTH = 8

function t(key, params) {
  return i18n.global.t(key, params ?? {})
}

export function isValidEmail(email) {
  return EMAIL_PATTERN.test(email.trim())
}

export function isValidPassword(password) {
  return password.length >= MIN_PASSWORD_LENGTH
}

export function validateSignIn({ email, password }) {
  const errors = {}

  if (!email.trim()) {
    errors.email = t('validation.emailRequired')
  } else if (!isValidEmail(email)) {
    errors.email = t('validation.emailInvalid')
  }

  if (!password) {
    errors.password = t('validation.passwordRequired')
  }

  return errors
}

export function validateSignUp({
  fullName,
  email,
  password,
  confirmPassword,
  role,
  operatorAccessCode,
}) {
  const errors = {}

  if (!fullName.trim()) {
    errors.fullName = t('validation.fullNameRequired')
  }

  if (!email.trim()) {
    errors.email = t('validation.emailRequired')
  } else if (!isValidEmail(email)) {
    errors.email = t('validation.emailInvalid')
  }

  if (!role) {
    errors.role = t('validation.roleRequired')
  }

  if (role === 'OPERATOR' && !operatorAccessCode?.trim()) {
    errors.operatorAccessCode = t('validation.accessCodeRequired')
  }

  if (!password) {
    errors.password = t('validation.passwordRequired')
  } else if (!isValidPassword(password)) {
    errors.password = t('validation.passwordMin', { min: MIN_PASSWORD_LENGTH })
  }

  if (confirmPassword !== password) {
    errors.confirmPassword = t('validation.passwordsMismatch')
  }

  return errors
}

export const NOTE_MAX_LENGTH = 300
export const GOODS_DESCRIPTION_MAX_LENGTH = 200

const HS_CODE_PATTERN = /^\d{6,10}$/

export function validateNewShipment({
  origin,
  destination,
  note,
  transportMode,
  packageType,
  quantity,
  weightKg,
  goodsDescription,
  hsCode,
}) {
  const errors = {}

  if (!origin || !origin.trim()) {
    errors.origin = t('validation.originRequired')
  }

  if (!destination || !destination.trim()) {
    errors.destination = t('validation.destinationRequired')
  }

  if (!transportMode) {
    errors.transportMode = t('validation.transportRequired')
  }

  if (!packageType) {
    errors.packageType = t('validation.packageRequired')
  }

  if (quantity === '' || quantity === null || quantity === undefined) {
    errors.quantity = t('validation.quantityRequired')
  } else if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
    errors.quantity = t('validation.quantityMin')
  }

  if (weightKg === '' || weightKg === null || weightKg === undefined) {
    errors.weightKg = t('validation.weightRequired')
  } else if (!(Number(weightKg) > 0)) {
    errors.weightKg = t('validation.weightPositive')
  }

  if (goodsDescription && goodsDescription.length > GOODS_DESCRIPTION_MAX_LENGTH) {
    errors.goodsDescription = t('validation.goodsMax', { max: GOODS_DESCRIPTION_MAX_LENGTH })
  }

  if (hsCode && !HS_CODE_PATTERN.test(hsCode.trim())) {
    errors.hsCode = t('validation.hsInvalid')
  }

  if (note && note.length > NOTE_MAX_LENGTH) {
    errors.note = t('validation.noteMax', { max: NOTE_MAX_LENGTH })
  }

  return errors
}

export function validateProfile({ name, email }) {
  const errors = {}

  if (!name.trim()) {
    errors.name = t('validation.fullNameRequired')
  }

  if (!email.trim()) {
    errors.email = t('validation.emailRequired')
  } else if (!isValidEmail(email)) {
    errors.email = t('validation.emailInvalid')
  }

  return errors
}

export function validatePasswordChange({ currentPassword, newPassword, confirmPassword }) {
  const errors = {}

  if (!currentPassword) {
    errors.currentPassword = t('validation.currentPasswordRequired')
  }

  if (!newPassword) {
    errors.newPassword = t('validation.newPasswordRequired')
  } else if (!isValidPassword(newPassword)) {
    errors.newPassword = t('validation.passwordMin', { min: MIN_PASSWORD_LENGTH })
  }

  if (confirmPassword !== newPassword) {
    errors.confirmPassword = t('validation.passwordsMismatch')
  }

  return errors
}
