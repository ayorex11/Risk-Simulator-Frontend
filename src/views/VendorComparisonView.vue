<template>
  <div class="comparison-page">
    <NavBar />
    <div class="container py-8">
      <div class="page-header mb-8">
        <div>
          <h1 class="text-3xl font-bold">Vendor Comparison</h1>
          <p class="text-muted">
            Analyze and compare risk metrics across multiple vendors side-by-side.
          </p>
        </div>
        <router-link to="/vendors" class="btn btn-outline">
          <ArrowLeft class="icon" /> Back to Vendors
        </router-link>
      </div>

      <!-- Selection Section -->
      <div class="card mb-8">
        <div class="card-header border-b p-6">
          <h2 class="text-xl font-semibold">Select Vendors to Compare</h2>
          <p class="text-sm text-muted">Choose at least 2 vendors to begin analysis.</p>
        </div>
        <div class="p-6">
          <div class="vendor-selector">
            <div
              v-if="vendorStore.loading && vendorStore.vendors.length === 0"
              class="p-8 text-center"
            >
              <LoadingSpinner />
            </div>
            <div v-else class="selection-grid">
              <div
                v-for="vendor in vendorStore.vendors"
                :key="vendor.id"
                @click="toggleSelection(vendor.id)"
                class="selector-card"
                :class="{ selected: selectedIds.includes(vendor.id) }"
              >
                <div class="check-box">
                  <Check v-if="selectedIds.includes(vendor.id)" class="icon-small" />
                </div>
                <div class="selector-info">
                  <span class="vendor-name">{{ vendor.name }}</span>
                  <span class="vendor-sub">{{ vendor.industry }}</span>
                </div>
                <div class="selector-risk" :class="getRiskClass(vendor.overall_risk_score)">
                  {{ vendor.overall_risk_score.toFixed(1) }}
                </div>
              </div>
            </div>
          </div>
          <div class="mt-6 flex justify-end">
            <button
              @click="runComparison"
              class="btn btn-primary lg"
              :disabled="selectedIds.length < 2 || loading"
            >
              <Users class="icon" />
              {{ loading ? 'Analyzing...' : 'Run Comparison' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Comparison Results -->
      <div v-if="results" class="comparison-results space-y-8">
        <!-- Overview Table -->
        <div class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="comparison-table">
              <thead>
                <tr>
                  <th class="feature-col">Feature / Metric</th>
                  <th v-for="vendor in results.vendors" :key="vendor.id" class="vendor-col">
                    <div class="col-vendor-name">{{ vendor.name }}</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr class="bg-blue-50">
                  <td class="font-bold">Overall Risk Score</td>
                  <td v-for="vId in selectedIds" :key="vId" class="text-center">
                    <span
                      class="score-badge"
                      :class="getRiskClass(results.comparison_metrics[vId].overall_risk_score)"
                    >
                      {{ results.comparison_metrics[vId].overall_risk_score.toFixed(3) }}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Risk Level</td>
                  <td
                    v-for="vId in selectedIds"
                    :key="vId"
                    class="text-center capitalize font-bold"
                    :class="getRiskClass(results.comparison_metrics[vId].overall_risk_score)"
                  >
                    {{ results.comparison_metrics[vId].risk_level }}
                  </td>
                </tr>
                <tr>
                  <td>Security Posture</td>
                  <td v-for="vId in selectedIds" :key="vId" class="text-center">
                    {{ results.comparison_metrics[vId].security_posture_score }}/100
                  </td>
                </tr>
                <tr>
                  <td>Compliance Score</td>
                  <td v-for="vId in selectedIds" :key="vId" class="text-center">
                    {{ results.comparison_metrics[vId].compliance_score }}/100
                  </td>
                </tr>
                <tr>
                  <td>Incidents Reported</td>
                  <td v-for="vId in selectedIds" :key="vId" class="text-center">
                    {{ results.comparison_metrics[vId].incident_count }}
                  </td>
                </tr>
                <tr>
                  <td>Active Certifications</td>
                  <td v-for="vId in selectedIds" :key="vId" class="text-center">
                    {{ results.comparison_metrics[vId].certification_count }}
                  </td>
                </tr>
                <tr>
                  <td>Annual Contract Value</td>
                  <td v-for="vId in selectedIds" :key="vId" class="text-center font-mono">
                    ${{ formatNumber(results.comparison_metrics[vId].contract_value) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Recommendations -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="card p-6 border-l-4 border-yellow-400">
            <h3 class="flex items-center gap-2 text-lg font-bold mb-4">
              <Zap class="text-yellow-400" /> Key Observations
            </h3>
            <ul class="recommendation-list">
              <li v-for="(rec, index) in results.recommendations" :key="index">
                {{ rec }}
              </li>
              <li v-if="results.recommendations.length === 0">
                No significant anomalies detected between selected vendors.
              </li>
            </ul>
          </div>

          <div class="card p-6">
            <h3 class="text-lg font-bold mb-4">Risk Distribution</h3>
            <div class="dist-grid">
              <div
                v-for="(count, level) in results.risk_distribution"
                :key="level"
                class="dist-item"
              >
                <span class="capitalize text-sm font-semibold">{{ level }}</span>
                <div class="dist-bar-bg">
                  <div
                    class="dist-bar"
                    :class="level"
                    :style="{ width: `${(count / selectedIds.length) * 100}%` }"
                  ></div>
                </div>
                <span class="text-xs font-bold">{{ count }}</span>
              </div>
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
import { ArrowLeft, Check, Users, Zap } from 'lucide-vue-next'

const vendorStore = useVendorStore()
const selectedIds = ref([])
const loading = ref(false)
const results = ref(null)

onMounted(() => {
  if (vendorStore.vendors.length === 0) {
    vendorStore.fetchVendors()
  }
})

const toggleSelection = (id) => {
  const index = selectedIds.value.indexOf(id)
  if (index === -1) {
    if (selectedIds.value.length < 5) {
      selectedIds.value.push(id)
    }
  } else {
    selectedIds.value.splice(index, 1)
  }
}

const runComparison = async () => {
  loading.value = true
  try {
    results.value = await vendorStore.compareVendors(selectedIds.value)
  } finally {
    loading.value = false
  }
}

const getRiskClass = (score) => {
  if (score >= 76) return 'critical'
  if (score >= 51) return 'high'
  if (score >= 26) return 'medium'
  return 'low'
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('en-US').format(num)
}
</script>

<style scoped>
.comparison-page {
  min-height: 100vh;
  background: #f8fafc;
}

.selection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.selector-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
}

.selector-card:hover {
  border-color: #cbd5e1;
  transform: translateY(-2px);
}

.selector-card.selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.check-box {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.selected .check-box {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.selector-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.vendor-name {
  font-weight: 700;
  font-size: 14px;
  color: #1e293b;
}

.vendor-sub {
  font-size: 11px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.selector-risk {
  font-weight: 800;
  font-size: 14px;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
}

.comparison-table th,
.comparison-table td {
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
}

.feature-col {
  width: 250px;
  background: #f8fafc;
  font-weight: 600;
  position: sticky;
  left: 0;
  z-index: 5;
}

.vendor-col {
  min-width: 200px;
  text-align: center;
  background: white;
}

.col-vendor-name {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.score-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 999px;
  font-weight: 800;
  font-size: 18px;
}

.recommendation-list {
  padding-left: 20px;
  list-style-type: disc;
}

.recommendation-list li {
  margin-bottom: 12px;
  color: #475569;
  line-height: 1.6;
}

.dist-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dist-item {
  display: grid;
  grid-template-columns: 80px 1fr 20px;
  align-items: center;
  gap: 12px;
}

.dist-bar-bg {
  height: 10px;
  background: #f1f5f9;
  border-radius: 5px;
  overflow: hidden;
}

.dist-bar {
  height: 100%;
  border-radius: 5px;
}

.critical {
  color: #dc2626;
  background-color: #fee2e2;
}
.high {
  color: #b45309;
  background-color: #fef3c7;
}
.medium {
  color: #854d0e;
  background-color: #fef9c3;
}
.low {
  color: #15803d;
  background-color: #d1fae5;
}

.dist-bar.critical {
  background: #dc2626;
}
.dist-bar.high {
  background: #f59e0b;
}
.dist-bar.medium {
  background: #eab308;
}
.dist-bar.low {
  background: #10b981;
}

.icon {
  width: 20px;
  height: 20px;
}
.icon-small {
  width: 14px;
  height: 14px;
}
</style>
