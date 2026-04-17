import api from './api'

export default {
  // ==================== SIMULATIONS ====================
  async getSimulations(params = {}) {
    const response = await api.get('/simulations/', { params })
    return response.data
  },

  async getSimulation(id) {
    const response = await api.get(`/simulations/${id}/`)
    return response.data
  },

  async createSimulation(data) {
    const response = await api.post('/simulations/', data)
    return response.data
  },

  async deleteSimulation(id) {
    const response = await api.delete(`/simulations/${id}/`)
    return response.data
  },

  async executeSimulation(id, forceRerun = false) {
    const response = await api.post(`/simulations/${id}/execute/`, { force_rerun: forceRerun })
    return response.data
  },

  async getSimulationResults(id) {
    const response = await api.get(`/simulations/${id}/results/`)
    return response.data
  },

  // ==================== SCENARIO TEMPLATES ====================
  async getScenarioTemplates() {
    const response = await api.get('/simulations/scenarios/')
    return response.data
  },

  async getScenarioTemplate(id) {
    const response = await api.get(`/simulations/scenarios/${id}/`)
    return response.data
  },

  async getScenarioParameters(id) {
    const response = await api.get(`/simulations/scenarios/${id}/parameters/`)
    return response.data
  },

  // ==================== BUSINESS PROCESSES ====================
  async getProcesses(params = {}) {
    const response = await api.get('/simulations/processes/', { params })
    return response.data
  },

  async getDependencyMap() {
    const response = await api.get('/simulations/processes/dependency-map/')
    return response.data
  },

  async createProcess(data) {
    const response = await api.post('/simulations/processes/', data)
    return response.data
  },

  async getProcess(id) {
    const response = await api.get(`/simulations/processes/${id}/`)
    return response.data
  },

  async updateProcess(id, data) {
    const response = await api.patch(`/simulations/processes/${id}/`, data)
    return response.data
  },

  async deleteProcess(id) {
    const response = await api.delete(`/simulations/processes/${id}/`)
    return response.data
  },

  // ==================== ANALYTICS & COMPARISON ====================
  async getSimulationSummary() {
    const response = await api.get('/simulations/summary/')
    return response.data
  },

  async compareSimulations(simulationIds, metrics = []) {
    const response = await api.post('/simulations/compare/', {
      simulation_ids: simulationIds,
      comparison_metrics: metrics,
    })
    return response.data
  },

  async whatIfAnalysis(data) {
    const response = await api.post('/simulations/what-if/', data)
    return response.data
  },

  async batchCreate(data) {
    const response = await api.post('/simulations/batch-create/', data)
    return response.data
  },
}
