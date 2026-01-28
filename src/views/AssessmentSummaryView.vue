<template>
  <div>
    <NavBar />
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-text">
            <div class="header-badge">
              <PieChart class="badge-icon" />
              <span>Intelligence Report</span>
            </div>
            <h1 class="page-title">Portfolio Summary</h1>
            <p class="page-subtitle">Deep dive into your vendor ecosystem's security posture.</p>
          </div>
          <div class="header-actions">
            <router-link to="/assessments" class="btn btn-outline">
              <ClipboardCheck class="icon-sm" />
              <span>Audit Log</span>
            </router-link>
            <router-link to="/assessments/new" class="btn btn-primary">
              <Plus class="icon-sm" />
              <span>Launch Audit</span>
            </router-link>
          </div>
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <LoadingSpinner />
      </div>

      <!-- Content -->
      <div v-else-if="summary" class="summary-content">
        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-inner">
              <div class="stat-info">
                <span class="stat-label">Volume</span>
                <div class="stat-value">{{ summary.total_assessments }}</div>
                <span class="stat-sub">Historical audits</span>
              </div>
              <div class="stat-visual total">
                <ClipboardList class="icon-stat" />
              </div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-inner">
              <div class="stat-info">
                <span class="stat-label">Velocity</span>
                <div class="stat-value low">{{ summary.completed_assessments }}</div>
                <span class="stat-sub">Resolved reports</span>
              </div>
              <div class="stat-visual completed">
                <CheckCircle class="icon-stat" />
              </div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-info">
              <span class="stat-label">Attention</span>
              <div class="stat-value medium">{{ summary.pending_assessments }}</div>
              <span class="stat-sub">Active in pipeline</span>
            </div>
            <div class="stat-visual pending">
              <Clock class="icon-stat" />
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-info">
              <span class="stat-label">Resilience</span>
              <div class="stat-value" :class="getScoreClass(summary.average_score)">
                {{ Math.round(summary.average_score) }}
              </div>
              <span class="stat-sub">Mean security score</span>
            </div>
            <div class="stat-visual avg-score">
              <BarChart3 class="icon-stat" />
            </div>
          </div>
        </div>

        <div class="main-grid">
          <!-- Recent Assessments -->
          <section class="info-card">
            <div class="info-header">
              <h2 class="header-title">
                <div class="icon-bg primary"><Activity class="icon-xs" /></div>
                Telemetry Stream
              </h2>
              <router-link to="/assessments" class="view-all">Audit Vault</router-link>
            </div>
            <div class="info-body p-0">
              <div v-if="summary.recent_assessments.length === 0" class="empty-mini">
                <p>Stream clear. No recent entries.</p>
              </div>
              <div v-else class="v-list">
                <div
                  v-for="assessment in summary.recent_assessments"
                  :key="assessment.id"
                  class="v-item"
                  @click="goToAssessment(assessment.id)"
                >
                  <div class="v-info">
                    <span class="v-title">{{ assessment.vendor_name }}</span>
                    <span class="v-sub">{{ formatDate(assessment.assessment_date) }}</span>
                  </div>
                  <div class="v-meta">
                    <div class="risk-pill" :class="getScoreClass(assessment.overall_score)">
                      {{ assessment.overall_score }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Needing Assessment -->
          <section class="info-card">
            <div class="info-header">
              <h2 class="header-title">
                <div class="icon-bg warning"><ShieldAlert class="icon-xs" /></div>
                Visibility Gaps
              </h2>
              <router-link to="/vendors" class="view-all">Ecosystem</router-link>
            </div>
            <div class="info-body p-0">
              <div v-if="summary.vendors_needing_assessment.length === 0" class="empty-mini">
                <p>Full spectrum visibility achieved.</p>
              </div>
              <div v-else class="v-list">
                <div
                  v-for="vendor in summary.vendors_needing_assessment"
                  :key="vendor.id"
                  class="v-item"
                  @click="goToVendor(vendor.id)"
                >
                  <div class="v-info">
                    <span class="v-title">{{ vendor.name }}</span>
                    <span class="v-sub">Tier: {{ vendor.risk_level }}</span>
                  </div>
                  <div class="v-meta">
                    <button class="btn btn-outline btn-xs" @click.stop="startAssessment(vendor.id)">
                      Assess
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAssessmentStore } from '../stores/assessment'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import {
  ClipboardList,
  CheckCircle,
  Clock,
  BarChart3,
  Plus,
  PieChart,
  ClipboardCheck,
  Activity,
  ShieldAlert,
} from 'lucide-vue-next'

const router = useRouter()
const assessmentStore = useAssessmentStore()
const summary = ref(null)
const loading = ref(true)

const loadSummary = async () => {
  loading.value = true
  try {
    summary.value = await assessmentStore.fetchAssessmentSummary()
  } catch (error) {
    console.error('Failed to load summary:', error)
  } finally {
    loading.value = false
  }
}

const getScoreClass = (score) => {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'fair'
  return 'poor'
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const goToAssessment = (id) => {
  router.push(`/assessments/${id}`)
}

const goToVendor = (id) => {
  router.push(`/vendors/${id}`)
}

const startAssessment = (vendorId) => {
  router.push({
    path: '/assessments/new',
    query: { vendor_id: vendorId },
  })
}

onMounted(() => {
  loadSummary()
})
</script>

<style scoped>
/* Base Layout */
.summary-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px 80px;
}

/* Page Header */
.page-header {
  padding: 48px 0 40px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 32px;
  animation: fadeIn 0.5s ease-out;
}

.header-text {
  flex: 1;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25);
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
  margin: 0 0 12px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #64748b;
  font-weight: 500;
  line-height: 1.6;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 48px;
  animation: fadeIn 0.6s ease-out 0.1s both;
}

.stat-card {
  background: white;
  border-radius: 24px;
  border: 2px solid #e2e8f0;
  padding: 24px;
  transition: all 0.3s;
}

.stat-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  display: block;
  font-size: 11px;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 12px;
}

.stat-value {
  font-size: 36px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1;
  margin-bottom: 8px;
}
.stat-sub {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}

.stat-visual {
  width: 60px;
  height: 60px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stat-visual.total {
  background: #eff6ff;
  color: #3b82f6;
}
.stat-visual.completed {
  background: #ecfdf5;
  color: #10b981;
}
.stat-visual.pending {
  background: #fffbeb;
  color: #f59e0b;
}
.stat-visual.avg-score {
  background: #f5f3ff;
  color: #8b5cf6;
}

.icon-stat {
  width: 28px;
  height: 28px;
}

/* Main Grid */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 48px;
  animation: fadeIn 0.6s ease-out 0.2s both;
}

.info-card {
  background: white;
  border-radius: 32px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 2px solid #f1f5f9;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
}

.icon-bg {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-bg.warning {
  background: #fff7ed;
  color: #f97316;
}
.icon-bg.primary {
  background: #eff6ff;
  color: #3b82f6;
}

.view-all {
  font-size: 11px;
  font-weight: 900;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-decoration: none;
}

.v-list {
  display: flex;
  flex-direction: column;
}
.v-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  border-bottom: 2px solid #f1f5f9;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.v-item:last-child {
  border-bottom: none;
}
.v-item:hover {
  background: #f8fafc;
  padding-left: 40px;
}

.v-title {
  display: block;
  font-size: 15px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 2px;
}
.v-sub {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
}

.risk-pill {
  font-size: 12px;
  font-weight: 900;
  padding: 4px 12px;
  border-radius: 8px;
  text-align: center;
  min-width: 32px;
}
.risk-pill.excellent {
  background: #d1fae5;
  color: #065f46;
}
.risk-pill.good {
  background: #dbeafe;
  color: #1e40af;
}
.risk-pill.fair {
  background: #fef3c7;
  color: #92400e;
}
.risk-pill.poor {
  background: #fee2e2;
  color: #991b1b;
}

.empty-mini {
  padding: 60px 40px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 700;
}

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

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }
  .main-grid {
    grid-template-columns: 1fr;
  }
}
</style>
