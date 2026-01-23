import { defineStore } from 'pinia'
import coreService from '../services/coreService'
import { useToast } from 'vue-toastification'

const toast = useToast()

export const useCoreStore = defineStore('core', {
  state: () => ({
    currentUser: null,
    organization: null,
    permissions: null,
    dashboardData: null,
    organizationStats: null,
    users: [],
    organizationRequests: [],
    loading: false,
    error: null
  }),

  getters: {
    isAdmin: (state) => state.permissions?.role === 'admin',
    isManager: (state) => ['admin', 'manager'].includes(state.permissions?.role),
    isAnalyst: (state) => ['admin', 'analyst', 'manager'].includes(state.permissions?.role),
    hasOrganization: (state) => !!state.organization,
    userRole: (state) => state.permissions?.role || 'viewer'
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
        const response = await coreService.updateCurrentUser(userData)
        this.currentUser = response
        toast.success('Profile updated successfully!')
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to update profile'
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
    }
  }
})
