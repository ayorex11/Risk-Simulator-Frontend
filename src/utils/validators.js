export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password) => {
  // At least 8 characters
  if (password.length < 8) {
    return 'Password must be at least 8 characters long'
  }
  return null
}

export const validatePasswordMatch = (password, confirmPassword) => {
  if (password !== confirmPassword) {
    return 'Passwords do not match'
  }
  return null
}
