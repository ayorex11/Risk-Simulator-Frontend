<template>
  <div class="page-container">
    <NavBar />

    <div class="container">
      <header class="page-header">
        <div class="header-text">
          <div class="header-badge">
            <Network class="badge-icon" />
            <span>Visualization</span>
          </div>
          <h1 class="page-title">Dependency Map</h1>
          <p class="page-subtitle">Interactive topology of your vendors, business processes, and their supply chain interdependencies.</p>
        </div>
      </header>

      <div v-if="loading" class="loading-zone">
        <LoadingSpinner />
      </div>
      
      <div v-else-if="error" class="error-state">
        <AlertTriangle class="error-icon" />
        <p>{{ error }}</p>
      </div>

      <section v-else class="content-card graph-card">
        <div class="card-header">
          <div class="summary-stats">
            <span class="stat-badge">Vendors: {{ mapData?.summary?.total_vendor_nodes || 0 }}</span>
            <span class="stat-badge process">Processes: {{ mapData?.summary?.total_process_nodes || 0 }}</span>
            <span class="stat-badge edge">Connections: {{ mapData?.summary?.total_edges || 0 }}</span>
          </div>
        </div>
        <div class="card-body" style="height: 600px; padding: 0;">
          <v-chart class="chart" :option="chartOption" autoresize />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import simulationService from '../services/simulationService'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import { Network, AlertTriangle } from 'lucide-vue-next'
import VChart from 'vue-echarts'
import * as echarts from 'echarts'

const loading = ref(true)
const error = ref(null)
const mapData = ref(null)

onMounted(async () => {
  try {
    const data = await simulationService.getDependencyMap()
    mapData.value = data
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load dependency map'
    console.error(err)
  } finally {
    loading.value = false
  }
})

const chartOption = computed(() => {
  if (!mapData.value || !mapData.value.nodes) return {}

  const nodes = mapData.value.nodes.map(n => {
    let color = '#94a3b8' // default
    let symbolSize = 40
    let label = n.name

    if (n.type === 'vendor') {
      symbolSize = 50
      if (n.risk_level === 'low') color = '#10b981'
      else if (n.risk_level === 'medium') color = '#f59e0b'
      else if (n.risk_level === 'high') color = '#f97316'
      else if (n.risk_level === 'critical') color = '#ef4444'
    } else if (n.type === 'process') {
      symbolSize = 65
      color = '#3b82f6'
    }

    return {
      id: n.id,
      name: label,
      symbolSize: symbolSize,
      itemStyle: { color: color, borderColor: '#fff', borderWidth: 2 },
      category: n.type,
      value: n.type === 'vendor' ? n.risk_level : n.criticality_display,
      tooltip: {
        formatter: (params) => {
          if (n.type === 'vendor') {
            return `<strong>Vendor:</strong> ${n.name}<br/>Risk: ${n.risk_level} (${n.overall_risk_score})`
          } else {
            return `<strong>Process:</strong> ${n.name}<br/>Criticality: ${n.criticality_display}`
          }
        }
      }
    }
  })

  const edges = mapData.value.edges.map(e => ({
    source: e.source,
    target: e.target,
    lineStyle: {
      color: e.type === 'vendor_process' ? '#3b82f6' : '#94a3b8',
      type: e.type === 'vendor_process' ? 'dashed' : 'solid',
      width: 2,
      curveness: 0.1
    }
  }))

  return {
    tooltip: { trigger: 'item' },
    legend: {
      data: ['vendor', 'process'],
      textStyle: { color: '#334155' }
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        data: nodes,
        links: edges,
        categories: [
          { name: 'vendor', itemStyle: { color: '#ef4444'} },
          { name: 'process', itemStyle: { color: '#3b82f6'} }
        ],
        roam: true,
        label: {
          show: true,
          position: 'bottom',
          formatter: '{b}',
          color: '#334155',
          fontSize: 11,
          fontWeight: 600
        },
        force: {
          repulsion: 800,
          edgeLength: [100, 200],
          friction: 0.2
        },
        itemStyle: {
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          shadowBlur: 10
        },
        lineStyle: {
          opacity: 0.7
        }
      }
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
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px 100px;
}
.page-header {
  padding: 48px 0 32px;
  animation: fadeIn 0.5s ease-out;
}
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
.error-state { text-align: center; padding: 100px 0; color: #ef4444; }

.graph-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.05);
}
.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
}
.summary-stats {
  display: flex;
  gap: 12px;
}
.stat-badge {
  padding: 6px 12px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
}
.stat-badge.process { background: #eff6ff; color: #3b82f6; }
.stat-badge.edge { background: #fdf2f8; color: #db2777; }

.chart { width: 100%; height: 100%; border-radius: 0 0 20px 20px; }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
