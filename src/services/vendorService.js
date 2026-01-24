import api from './api'

export default {
  // Vendor CRUD
  async getVendors(params = {}) {
    const response = await api.get('/vendors/', { params })
    return response.data
  },

  async getVendor(id) {
    const response = await api.get(`/vendors/${id}/`)
    return response.data
  },

  async createVendor(vendorData) {
    const response = await api.post('/vendors/', vendorData)
    return response.data
  },

  async updateVendor(id, vendorData) {
    const response = await api.patch(`/vendors/${id}/`, vendorData)
    return response.data
  },

  async deleteVendor(id) {
    const response = await api.delete(`/vendors/${id}/`)
    return response.data
  },

  // Risk calculations
  async recalculateRisk(vendorId) {
    const response = await api.post(`/vendors/${vendorId}/recalculate-risk/`)
    return response.data
  },

  async getRiskHistory(vendorId) {
    const response = await api.get(`/vendors/${vendorId}/risk-history/`)
    return response.data
  },

  async getDependencies(vendorId) {
    const response = await api.get(`/vendors/${vendorId}/dependencies/`)
    return response.data
  },

  // Vendor analytics
  async getVendorSummary() {
    const response = await api.get('/vendors/summary/')
    return response.data
  },

  async compareVendors(vendorIds) {
    const response = await api.post('/vendors/compare/', { vendor_ids: vendorIds })
    return response.data
  },

  // Incidents
  async getIncidents(params = {}) {
    const response = await api.get('/vendors/incidents/', { params })
    return response.data
  },

  async createIncident(incidentData) {
    const response = await api.post('/vendors/incidents/', incidentData)
    return response.data
  },

  async getIncident(id) {
    const response = await api.get(`/vendors/incidents/${id}/`)
    return response.data
  },

  async updateIncident(id, incidentData) {
    const response = await api.patch(`/vendors/incidents/${id}/`, incidentData)
    return response.data
  },

  async deleteIncident(id) {
    const response = await api.delete(`/vendors/incidents/${id}/`)
    return response.data
  },

  async getIncidentTrends() {
    const response = await api.get('/vendors/incidents/trends/')
    return response.data
  },

  // Certifications
  async getCertifications(params = {}) {
    const response = await api.get('/vendors/certifications/', { params })
    return response.data
  },

  async createCertification(certData) {
    const response = await api.post('/vendors/certifications/', certData)
    return response.data
  },

  async getExpiringCertifications() {
    const response = await api.get('/vendors/certifications/expiring/')
    return response.data
  },

  // Contacts
  async getVendorContacts(vendorId) {
    const response = await api.get(`/vendors/${vendorId}/contacts/`)
    return response.data
  },

  async createVendorContact(vendorId, contactData) {
    const response = await api.post(`/vendors/${vendorId}/contacts/`, contactData)
    return response.data
  },
}
