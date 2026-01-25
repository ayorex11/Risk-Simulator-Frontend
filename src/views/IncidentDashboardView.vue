<template>
  <div class="incident-dashboard-page">
    <NavBar />
    <div class="container py-8">
      <div class="page-header mb-8 flex justify-between items-center">
        <div>
          <h1 class="text-3xl font-bold">Incident Analytics</h1>
          <p class="text-muted">
            Global overview of security incidents and financial impact across your vendor portfolio.
          </p>
        </div>
        <div class="header-actions">
          <router-link to="/vendors" class="btn btn-outline">
            <Building class="icon" /> Manage Vendors
          </router-link>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-20">
        <LoadingSpinner />
      </div>

      <div v-else-if="trends" class="space-y-8">
        <!-- Summary Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div class="stat-card card">
            <span class="stat-label">Total Incidents</span>
            <span class="stat-value">{{ trends.total_incidents }}</span>
          </div>
          <div class="stat-card card">
            <span class="stat-label">Financial Impact</span>
            <span class="stat-value text-red-600"
              >${{ formatNumber(trends.total_financial_impact) }}</span
            >
          </div>
          <div class="stat-card card">
            <span class="stat-label">Avg. Downtime</span>
            <span class="stat-value">{{ trends.average_downtime.toFixed(1) }}h</span>
          </div>
          <div class="stat-card card">
            <span class="stat-label">Critical Incidents</span>
            <span class="stat-value text-orange-600">{{ trends.by_severity?.critical || 0 }}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Distribution by Type -->
          <div class="card p-6">
            <h3 class="text-lg font-bold mb-6 flex items-center gap-2">
              <ShieldAlert class="text-blue-500" /> Incident Type Distribution
            </h3>
            <div class="space-y-4">
              <div
                v-for="(count, type) in trends.by_type"
                :key="type"
                class="flex items-center gap-4"
              >
                <span class="w-32 text-sm font-medium capitalize">{{
                  type.replace('_', ' ')
                }}</span>
                <div class="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-blue-500"
                    :style="{ width: `${(count / trends.total_incidents) * 100}%` }"
                  ></div>
                </div>
                <span class="text-sm font-bold">{{ count }}</span>
              </div>
            </div>
          </div>

          <!-- Most Affected Vendors -->
          <div class="card p-6">
            <h3 class="text-lg font-bold mb-6 flex items-center gap-2">
              <AlertTriangle class="text-red-500" /> Most Affected Vendors
            </h3>
            <div class="space-y-4">
              <div
                v-for="(v, index) in trends.most_affected_vendors"
                :key="index"
                class="flex justify-between items-center p-3 bg-slate-50 rounded-lg"
              >
                <span class="font-bold text-slate-700">{{ v.vendor__name }}</span>
                <span class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-black"
                  >{{ v.count }} INCIDENTS</span
                >
              </div>
              <div
                v-if="trends.most_affected_vendors?.length === 0"
                class="py-10 text-center text-muted"
              >
                No incident data recorded for specific vendors.
              </div>
            </div>
          </div>
        </div>

        <!-- Severity Breakdown -->
        <div class="card p-8 text-center">
          <h3 class="text-xl font-bold mb-8">Incident Severity Breakdown</h3>
          <div class="flex justify-around items-end h-48 gap-4 px-10">
            <div
              v-for="sev in ['low', 'medium', 'high', 'critical']"
              :key="sev"
              class="flex flex-col items-center gap-2 flex-1 max-w-[120px]"
            >
              <div
                class="w-full rounded-t-xl transition-all duration-500"
                :class="`bg-${sev}-sev`"
                :style="{
                  height: `${((trends.by_severity?.[sev] || 0) / trends.total_incidents) * 200 + 10}px`,
                }"
              ></div>
              <span class="text-xs font-black uppercase tracking-widest">{{ sev }}</span>
              <span class="text-lg font-bold">{{ trends.by_severity?.[sev] || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useVendorStore } from '../stores/vendor'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import { Building, ShieldAlert, AlertTriangle } from 'lucide-vue-next'

const vendorStore = useVendorStore()
const loading = ref(true)
const trends = ref(null)

onMounted(async () => {
  try {
    trends.value = await vendorStore.fetchIncidentTrends()
  } finally {
    loading.value = false
  }
})

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(num)
}
</script>

<style scoped>
.incident-dashboard-page {
  min-height: 100vh;
  background: #f8fafc;
}

.stat-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: 4px solid transparent;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-label {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 28px;
  font-weight: 900;
  color: #1e293b;
}

.bg-low-sev {
  background-color: #10b981;
}
.bg-medium-sev {
  background-color: #eab308;
}
.bg-high-sev {
  background-color: #f59e0b;
}
.bg-critical-sev {
  background-color: #dc2626;
}

.icon {
  width: 20px;
  height: 20px;
}
</style>
