<template>
  <div class="page-wrapper">
    <NavBar />
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-text">
            <div class="header-badge">
              <ClipboardCheck class="badge-icon" />
              <span>Assurance Hub</span>
            </div>
            <h1 class="page-title">Assessments</h1>
            <p class="page-subtitle">
              Manage and track vendor security audits across your ecosystem.
            </p>
          </div>
          <div class="header-actions">
            <router-link to="/assessments/summary" class="btn btn-outline">
              <BarChart3 class="icon-sm" />
              <span>Portfolio Summary</span>
            </router-link>
            <router-link to="/assessments/new" class="btn btn-primary">
              <Plus class="icon-sm" />
              <span>New Assessment</span>
            </router-link>
          </div>
        </div>
      </header>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="search-wrapper">
          <Search class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by vendor or audit type..."
            class="search-input"
          />
        </div>
        <div class="filter-group">
          <div class="select-wrapper">
            <Filter class="select-icon" />
            <select v-model="filterStatus" class="modern-select">
              <option value="">Status</option>
              <option value="draft">Draft</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="approved">Approved</option>
            </select>
          </div>
          <div class="select-wrapper">
            <Activity class="select-icon" />
            <select v-model="filterType" class="modern-select">
              <option value="">Audit Type</option>
              <option value="initial">Initial</option>
              <option value="annual">Annual Review</option>
              <option value="triggered">Triggered</option>
              <option value="incident_followup">Follow-up</option>
            </select>
          </div>
          <button
            v-if="searchQuery || filterStatus || filterType"
            @click="resetFilters"
            class="btn-clear"
            title="Clear Filters"
          >
            <X class="icon-xs" />
            <span class="clear-text">Clear</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="assessmentStore.loading" class="loading-container">
        <LoadingSpinner />
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredAssessments.length === 0" class="empty-state">
        <div class="empty-illustration">
          <div class="pulse-ring primary"></div>
          <div class="pulse-ring secondary"></div>
          <ClipboardList class="illustration-icon" />
        </div>
        <h2 class="empty-title">Audit Queue Clear</h2>
        <p class="empty-description">
          No assessments matched your current search criteria. Your risk pipeline is up to date.
        </p>
        <div class="empty-actions">
          <button @click="resetFilters" class="btn btn-secondary">Clear All Filters</button>
          <router-link to="/assessments/new" class="btn btn-primary">Launch Assessment</router-link>
        </div>
      </div>

      <!-- Assessments Grid -->
      <div v-else class="assessments-grid">
        <div
          v-for="assessment in filteredAssessments"
          :key="assessment.id"
          class="assessment-card"
          @click="navigateToAssessment(assessment.id)"
        >
          <div class="card-edge" :class="getScoreClass(assessment.overall_score)"></div>

          <div class="card-header">
            <span class="type-badge">{{ assessment.assessment_type_display }}</span>
            <div class="score-pill" :class="getScoreClass(assessment.overall_score)">
              {{ assessment.overall_score }}
            </div>
          </div>

          <div class="card-body">
            <h3 class="assessment-title">{{ assessment.vendor_name }}</h3>
            <p class="assessment-meta">Executed on {{ formatDate(assessment.assessment_date) }}</p>

            <div class="assessment-stats">
              <div class="stat-item">
                <span class="stat-label">Analyst</span>
                <span class="stat-value">{{ assessment.assessed_by_name || 'System' }}</span>
              </div>
              <div class="stat-item align-right">
                <span class="stat-label">Audit ID</span>
                <span class="stat-value">#{{ assessment.id.split('-')[0] }}</span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <span class="status-tag" :class="assessment.status">
              {{ assessment.status_display }}
            </span>
            <div class="card-actions">
              <button
                @click.stop="viewDetails(assessment)"
                class="action-btn view"
                title="View Full Report"
              >
                <Eye class="icon-xs" />
              </button>
              <button
                v-if="assessment.status === 'draft' || assessment.status === 'in_progress'"
                @click.stop="editAssessment(assessment)"
                class="action-btn edit"
                title="Modify"
              >
                <Edit class="icon-xs" />
              </button>
              <button
                v-if="assessment.status === 'draft'"
                @click.stop="deleteAssessmentConfirm(assessment)"
                class="action-btn delete"
                title="Remove"
              >
                <Trash2 class="icon-xs" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footnote Stats -->
      <footer
        v-if="!assessmentStore.loading && filteredAssessments.length > 0"
        class="summary-stats"
      >
        <div class="f-stat">
          <span class="f-label">Audits Conducted</span>
          <span class="f-val">{{ filteredAssessments.length }}</span>
        </div>
        <div class="f-stat">
          <span class="f-label">Mean Security Score</span>
          <span class="f-val">{{ averageScore }}</span>
        </div>
        <div class="f-stat">
          <span class="f-label">Resolution Rate</span>
          <span class="f-val"
            >{{ Math.round((completedCount / filteredAssessments.length) * 100) }}%</span
          >
        </div>
      </footer>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="delete-modal">
        <h2>Delete Assessment</h2>
        <p>
          Are you sure you want to delete this assessment for
          <strong>{{ assessmentToDelete?.vendor_name }}</strong
          >?
        </p>
        <p class="warning-text">This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="confirmDelete" class="btn btn-danger">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAssessmentStore } from '../stores/assessment'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import {
  Plus,
  Search,
  ClipboardList,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  ClipboardCheck,
  Filter,
  Activity,
  X,
} from 'lucide-vue-next'

const router = useRouter()
const assessmentStore = useAssessmentStore()

const searchQuery = ref('')
const filterStatus = ref('')
const filterType = ref('')
const showDeleteModal = ref(false)
const assessmentToDelete = ref(null)

const filteredAssessments = computed(() => {
  let assessments = assessmentStore.assessments

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    assessments = assessments.filter(
      (a) =>
        a.vendor_name.toLowerCase().includes(query) ||
        a.assessment_type_display.toLowerCase().includes(query),
    )
  }

  // Status filter
  if (filterStatus.value) {
    assessments = assessments.filter((a) => a.status === filterStatus.value)
  }

  // Type filter
  if (filterType.value) {
    assessments = assessments.filter((a) => a.assessment_type === filterType.value)
  }

  return assessments
})

const averageScore = computed(() => {
  if (filteredAssessments.value.length === 0) return 0
  const total = filteredAssessments.value.reduce((sum, a) => sum + (a.overall_score || 0), 0)
  return Math.round(total / filteredAssessments.value.length)
})

const completedCount = computed(() => {
  return filteredAssessments.value.filter(
    (a) => a.status === 'completed' || a.status === 'approved',
  ).length
})

const getScoreClass = (score) => {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'fair'
  return 'poor'
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const navigateToAssessment = (id) => {
  router.push(`/assessments/${id}`)
}

const viewDetails = (assessment) => {
  router.push(`/assessments/${assessment.id}`)
}

const editAssessment = (assessment) => {
  router.push(`/assessments/${assessment.id}`)
}

const deleteAssessmentConfirm = (assessment) => {
  assessmentToDelete.value = assessment
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (assessmentToDelete.value) {
    await assessmentStore.deleteAssessment(assessmentToDelete.value.id)
    showDeleteModal.value = false
    assessmentToDelete.value = null
  }
}

onMounted(() => {
  assessmentStore.fetchAssessments()
})
</script>

<style scoped>
/* Base Layout */
.page-wrapper {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
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

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 32px;
}

.header-text {
  flex: 1;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(109, 40, 217, 0.25);
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
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
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

.btn-outline {
  background: white;
  color: #475569;
  border: 2px solid #e2e8f0;
}

.btn-outline:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

.btn-secondary {
  background: white;
  color: #475569;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);
}

.btn-danger:hover {
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
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

/* Toolbar */
.toolbar {
  display: flex;
  gap: 16px;
  margin-bottom: 56px;
  animation: fadeIn 0.6s ease-out 0.1s both;
}

.search-wrapper {
  flex: 1;
  position: relative;
  max-width: 500px;
}

.search-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 16px 20px 16px 52px;
  border-radius: 16px;
  border: 2px solid #e2e8f0;
  background: white;
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.search-input::placeholder {
  color: #94a3b8;
}

.search-input:focus {
  border-color: #3b82f6;
  box-shadow:
    0 0 0 4px rgba(59, 130, 246, 0.1),
    0 1px 3px rgba(0, 0, 0, 0.04);
  outline: none;
}

.filter-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.select-wrapper {
  position: relative;
  min-width: 180px;
}

.select-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #64748b;
  pointer-events: none;
  z-index: 1;
}

.modern-select {
  width: 100%;
  padding: 16px 40px 16px 46px;
  border-radius: 16px;
  border: 2px solid #e2e8f0;
  background: white;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 16px;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.modern-select:hover {
  border-color: #cbd5e1;
}

.modern-select:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  outline: none;
}

.btn-clear {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 16px 20px;
  border-radius: 16px;
  border: 2px solid #fee2e2;
  background: white;
  color: #dc2626;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-clear:hover {
  background: #fef2f2;
  border-color: #fecaca;
}

.clear-text {
  display: none;
}

/* Loading */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

/* Assessments Grid */
.assessments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 28px;
  margin-bottom: 56px;
  animation: fadeIn 0.6s ease-out 0.2s both;
}

/* Card Styling */
.assessment-card {
  position: relative;
  background: white;
  border-radius: 32px;
  overflow: hidden;
  border: 2px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.assessment-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.card-edge {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 5px;
  transition: width 0.3s;
}

.assessment-card:hover .card-edge {
  width: 7px;
}

.card-edge.excellent {
  background: linear-gradient(to bottom, #10b981, #059669);
}
.card-edge.good {
  background: linear-gradient(to bottom, #3b82f6, #2563eb);
}
.card-edge.fair {
  background: linear-gradient(to bottom, #f59e0b, #d97706);
}
.card-edge.poor {
  background: linear-gradient(to bottom, #ef4444, #dc2626);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 32px 24px;
}

.type-badge {
  font-size: 11px;
  font-weight: 900;
  color: #64748b;
  background: #f1f5f9;
  padding: 6px 14px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.score-pill {
  font-size: 16px;
  font-weight: 900;
  padding: 6px 14px;
  border-radius: 10px;
}

.score-pill.excellent {
  background: #d1fae5;
  color: #065f46;
}

.score-pill.good {
  background: #dbeafe;
  color: #1e40af;
}

.score-pill.fair {
  background: #fef3c7;
  color: #92400e;
}

.score-pill.poor {
  background: #fee2e2;
  color: #991b1b;
}

.card-body {
  padding: 0 32px 28px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.assessment-title {
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}

.assessment-meta {
  font-size: 15px;
  color: #64748b;
  font-weight: 500;
  margin: 0;
}

.assessment-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding-top: 20px;
  border-top: 2px solid #f1f5f9;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-item.align-right {
  align-items: flex-end;
}

.stat-label {
  font-size: 11px;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.stat-value {
  font-size: 14px;
  font-weight: 700;
  color: #334155;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: #f8fafc;
  border-top: 2px solid #f1f5f9;
}

.status-tag {
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  padding: 6px 14px;
  border-radius: 10px;
  letter-spacing: 0.06em;
}

.status-tag.draft {
  background: #f1f5f9;
  color: #64748b;
}

.status-tag.in_progress {
  background: #eff6ff;
  color: #3b82f6;
}

.status-tag.completed {
  background: #ecfdf5;
  color: #10b981;
}

.status-tag.approved {
  background: #f5f3ff;
  color: #8b5cf6;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: 2px solid transparent;
  background: white;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  cursor: pointer;
}

.action-btn.view:hover {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #e2e8f0;
}

.action-btn.edit:hover {
  background: #eff6ff;
  border-color: #dbeafe;
  color: #3b82f6;
}

.action-btn.delete:hover {
  background: #fef2f2;
  border-color: #fee2e2;
  color: #ef4444;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 100px 40px;
  background: white;
  border-radius: 32px;
  border: 2px solid #e2e8f0;
  animation: fadeIn 0.6s ease-out 0.2s both;
}

.empty-illustration {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.illustration-icon {
  width: 72px;
  height: 72px;
  color: #8b5cf6;
  position: relative;
  z-index: 5;
}

.pulse-ring {
  position: absolute;
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;
}

.pulse-ring.primary {
  width: 100%;
  height: 100%;
  border: 3px solid rgba(139, 92, 246, 0.3);
}

.pulse-ring.secondary {
  width: 130%;
  height: 130%;
  border: 2px solid rgba(139, 92, 246, 0.15);
  animation-delay: 0.5s;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(0.95);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.6;
  }
}

.empty-title {
  font-size: 36px;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 16px 0;
  letter-spacing: -0.02em;
}

.empty-description {
  font-size: 16px;
  color: #64748b;
  max-width: 480px;
  margin: 0 auto 40px;
  line-height: 1.6;
}

.empty-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* Summary Stats */
.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  background: white;
  padding: 32px;
  border-radius: 32px;
  border: 2px solid #e2e8f0;
}

.f-stat {
  text-align: center;
}
.f-label {
  display: block;
  font-size: 11px;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
}
.f-val {
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.delete-modal {
  background: white;
  border-radius: 32px;
  padding: 40px;
  max-width: 440px;
  width: 90%;
  animation: fadeIn 0.4s ease-out;
}

.delete-modal h2 {
  font-size: 28px;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}
.delete-modal p {
  font-size: 16px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 24px;
}
.warning-text {
  color: #ef4444;
  font-weight: 800;
  background: #fef2f2;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 32px;
}
.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
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

@media (max-width: 900px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }
  .toolbar {
    flex-direction: column;
  }
  .search-wrapper {
    max-width: 100%;
  }
  .filter-group {
    width: 100%;
    flex-wrap: wrap;
  }
  .select-wrapper {
    flex: 1;
    min-width: 140px;
  }
  .btn-clear {
    width: 100%;
    justify-content: center;
  }
  .clear-text {
    display: inline;
  }
  .assessments-grid {
    grid-template-columns: 1fr;
  }
  .summary-stats {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .assessments-grid {
    grid-template-columns: 1fr;
  }

  .summary-stats {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
