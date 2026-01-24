import api from './api'

export default {
  // Assessment CRUD
  async getAssessments(params = {}) {
    const response = await api.get('/assessments/', { params })
    return response.data
  },

  async getAssessment(id) {
    const response = await api.get(`/assessments/${id}/`)
    return response.data
  },

  async createAssessment(assessmentData) {
    const response = await api.post('/assessments/', assessmentData)
    return response.data
  },

  async updateAssessment(id, assessmentData) {
    const response = await api.patch(`/assessments/${id}/`, assessmentData)
    return response.data
  },

  async deleteAssessment(id) {
    const response = await api.delete(`/assessments/${id}/`)
    return response.data
  },

  // Assessment actions
  async approveAssessment(id, approvalData = {}) {
    const response = await api.post(`/assessments/${id}/approve/`, approvalData)
    return response.data
  },

  async compareAssessments(id) {
    const response = await api.get(`/assessments/${id}/compare/`)
    return response.data
  },

  // Assessment analytics
  async getAssessmentSummary() {
    const response = await api.get('/assessments/summary/')
    return response.data
  },

  // Questions
  async getQuestions(params = {}) {
    const response = await api.get('/assessments/questions/', { params })
    return response.data
  },

  async createQuestion(questionData) {
    const response = await api.post('/assessments/questions/', questionData)
    return response.data
  },

  // Questionnaire
  async getQuestionnaire(templateId = null) {
    const params = templateId ? { template_id: templateId } : {}
    const response = await api.get('/assessments/questionnaire/', { params })
    return response.data
  },

  // Templates
  async getTemplates() {
    const response = await api.get('/assessments/templates/')
    return response.data
  },

  async getTemplate(id) {
    const response = await api.get(`/assessments/templates/${id}/`)
    return response.data
  },

  async createTemplate(templateData) {
    const response = await api.post('/assessments/templates/', templateData)
    return response.data
  },

  // Evidence
  async getEvidence(assessmentId) {
    const response = await api.get(`/assessments/${assessmentId}/evidence/`)
    return response.data
  },

  async uploadEvidence(assessmentId, evidenceData) {
    const formData = new FormData()

    // Append all fields to FormData
    Object.keys(evidenceData).forEach((key) => {
      if (evidenceData[key] !== null && evidenceData[key] !== undefined) {
        formData.append(key, evidenceData[key])
      }
    })

    const response = await api.post(`/assessments/${assessmentId}/evidence/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  async deleteEvidence(evidenceId) {
    const response = await api.delete(`/assessments/evidence/${evidenceId}/`)
    return response.data
  },
}
