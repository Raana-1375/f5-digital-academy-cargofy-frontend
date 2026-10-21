const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const MIN_PASSWORD_LENGTH = 8

export function isValidEmail(email) {
  return EMAIL_PATTERN.test(email.trim())
}

export function isValidPassword(password) {
  return password.length >= MIN_PASSWORD_LENGTH
}

export function validateSignIn({ email, password }) {
  const errors = {}

  if (!email.trim()) {
    errors.email = 'Email is required'
  } else if (!isValidEmail(email)) {
    errors.email = 'Enter a valid email address'
  }

  if (!password) {
    errors.password = 'Password is required'
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
    errors.fullName = 'Full name is required'
  }

  if (!email.trim()) {
    errors.email = 'Email is required'
  } else if (!isValidEmail(email)) {
    errors.email = 'Enter a valid email address'
  }

  if (!role) {
    errors.role = 'Select your role'
  }

  if (role === 'OPERATOR' && !operatorAccessCode?.trim()) {
    errors.operatorAccessCode = 'Operator access code is required'
  }

  if (!password) {
    errors.password = 'Password is required'
  } else if (!isValidPassword(password)) {
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
  }

  if (confirmPassword !== password) {
    errors.confirmPassword = 'Passwords do not match'
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
    errors.origin = 'Origin is required'
  }

  if (!destination || !destination.trim()) {
    errors.destination = 'Destination is required'
  }

  if (!transportMode) {
    errors.transportMode = 'Transport mode is required'
  }

  if (!packageType) {
    errors.packageType = 'Package type is required'
  }

  if (quantity === '' || quantity === null || quantity === undefined) {
    errors.quantity = 'Quantity is required'
  } else if (!Number.isInteger(Number(quantity)) || Number(quantity) < 1) {
    errors.quantity = 'Quantity must be at least 1'
  }

  if (weightKg === '' || weightKg === null || weightKg === undefined) {
    errors.weightKg = 'Weight is required'
  } else if (!(Number(weightKg) > 0)) {
    errors.weightKg = 'Weight must be greater than 0'
  }

  if (goodsDescription && goodsDescription.length > GOODS_DESCRIPTION_MAX_LENGTH) {
    errors.goodsDescription = `Goods description must be at most ${GOODS_DESCRIPTION_MAX_LENGTH} characters`
  }

  if (hsCode && !HS_CODE_PATTERN.test(hsCode.trim())) {
    errors.hsCode = 'HS code must contain 6 to 10 digits'
  }

  if (note && note.length > NOTE_MAX_LENGTH) {
    errors.note = `Notes must be at most ${NOTE_MAX_LENGTH} characters`
  }

  return errors
}

export function validateProfile({ name, email }) {
  const errors = {}

  if (!name.trim()) {
    errors.name = 'Full name is required'
  }

  if (!email.trim()) {
    errors.email = 'Email is required'
  } else if (!isValidEmail(email)) {
    errors.email = 'Enter a valid email address'
  }

  return errors
}

export function validatePasswordChange({ currentPassword, newPassword, confirmPassword }) {
  const errors = {}

  if (!currentPassword) {
    errors.currentPassword = 'Current password is required'
  }

  if (!newPassword) {
    errors.newPassword = 'New password is required'
  } else if (!isValidPassword(newPassword)) {
    errors.newPassword = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
  }

  if (confirmPassword !== newPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }

  return errors
}
