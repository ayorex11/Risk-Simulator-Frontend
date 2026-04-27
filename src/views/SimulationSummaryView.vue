<template>
  <div class="page-container">
    <NavBar />
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-content">
          <button @click="router.push('/simulations')" class="back-btn">
            <ArrowLeft class="icon-sm" />
            <span>Back to Simulations</span>
          </button>
          <div class="header-text">
            <div class="header-badge">
              <BarChart3 class="badge-icon" />
              <span>Portfolio Analysis</span>
            </div>
            <h1 class="page-title">Simulation Summary</h1>
            <p class="page-subtitle">
              Aggregated risk metrics across your entire simulation portfolio.
            </p>
          </div>
        </div>
      </header>

      <!-- Loading -->
      <div v-if="loading" class="loading-zone">
        <LoadingSpinner />
      </div>

      <!-- Error -->
      <div v-else-if="error" class="error-state">
        <AlertCircle class="error-icon" />
        <p class="error-text">{{ error }}</p>
        <button @click="loadSummary" class="btn btn-primary">Retry</button>
      </div>

      <template v-else-if="summary">
        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">Total Sims</span>
              <div class="stat-icon" style="background: #f3e8ff; color: #7c3aed">
                <Zap class="icon-stat" />
              </div>
            </div>
            <div class="stat-value">{{ summary.total_simulations || 0 }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">Completed</span>
              <div class="stat-icon" style="background: #ecfdf5; color: #10b981">
                <CheckCircle class="icon-stat" />
              </div>
            </div>
            <div class="stat-value completed">{{ summary.completed_simulations || 0 }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">Pending</span>
              <div class="stat-icon" style="background: #eff6ff; color: #3b82f6">
                <Clock class="icon-stat" />
              </div>
            </div>
            <div class="stat-value">{{ summary.pending_simulations || 0 }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">Total Exposure</span>
              <div class="stat-icon" style="background: #fff7ed; color: #f97316">
                <DollarSign class="icon-stat" />
              </div>
            </div>
            <div class="stat-value exposure">
              ${{ formatNumber(summary.total_financial_exposure || 0) }}
            </div>
          </div>
        </div>

        <!-- Two Column Grid -->
        <div class="main-grid">
          <!-- Highest Impact Scenarios -->
          <section class="content-card">
            <div class="card-header">
              <div class="header-left">
                <div class="header-icon danger">
                  <AlertTriangle class="icon-xs" />
                </div>
                <h2 class="card-title">Highest Impact Scenarios</h2>
              </div>
            </div>
            <div class="card-body">
              <div v-if="!highImpact.length" class="empty-mini">
                <p>No completed simulations yet.</p>
              </div>
              <div v-else class="impact-list">
                <router-link
                  v-for="sim in highImpact"
                  :key="sim.id"
                  :to="`/simulations/${sim.id}`"
                  class="impact-item"
                >
                  <div class="impact-info">
                    <span class="impact-name">{{ sim.name }}</span>
                    <span class="impact-scenario">{{
                      sim.scenario_name || sim.scenario_type
                    }}</span>
                  </div>
                  <span class="impact-cost">${{ formatNumber(sim.total_financial_impact) }}</span>
                </router-link>
              </div>
            </div>
          </section>

          <!-- Recent Simulations -->
          <section class="content-card">
            <div class="card-header">
              <div class="header-left">
                <div class="header-icon primary">
                  <Clock class="icon-xs" />
                </div>
                <h2 class="card-title">Recent Simulations</h2>
              </div>
              <router-link to="/simulations" class="card-link">
                View All
                <span class="arrow">→</span>
              </router-link>
            </div>
            <div class="card-body">
              <div v-if="!recentSims.length" class="empty-mini">
                <p>No simulations found.</p>
              </div>
              <div v-else class="recent-list">
                <router-link
                  v-for="sim in recentSims"
                  :key="sim.id"
                  :to="`/simulations/${sim.id}`"
                  class="recent-item"
                >
                  <div class="recent-info">
                    <span class="recent-name">{{ sim.name }}</span>
                    <span class="recent-date">{{ formatDate(sim.created_at) }}</span>
                  </div>
                  <div class="status-pill" :class="sim.status">
                    {{ sim.status }}
                  </div>
                </router-link>
              </div>
            </div>
          </section>
        </div>

        <!-- Breakdown by Scenario Type -->
        <!-- FIX: was checking .length on a plain object — now normalized to array in loadSummary -->
        <section v-if="summary.by_scenario_type.length" class="content-card full-width">
          <div class="card-header">
            <div class="header-left">
              <div class="header-icon scenario">
                <Zap class="icon-xs" />
              </div>
              <h2 class="card-title">Breakdown by Scenario Type</h2>
            </div>
          </div>
          <div class="card-body">
            <div class="breakdown-grid">
              <div
                v-for="item in summary.by_scenario_type"
                :key="item.scenario_type"
                class="breakdown-card"
              >
                <span class="breakdown-type">{{ formatScenarioType(item.scenario_type) }}</span>
                <span class="breakdown-count"
                  >{{ item.count }} simulation{{ item.count !== 1 ? 's' : '' }}</span
                >
                <span v-if="item.average_impact" class="breakdown-impact">
                  Avg: ${{ formatNumber(item.average_impact) }}
                </span>
              </div>
            </div>
          </div>
        </section>

        <!-- Breakdown by Vendor -->
        <!-- FIX: same — normalized to array in loadSummary -->
        <section v-if="summary.by_vendor.length" class="content-card full-width">
          <div class="card-header">
            <div class="header-left">
              <div class="header-icon vendor">
                <Building class="icon-xs" />
              </div>
              <h2 class="card-title">Breakdown by Vendor</h2>
            </div>
          </div>
          <div class="card-body">
            <div class="vendor-breakdown">
              <div
                v-for="item in summary.by_vendor"
                :key="item.vendor_name"
                class="vendor-row"
              >
                <div class="vendor-info">
                  <div class="vendor-avatar">{{ (item.vendor_name || '?').charAt(0) }}</div>
                  <div class="vendor-details">
                    <span class="vendor-name">{{ item.vendor_name }}</span>
                    <span class="vendor-sims"
                      >{{ item.count }} simulation{{ item.count !== 1 ? 's' : '' }}</span
                    >
                  </div>
                </div>
                <span class="vendor-impact" v-if="item.total_impact">
                  ${{ formatNumber(item.total_impact) }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSimulationStore } from '../stores/simulation'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import {
  ArrowLeft,
  Zap,
  BarChart3,
  CheckCircle,
  Clock,
  DollarSign,
  AlertTriangle,
  AlertCircle,
  Building,
} from 'lucide-vue-next'

const router = useRouter()
const simulationStore = useSimulationStore()

const summary = ref(null)
const loading = ref(true)
const error = ref(null)

const highImpact = computed(() => {
  const list = summary.value?.highest_impact_scenarios || []
  return Array.isArray(list) ? list.slice(0, 5) : []
})

const recentSims = computed(() => {
  const list = summary.value?.recent_simulations || []
  return Array.isArray(list) ? list.slice(0, 5) : []
})

// Converts a plain object like { supply_chain: 6, cyber: 2 }
// into an array like [{ scenario_type: 'supply_chain', count: 6 }, ...]
// so the template can use v-for and .length checks correctly.
const normalizeObjectToArray = (data, keyName = 'key', valueName = 'count') => {
  if (!data) return []
  if (Array.isArray(data)) return data
  return Object.entries(data).map(([key, value]) => ({
    [keyName]: key,
    // If value is already an object (e.g. { count, average_impact }), spread it; otherwise treat it as the count
    ...(typeof value === 'object' && value !== null ? value : { [valueName]: value }),
  }))
}

const loadSummary = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await simulationStore.fetchSimulationSummary()
    if (response) {
      summary.value = {
        total_simulations: response.total_simulations ?? 0,
        completed_simulations: response.completed_simulations ?? 0,
        pending_simulations: response.pending_simulations ?? 0,
        failed_simulations: response.failed_simulations ?? 0,
        // FIX: backend sends total_estimated_impact, not total_financial_exposure
        total_financial_exposure: response.total_estimated_impact ?? 0,
        // FIX: backend sends average_recovery_time, not average_recovery_time_hours
        average_recovery_time: response.average_recovery_time ?? 0,
        recent_simulations: response.recent_simulations ?? [],
        highest_impact_scenarios: response.highest_impact_scenarios ?? [],
        // FIX: backend returns plain objects (dicts), normalize both to arrays
        // so v-for and .length work correctly in the template
        by_scenario_type: normalizeObjectToArray(
          response.by_scenario_type,
          'scenario_type',
          'count',
        ),
        by_vendor: normalizeObjectToArray(response.by_vendor, 'vendor_name', 'count'),
      }
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load simulation summary'
  } finally {
    loading.value = false
  }
}

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return Number(num || 0).toLocaleString()
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

const formatScenarioType = (type) => {
  if (!type) return 'Unknown'
  return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

onMounted(loadSummary)
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
}
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px 100px;
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
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
}
.badge-icon {
  width: 14px;
  height: 14px;
}
.page-title {
  font-size: 48px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0 0 12px;
}
.page-subtitle {
  font-size: 16px;
  color: #64748b;
  font-weight: 500;
  margin: 0;
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
}
.btn-primary {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
}
.btn-primary:hover {
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
  transform: translateY(-2px);
}
.icon-sm {
  width: 18px;
  height: 18px;
}
.icon-xs {
  width: 16px;
  height: 16px;
}
.icon-stat {
  width: 26px;
  height: 26px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 56px;
  animation: fadeIn 0.5s ease-out 0.1s both;
}
.stat-card {
  background: white;
  border-radius: 24px;
  border: 2px solid #e2e8f0;
  padding: 28px;
  transition: all 0.3s;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
}
.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.stat-label {
  font-size: 12px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-value {
  font-size: 40px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1;
  letter-spacing: -0.02em;
}
.stat-value.completed {
  color: #10b981;
}
.stat-value.exposure {
  color: #f97316;
  font-size: 32px;
}

/* Main Grid */
.main-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px;
  margin-bottom: 32px;
  animation: fadeIn 0.5s ease-out 0.2s both;
}

/* Content Cards */
.content-card {
  background: white;
  border-radius: 32px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s;
  margin-bottom: 0;
}
.content-card.full-width {
  margin-bottom: 32px;
  animation: fadeIn 0.5s ease-out 0.3s both;
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
}
.header-icon.danger {
  background: #fef2f2;
  color: #ef4444;
}
.header-icon.primary {
  background: #eff6ff;
  color: #3b82f6;
}
.header-icon.scenario {
  background: #f3e8ff;
  color: #7c3aed;
}
.header-icon.vendor {
  background: #f0fdf4;
  color: #10b981;
}
.card-title {
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
}
.card-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 800;
  color: #7c3aed;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s;
}
.card-link:hover {
  gap: 8px;
}
.arrow {
  font-size: 16px;
}
.card-body {
  padding: 0;
}

/* Empty Mini */
.empty-mini {
  padding: 60px 40px;
  text-align: center;
}
.empty-mini p {
  font-size: 15px;
  font-weight: 600;
  color: #94a3b8;
  margin: 0;
}

/* Impact List */
.impact-list,
.recent-list {
  display: flex;
  flex-direction: column;
}
.impact-item,
.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  border-bottom: 2px solid #f8fafc;
  text-decoration: none;
  transition: background 0.2s;
}
.impact-item:last-child,
.recent-item:last-child {
  border-bottom: none;
}
.impact-item:hover,
.recent-item:hover {
  background: #faf5ff;
}
.impact-info,
.recent-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.impact-name,
.recent-name {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
}
.impact-scenario {
  font-size: 12px;
  font-weight: 600;
  color: #7c3aed;
  text-transform: capitalize;
}
.impact-cost {
  font-size: 18px;
  font-weight: 900;
  color: #ef4444;
}
.recent-date {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
}
.status-pill {
  padding: 4px 12px;
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

/* Breakdown Grid */
.breakdown-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 28px 32px;
}
.breakdown-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 24px;
  background: #f8fafc;
  border-radius: 18px;
  text-align: center;
}
.breakdown-type {
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
  text-transform: capitalize;
}
.breakdown-count {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}
.breakdown-impact {
  font-size: 14px;
  font-weight: 800;
  color: #f97316;
}

/* Vendor Breakdown */
.vendor-breakdown {
  display: flex;
  flex-direction: column;
}
.vendor-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  border-bottom: 2px solid #f8fafc;
}
.vendor-row:last-child {
  border-bottom: none;
}
.vendor-info {
  display: flex;
  align-items: center;
  gap: 16px;
}
.vendor-avatar {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: white;
  font-size: 20px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
}
.vendor-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.vendor-name {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
}
.vendor-sims {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
}
.vendor-impact {
  font-size: 18px;
  font-weight: 900;
  color: #f97316;
}

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

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .main-grid {
    grid-template-columns: 1fr;
  }
  .page-title {
    font-size: 32px;
  }
}
</style>
