import { defineStore } from 'pinia'
import vendorService from '../services/vendorService'
import { useToast } from 'vue-toastification'

const toast = useToast()

export const useVendorStore = defineStore('vendor', {
  state: () => ({
    vendors: [],
    currentVendor: null,
    vendorSummary: null,
    incidents: [],
    incidentTrends: null,
    certifications: [],
    expiringCertifications: [],
    riskHistory: [],
    dependencies: null,
    vendorContacts: [],
    comparisonResults: null,
    loading: false,
    error: null,
  }),

  getters: {
    getVendorById: (state) => (id) => {
      return state.vendors.find((vendor) => vendor.id === id)
    },

    vendorsByRiskLevel: (state) => {
      return {
        critical: state.vendors.filter((v) => v.risk_level === 'critical'),
        high: state.vendors.filter((v) => v.risk_level === 'high'),
        medium: state.vendors.filter((v) => v.risk_level === 'medium'),
        low: state.vendors.filter((v) => v.risk_level === 'low'),
      }
    },

    activeVendors: (state) => state.vendors.filter((v) => v.is_active),

    totalVendors: (state) => state.vendors.length,

    averageRiskScore: (state) => {
      if (state.vendors.length === 0) return 0
      const total = state.vendors.reduce((sum, v) => sum + (v.overall_risk_score || 0), 0)
      return total / state.vendors.length
    },
  },

  actions: {
    async fetchVendors(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await vendorService.getVendors(params)
        this.vendors = response
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch vendors'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchVendor(id) {
      this.loading = true
      this.error = null
      try {
        const response = await vendorService.getVendor(id)
        this.currentVendor = response
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch vendor'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createVendor(vendorData) {
      this.loading = true
      this.error = null
      try {
        const response = await vendorService.createVendor(vendorData)
        this.vendors.push(response)
        toast.success('Vendor created successfully!')
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to create vendor'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateVendor(id, vendorData) {
      this.loading = true
      this.error = null
      try {
        const response = await vendorService.updateVendor(id, vendorData)
        const index = this.vendors.findIndex((v) => v.id === id)
        if (index !== -1) {
          this.vendors[index] = response
        }
        if (this.currentVendor?.id === id) {
          this.currentVendor = response
        }
        toast.success('Vendor updated successfully!')
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to update vendor'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteVendor(id) {
      this.loading = true
      this.error = null
      try {
        await vendorService.deleteVendor(id)
        this.vendors = this.vendors.filter((v) => v.id !== id)
        toast.success('Vendor deleted successfully!')
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to delete vendor'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async recalculateRisk(vendorId) {
      this.loading = true
      this.error = null
      try {
        const response = await vendorService.recalculateRisk(vendorId)
        // Update the vendor in the list
        const index = this.vendors.findIndex((v) => v.id === vendorId)
        if (index !== -1) {
          this.vendors[index].overall_risk_score = response.overall_risk_score
          this.vendors[index].risk_level = response.risk_level
        }
        toast.success('Risk score recalculated!')
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to recalculate risk'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchVendorSummary() {
      this.loading = true
      this.error = null
      try {
        const response = await vendorService.getVendorSummary()
        this.vendorSummary = response
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch summary'
        this.error = errorMsg
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchIncidents(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await vendorService.getIncidents(params)
        this.incidents = response
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch incidents'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createIncident(incidentData) {
      this.loading = true
      this.error = null
      try {
        const response = await vendorService.createIncident(incidentData)
        this.incidents.unshift(response)
        toast.success('Incident reported successfully!')
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to create incident'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateIncident(id, incidentData) {
      this.loading = true
      try {
        const response = await vendorService.updateIncident(id, incidentData)
        const index = this.incidents.findIndex((i) => i.id === id)
        if (index !== -1) this.incidents[index] = response
        toast.success('Incident updated!')
        return response
      } catch (error) {
        toast.error('Failed to update incident')
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteIncident(id) {
      this.loading = true
      try {
        await vendorService.deleteIncident(id)
        this.incidents = this.incidents.filter((i) => i.id !== id)
        toast.success('Incident deleted')
      } catch (error) {
        toast.error('Failed to delete incident')
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchCertifications(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await vendorService.getCertifications(params)
        this.certifications = response
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch certifications'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createCertification(certData) {
      this.loading = true
      this.error = null
      try {
        const response = await vendorService.createCertification(certData)
        this.certifications.unshift(response)
        toast.success('Certification added successfully!')
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to add certification'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateCertification(id, certData) {
      this.loading = true
      try {
        const response = await vendorService.updateCertification(id, certData)
        const index = this.certifications.findIndex((c) => c.id === id)
        if (index !== -1) this.certifications[index] = response
        toast.success('Certification updated!')
        return response
      } catch (error) {
        toast.error('Failed to update certification')
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteCertification(id) {
      this.loading = true
      try {
        await vendorService.deleteCertification(id)
        this.certifications = this.certifications.filter((c) => c.id !== id)
        toast.success('Certification removed')
      } catch (error) {
        toast.error('Failed to delete certification')
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchRiskHistory(vendorId) {
      this.loading = true
      try {
        const response = await vendorService.getRiskHistory(vendorId)
        this.riskHistory = response.history
        return response
      } catch (error) {
        toast.error('Failed to fetch risk history')
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchDependencies(vendorId) {
      this.loading = true
      try {
        const response = await vendorService.getDependencies(vendorId)
        this.dependencies = response
        return response
      } catch (error) {
        toast.error('Failed to fetch dependencies')
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchIncidentTrends() {
      this.loading = true
      try {
        const response = await vendorService.getIncidentTrends()
        this.incidentTrends = response
        return response
      } catch (error) {
        toast.error('Failed to fetch incident trends')
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchVendorContacts(vendorId) {
      this.loading = true
      try {
        const response = await vendorService.getVendorContacts(vendorId)
        this.vendorContacts = response
        return response
      } catch (error) {
        toast.error('Failed to fetch contacts')
        throw error
      } finally {
        this.loading = false
      }
    },

    async createVendorContact(vendorId, contactData) {
      this.loading = true
      try {
        const response = await vendorService.createVendorContact(vendorId, contactData)
        this.vendorContacts.push(response)
        toast.success('Contact added!')
        return response
      } catch (error) {
        toast.error('Failed to add contact')
        throw error
      } finally {
        this.loading = false
      }
    },

    async compareVendors(vendorIds) {
      this.loading = true
      try {
        const response = await vendorService.compareVendors(vendorIds)
        this.comparisonResults = response
        return response
      } catch (error) {
        toast.error('Comparison failed')
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchExpiringCertifications() {
      this.loading = true
      try {
        const response = await vendorService.getExpiringCertifications()
        this.expiringCertifications = response
        return response
      } catch (error) {
        toast.error('Failed to fetch expiring certifications')
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
