<template>
  <div class="page-container">
    <NavBar />
    <div class="container">
      <header class="page-header">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">Risk Heatmap</h1>
            <p class="page-subtitle">Vendor portfolio plotted by likelihood vs impact</p>
          </div>
        </div>
      </header>

      <div v-if="loading" class="loading-zone">
        <LoadingSpinner />
      </div>

      <div v-else>
        <!-- Top Stats / Legend Area -->
        <div class="stats-row">
          <div class="stat-counts">
            <span class="stat-total"><b>Total Vendors:</b> {{ vendors.length }}</span>
            <span class="stat-breakdown">
              (<span class="count red">{{ counts.critical }} Critical</span> &middot;
              <span class="count orange">{{ counts.high }} High</span> &middot;
              <span class="count amber">{{ counts.medium }} Medium</span> &middot;
              <span class="count green">{{ counts.low }} Low</span>)
            </span>
          </div>
          <div class="legend">
            <b>Risk Levels:</b>
            <span class="legend-item"><span class="swatch green"></span>Low</span>
            <span class="legend-item"><span class="swatch amber"></span>Medium</span>
            <span class="legend-item"><span class="swatch orange"></span>High</span>
            <span class="legend-item"><span class="swatch red"></span>Critical</span>
          </div>
        </div>

        <!-- The ECharts Heatmap (Scatter) -->
        <section class="chart-section mt-6">
          <div class="chart-container">
            <v-chart class="heatmap-chart" :option="chartOptions" autoresize />
          </div>
        </section>

        <!-- High/Critical Vendors Table -->
        <section class="table-section mt-10">
          <h2 class="section-title">Critical & High Risk Assets</h2>
          <div v-if="highRiskVendors.length === 0" class="empty-state">
            No critical or high risk vendors detected.
          </div>
          <div v-else class="table-wrapper">
            <table class="risk-table">
              <thead>
                <tr>
                  <th>Vendor Name</th>
                  <th>Industry</th>
                  <th>Risk Score</th>
                  <th>Risk Level</th>
                  <th>Service Criticality</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="vendor in highRiskVendors" :key="vendor.id">
                  <td><b>{{ vendor.name }}</b></td>
                  <td>{{ vendor.industry || '—' }}</td>
                  <td>{{ vendor.overall_risk_score }}</td>
                  <td>
                    <span class="risk-badge" :class="vendor.risk_level">{{ vendor.risk_level }}</span>
                  </td>
                  <td>{{ vendor.service_criticality_level }}/5</td>
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
import { useVendorStore } from '../stores/vendor'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import VChart from 'vue-echarts'
import * as echarts from 'echarts'

const vendorStore = useVendorStore()
const loading = ref(true)

const vendors = computed(() => vendorStore.vendors || [])

const counts = computed(() => {
  const c = { low: 0, medium: 0, high: 0, critical: 0 }
  vendors.value.forEach(v => {
    if (c[v.risk_level] !== undefined) c[v.risk_level]++
  })
  return c
})

const highRiskVendors = computed(() => {
  return vendors.value
    .filter(v => v.risk_level === 'critical' || v.risk_level === 'high')
    .sort((a, b) => (b.overall_risk_score || 0) - (a.overall_risk_score || 0))
})

const chartOptions = computed(() => {
  const data = vendors.value.map(v => {
    const x = v.overall_risk_score || 0 // Likelihood proxy
    const y = (v.service_criticality_level || 3) * 20 // Impact proxy scaled 0-100
    
    let color = '#1D9E75' // green
    if (v.risk_level === 'medium') color = '#BA7517' // amber
    if (v.risk_level === 'high') color = '#D85A30' // orange
    if (v.risk_level === 'critical') color = '#E24B4A' // red
    
    // Bubble size
    const baseSize = 25
    let extraSize = 0
    if (v.contract_value) {
      // Scale by contract value, capped
      const val = parseFloat(v.contract_value)
      if (val > 100000) extraSize = 15
      else if (val > 50000) extraSize = 10
      else if (val > 10000) extraSize = 5
    }
    
    return {
      name: v.name,
      value: [x, y, v.overall_risk_score, v.risk_level, v.service_criticality_level, v.contract_value],
      itemStyle: { color },
      symbolSize: baseSize + extraSize
    }
  })

  return {
    tooltip: {
      formatter: function (params) {
        const v = params.value
        return `
          <div style="font-weight:bold; margin-bottom:4px">${params.name}</div>
          Risk Score: <b>${v[2]}</b><br/>
          Risk Level: <b>${v[3]}</b><br/>
          Service Criticality: <b>${v[4]}/5</b><br/>
          ${v[5] ? `Contract Value: <b>$${parseFloat(v[5]).toLocaleString()}</b>` : ''}
        `
      }
    },
    grid: { left: '5%', right: '5%', bottom: '10%', top: '10%', containLabel: true },
    xAxis: {
      type: 'value',
      name: 'Likelihood (Risk Score)',
      nameLocation: 'middle',
      nameGap: 30,
      min: 0,
      max: 100,
      splitLine: { show: false }
    },
    yAxis: {
      type: 'value',
      name: 'Impact (Scaled Criticality)',
      nameLocation: 'middle',
      nameGap: 40,
      min: 0,
      max: 100,
      splitLine: { show: false }
    },
    series: [
      {
        type: 'scatter',
        data: data,
        markArea: {
          silent: true,
          data: [
            [
              { xAxis: 0, yAxis: 0, itemStyle: { color: 'rgba(29, 158, 117, 0.1)' } }, // Bottom-left (Green)
              { xAxis: 50, yAxis: 50 }
            ],
            [
              { xAxis: 50, yAxis: 0, itemStyle: { color: 'rgba(186, 117, 23, 0.1)' } }, // Bottom-right (Amber)
              { xAxis: 100, yAxis: 50 }
            ],
            [
              { xAxis: 0, yAxis: 50, itemStyle: { color: 'rgba(186, 117, 23, 0.1)' } }, // Top-left (Amber)
              { xAxis: 50, yAxis: 100 }
            ],
            [
              { xAxis: 50, yAxis: 50, itemStyle: { color: 'rgba(226, 75, 74, 0.1)' } }, // Top-right (Red)
              { xAxis: 100, yAxis: 100 }
            ]
          ]
        }
      }
    ]
  }
})

onMounted(async () => {
  loading.value = true
  try {
    if (vendors.value.length === 0) {
      await vendorStore.fetchVendors()
    }
  } catch (error) {
    console.error("Failed to load vendors for heatmap")
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.page-container { min-height: 100vh; background: #f8fafc; }
.container { max-width: 1400px; margin: 0 auto; padding: 0 24px 100px; }
.page-header { padding: 48px 0 24px; }
.page-title { font-size: 32px; font-weight: 800; color: #0f172a; margin: 0 0 8px; }
.page-subtitle { font-size: 16px; color: #64748b; margin: 0; }

.stats-row {
  display: flex; justify-content: space-between; align-items: center;
  background: white; padding: 16px 24px; border-radius: 12px;
  border: 1px solid #e2e8f0; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}
.stat-counts { font-size: 15px; color: #334155; }
.stat-breakdown { margin-left: 8px; font-size: 14px; }
.count.red { color: #E24B4A; font-weight: bold; }
.count.orange { color: #D85A30; font-weight: bold; }
.count.amber { color: #BA7517; font-weight: bold; }
.count.green { color: #1D9E75; font-weight: bold; }

.legend { display: flex; align-items: center; gap: 16px; font-size: 14px; color: #475569; }
.legend-item { display: flex; align-items: center; gap: 6px; }
.swatch { width: 12px; height: 12px; border-radius: 50%; }
.swatch.green { background: #1D9E75; }
.swatch.amber { background: #BA7517; }
.swatch.orange { background: #D85A30; }
.swatch.red { background: #E24B4A; }

.chart-section {
  background: white; border: 1px solid #e2e8f0; border-radius: 16px;
  padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}
.chart-container { height: 600px; width: 100%; }
.heatmap-chart { width: 100%; height: 100%; }

.table-section { margin-top: 40px; }
.section-title { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 16px; }
.empty-state { padding: 40px; text-align: center; background: white; border-radius: 12px; border: 1px dashed #cbd5e1; color: #64748b; }
.table-wrapper { background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.risk-table { width: 100%; border-collapse: collapse; }
.risk-table th { padding: 16px 20px; text-align: left; background: #f8fafc; font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
.risk-table td { padding: 16px 20px; border-bottom: 1px solid #f1f5f9; color: #334155; font-size: 14px; }
.risk-table tr:last-child td { border-bottom: none; }
.risk-table tr:hover { background: #f8fafc; }

.risk-badge { padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
.risk-badge.critical { background: #fee2e2; color: #ef4444; }
.risk-badge.high { background: #ffedd5; color: #f97316; }
.risk-badge.medium { background: #fef3c7; color: #f59e0b; }
.risk-badge.low { background: #d1fae5; color: #10b981; }
</style>
