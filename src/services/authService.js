import api from './api'

export default {
  // Register new user
  async register(userData) {
    const response = await api.post('/auth/register/', userData)
    return response.data
  },

  // Login user
  async login(credentials) {
    const response = await api.post('/auth/login/', credentials)
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  // Logout user
  async logout() {
    const refreshToken = localStorage.getItem('refresh_token')
    try {
      await api.post('/auth/logout/', { refresh: refreshToken })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user')
    }
  },

  // Verify email
  async verifyEmail(token) {
    const response = await api.post(`/auth/verify-email/${token}/`)
    return response.data
  },

  // Resend verification email
  async resendVerification(email) {
    const response = await api.post('/auth/resend-verification/', { email })
    return response.data
  },

  // Forgot password
  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password/', { email })
    return response.data
  },

  // Reset password
  async resetPassword(token, newPassword, newPassword2) {
    const response = await api.post('/auth/reset-password/', {
      token,
      new_password: newPassword,
      new_password2: newPassword2
    })
    return response.data
  },

  // Change password
  async changePassword(oldPassword, newPassword) {
    const response = await api.post('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword
    })
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access)
      localStorage.setItem('refresh_token', response.data.refresh)
    }
    return response.data
  },

  // Get user profile
  async getProfile() {
    const response = await api.get('/auth/profile/')
    return response.data
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('access_token')
  },

  // Get current user from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }
}
