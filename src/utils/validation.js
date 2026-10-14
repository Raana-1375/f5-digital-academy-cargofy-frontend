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

export function validateSignUp({ fullName, email, password, confirmPassword, role }) {
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
