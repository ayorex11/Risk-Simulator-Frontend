<template>
  <div class="comparison-page">
    <NavBar />
    <main class="main-content custom-scrollbar">
      <div class="container py-12">
        <!-- Header Section -->
        <header class="executive-header mb-12 animate-in">
          <div class="flex items-center gap-4 mb-4">
            <div class="header-icon-bg primary shadow-glow"><Scale /></div>
            <span class="header-tag">Strategic Analysis</span>
          </div>
          <div class="flex justify-between items-end">
            <div>
              <h1 class="text-4xl font-black tracking-tight text-slate-900">
                Entity <span class="text-primary">Matrix</span> Comparison
              </h1>
              <p class="text-slate-500 font-medium max-w-2xl mt-2 text-lg">
                High-fidelity side-by-side audit of risk telemetry, compliance posture, and
                contractual exposure.
              </p>
            </div>
            <div class="header-actions">
              <router-link to="/vendors" class="btn-executive">
                <ArrowLeft class="icon-sm" /> Return to Ecosystem
              </router-link>
            </div>
          </div>
        </header>

        <!-- Selection Shell -->
        <section class="selection-shell card-premium p-8 mb-12 animate-in" style="--delay: 0.1s">
          <div class="flex justify-between items-center mb-8">
            <div>
              <h3 class="text-xl font-black text-slate-800">Resource Selection</h3>
              <p class="text-sm text-slate-400 font-bold uppercase tracking-wider">
                Select up to 5 entities for matrix parsing
              </p>
            </div>
            <div class="selection-counter" :class="{ ready: selectedIds.length >= 2 }">
              <span class="count-num">{{ selectedIds.length }}</span>
              <span class="count-txt">/ 5 Selected</span>
            </div>
          </div>

          <div
            v-if="vendorStore.loading && vendorStore.vendors.length === 0"
            class="flex justify-center py-12"
          >
            <LoadingSpinner />
          </div>

          <div v-else class="selection-matrix">
            <div
              v-for="vendor in vendorStore.vendors"
              :key="vendor.id"
              @click="toggleSelection(vendor.id)"
              class="matrix-selector-card"
              :class="{ selected: selectedIds.includes(vendor.id) }"
            >
              <div class="selector-check">
                <Check v-if="selectedIds.includes(vendor.id)" class="icon-xs" />
              </div>
              <div class="selector-body">
                <span class="s-vendor-name">{{ vendor.name }}</span>
                <span class="s-vendor-tag">{{ vendor.industry }}</span>
              </div>
              <div class="selector-risk-pill" :class="getRiskClass(vendor.overall_risk_score)">
                {{ (vendor.overall_risk_score || 0).toFixed(2) }}
              </div>
            </div>
          </div>

          <div class="mt-10 flex justify-center">
            <button
              @click="runComparison"
              class="btn-primary-executive lg shadow-glow"
              :disabled="selectedIds.length < 2 || loading"
            >
              <Activity v-if="!loading" class="icon-sm" />
              <div v-else class="spinner-mini"></div>
              {{ loading ? 'Parsing Ecosystem Telemetry...' : 'Generate Matrix Audit' }}
            </button>
          </div>
        </section>

        <!-- Comparison Results -->
        <div v-if="results" class="results-anchor animate-in" style="--delay: 0.2s">
          <div class="card-premium overflow-hidden border-primary-soft mb-12">
            <div class="overflow-x-auto">
              <table class="executive-matrix-table">
                <thead>
                  <tr>
                    <th class="matrix-head-label">Audit Vector</th>
                    <th
                      v-for="vendor in results.vendors"
                      :key="vendor.id"
                      class="matrix-head-vendor"
                    >
                      <div class="vendor-id-card">
                        <div class="v-avatar">{{ vendor.name.charAt(0) }}</div>
                        <span class="v-name">{{ vendor.name }}</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="row-highlight">
                    <td class="vector-name">Overall Risk Score</td>
                    <td v-for="vId in selectedIds" :key="vId" class="text-center">
                      <div
                        class="matrix-score-hero"
                        :class="getRiskClass(results.comparison_metrics[vId].overall_risk_score)"
                      >
                        {{ results.comparison_metrics[vId].overall_risk_score.toFixed(3) }}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="vector-name">Risk Classification</td>
                    <td v-for="vId in selectedIds" :key="vId" class="text-center">
                      <span
                        class="classification-tag"
                        :class="getRiskClass(results.comparison_metrics[vId].overall_risk_score)"
                      >
                        {{ results.comparison_metrics[vId].risk_level }}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td class="vector-name">Security Posture</td>
                    <td v-for="vId in selectedIds" :key="vId" class="text-center">
                      <div class="posture-meter">
                        <span class="meter-val"
                          >{{ results.comparison_metrics[vId].security_posture_score }}%</span
                        >
                        <div class="meter-track">
                          <div
                            class="meter-fill"
                            :style="{
                              width: results.comparison_metrics[vId].security_posture_score + '%',
                            }"
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="vector-name">Incident Volume</td>
                    <td v-for="vId in selectedIds" :key="vId" class="text-center">
                      <span
                        class="volume-num"
                        :class="{
                          'text-red-500': results.comparison_metrics[vId].incident_count > 0,
                        }"
                      >
                        {{ results.comparison_metrics[vId].incident_count }}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td class="vector-name">Trust Certificates</td>
                    <td v-for="vId in selectedIds" :key="vId" class="text-center">
                      <div class="cert-stack">
                        <ShieldCheck class="icon-xs text-green-500" />
                        <span class="cert-count"
                          >{{ results.comparison_metrics[vId].certification_count }} Active</span
                        >
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="vector-name">Fiscal Exposure (Annual)</td>
                    <td
                      v-for="vId in selectedIds"
                      :key="vId"
                      class="text-center font-mono font-bold text-slate-700"
                    >
                      ${{ formatNumber(results.comparison_metrics[vId].contract_value) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Analysis Insights -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="card-premium p-8 border-l-4 border-l-blue-500">
              <div class="flex items-center gap-3 mb-6">
                <div class="insight-icon-shell"><Lightbulb /></div>
                <h3 class="text-xl font-black text-slate-800">Internal Observations</h3>
              </div>
              <ul class="insight-bullet-list">
                <li v-for="(rec, index) in results.recommendations" :key="index">
                  <div class="bullet-dot"></div>
                  <p>{{ rec }}</p>
                </li>
                <li
                  v-if="results.recommendations.length === 0"
                  class="text-slate-400 font-medium italic"
                >
                  No significant anomalies or strategic deviations detected.
                </li>
              </ul>
            </div>

            <div class="card-premium p-8">
              <div class="flex items-center gap-3 mb-8">
                <div class="insight-icon-shell"><BarChartHorizontal /></div>
                <h3 class="text-xl font-black text-slate-800">Portfolio Distribution</h3>
              </div>
              <div class="distribution-stack">
                <div
                  v-for="level in ['critical', 'high', 'medium', 'low']"
                  :key="level"
                  class="dist-row-premium"
                  :class="{ 'opacity-30 ghosted': (results.risk_distribution[level] || 0) === 0 }"
                >
                  <div class="dist-info-block">
                    <span class="dist-label-p capitalize">{{ level }} Risk</span>
                    <div class="dist-badge-minimal" :class="level">
                      {{ results.risk_distribution[level] || 0 }}
                      <span class="text-[10px] opacity-70">Entities</span>
                    </div>
                  </div>
                  <div class="dist-track-premium">
                    <div
                      class="dist-fill-premium"
                      :class="level"
                      :style="{
                        width: `${((results.risk_distribution[level] || 0) / selectedIds.length) * 100}%`,
                      }"
                    ></div>
                    <div
                      v-if="(results.risk_distribution[level] || 0) === 0"
                      class="dist-zero-hint"
                    >
                      No vectors detected
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useVendorStore } from '../stores/vendor'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import {
  ArrowLeft,
  Check,
  Scale,
  Activity,
  ShieldCheck,
  Lightbulb,
  BarChartHorizontal,
} from 'lucide-vue-next'

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
  background: #fdfdfd;
  display: flex;
  flex-direction: column;
}
.main-content {
  flex: 1;
}

.executive-header h1 {
  letter-spacing: -0.04em;
}
.header-tag {
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  color: var(--primary);
  letter-spacing: 0.2em;
  border: 1px solid var(--primary-soft);
  padding: 4px 10px;
  border-radius: 20px;
}
.header-icon-bg {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  border: 1px solid #f1f5f9;
}
.shadow-glow {
  box-shadow: 0 4px 20px -5px var(--primary-soft);
}

.btn-executive {
  padding: 12px 24px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
.btn-executive:hover {
  background: #f8fafc;
  transform: translateY(-2px);
  border-color: var(--primary);
  color: var(--primary);
}

.card-premium {
  background: white;
  border-radius: 32px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

/* Selection Counter */
.selection-counter {
  padding: 10px 20px;
  border-radius: 50px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: 0.3s;
}
.selection-counter.ready {
  background: #eff6ff;
  color: #3b82f6;
}
.count-num {
  font-size: 20px;
  font-weight: 950;
}
.count-txt {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.6;
}

/* Matrix Selector */
.selection-matrix {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.matrix-selector-card {
  padding: 20px;
  border: 2px solid #f1f5f9;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  background: white;
}
.matrix-selector-card:hover {
  transform: translateY(-4px);
  border-color: #e2e8f0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}
.matrix-selector-card.selected {
  border-color: var(--primary);
  background: #fcfdfe;
  box-shadow: 0 0 0 4px var(--primary-soft);
}

.selector-check {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: 0.2s;
}
.selected .selector-check {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}

.s-vendor-name {
  font-weight: 800;
  font-size: 15px;
  display: block;
  color: #1e293b;
}
.s-vendor-tag {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.selector-risk-pill {
  margin-left: auto;
  padding: 4px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 900;
}

.btn-primary-executive {
  padding: 18px 40px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 18px;
  font-size: 16px;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: 0.2s;
}
.btn-primary-executive:hover:not(:disabled) {
  transform: translateY(-2px);
  filter: brightness(1.1);
}
.btn-primary-executive:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Matrix Table */
.executive-matrix-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}
.matrix-head-label {
  padding: 32px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.1em;
  width: 260px;
  position: sticky;
  left: 0;
  z-index: 10;
  border-right: 1px solid #e2e8f0;
}
.matrix-head-vendor {
  padding: 32px;
  border-bottom: 1px solid #e2e8f0;
  background: white;
  min-width: 220px;
}

.vendor-id-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.v-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #eff6ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 950;
  border: 2px solid #dbeafe;
}
.v-name {
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
}

.vector-name {
  padding: 24px 32px;
  font-size: 14px;
  font-weight: 800;
  color: #475569;
  position: sticky;
  left: 0;
  background: #fdfdfd;
  z-index: 5;
  border-right: 1px solid #f1f5f9;
}
.executive-matrix-table td {
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}
.row-highlight {
  background: #f8fafc;
}

.matrix-score-hero {
  font-size: 20px;
  font-weight: 950;
  padding: 10px 20px;
  border-radius: 12px;
  display: inline-block;
}
.classification-tag {
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  padding: 4px 12px;
  border-radius: 50px;
}

.posture-meter {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 140px;
  margin: 0 auto;
}
.meter-val {
  font-size: 13px;
  font-weight: 800;
  color: #1e293b;
}
.meter-track {
  height: 6px;
  background: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}
.meter-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 10px;
}

.volume-num {
  font-size: 24px;
  font-weight: 950;
}
.cert-stack {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 800;
}

/* Insights */
.insight-icon-shell {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #eff6ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
}
.insight-bullet-list {
  list-style: none;
  padding: 0;
}
.insight-bullet-list li {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 16px;
}
.bullet-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  background: #3b82f6;
  margin-top: 6px;
  flex-shrink: 0;
}
.insight-bullet-list p {
  font-size: 15px;
  line-height: 1.6;
  font-weight: 500;
  color: #475569;
}

/* Portfolio Distribution Premium */
.distribution-stack {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.dist-row-premium {
  transition: 0.3s;
}
.dist-row-premium.ghosted {
  filter: grayscale(1);
}

.dist-info-block {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 10px;
}
.dist-label-p {
  font-size: 13px;
  font-weight: 800;
  color: #475569;
  letter-spacing: -0.01em;
}
.dist-badge-minimal {
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 900;
  display: flex;
  align-items: center;
  gap: 4px;
}

.dist-track-premium {
  height: 12px;
  background: #f1f5f9;
  border-radius: 20px;
  position: relative;
  overflow: hidden;
}
.dist-fill-premium {
  height: 100%;
  border-radius: 20px;
  transition: 1s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.dist-zero-hint {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 900;
  color: #cbd5e1;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.critical {
  color: #dc2626;
  background: #fee2e2;
}
.high {
  color: #f59e0b;
  background: #fef3c7;
}
.medium {
  color: #eab308;
  background: #fef9c3;
}
.low {
  color: #10b981;
  background: #d1fae5;
}

.dist-fill-premium.critical {
  background: #dc2626;
  box-shadow: 0 0 12px rgba(220, 38, 38, 0.2);
}
.dist-fill-premium.high {
  background: #f59e0b;
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.2);
}
.dist-fill-premium.medium {
  background: #eab308;
  box-shadow: 0 0 12px rgba(234, 179, 8, 0.2);
}
.dist-fill-premium.low {
  background: #10b981;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.2);
}

/* Animations */
.animate-in {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  animation-delay: var(--delay, 0s);
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.spinner-mini {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f8fafc;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 4px;
}
</style>
