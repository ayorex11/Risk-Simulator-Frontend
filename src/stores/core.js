import { defineStore } from 'pinia'
import coreService from '../services/coreService'
import authService from '../services/authService'
import { useToast } from 'vue-toastification'

const toast = useToast()

export const useCoreStore = defineStore('core', {
  state: () => ({
    currentUser: authService.getCurrentUser(),
    organization: null,
    permissions: null,
    dashboardData: null,
    organizationStats: null,
    users: [],
    organizationRequests: [],
    allOrganizations: [],
    loading: false,
    error: null,
  }),

  getters: {
    isAdmin: (state) => state.permissions?.role === 'admin',
    isManager: (state) => ['admin', 'manager'].includes(state.permissions?.role),
    isAnalyst: (state) => ['admin', 'analyst', 'manager'].includes(state.permissions?.role),
    hasOrganization: (state) =>
      !!state.organization ||
      !!state.currentUser?.organization ||
      !!state.currentUser?.organization_id ||
      !!state.currentUser?.profile?.organization,
    userRole: (state) => state.permissions?.role || 'viewer',
  },

  actions: {
    async fetchCurrentUser() {
      this.loading = true
      this.error = null
      try {
        const response = await coreService.getCurrentUser()
        this.currentUser = response
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch user'
        this.error = errorMsg
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateCurrentUser(userData) {
      this.loading = true
      this.error = null
      try {
        await coreService.updateCurrentUser(userData)

        // Fix: Re-fetch the full user object to ensure all fields (including auth-level fields)
        // are correctly populated in the store and local storage, preventing "missing fields" issues.
        const fullUser = await this.fetchCurrentUser()

        // Sync with auth store
        const { useAuthStore } = await import('./auth')
        const authStore = useAuthStore()
        authStore.user = fullUser
        localStorage.setItem('user', JSON.stringify(fullUser))

        toast.success('Profile updated successfully!')
        return fullUser
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to update profile'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async adminUpdateName(nameData) {
      this.loading = true
      this.error = null
      try {
        await coreService.adminUpdateName(nameData)
        const fullUser = await this.fetchCurrentUser()

        // Sync with auth store
        const { useAuthStore } = await import('./auth')
        const authStore = useAuthStore()
        authStore.user = fullUser
        localStorage.setItem('user', JSON.stringify(fullUser))

        return fullUser
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to update name'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchOrganization() {
      this.loading = true
      this.error = null
      try {
        const response = await coreService.getOrganization()
        this.organization = response
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch organization'
        this.error = errorMsg
        throw error
      } finally {
        this.loading = false
      }
    },

    async createOrganization(orgData) {
      this.loading = true
      this.error = null
      try {
        const response = await coreService.createOrganization(orgData)
        this.organization = response

        // Refresh permissions and user data to reflect role change
        await this.fetchPermissions()
        await this.fetchCurrentUser()

        toast.success('Organization created successfully!')
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to create organization'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateOrganization(orgData) {
      this.loading = true
      this.error = null
      try {
        const response = await coreService.updateOrganization(orgData)
        this.organization = response

        // Refresh permissions in case role or access changed
        await this.fetchPermissions()

        toast.success('Organization updated successfully!')
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to update organization'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchPermissions() {
      this.loading = true
      this.error = null
      try {
        const response = await coreService.getUserPermissions()
        this.permissions = response
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch permissions'
        this.error = errorMsg
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchDashboard() {
      this.loading = true
      this.error = null
      try {
        const response = await coreService.getDashboardOverview()
        this.dashboardData = response
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch dashboard'
        this.error = errorMsg
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchOrganizationStats() {
      this.loading = true
      this.error = null
      try {
        const response = await coreService.getOrganizationStats()
        this.organizationStats = response
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch stats'
        this.error = errorMsg
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchUsers(params) {
      this.loading = true
      this.error = null
      try {
        const response = await coreService.listUsers(params)
        this.users = response
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch users'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateUser(userId, userData) {
      this.loading = true
      this.error = null
      try {
        const response = await coreService.updateUser(userId, userData)
        // Refresh users list if we were displaying it
        if (this.users.length > 0) {
          const index = this.users.findIndex((u) => u.id === userId)
          if (index !== -1) {
            this.users[index] = { ...this.users[index], ...response }
          }
        }
        toast.success('User updated successfully!')
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to update user'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateUserProfile(userId, profileData) {
      this.loading = true
      this.error = null
      try {
        const response = await coreService.updateUserProfile(userId, profileData)

        // If we updated the current user, sync the store and local storage
        if (this.currentUser && String(userId) === String(this.currentUser.id)) {
          // Re-fetch the full user object to ensure all fields are correctly populated
          const fullUser = await this.fetchCurrentUser()

          // Sync with auth store
          const { useAuthStore } = await import('./auth')
          const authStore = useAuthStore()
          authStore.user = fullUser
          localStorage.setItem('user', JSON.stringify(fullUser))
        }

        // Refresh users list if we were displaying it
        if (this.users.length > 0) {
          const index = this.users.findIndex((u) => u.id === userId)
          if (index !== -1) {
            // Re-fetch user details to ensure we have the most accurate state
            const updatedUser = await coreService.getUserDetail(userId)
            this.users[index] = updatedUser
          }
        }
        toast.success('User profile updated successfully!')
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to update user profile'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchOrganizationRequests() {
      this.loading = true
      this.error = null
      try {
        const response = await coreService.getRequestList()
        this.organizationRequests = response
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch requests'
        this.error = errorMsg
        throw error
      } finally {
        this.loading = false
      }
    },

    async approveRequest(requestId) {
      this.loading = true
      this.error = null
      try {
        await coreService.approveRequest(requestId)
        toast.success('Request approved successfully!')
        // Refresh the list
        await this.fetchOrganizationRequests()
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to approve request'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async joinOrganization(organizationId) {
      this.loading = true
      this.error = null
      try {
        const response = await coreService.sendOrganizationRequest(organizationId)
        toast.success(response.message || 'Request sent successfully!')
        // Refresh user data (might have pending status now)
        await this.fetchCurrentUser()
        return response
      } catch (error) {
        const errorMsg =
          error.response?.data?.message || error.response?.data?.error || 'Failed to send request'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchOrganizations(params = {}) {
      this.loading = true
      this.error = null
      try {
        // Fallback or assume /core/organizations/ exists if we're to search
        const response = await coreService.listOrganizations(params)
        this.allOrganizations = response
        return response
      } catch (error) {
        this.error = 'Failed to search organizations'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
