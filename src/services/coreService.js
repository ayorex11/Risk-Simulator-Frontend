import api from './api'

export default {
  // User endpoints
  async getCurrentUser() {
    const response = await api.get('/core/users/me/')
    return response.data
  },

  async updateCurrentUser(userData) {
    const response = await api.put('/core/users/me/update/', userData)
    return response.data
  },

  async listUsers(params = {}) {
    const response = await api.get('/core/users/', { params })
    return response.data
  },

  async getUserDetail(userId) {
    const response = await api.get(`/core/users/${userId}/`)
    return response.data
  },

  async updateUser(userId, userData) {
    const response = await api.put(`/core/users/${userId}/update/`, userData)
    return response.data
  },

  async getUserPermissions() {
    const response = await api.get('/core/users/permissions/')
    return response.data
  },

  // Organization endpoints
  async getOrganization() {
    const response = await api.get('/core/organization/')
    return response.data
  },

  async createOrganization(orgData) {
    const response = await api.post('/core/organization/create/', orgData)
    return response.data
  },

  async updateOrganization(orgData) {
    const response = await api.put('/core/organization/update/', orgData)
    return response.data
  },

  async getOrganizationStats() {
    const response = await api.get('/core/organization/stats/')
    return response.data
  },

  async getDashboardOverview() {
    const response = await api.get('/core/organization/dashboard/')
    return response.data
  },

  // Organization requests
  async sendOrganizationRequest(organizationId) {
    const response = await api.post(`/core/organization/${organizationId}/request/`)
    return response.data
  },

  async getRequestList() {
    const response = await api.get('/core/organization/request_list/')
    return response.data
  },

  async approveRequest(requestId) {
    const response = await api.post(`/core/organization/${requestId}/approve/`)
    return response.data
  }
}
