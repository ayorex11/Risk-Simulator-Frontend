import { defineStore } from 'pinia'
import authService from '../services/authService'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const toast = useToast()

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: authService.getCurrentUser(),
    isAuthenticated: authService.isAuthenticated(),
    accessToken: null,
    loading: false,
    error: null,
  }),

  getters: {
    getUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
  },

  actions: {
    async initializeAuth() {
      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/token/refresh/`,
            { refresh: refreshToken }
          )
          this.accessToken = response.data.access
          this.isAuthenticated = true
        } catch (error) {
          this.accessToken = null
          this.isAuthenticated = false
          this.user = null
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('user')
        }
      }
    },
    setAccessToken(token) {
      this.accessToken = token
    },
    clearAccessToken() {
      this.accessToken = null
    },

    async register(userData) {
      this.loading = true
      this.error = null
      try {
        const response = await authService.register(userData)
        toast.success(response.message || 'Registration successful! Please check your email.')
        return response
      } catch (error) {
        const errorMsg =
          error.response?.data?.error || error.response?.data?.email?.[0] || 'Registration failed'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const response = await authService.login(credentials)
        this.user = response.user
        this.isAuthenticated = true
        toast.success('Login successful!')
        return response
      } catch (error) {
        const data = error.response?.data
        if (error.response?.status === 400 && data && typeof data === 'object' && !data.error) {
          return { fieldErrors: data }
        }
        const errorMsg = data?.error || data?.detail || 'Login failed'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      this.loading = true
      try {
        await authService.logout()
        this.user = null
        this.isAuthenticated = false
        toast.success('Logged out successfully')
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.loading = false
      }
    },

    async verifyEmail(token) {
      this.loading = true
      this.error = null
      try {
        const response = await authService.verifyEmail(token)
        toast.success(response.message || 'Email verified successfully!')
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Email verification failed'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async resendVerification(email) {
      this.loading = true
      this.error = null
      try {
        const response = await authService.resendVerification(email)
        toast.success(response.message || 'Verification email sent!')
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to resend verification email'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async forgotPassword(email) {
      this.loading = true
      this.error = null
      try {
        const response = await authService.forgotPassword(email)
        toast.success(response.message || 'Password reset email sent!')
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to send reset email'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async resetPassword(token, newPassword, newPassword2) {
      this.loading = true
      this.error = null
      try {
        const response = await authService.resetPassword(token, newPassword, newPassword2)
        toast.success(response.message || 'Password reset successfully!')
        return response
      } catch (error) {
        const errorMsg =
          error.response?.data?.error ||
          error.response?.data?.new_password?.[0] ||
          'Password reset failed'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async changePassword(oldPassword, newPassword) {
      this.loading = true
      this.error = null
      try {
        const response = await authService.changePassword(oldPassword, newPassword)
        toast.success(response.message || 'Password changed successfully!')
        return response
      } catch (error) {
        const errorMsg =
          error.response?.data?.error ||
          error.response?.data?.new_password?.[0] ||
          'Password change failed'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchProfile() {
      this.loading = true
      this.error = null
      try {
        const response = await authService.getProfile()
        this.user = response
        localStorage.setItem('user', JSON.stringify(response))
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch profile'
        this.error = errorMsg
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
