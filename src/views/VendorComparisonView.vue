<template>
  <div class="comparison-page">
    <NavBar />
    <main class="main-content custom-scrollbar">
      <div class="container">
        <!-- Header Section -->
        <header class="page-header">
          <div class="header-top">
            <div class="header-badge-wrapper">
              <div class="header-icon-bg">
                <Scale class="icon-sm" />
              </div>
              <span class="header-badge">Strategic Analysis</span>
            </div>
          </div>
          <div class="header-content">
            <div class="header-text">
              <h1 class="page-title">
                Entity <span class="title-accent">Matrix</span> Comparison
              </h1>
              <p class="page-subtitle">
                High-fidelity side-by-side audit of risk telemetry, compliance posture, and
                contractual exposure.
              </p>
            </div>
            <div class="header-actions">
              <router-link to="/vendors" class="btn btn-secondary">
                <ArrowLeft class="icon-sm" />
                <span>Return to Ecosystem</span>
              </router-link>
            </div>
          </div>
        </header>

        <!-- Selection Shell -->
        <section class="selection-section">
          <div class="selection-card">
            <div class="selection-header">
              <div class="selection-title-group">
                <h3 class="selection-title">Resource Selection</h3>
                <p class="selection-subtitle">
                  Select up to 5 entities for matrix parsing
                </p>
              </div>
              <div class="selection-counter" :class="{ ready: selectedIds.length >= 2 }">
                <span class="counter-number">{{ selectedIds.length }}</span>
                <span class="counter-divider">/</span>
                <span class="counter-total">5</span>
                <span class="counter-label">Selected</span>
              </div>
            </div>

            <div
              v-if="vendorStore.loading && vendorStore.vendors.length === 0"
              class="loading-state"
            >
              <LoadingSpinner />
            </div>

            <div v-else class="vendor-grid">
              <div
                v-for="vendor in vendorStore.vendors"
                :key="vendor.id"
                @click="toggleSelection(vendor.id)"
                class="vendor-selector"
                :class="{ selected: selectedIds.includes(vendor.id) }"
              >
                <div class="selector-checkbox">
                  <Check v-if="selectedIds.includes(vendor.id)" class="check-icon" />
                </div>
                <div class="vendor-info">
                  <div class="vendor-avatar">{{ vendor.name.charAt(0) }}</div>
                  <div class="vendor-details">
                    <span class="vendor-name">{{ vendor.name }}</span>
                    <span class="vendor-industry">{{ vendor.industry }}</span>
                  </div>
                </div>
                <div class="risk-indicator" :class="getRiskClass(vendor.overall_risk_score)">
                  {{ (vendor.overall_risk_score || 0).toFixed(1) }}
                </div>
              </div>
            </div>

            <div class="selection-actions">
              <button
                @click="runComparison"
                class="btn btn-primary btn-xl"
                :disabled="selectedIds.length < 2 || loading"
              >
                <Activity v-if="!loading" class="icon-sm" />
                <div v-else class="spinner"></div>
                <span>{{ loading ? 'Parsing Ecosystem Telemetry...' : 'Generate Matrix Audit' }}</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Comparison Results -->
        <div v-if="results" class="results-section">
          <!-- Matrix Table -->
          <div class="matrix-card">
            <div class="matrix-overflow">
              <table class="matrix-table">
                <thead>
                  <tr>
                    <th class="matrix-header-label">Audit Vector</th>
                    <th
                      v-for="vendor in results.vendors"
                      :key="vendor.id"
                      class="matrix-header-vendor"
                    >
                      <div class="vendor-header">
                        <div class="vendor-avatar-header">{{ vendor.name.charAt(0) }}</div>
                        <span class="vendor-name-header">{{ vendor.name }}</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="row-primary">
                    <td class="vector-label">Overall Risk Score</td>
                    <td v-for="vId in selectedIds" :key="vId" class="vector-value">
                      <div
                        class="score-display"
                        :class="getRiskClass(results.comparison_metrics[vId].overall_risk_score)"
                      >
                        {{ results.comparison_metrics[vId].overall_risk_score.toFixed(2) }}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="vector-label">Risk Classification</td>
                    <td v-for="vId in selectedIds" :key="vId" class="vector-value">
                      <span
                        class="classification-badge"
                        :class="getRiskClass(results.comparison_metrics[vId].overall_risk_score)"
                      >
                        {{ results.comparison_metrics[vId].risk_level }}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td class="vector-label">Security Posture</td>
                    <td v-for="vId in selectedIds" :key="vId" class="vector-value">
                      <div class="progress-display">
                        <span class="progress-value"
                          >{{ results.comparison_metrics[vId].security_posture_score }}%</span
                        >
                        <div class="progress-bar">
                          <div
                            class="progress-fill"
                            :style="{
                              width: results.comparison_metrics[vId].security_posture_score + '%',
                            }"
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="vector-label">Incident Volume</td>
                    <td v-for="vId in selectedIds" :key="vId" class="vector-value">
                      <span
                        class="incident-count"
                        :class="{
                          'has-incidents': results.comparison_metrics[vId].incident_count > 0,
                        }"
                      >
                        {{ results.comparison_metrics[vId].incident_count }}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td class="vector-label">Trust Certificates</td>
                    <td v-for="vId in selectedIds" :key="vId" class="vector-value">
                      <div class="cert-display">
                        <ShieldCheck class="cert-icon" />
                        <span class="cert-label"
                          >{{ results.comparison_metrics[vId].certification_count }} Active</span
                        >
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td class="vector-label">Fiscal Exposure (Annual)</td>
                    <td v-for="vId in selectedIds" :key="vId" class="vector-value">
                      <span class="fiscal-value">
                        ${{ formatNumber(results.comparison_metrics[vId].contract_value) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Analysis Grid -->
          <div class="analysis-grid">
            <!-- Insights Card -->
            <div class="insight-card">
              <div class="insight-header">
                <div class="insight-icon-wrapper">
                  <Lightbulb class="insight-icon" />
                </div>
                <h3 class="insight-title">Internal Observations</h3>
              </div>
              <div class="insight-body">
                <ul class="insight-list">
                  <li v-for="(rec, index) in results.recommendations" :key="index" class="insight-item">
                    <div class="insight-bullet"></div>
                    <p class="insight-text">{{ rec }}</p>
                  </li>
                  <li
                    v-if="results.recommendations.length === 0"
                    class="insight-item empty"
                  >
                    <p class="insight-text empty">No significant anomalies or strategic deviations detected.</p>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Distribution Card -->
            <div class="distribution-card">
              <div class="distribution-header">
                <div class="distribution-icon-wrapper">
                  <BarChartHorizontal class="distribution-icon" />
                </div>
                <h3 class="distribution-title">Portfolio Distribution</h3>
              </div>
              <div class="distribution-body">
                <div
                  v-for="level in ['critical', 'high', 'medium', 'low']"
                  :key="level"
                  class="distribution-row"
                  :class="{ 'is-empty': (results.risk_distribution[level] || 0) === 0 }"
                >
                  <div class="distribution-info">
                    <span class="distribution-label">{{ level }} Risk</span>
                    <div class="distribution-badge" :class="level">
                      <span class="badge-count">{{ results.risk_distribution[level] || 0 }}</span>
                      <span class="badge-text">Entities</span>
                    </div>
                  </div>
                  <div class="distribution-track">
                    <div
                      class="distribution-fill"
                      :class="level"
                      :style="{
                        width: `${((results.risk_distribution[level] || 0) / selectedIds.length) * 100}%`,
                      }"
                    ></div>
                    <div
                      v-if="(results.risk_distribution[level] || 0) === 0"
                      class="empty-indicator"
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
/* Base Layout */
.comparison-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px 100px;
}

/* Page Header */
.page-header {
  padding: 48px 0 40px;
  animation: fadeIn 0.5s ease-out;
}

.header-top {
  margin-bottom: 20px;
}

.header-badge-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.header-icon-bg {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: white;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.icon-sm {
  width: 20px;
  height: 20px;
}

.header-badge {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: #3b82f6;
  letter-spacing: 0.1em;
  padding: 6px 14px;
  border-radius: 12px;
  border: 2px solid #dbeafe;
  background: #eff6ff;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 32px;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 48px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0 0 12px 0;
}

.title-accent {
  color: #3b82f6;
}

.page-subtitle {
  font-size: 17px;
  color: #64748b;
  font-weight: 500;
  line-height: 1.6;
  max-width: 700px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
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
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  border: none;
  white-space: nowrap;
}

.btn-secondary {
  background: white;
  color: #475569;
  border: 2px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-xl {
  padding: 18px 40px;
  font-size: 16px;
  border-radius: 16px;
}

/* Selection Section */
.selection-section {
  margin-bottom: 56px;
  animation: fadeIn 0.6s ease-out 0.1s both;
}

.selection-card {
  background: white;
  border-radius: 32px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
}

.selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 40px;
  border-bottom: 2px solid #f1f5f9;
}

.selection-title-group {
  flex: 1;
}

.selection-title {
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 6px 0;
  letter-spacing: -0.02em;
}

.selection-subtitle {
  font-size: 13px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin: 0;
}

.selection-counter {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 16px;
  background: #f1f5f9;
  transition: all 0.3s;
}

.selection-counter.ready {
  background: #dbeafe;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.counter-number {
  font-size: 28px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1;
}

.selection-counter.ready .counter-number {
  color: #2563eb;
}

.counter-divider {
  font-size: 20px;
  font-weight: 700;
  color: #cbd5e1;
}

.counter-total {
  font-size: 20px;
  font-weight: 700;
  color: #94a3b8;
}

.counter-label {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.05em;
  margin-left: 4px;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 80px 40px;
}

/* Vendor Grid */
.vendor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  padding: 40px;
}

.vendor-selector {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border: 2px solid #f1f5f9;
  border-radius: 20px;
  background: #fafbfc;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.vendor-selector:hover {
  transform: translateY(-4px);
  border-color: #e2e8f0;
  background: white;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}

.vendor-selector.selected {
  border-color: #3b82f6;
  background: #f8fbff;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.selector-checkbox {
  width: 28px;
  height: 28px;
  border-radius: 10px;
  border: 2px solid #cbd5e1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  background: white;
}

.vendor-selector.selected .selector-checkbox {
  background: #3b82f6;
  border-color: #3b82f6;
}

.check-icon {
  width: 16px;
  height: 16px;
  color: white;
  stroke-width: 3px;
}

.vendor-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.vendor-avatar {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 900;
  flex-shrink: 0;
}

.vendor-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.vendor-name {
  font-size: 16px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vendor-industry {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.risk-indicator {
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 900;
  flex-shrink: 0;
}

.risk-indicator.critical {
  background: #fee2e2;
  color: #991b1b;
}
.risk-indicator.high {
  background: #fed7aa;
  color: #9a3412;
}
.risk-indicator.medium {
  background: #fef3c7;
  color: #92400e;
}
.risk-indicator.low {
  background: #d1fae5;
  color: #065f46;
}

.selection-actions {
  display: flex;
  justify-content: center;
  padding: 40px;
  border-top: 2px solid #f1f5f9;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Results Section */
.results-section {
  animation: fadeIn 0.6s ease-out 0.2s both;
}

/* Matrix Card */
.matrix-card {
  background: white;
  border-radius: 32px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
  margin-bottom: 56px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.matrix-overflow {
  overflow-x: auto;
}

.matrix-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.matrix-header-label {
  padding: 32px 40px;
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  border-right: 2px solid #e2e8f0;
  text-align: left;
  font-size: 13px;
  font-weight: 900;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.08em;
  min-width: 280px;
  position: sticky;
  left: 0;
  z-index: 10;
}

.matrix-header-vendor {
  padding: 32px 40px;
  border-bottom: 2px solid #e2e8f0;
  background: white;
  min-width: 240px;
}

.vendor-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.vendor-avatar-header {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #2563eb;
  border: 3px solid #dbeafe;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: 900;
}

.vendor-name-header {
  font-size: 17px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.vector-label {
  padding: 28px 40px;
  font-size: 15px;
  font-weight: 800;
  color: #475569;
  position: sticky;
  left: 0;
  background: white;
  z-index: 5;
  border-right: 2px solid #f8fafc;
  border-bottom: 1px solid #f1f5f9;
}

.vector-value {
  padding: 28px 40px;
  text-align: center;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.row-primary {
  background: #f8fafc;
}

.row-primary .vector-label {
  background: #f8fafc;
}

.score-display {
  font-size: 24px;
  font-weight: 900;
  padding: 12px 24px;
  border-radius: 14px;
  display: inline-block;
  letter-spacing: -0.01em;
}

.score-display.critical {
  background: #fee2e2;
  color: #991b1b;
}
.score-display.high {
  background: #fed7aa;
  color: #9a3412;
}
.score-display.medium {
  background: #fef3c7;
  color: #92400e;
}
.score-display.low {
  background: #d1fae5;
  color: #065f46;
}

.classification-badge {
  font-size: 12px;
  font-weight: 900;
  text-transform: uppercase;
  padding: 8px 18px;
  border-radius: 12px;
  letter-spacing: 0.05em;
}

.classification-badge.critical {
  background: #fee2e2;
  color: #991b1b;
}
.classification-badge.high {
  background: #fed7aa;
  color: #9a3412;
}
.classification-badge.medium {
  background: #fef3c7;
  color: #92400e;
}
.classification-badge.low {
  background: #d1fae5;
  color: #065f46;
}

.progress-display {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 160px;
  margin: 0 auto;
}

.progress-value {
  font-size: 15px;
  font-weight: 800;
  color: #1e293b;
}

.progress-bar {
  height: 8px;
  background: #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 10px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
}

.incident-count {
  font-size: 28px;
  font-weight: 900;
  color: #64748b;
}

.incident-count.has-incidents {
  color: #ef4444;
}

.cert-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.cert-icon {
  width: 18px;
  height: 18px;
  color: #10b981;
}

.cert-label {
  font-size: 14px;
  font-weight: 800;
  color: #334155;
}

.fiscal-value {
  font-size: 16px;
  font-weight: 900;
  color: #0f172a;
  font-feature-settings: 'tnum';
}

/* Analysis Grid */
.analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px;
}

/* Insight Card */
.insight-card {
  background: white;
  border-radius: 32px;
  border: 2px solid #e2e8f0;
  border-left: 5px solid #3b82f6;
  overflow: hidden;
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 32px 40px;
  border-bottom: 2px solid #f1f5f9;
}

.insight-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: #eff6ff;
  color: #3b82f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.insight-icon {
  width: 24px;
  height: 24px;
}

.insight-title {
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.01em;
}

.insight-body {
  padding: 40px;
}

.insight-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.insight-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.insight-item.empty {
  justify-content: center;
  padding: 20px;
}

.insight-bullet {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  background: #3b82f6;
  margin-top: 6px;
  flex-shrink: 0;
}

.insight-text {
  font-size: 15px;
  line-height: 1.7;
  font-weight: 500;
  color: #475569;
  margin: 0;
}

.insight-text.empty {
  color: #94a3b8;
  font-style: italic;
  text-align: center;
}

/* Distribution Card */
.distribution-card {
  background: white;
  border-radius: 32px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
}

.distribution-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 32px 40px;
  border-bottom: 2px solid #f1f5f9;
}

.distribution-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: #f0fdf4;
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.distribution-icon {
  width: 24px;
  height: 24px;
}

.distribution-title {
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.01em;
}

.distribution-body {
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.distribution-row {
  transition: all 0.3s;
}

.distribution-row.is-empty {
  opacity: 0.4;
}

.distribution-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.distribution-label {
  font-size: 15px;
  font-weight: 800;
  color: #475569;
  text-transform: capitalize;
  letter-spacing: -0.01em;
}

.distribution-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 10px;
  font-weight: 900;
}

.badge-count {
  font-size: 15px;
}

.badge-text {
  font-size: 11px;
  opacity: 0.7;
}

.distribution-badge.critical {
  background: #fee2e2;
  color: #991b1b;
}
.distribution-badge.high {
  background: #fed7aa;
  color: #9a3412;
}
.distribution-badge.medium {
  background: #fef3c7;
  color: #92400e;
}
.distribution-badge.low {
  background: #d1fae5;
  color: #065f46;
}

.distribution-track {
  height: 14px;
  background: #f1f5f9;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.distribution-fill {
  height: 100%;
  border-radius: 10px;
  transition: width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.distribution-fill.critical {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 0 16px rgba(239, 68, 68, 0.3);
}
.distribution-fill.high {
  background: linear-gradient(90deg, #f97316 0%, #ea580c 100%);
  box-shadow: 0 0 16px rgba(249, 115, 22, 0.3);
}
.distribution-fill.medium {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 0 16px rgba(245, 158, 11, 0.3);
}
.distribution-fill.low {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.3);
}

.empty-indicator {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 900;
  color: #cbd5e1;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  height: 10px;
  width: 10px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f8fafc;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Responsive */
@media (max-width: 1200px) {
  .analysis-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }

  .header-actions {
    width: 100%;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .vendor-grid {
    grid-template-columns: 1fr;
    padding: 32px 24px;
  }

  .selection-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 16px 80px;
  }

  .page-header {
    padding: 32px 0 28px;
  }

  .page-title {
    font-size: 36px;
  }

  .page-subtitle {
    font-size: 15px;
  }

  .selection-card {
    border-radius: 24px;
  }

  .selection-header,
  .insight-header,
  .distribution-header {
    padding: 24px;
  }

  .insight-body,
  .distribution-body {
    padding: 24px;
  }

  .matrix-header-label,
  .vector-label {
    padding: 20px 24px;
  }

  .matrix-header-vendor,
  .vector-value {
    padding: 20px 24px;
  }
}
</style>
