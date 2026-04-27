import { defineStore } from 'pinia'
import simulationService from '../services/simulationService'
import { useToast } from 'vue-toastification'

const toast = useToast()

export const useSimulationStore = defineStore('simulation', {
  state: () => ({
    simulations: [],
    currentSimulation: null,
    scenarioTemplates: [],
    simulationSummary: null,
    loading: false,
    error: null,
  }),

  getters: {
    getSimulationById: (state) => {
      return (id) => state.simulations.find((s) => s.id === id)
    },

    simulationsByStatus: (state) => {
      return {
        pending: state.simulations.filter((s) => s.status === 'pending'),
        running: state.simulations.filter((s) => s.status === 'running'),
        completed: state.simulations.filter((s) => s.status === 'completed'),
        failed: state.simulations.filter((s) => s.status === 'failed'),
      }
    },

    completedSimulations: (state) => {
      return state.simulations.filter((s) => s.status === 'completed')
    },

    totalSimulations: (state) => state.simulations.length,
  },

  actions: {
    // ==================== SIMULATIONS ====================
    async fetchSimulations(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await simulationService.getSimulations(params)
        this.simulations = Array.isArray(response) ? response : response?.results || []
        return this.simulations
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch simulations'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchSimulation(id) {
      this.loading = true
      this.error = null
      try {
        const response = await simulationService.getSimulation(id)
        this.currentSimulation = response
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch simulation'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchSimulationResults(id) {
      try {
        const response = await simulationService.getSimulationResults(id)
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch simulation results'
        // toast.error(errorMsg) // Optional: suppress if we have fallback
        throw error
      }
    },

    async createSimulation(data) {
      this.loading = true
      this.error = null
      try {
        const response = await simulationService.createSimulation(data)
        this.simulations.unshift(response)
        toast.success('Simulation created successfully')
        return response
      } catch (error) {
        const data = error.response?.data
        if (error.response?.status === 400 && data && typeof data === 'object' && !data.error) {
          return { fieldErrors: data }
        }
        const errorMsg = data?.error || data?.detail || 'Failed to create simulation'
        this.error = errorMsg
        toast.error(errorMsg)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteSimulation(id) {
      try {
        await simulationService.deleteSimulation(id)
        this.simulations = this.simulations.filter((s) => s.id !== id)
        toast.success('Simulation deleted')
        return true
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to delete simulation'
        toast.error(errorMsg)
        throw error
      }
    },

    async executeSimulation(id, forceRerun = false) {
      // No global loading — execution has its own loading state in the view
      try {
        const response = await simulationService.executeSimulation(id, forceRerun)
        // Update the current simulation with fresh data
        if (response.simulation) {
          this.currentSimulation = response.simulation
        }
        toast.success('Simulation completed successfully!')
        return response
      } catch (error) {
        const errorMsg =
          error.response?.data?.error ||
          error.response?.data?.details ||
          'Simulation execution failed'
        toast.error(errorMsg)
        throw error
      }
    },

    // ==================== SCENARIO TEMPLATES ====================
    async fetchScenarioTemplates() {
      try {
        const response = await simulationService.getScenarioTemplates()
        this.scenarioTemplates = Array.isArray(response) ? response : []
        return this.scenarioTemplates
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch scenario templates'
        toast.error(errorMsg)
        throw error
      }
    },

    async fetchScenarioParameters(templateId) {
      try {
        const response = await simulationService.getScenarioParameters(templateId)
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch scenario parameters'
        toast.error(errorMsg)
        throw error
      }
    },

    // ==================== ANALYTICS ====================
    async fetchSimulationSummary() {
      this.error = null
      try {
        const response = await simulationService.getSimulationSummary()
        this.simulationSummary = response
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to fetch summary'
        this.error = errorMsg
        throw error
      }
    },

    async compareSimulations(simulationIds, metrics = []) {
      try {
        const response = await simulationService.compareSimulations(simulationIds, metrics)
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to compare simulations'
        toast.error(errorMsg)
        throw error
      }
    },

    async whatIfAnalysis(data) {
      try {
        const response = await simulationService.whatIfAnalysis(data)
        toast.success('What-if scenario created')
        return response
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Failed to create what-if analysis'
        toast.error(errorMsg)
        throw error
      }
    },
  },
})
