<template>
  <div>
    <NavBar />
    <div class="comparison-page">
      <div v-if="loading" class="loading-container">
        <LoadingSpinner />
      </div>

      <div v-else-if="comparison" class="container">
        <div class="page-header">
          <div class="header-main">
            <button @click="$router.back()" class="back-link">
              <ChevronLeft class="icon-small" />
              Back to Assessment
            </button>
            <h1>Security Posture Comparison</h1>
            <p class="text-muted">Comparing assessments for {{ currentAssessment?.vendor_name }}</p>
          </div>
          <div v-if="comparison.trend" class="trend-indicator" :class="comparison.trend">
            <TrendingUp v-if="comparison.trend === 'improving'" />
            <TrendingDown v-else-if="comparison.trend === 'declining'" />
            <Minus v-else />
            <span>{{ comparison.trend.charAt(0).toUpperCase() + comparison.trend.slice(1) }}</span>
          </div>
        </div>

        <div v-if="!comparison.previous" class="no-comparison-card card">
          <AlertCircle class="warning-icon" />
          <h2>No Previous Assessment Found</h2>
          <p>
            We couldn't find an earlier completed assessment for this vendor to compare against.
          </p>
          <button @click="$router.back()" class="btn btn-secondary">Go Back</button>
        </div>

        <div v-else class="comparison-content">
          <!-- Summary Cards -->
          <div class="summary-cards">
            <div class="card summary-card">
              <span class="card-label">Overall Improvement</span>
              <div
                class="improvement-value"
                :class="{
                  positive: comparison.improvement_percentage > 0,
                  negative: comparison.improvement_percentage < 0,
                }"
              >
                <span class="value"
                  >{{ comparison.improvement_percentage > 0 ? '+' : ''
                  }}{{ Math.round(comparison.improvement_percentage) }}%</span
                >
                <span class="delta"
                  >({{ comparison.changes.overall > 0 ? '+' : ''
                  }}{{ comparison.changes.overall }} pts)</span
                >
              </div>
            </div>
            <div class="card summary-card">
              <span class="card-label">Current Score</span>
              <div class="score-display">
                <span class="score">{{ comparison.current.overall_score }}</span>
                <span class="date">{{ formatDate(comparison.current.date) }}</span>
              </div>
            </div>
            <div class="card summary-card">
              <span class="card-label">Previous Score</span>
              <div class="score-display">
                <span class="score secondary">{{ comparison.previous.overall_score }}</span>
                <span class="date">{{ formatDate(comparison.previous.date) }}</span>
              </div>
            </div>
          </div>

          <!-- Category Breakdown -->
          <div class="breakdown-section card">
            <div class="section-header">
              <h2>Category Breakdown</h2>
            </div>
            <div class="breakdown-grid">
              <div v-for="(name, key) in categoryLabelMap" :key="key" class="category-row">
                <div class="category-info">
                  <span class="cat-name">{{ name }}</span>
                  <div
                    class="cat-delta"
                    :class="{
                      positive: comparison.changes[key] > 0,
                      negative: comparison.changes[key] < 0,
                    }"
                  >
                    <ArrowUp v-if="comparison.changes[key] > 0" class="icon-xs" />
                    <ArrowDown v-else-if="comparison.changes[key] < 0" class="icon-xs" />
                    <span
                      >{{ comparison.changes[key] > 0 ? '+' : ''
                      }}{{ comparison.changes[key] }}</span
                    >
                  </div>
                </div>
                <div class="progress-container">
                  <div class="progress-bar-stack">
                    <!-- Current Score Layer -->
                    <div
                      class="progress-layer current"
                      :style="{ width: comparison.current.category_scores[key] + '%' }"
                    ></div>
                    <!-- Previous Score Marker -->
                    <div
                      class="previous-marker"
                      :title="`Previous: ${comparison.previous.category_scores[key]}`"
                      :style="{ left: comparison.previous.category_scores[key] + '%' }"
                    ></div>
                  </div>
                  <div class="progress-labels">
                    <span>{{ comparison.previous.category_scores[key] }} (Prev)</span>
                    <span>{{ comparison.current.category_scores[key] }} (New)</span>
                  </div>
                </div>
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
import { useRoute } from 'vue-router'
import { useAssessmentStore } from '../stores/assessment'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import {
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowUp,
  ArrowDown,
  AlertCircle,
} from 'lucide-vue-next'

const route = useRoute()
const assessmentStore = useAssessmentStore()
const comparison = ref(null)
const currentAssessment = ref(null)
const loading = ref(true)

const categoryLabelMap = {
  access_control: 'Access Control',
  data_protection: 'Data Protection',
  network_security: 'Network Security',
  incident_response: 'Incident Response',
  vulnerability_management: 'Vulnerability Management',
  business_continuity: 'Business Continuity',
  security_governance: 'Security Governance',
}

const loadData = async () => {
  loading.value = true
  try {
    const [compData, assessData] = await Promise.all([
      assessmentStore.compareAssessments(route.params.id),
      assessmentStore.fetchAssessment(route.params.id),
    ])
    comparison.value = compData
    currentAssessment.value = assessData
  } catch (error) {
    console.error('Failed to load comparison data:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.comparison-page {
  min-height: calc(100vh - 72px);
  padding: 40px 0;
  background: #f5f7fa;
}

.back-link {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  border: none;
  color: #6b7280;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 16px;
  padding: 0;
}

.back-link:hover {
  color: #3b82f6;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 99px;
  font-weight: 700;
  font-size: 14px;
}

.trend-indicator.improving {
  background: #ecfdf5;
  color: #10b981;
}
.trend-indicator.declining {
  background: #fff1f2;
  color: #ef4444;
}
.trend-indicator.stable {
  background: #f3f4f6;
  color: #6b7280;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.summary-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-label {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.improvement-value {
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.value {
  font-size: 32px;
  font-weight: 700;
}
.delta {
  font-size: 16px;
  font-weight: 600;
}

.positive {
  color: #10b981;
}
.negative {
  color: #ef4444;
}

.score-display {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.score {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
}
.score.secondary {
  color: #6b7280;
}
.date {
  font-size: 14px;
  color: #9ca3af;
}

/* Breakdown */
.breakdown-section {
  padding: 0;
}
.section-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}
.section-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.breakdown-grid {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.category-row {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 40px;
  align-items: center;
}

.category-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cat-name {
  font-weight: 700;
  color: #1f2937;
  font-size: 16px;
}
.cat-delta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 700;
}

.icon-xs {
  width: 14px;
  height: 14px;
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-bar-stack {
  height: 12px;
  background: #e5e7eb;
  border-radius: 99px;
  position: relative;
  overflow: visible;
}

.progress-layer.current {
  height: 100%;
  background: #3b82f6;
  border-radius: 99px;
  transition: width 1s ease;
}

.previous-marker {
  position: absolute;
  top: -6px;
  bottom: -6px;
  width: 4px;
  background: #1f2937;
  border-radius: 2px;
  transform: translateX(-50%);
  z-index: 2;
  box-shadow: 0 0 0 2px #fff;
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
}

.no-comparison-card {
  padding: 60px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.warning-icon {
  width: 64px;
  height: 64px;
  color: #f59e0b;
}

@media (max-width: 768px) {
  .summary-cards {
    grid-template-columns: 1fr;
  }
  .category-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
