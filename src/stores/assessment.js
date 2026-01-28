import { defineStore } from 'pinia'
import assessmentService from '../services/assessmentService'
import { useToast } from 'vue-toastification'

const toast = useToast()

export const useAssessmentStore = defineStore('assessment', {
  state: () => ({
    assessments: [],
    currentAssessment: null,
    assessmentSummary: null,
    questions: [],
    templates: [],
    currentQuestionnaire: null,
    evidence: [],
    loading: false,
    error: null,
  }),

  getters: {
    getAssessmentById: (state) => (id) => {
      return state.assessments.find((assessment) => assessment.id === id)
    },

    assessmentsByStatus: (state) => {
      return {
        draft: state.assessments.filter((a) => a.status === 'draft'),
        in_progress: state.assessments.filter((a) => a.status === 'in_progress'),
        completed: state.assessments.filter((a) => a.status === 'completed'),
        approved: state.assessments.filter((a) => a.status === 'approved'),
      }
    },

    assessmentsByVendor: (state) => (vendorId) => {
      return state.assessments.filter((a) => a.vendor === vendorId)
    },

    totalAssessments: (state) => state.assessments.length,

    averageScore: (state) => {
      const completed = state.assessments.filter(
        (a) => a.status === 'completed' || a.status === 'approved',
      )
      if (completed.length === 0) return 0
      const total = completed.reduce((sum, a) => sum + (a.overall_score || 0), 0)
      return Math.round(total / completed.length)
    },
  },

  actions: {
    async fetchAssessments(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await assessmentService.getAssessments(params)
        this.assessments = response
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch assessments'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchAssessment(id) {
      this.loading = true
      this.error = null
      try {
        const response = await assessmentService.getAssessment(id)
        this.currentAssessment = response
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch assessment'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createAssessment(assessmentData) {
      this.loading = true
      this.error = null
      try {
        const response = await assessmentService.createAssessment(assessmentData)
        this.assessments.unshift(response)
        toast.success('Assessment created successfully!')
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to create assessment'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateAssessment(id, assessmentData) {
      this.loading = true
      this.error = null
      try {
        const response = await assessmentService.updateAssessment(id, assessmentData)
        const index = this.assessments.findIndex((a) => a.id === id)
        if (index !== -1) {
          this.assessments[index] = response
        }
        if (this.currentAssessment?.id === id) {
          this.currentAssessment = response
        }
        toast.success('Assessment updated successfully!')
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to update assessment'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteAssessment(id) {
      this.loading = true
      this.error = null
      try {
        await assessmentService.deleteAssessment(id)
        this.assessments = this.assessments.filter((a) => a.id !== id)
        toast.success('Assessment deleted successfully!')
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to delete assessment'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async approveAssessment(id, approvalData = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await assessmentService.approveAssessment(id, approvalData)
        const index = this.assessments.findIndex((a) => a.id === id)
        if (index !== -1) {
          this.assessments[index] = response.assessment
        }
        if (this.currentAssessment?.id === id) {
          this.currentAssessment = response.assessment
        }
        toast.success('Assessment approved successfully!')
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to approve assessment'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async compareAssessments(id) {
      this.loading = true
      this.error = null
      try {
        const response = await assessmentService.compareAssessments(id)
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to compare assessments'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchAssessmentSummary() {
      this.loading = true
      this.error = null
      try {
        const response = await assessmentService.getAssessmentSummary()
        this.assessmentSummary = response
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch summary'
        this.error = errorMsg
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchQuestions(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await assessmentService.getQuestions(params)
        this.questions = response
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch questions'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createQuestion(questionData) {
      this.loading = true
      this.error = null
      try {
        const response = await assessmentService.createQuestion(questionData)
        this.questions.unshift(response)
        toast.success('Question created successfully!')
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to create question'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchQuestionnaire(templateId = null) {
      this.loading = true
      this.error = null
      try {
        const response = await assessmentService.getQuestionnaire(templateId)
        this.currentQuestionnaire = response
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch questionnaire'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchTemplates() {
      this.loading = true
      this.error = null
      try {
        const response = await assessmentService.getTemplates()
        this.templates = response
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch templates'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchTemplate(id) {
      this.loading = true
      this.error = null
      try {
        const response = await assessmentService.getTemplate(id)
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch template'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createTemplate(templateData) {
      this.loading = true
      this.error = null
      try {
        const response = await assessmentService.createTemplate(templateData)
        this.templates.unshift(response)
        toast.success('Template created successfully!')
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to create template'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchEvidence(assessmentId) {
      this.loading = true
      this.error = null
      try {
        const response = await assessmentService.getEvidence(assessmentId)
        this.evidence = response
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch evidence'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async uploadEvidence(assessmentId, evidenceData) {
      this.loading = true
      this.error = null
      try {
        const response = await assessmentService.uploadEvidence(assessmentId, evidenceData)
        this.evidence.unshift(response)
        toast.success('Evidence uploaded successfully!')
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to upload evidence'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteEvidence(evidenceId) {
      this.loading = true
      this.error = null
      try {
        await assessmentService.deleteEvidence(evidenceId)
        this.evidence = this.evidence.filter((e) => e.id !== evidenceId)
        toast.success('Evidence deleted successfully!')
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to delete evidence'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
