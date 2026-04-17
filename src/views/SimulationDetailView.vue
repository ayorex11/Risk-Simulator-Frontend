<template>
  <div class="page-container">
    <NavBar />
    <div class="container">
      <!-- Loading -->
      <div v-if="loading" class="loading-zone">
        <LoadingSpinner />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="error-state">
        <AlertCircle class="error-icon" />
        <p class="error-text">{{ error }}</p>
        <button @click="loadSimulation" class="btn btn-secondary">Retry</button>
      </div>

      <template v-else-if="simulation">
        <!-- Page Header -->
        <header class="page-header">
          <div class="header-content">
            <button @click="router.push('/simulations')" class="back-btn">
              <ArrowLeft class="icon-sm" />
              <span>Back to Simulations</span>
            </button>
            <div class="header-row">
              <div class="header-text">
                <div class="header-badges">
                  <div class="header-badge">
                    <Zap class="badge-icon" />
                    <span>{{ simulation.scenario_name }}</span>
                  </div>
                  <div class="status-pill" :class="simulation.status">
                    <span v-if="simulation.status === 'running'" class="status-pulse"></span>
                    {{ simulation.status }}
                  </div>
                </div>
                <h1 class="page-title">{{ simulation.name }}</h1>
                <p class="page-subtitle">
                  Vendor: <strong>{{ simulation.vendor_name }}</strong> &middot; Created
                  {{ formatDate(simulation.created_at) }}
                  <template v-if="simulation.created_by_name">
                    &middot; by {{ simulation.created_by_name }}
                  </template>
                </p>
              </div>
              <div class="header-actions">
                <button
                  v-if="simulation.status === 'completed'"
                  @click="showWhatIfModal = true"
                  class="btn btn-primary"
                >
                  <Zap class="icon-sm" />
                  What-If Analysis
                </button>
                <button
                  v-if="simulation.status === 'completed'"
                  @click="downloadPDF"
                  class="btn btn-secondary"
                >
                  <ArrowDown class="icon-sm" />
                  Download Report
                </button>
                <button
                  v-if="canExecute"
                  @click="executeSimulation"
                  class="btn btn-primary"
                  :disabled="executing"
                >
                  <Zap v-if="!executing" class="icon-sm" />
                  {{
                    executing
                      ? 'Running...'
                      : simulation.status === 'failed'
                        ? 'Retry Execution'
                        : 'Execute Simulation'
                  }}
                </button>
                <button
                  v-if="
                    isAdmin && (simulation.status === 'pending' || simulation.status === 'failed')
                  "
                  @click="showDeleteModal = true"
                  class="btn btn-danger"
                >
                  <Trash2 class="icon-sm" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- Description and Tags -->
        <div class="desc-card">
          <p v-if="simulation.description" class="desc-text">{{ simulation.description }}</p>
          <div style="margin-top: 16px;">
            <div v-if="!simulation.tags || simulation.tags.length === 0" class="empty-state">
              <p>No tags have been assigned to this simulation yet.</p>
            </div>
            <div v-else class="tags-list">
               <span v-for="tag in simulation.tags" :key="tag" class="tag-item">{{ tag }}</span>
            </div>
          </div>
        </div>

        <!-- Execution Progress -->
        <div v-if="executing" class="exec-card">
          <div class="exec-inner">
            <div class="exec-spinner"></div>
            <div class="exec-text">
              <h3>Simulation Running</h3>
              <p>The risk engine is processing your scenario. This may take a moment...</p>
            </div>
          </div>
          <div class="exec-bar">
            <div class="exec-bar-fill"></div>
          </div>
        </div>

        <!-- Parameters Card -->
        <section
          v-if="simulation.parameters && Object.keys(simulation.parameters).length"
          class="content-card"
        >
          <div class="card-header">
            <div class="header-left">
              <div class="header-icon params">
                <Settings class="icon-xs" />
              </div>
              <h2 class="card-title">Simulation Parameters</h2>
            </div>
            <button @click="showParams = !showParams" class="toggle-link">
              {{ showParams ? 'Hide' : 'Show' }}
            </button>
          </div>
          <div v-if="showParams" class="card-body">
            <div class="params-grid">
              <div v-for="(value, key) in simulation.parameters" :key="key" class="param-item">
                <span class="param-label">{{ formatKey(key) }}</span>
                <span class="param-value">{{ formatParamValue(value) }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Results Section -->
        <template v-if="simulation.status === 'completed' && results">
          <!-- Financial Impact -->
          <section class="content-card">
            <div class="card-header">
              <div class="header-left">
                <div class="header-icon impact">
                  <DollarSign class="icon-xs" />
                </div>
                <h2 class="card-title">Financial Impact Analysis</h2>
              </div>
            </div>
            <div class="card-body">
              <div class="impact-hero">
                <span class="impact-label">Total Estimated Impact</span>
                <span class="impact-value"
                  >{{ formatCurrency(results.total_financial_impact) }}</span
                >
              </div>
              <div class="impact-grid">
                <div class="impact-category">
                  <div class="category-color direct"></div>
                  <div class="category-info">
                    <span class="category-label">Direct Costs</span>
                    <span class="category-value">{{ formatCurrency(results.direct_costs) }}</span>
                  </div>
                </div>
                <div class="impact-category">
                  <div class="category-color operational"></div>
                  <div class="category-info">
                    <span class="category-label">Operational Impact</span>
                    <span class="category-value"
                      >{{ formatCurrency(results.operational_costs) }}</span
                    >
                  </div>
                </div>
                <div class="impact-category">
                  <div class="category-color regulatory"></div>
                  <div class="category-info">
                    <span class="category-label">Regulatory Fines</span>
                    <span class="category-value"
                      >{{ formatCurrency(results.regulatory_costs) }}</span
                    >
                  </div>
                </div>
                <div class="impact-category">
                  <div class="category-color reputational"></div>
                  <div class="category-info">
                    <span class="category-label">Reputational Damage</span>
                    <span class="category-value"
                      >{{ formatCurrency(results.reputational_costs) }}</span
                    >
                  </div>
                </div>
                <div
                  v-if="
                    results.total_cascading_impact && Number(results.total_cascading_impact) > 0
                  "
                  class="impact-category"
                >
                  <div class="category-color cascading"></div>
                  <div class="category-info">
                    <span class="category-label">Cascading Impact</span>
                    <span class="category-value"
                      >{{ formatCurrency(results.total_cascading_impact) }}</span
                    >
                  </div>
                </div>
              </div>
              <div v-if="results" class="chart-container" style="height: 300px; margin-top: 32px;">
                <v-chart class="chart" :option="financialChartOption" autoresize />
              </div>
            </div>
          </section>

          <!-- Operational Metrics -->
          <section class="content-card">
            <div class="card-header">
              <div class="header-left">
                <div class="header-icon metrics">
                  <Activity class="icon-xs" />
                </div>
                <h2 class="card-title">Operational Metrics</h2>
              </div>
            </div>
            <div class="card-body">
              <div class="metrics-grid">
                <div class="metric-card">
                  <span class="metric-label">Risk Score</span>
                  <span class="metric-value risk" :class="getRiskClass(results.risk_score)">
                    {{ (results.risk_score || 0).toFixed(1) }}
                  </span>
                </div>
                <div class="metric-card">
                  <span class="metric-label">Estimated Downtime</span>
                  <span class="metric-value">{{ results.downtime_hours || 0 }}h</span>
                </div>
                <div class="metric-card">
                  <span class="metric-label">Recovery Time</span>
                  <span class="metric-value"
                    >{{ formatHours(results.estimated_recovery_time_hours) }}</span
                  >
                </div>
                <div class="metric-card">
                  <span class="metric-label">Customers Affected</span>
                  <span class="metric-value">{{
                    formatNumber(results.customers_affected || 0)
                  }}</span>
                </div>
                <div class="metric-card">
                  <span class="metric-label">Productivity Loss</span>
                  <span class="metric-value"
                    >{{ (results.productivity_loss_percentage || 0).toFixed(0) }}%</span
                  >
                </div>
                <div class="metric-card">
                  <span class="metric-label">Complexity</span>
                  <span class="metric-value">{{
                    formatKey(results.recovery_complexity || 'medium')
                  }}</span>
                </div>
              </div>
            </div>
          </section>

          <!-- Monte Carlo Results -->
          <section
            v-if="
              results.monte_carlo_results && Object.keys(results.monte_carlo_results).length > 0
            "
            class="content-card"
          >
            <div class="card-header">
              <div class="header-left">
                <div class="header-icon mc">
                  <TrendingUp class="icon-xs" />
                </div>
                <h2 class="card-title">Monte Carlo Analysis</h2>
              </div>
              <span class="mc-iterations"
                >{{ results.monte_carlo_results.iterations?.toLocaleString() }} iterations</span
              >
            </div>
            <div class="card-body">
              <div class="mc-grid">
                <div class="mc-stat">
                  <span class="mc-label">Mean Impact</span>
                  <span class="mc-value"
                    >{{ formatCurrency(results.monte_carlo_results.mean) }}</span
                  >
                </div>
                <div class="mc-stat">
                  <span class="mc-label">Median Impact</span>
                  <span class="mc-value"
                    >{{ formatCurrency(results.monte_carlo_results.median) }}</span
                  >
                </div>
                <div class="mc-stat">
                  <span class="mc-label">Std. Deviation</span>
                  <span class="mc-value"
                    >{{ formatCurrency(results.monte_carlo_results.std_dev) }}</span
                  >
                </div>
                <div class="mc-stat">
                  <span class="mc-label">Min</span>
                  <span class="mc-value"
                    >{{ formatCurrency(results.monte_carlo_results.min) }}</span
                  >
                </div>
                <div class="mc-stat">
                  <span class="mc-label">Max</span>
                  <span class="mc-value"
                    >{{ formatCurrency(results.monte_carlo_results.max) }}</span
                  >
                </div>
              </div>

              <!-- Percentiles -->
              <div class="percentiles-section">
                <h4 class="percentile-title">Percentile Breakdown</h4>
                <div class="percentile-bar-container">
                  <div
                    v-for="pct in ['50', '75', '90', '95', '99']"
                    :key="pct"
                    class="percentile-item"
                  >
                    <span class="pct-label">P{{ pct }}</span>
                    <div class="pct-bar-wrapper">
                      <div
                        class="pct-bar"
                        :style="{ width: getPercentileWidth(results.monte_carlo_results['percentile_' + pct]) + '%' }"
                      ></div>
                    </div>
                    <span class="pct-value">{{ formatCurrency(results.monte_carlo_results['percentile_' + pct]) }}</span>
                  </div>
                </div>
              </div>

              <!-- Confidence Intervals -->
              <div v-if="results.monte_carlo_results.confidence_intervals" class="ci-section">
                <h4 class="ci-title">Confidence Intervals</h4>
                <div class="ci-grid">
                  <div
                    v-for="(interval, level) in results.monte_carlo_results.confidence_intervals"
                    :key="level"
                    class="ci-item"
                  >
                    <span class="ci-level">{{ level }} CI</span>
                    <span class="ci-range">
                      {{ formatCurrency(interval.lower) }} – {{ formatCurrency(interval.upper) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>


          <!-- Affected Processes -->
          <section class="content-card">
            <div class="card-header">
              <div class="header-left">
                <div class="header-icon params">
                  <Settings class="icon-xs" />
                </div>
                <h2 class="card-title">Affected Processes</h2>
              </div>
            </div>
            <div class="card-body">
              <div v-if="!results.affected_processes || results.affected_processes.length === 0" class="empty-state">
                <p>No business processes are linked to this vendor. Add business processes in the vendor management section to see cascading impact analysis.</p>
              </div>
              <div v-else>
                <ul class="rec-list">
                  <li v-for="(proc, idx) in results.affected_processes" :key="idx" class="rec-item">
                    {{ proc }}
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <!-- Cascading Vendor Impacts -->
          <section class="content-card">
            <div class="card-header">
              <div class="header-left">
                <div class="header-icon params">
                  <Settings class="icon-xs" />
                </div>
                <h2 class="card-title">Cascading Vendor Impacts</h2>
              </div>
            </div>
            <div class="card-body">
              <div v-if="!results.cascading_vendor_impacts || results.cascading_vendor_impacts.length === 0" class="empty-state">
                <p>No cascading vendor impacts were found for this scenario.</p>
              </div>
              <div v-else>
                <ul class="rec-list">
                  <li v-for="(vendor, idx) in results.cascading_vendor_impacts" :key="idx" class="rec-item">
                    {{ vendor }}
                  </li>
                </ul>
              </div>
            </div>
          </section>
          <!-- Recommendations -->
          <section v-if="results.recommendations?.length" class="content-card">
            <div class="card-header">
              <div class="header-left">
                <div class="header-icon recs">
                  <CheckCircle class="icon-xs" />
                </div>
                <h2 class="card-title">Recommendations</h2>
              </div>
            </div>
            <div class="card-body">
              <ul class="rec-list">
                <li v-for="(rec, idx) in results.recommendations" :key="idx" class="rec-item">
                  {{ rec }}
                </li>
              </ul>
            </div>
          </section>
        </template>

        <!-- Failed State -->
        <div v-if="simulation.status === 'failed'" class="failed-card">
          <AlertCircle class="failed-icon" />
          <h3>Simulation Failed</h3>
          <p>The simulation engine encountered an error. You can retry the execution.</p>
        </div>

        <!-- Pending State -->
        <div v-if="simulation.status === 'pending' && !executing" class="pending-card">
          <Zap class="pending-icon" />
          <h3>Ready to Execute</h3>
          <p>Click "Execute Simulation" to run this scenario through the risk engine.</p>
        </div>
      </template>
    </div>

    <!-- Delete Modal -->
    <DeleteConfirmationModal
      v-if="showDeleteModal"
      :item-name="simulation?.name"
      title="Delete Simulation"
      confirm-text="Confirm Delete"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    >
      <template #description>
        You are about to permanently delete <strong>{{ simulation?.name }}</strong
        >.
      </template>
    </DeleteConfirmationModal>

    <!-- What-If Modal -->
    <WhatIfCloneModal
      v-if="showWhatIfModal && simulation"
      :base-simulation="simulation"
      @close="showWhatIfModal = false"
      @completed="handleWhatIfComplete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSimulationStore } from '../stores/simulation'
import { useCoreStore } from '../stores/core'
import api from '../services/api'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal.vue'
import WhatIfCloneModal from '../components/simulations/WhatIfCloneModal.vue'
import {
  ArrowLeft,
  ArrowDown,
  Zap,
  Trash2,
  DollarSign,
  Activity,
  TrendingUp,
  Settings,
  CheckCircle,
  AlertCircle,
} from 'lucide-vue-next'
import VChart from 'vue-echarts'
import * as echarts from 'echarts'

const route = useRoute()
const router = useRouter()
const simulationStore = useSimulationStore()
const coreStore = useCoreStore()

const simulation = ref(null)
const results = ref(null)
const loading = ref(true)
const error = ref(null)
const executing = ref(false)
const showParams = ref(false)
const showDeleteModal = ref(false)
const showWhatIfModal = ref(false)

const financialChartOption = computed(() => {
  if (!results.value) return {}
  const data = [
    { name: 'Direct', value: results.value.direct_costs || 0, itemStyle: { color: '#3b82f6' } },
    { name: 'Operational', value: results.value.operational_costs || 0, itemStyle: { color: '#f59e0b' } },
    { name: 'Regulatory', value: results.value.regulatory_costs || 0, itemStyle: { color: '#ef4444' } },
    { name: 'Reputational', value: results.value.reputational_costs || 0, itemStyle: { color: '#8b5cf6' } },
  ]
  
  if (results.value.total_cascading_impact && Number(results.value.total_cascading_impact) > 0) {
    data.push({ name: 'Cascading', value: results.value.total_cascading_impact, itemStyle: { color: '#10b981' } })
  }

  return {
    tooltip: { 
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params) => {
        const val = params[0]
        return `${val.name}: $${Number(val.value).toLocaleString()}`
      }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: { type: 'category', data: data.map(d => d.name) },
    yAxis: { type: 'value', axisLabel: { formatter: (value) => '$' + (value >= 1000 ? (value / 1000) + 'k' : value) } },
    series: [{ 
      type: 'bar', 
      barWidth: '50%',
      data: data,
      itemStyle: { borderRadius: [4, 4, 0, 0] }
    }]
  }
})

const isAdmin = computed(() => coreStore.permissions?.role === 'admin')
const canExecute = computed(() => {
  const role = coreStore.permissions?.role
  const status = simulation.value?.status
  return (
    ['admin', 'manager', 'analyst'].includes(role) && (status === 'pending' || status === 'failed')
  )
})

const loadSimulation = async () => {
  loading.value = true
  error.value = null
  try {
    const id = route.params.id
    simulation.value = await simulationStore.fetchSimulation(id)
    // If completed, load results
    // If completed, load results
    if (simulation.value?.status === 'completed') {
      try {
        if (simulation.value.result) {
          console.log('Using embedded results:', simulation.value.result)
          results.value = simulation.value.result
        } else {
          console.log('Fetching separate results...')
          results.value = await simulationStore.fetchSimulationResults(id)
        }
      } catch (err) {
        console.error('Error loading results:', err)
        // Fallback to whatever might be there
        results.value = simulation.value.result || simulation.value.results || null
      }
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load simulation'
  } finally {
    loading.value = false
  }
}

const executeSimulation = async () => {
  executing.value = true
  try {
    const response = await simulationStore.executeSimulation(route.params.id)
    // Refresh simulation data
    await loadSimulation()
  } catch {
    // Handled by store toast
  } finally {
    executing.value = false
  }
}

const confirmDelete = async () => {
  await simulationStore.deleteSimulation(simulation.value.id)
  showDeleteModal.value = false
  router.push('/simulations')
}

const handleWhatIfComplete = (newSimulation) => {
  showWhatIfModal.value = false
  // Navigate to the new clone
  router.push(`/simulations/${newSimulation.id}`)
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0'
  const value = Number(num)
  if (isNaN(value)) return '0'

  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K'
  return value.toLocaleString()
}

const formatCurrency = (value) => {
  if (!value && value !== 0) return '$0'
  const num = parseFloat(value)
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`
  return `$${num.toFixed(2)}`
}

const formatHours = (hours) => {
  if (!hours && hours !== 0) return 'N/A'
  return `${parseFloat(hours).toFixed(1)}h`
}

const downloadPDF = async () => {
  try {
    const simulationId = route.params.id
    const response = await api.get(
      `/simulations/${simulationId}/report/pdf/`,
      { responseType: 'blob' }
    )
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `scenarioforge_report_${simulationId}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('PDF download failed:', error)
  }
}

const formatKey = (key) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const formatParamValue = (val) => {
  if (typeof val === 'boolean') return val ? 'Yes' : 'No'
  if (Array.isArray(val)) return val.join(', ')
  if (typeof val === 'number') return val.toLocaleString()
  return val
}

const getRiskClass = (score) => {
  if (score >= 80) return 'critical'
  if (score >= 60) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

const getPercentileWidth = (value) => {
  if (!results.value?.monte_carlo_results?.max) return 0
  const max = results.value.monte_carlo_results.max
  return Math.min((value / max) * 100, 100)
}

onMounted(loadSimulation)
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
}
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px 100px;
}

/* Loading / Error */
.loading-zone {
  display: flex;
  justify-content: center;
  padding: 120px 0;
}
.error-state {
  text-align: center;
  padding: 120px 0;
}
.error-icon {
  width: 56px;
  height: 56px;
  color: #ef4444;
  margin: 0 auto 20px;
}
.error-text {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 24px;
}

/* Header */
.page-header {
  padding: 48px 0 40px;
  animation: fadeIn 0.5s ease-out;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: none;
  background: none;
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 20px;
  transition: color 0.2s;
}
.back-btn:hover {
  color: #7c3aed;
}
.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
}
.header-text {
  flex: 1;
}
.header-badges {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
}
.badge-icon {
  width: 14px;
  height: 14px;
}
.status-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: capitalize;
}
.status-pill.pending {
  background: #f1f5f9;
  color: #64748b;
}
.status-pill.running {
  background: #eff6ff;
  color: #3b82f6;
}
.status-pill.completed {
  background: #ecfdf5;
  color: #059669;
}
.status-pill.failed {
  background: #fef2f2;
  color: #dc2626;
}
.status-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3b82f6;
  animation: pulseDot 1.5s ease-in-out infinite;
}
.page-title {
  font-size: 40px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0 0 12px;
}
.page-subtitle {
  font-size: 15px;
  color: #64748b;
  font-weight: 500;
  margin: 0;
}
.page-subtitle strong {
  color: #334155;
}
.header-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
  white-space: nowrap;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-primary {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
}
.btn-primary:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
  transform: translateY(-2px);
}
.btn-secondary {
  background: white;
  color: #475569;
  border: 2px solid #e2e8f0;
}
.btn-danger {
  background: #fef2f2;
  color: #dc2626;
  border: 2px solid #fecaca;
}
.btn-danger:hover {
  background: #fee2e2;
}
.icon-sm {
  width: 18px;
  height: 18px;
}
.icon-xs {
  width: 16px;
  height: 16px;
}

/* Tags and Empty states */
.empty-state {
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px dashed #cbd5e1;
  text-align: center;
}
.empty-state p {
  color: #64748b;
  font-size: 14px;
  margin: 0;
}
.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tag-item {
  background: #e2e8f0;
  color: #334155;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

/* Description Card */
.desc-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 24px;
  padding: 24px 32px;
  margin-bottom: 32px;
}
.desc-text {
  font-size: 15px;
  color: #475569;
  line-height: 1.6;
  margin: 0;
}

/* Execution Progress */
.exec-card {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  border-radius: 24px;
  padding: 40px;
  margin-bottom: 32px;
  animation: fadeIn 0.5s ease-out;
}
.exec-inner {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
}
.exec-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  flex-shrink: 0;
}
.exec-text h3 {
  font-size: 22px;
  font-weight: 900;
  color: white;
  margin: 0 0 8px;
}
.exec-text p {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}
.exec-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}
.exec-bar-fill {
  height: 100%;
  background: white;
  border-radius: 3px;
  animation: progress 3s ease-in-out infinite;
}

/* Content Cards */
.content-card {
  background: white;
  border-radius: 32px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
  margin-bottom: 32px;
  transition: all 0.3s;
  animation: fadeIn 0.5s ease-out;
}
.content-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 32px;
  border-bottom: 2px solid #f1f5f9;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}
.header-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.header-icon.params {
  background: #f1f5f9;
  color: #64748b;
}
.header-icon.impact {
  background: #fff7ed;
  color: #f97316;
}
.header-icon.metrics {
  background: #eff6ff;
  color: #3b82f6;
}
.header-icon.mc {
  background: #f3e8ff;
  color: #7c3aed;
}
.header-icon.recs {
  background: #ecfdf5;
  color: #10b981;
}
.card-title {
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
}
.toggle-link {
  background: none;
  border: none;
  color: #7c3aed;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.card-body {
  padding: 32px;
}

/* Parameters */
.params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}
.param-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.param-label {
  font-size: 11px;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.param-value {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

/* Impact */
.impact-hero {
  text-align: center;
  padding: 20px 0 32px;
  border-bottom: 2px solid #f1f5f9;
  margin-bottom: 28px;
}
.impact-label {
  display: block;
  font-size: 12px;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}
.impact-value {
  font-size: 52px;
  font-weight: 900;
  color: #ef4444;
  letter-spacing: -0.03em;
}
.impact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}
.impact-category {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 16px;
}
.category-color {
  width: 6px;
  height: 48px;
  border-radius: 3px;
  flex-shrink: 0;
}
.category-color.direct {
  background: #ef4444;
}
.category-color.operational {
  background: #f97316;
}
.category-color.regulatory {
  background: #f59e0b;
}
.category-color.reputational {
  background: #8b5cf6;
}
.category-color.cascading {
  background: #ec4899;
}
.category-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.category-label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}
.category-value {
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
}

/* Metrics */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.metric-card {
  text-align: center;
  padding: 24px;
  background: #f8fafc;
  border-radius: 20px;
}
.metric-label {
  display: block;
  font-size: 11px;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 12px;
}
.metric-value {
  font-size: 32px;
  font-weight: 900;
  color: #0f172a;
}
.metric-value.risk.critical {
  color: #ef4444;
}
.metric-value.risk.high {
  color: #f97316;
}
.metric-value.risk.medium {
  color: #f59e0b;
}
.metric-value.risk.low {
  color: #10b981;
}

/* Monte Carlo */
.mc-iterations {
  font-size: 13px;
  font-weight: 700;
  color: #7c3aed;
  background: #f3e8ff;
  padding: 6px 14px;
  border-radius: 10px;
}
.mc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}
.mc-stat {
  text-align: center;
  padding: 20px;
  background: #faf5ff;
  border-radius: 16px;
}
.mc-label {
  display: block;
  font-size: 11px;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}
.mc-value {
  font-size: 20px;
  font-weight: 900;
  color: #7c3aed;
}

/* Percentiles */
.percentiles-section {
  margin-bottom: 32px;
}
.percentile-title,
.ci-title {
  font-size: 14px;
  font-weight: 900;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 16px;
}
.percentile-bar-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.percentile-item {
  display: grid;
  grid-template-columns: 50px 1fr 120px;
  align-items: center;
  gap: 16px;
}
.pct-label {
  font-size: 13px;
  font-weight: 800;
  color: #475569;
}
.pct-bar-wrapper {
  height: 10px;
  background: #f1f5f9;
  border-radius: 5px;
  overflow: hidden;
}
.pct-bar {
  height: 100%;
  background: linear-gradient(to right, #7c3aed, #a78bfa);
  border-radius: 5px;
  transition: width 0.6s ease;
}
.pct-value {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  text-align: right;
}

/* Confidence Intervals */
.ci-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}
.ci-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 20px;
  background: #f8fafc;
  border-radius: 14px;
}
.ci-level {
  font-size: 12px;
  font-weight: 900;
  color: #7c3aed;
  text-transform: uppercase;
}
.ci-range {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

/* Recommendations */
.rec-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.rec-item {
  padding: 16px 24px;
  background: #f0fdf4;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  color: #166534;
  line-height: 1.5;
  border-left: 4px solid #10b981;
}

/* Pending / Failed States */
.pending-card,
.failed-card {
  text-align: center;
  padding: 80px 40px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 32px;
  margin-bottom: 32px;
}
.pending-icon {
  width: 60px;
  height: 60px;
  color: #7c3aed;
  margin: 0 auto 20px;
}
.failed-icon {
  width: 60px;
  height: 60px;
  color: #ef4444;
  margin: 0 auto 20px;
}
.pending-card h3,
.failed-card h3 {
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 12px;
}
.pending-card p,
.failed-card p {
  font-size: 15px;
  color: #64748b;
  margin: 0;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes progress {
  0% {
    width: 0%;
  }
  50% {
    width: 70%;
  }
  100% {
    width: 100%;
  }
}
@keyframes pulseDot {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 28px;
  }
  .header-row {
    flex-direction: column;
  }
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .impact-grid {
    grid-template-columns: 1fr;
  }
  .impact-value {
    font-size: 36px;
  }
}
</style>
