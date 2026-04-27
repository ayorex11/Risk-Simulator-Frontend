<template>
  <div class="page-container">
    <NavBar />

    <div class="container">
      <header class="page-header">
        <button @click="router.push('/simulations')" class="back-btn">
          <ArrowLeft class="icon-sm" />
          <span>Back to Simulations</span>
        </button>
        <div class="header-text">
          <div class="header-badge">
            <BarChart2 class="badge-icon" />
            <span>Comparative Analysis</span>
          </div>
          <h1 class="page-title">Simulation Comparison</h1>
          <p class="page-subtitle">Comparing impact and risks across multiple scenarios.</p>
        </div>
      </header>

      <div v-if="loading" class="loading-zone">
        <LoadingSpinner />
      </div>

      <div v-else-if="simulations.length === 0" class="empty-state">
        <AlertCircle class="empty-icon" />
        <p>No simulations selected for comparison. Go back and select at least two completed simulations.</p>
      </div>

      <div v-else class="comparison-content">
        <!-- Summary Cards -->
        <div class="cards-grid">
          <div v-for="sim in simulations" :key="sim.id" class="content-card info-card">
            <div class="card-header">
              <h3 class="sim-name truncate">{{ sim.name }}</h3>
              <span class="type-badge">{{ sim.scenario_type.replace('_', ' ') }}</span>
            </div>
            <div class="card-body stat-body">
              <div class="stat-row">
                <span class="stat-label">Total Impact</span>
                <span class="stat-val impact">${{ Number(sim.result?.total_financial_impact || 0).toLocaleString() }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Target Vendor</span>
                <span class="stat-val">{{ sim.vendor_name }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Risk Score</span>
                <span class="stat-val">{{ (sim.result?.risk_score || 0).toFixed(1) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary Cards -->
        <div v-if="summaryStats" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 1.5rem;">
          <div class="content-card info-card" style="padding: 16px; display: flex; flex-direction: column; gap: 8px;">
            <div style="font-size: 13px; color: #64748b; font-weight: 700; text-transform: uppercase;">Average Impact</div>
            <div style="font-size: 24px; font-weight: 900; color: #0f172a;">{{ formatCurrency(summaryStats.average_impact) }}</div>
          </div>
          <div class="content-card info-card" style="padding: 16px; display: flex; flex-direction: column; gap: 8px;">
            <div style="font-size: 13px; color: #64748b; font-weight: 700; text-transform: uppercase;">Highest Impact</div>
            <div style="font-size: 24px; font-weight: 900; color: #0f172a;">{{ formatCurrency(summaryStats.max_impact) }}</div>
          </div>
          <div class="content-card info-card" style="padding: 16px; display: flex; flex-direction: column; gap: 8px;">
            <div style="font-size: 13px; color: #64748b; font-weight: 700; text-transform: uppercase;">Lowest Impact</div>
            <div style="font-size: 24px; font-weight: 900; color: #0f172a;">{{ formatCurrency(summaryStats.min_impact) }}</div>
          </div>
        </div>

        <!-- Comparative Chart -->
        <section class="content-card mt-8">
          <div class="card-header">
            <h2 class="card-title">Financial Impact Breakdown</h2>
          </div>
          <div class="card-body" style="height: 400px; padding: 20px;">
            <v-chart class="chart" :option="chartOption" autoresize />
          </div>
        </section>

        <!-- Detailed Comparison Table -->
        <section class="content-card mt-8">
          <div class="card-header">
            <h2 class="card-title">Detailed Metrics</h2>
          </div>
          <div class="table-wrapper">
            <table class="compare-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th v-for="sim in simulations" :key="sim.id">{{ sim.name }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Direct Costs</td>
                  <td v-for="sim in simulations" :key="sim.id">${{ Number(sim.result?.direct_costs || 0).toLocaleString() }}</td>
                </tr>
                <tr>
                  <td>Operational Costs</td>
                  <td v-for="sim in simulations" :key="sim.id">${{ Number(sim.result?.operational_costs || 0).toLocaleString() }}</td>
                </tr>
                <tr>
                  <td>Regulatory Fines</td>
                  <td v-for="sim in simulations" :key="sim.id">${{ Number(sim.result?.regulatory_costs || 0).toLocaleString() }}</td>
                </tr>
                <tr>
                  <td>Reputational Damage</td>
                  <td v-for="sim in simulations" :key="sim.id">${{ Number(sim.result?.reputational_costs || 0).toLocaleString() }}</td>
                </tr>
                <tr>
                  <td>Estimated Downtime (Hours)</td>
                  <td v-for="sim in simulations" :key="sim.id">{{ sim.result?.downtime_hours || '0' }}h</td>
                </tr>
                <tr>
                  <td>Risk Score</td>
                  <td v-for="sim in simulations" :key="sim.id">{{ (sim.result?.risk_score || 0).toFixed(1) }}</td>
                </tr>
                <tr>
                  <td>Recovery Time</td>
                  <td v-for="sim in simulations" :key="sim.id">{{ (sim.result?.estimated_recovery_time_hours || 0).toFixed(1) }}h</td>
                </tr>
                <tr>
                  <td>Customers Affected</td>
                  <td v-for="sim in simulations" :key="sim.id">{{ Number(sim.result?.customers_affected || 0).toLocaleString() }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSimulationStore } from '../stores/simulation'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import { ArrowLeft, BarChart2, AlertCircle } from 'lucide-vue-next'
import VChart from 'vue-echarts'
import * as echarts from 'echarts'

const router = useRouter()
const route = useRoute()
const simulationStore = useSimulationStore()

const loading = ref(true)
const simulations = ref([])
const comparisonData = ref(null)
const summaryStats = ref(null)

const formatCurrency = (value) => {
  if (!value && value !== 0) return '$0'
  const num = parseFloat(value)
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`
  return `$${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

onMounted(async () => {
  const ids = route.query.id
  if (!ids) {
    loading.value = false
    return
  }

  const idArray = Array.isArray(ids) ? ids : [ids]

  try {
    const result = await simulationStore.compareSimulations(idArray)
    comparisonData.value = result.comparison_data
    summaryStats.value = result.summary_statistics
    simulations.value = result.simulations || []
  } catch (error) {
    console.error("Error fetching comparison data", error)
  } finally {
    loading.value = false
  }
})

const chartOption = computed(() => {
  if (simulations.value.length === 0) return {}

  const source = [
    ['Metric', 'Direct Costs', 'Operational Costs', 'Regulatory Fines', 'Reputational Damage']
  ]

  simulations.value.forEach(sim => {
    source.push([
      sim.name,
      sim.result?.direct_costs || 0,
      sim.result?.operational_costs || 0,
      sim.result?.regulatory_costs || 0,
      sim.result?.reputational_costs || 0,
    ])
  })

  return {
    legend: {},
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    dataset: { source },
    xAxis: { type: 'category' },
    yAxis: { type: 'value', axisLabel: { formatter: (val) => '$' + (val >= 1000 ? val/1000 + 'k' : val) } },
    series: [
      { type: 'bar', itemStyle: { color: '#3b82f6' } },
      { type: 'bar', itemStyle: { color: '#f59e0b' } },
      { type: 'bar', itemStyle: { color: '#ef4444' } },
      { type: 'bar', itemStyle: { color: '#8b5cf6' } }
    ]
  }
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
}
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 100px;
}
.page-header {
  padding: 48px 0 32px;
  animation: fadeIn 0.5s ease-out;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #64748b;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 20px;
}
.back-btn:hover { color: #3b82f6; }
.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: #eff6ff;
  color: #3b82f6;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  margin-bottom: 16px;
}
.page-title {
  font-size: 36px;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 8px;
}
.page-subtitle { color: #64748b; margin: 0; }

.loading-zone { display: flex; justify-content: center; padding: 100px 0; }
.empty-state { text-align: center; padding: 100px 0; color: #64748b; }
.empty-icon { width: 48px; height: 48px; margin: 0 auto 16px; opacity: 0.5; }

.mt-8 { margin-top: 32px; }

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}
.content-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  overflow: hidden;
}
.card-header {
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sim-name { font-size: 16px; font-weight: 800; color: #0f172a; margin: 0; }
.truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60%; }
.type-badge {
  padding: 4px 10px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  border-radius: 8px;
  text-transform: capitalize;
}
.stat-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
.stat-row { display: flex; justify-content: space-between; align-items: center; }
.stat-label { font-size: 13px; color: #64748b; font-weight: 600; }
.stat-val { font-size: 14px; font-weight: 800; color: #1e293b; }
.stat-val.impact { color: #ef4444; font-size: 16px; }

.chart { width: 100%; height: 100%; }

.table-wrapper {
  overflow-x: auto;
}
.compare-table {
  width: 100%;
  border-collapse: collapse;
}
.compare-table th {
  text-align: left;
  padding: 16px 24px;
  background: #f8fafc;
  color: #334155;
  font-weight: 700;
  font-size: 14px;
  border-bottom: 2px solid #e2e8f0;
}
.compare-table td {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  color: #475569;
  font-size: 14px;
  font-weight: 500;
}
.compare-table tr:last-child td { border-bottom: none; }
</style>
