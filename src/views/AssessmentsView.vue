<template>
  <div>
    <NavBar />
    <div class="assessments-page">
      <div class="container">
        <div class="page-header">
          <div>
            <h1>Assessments</h1>
            <p class="text-muted">Manage vendor security assessments</p>
          </div>
          <router-link to="/assessments/new" class="btn btn-primary">
            <Plus class="icon" />
            New Assessment
          </router-link>
        </div>

        <!-- Filters and Search -->
        <div class="filters-section card">
          <div class="search-bar">
            <Search class="search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search assessments..."
              class="search-input"
            />
          </div>
          <div class="filters">
            <select v-model="filterStatus" class="filter-select">
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="approved">Approved</option>
            </select>
            <select v-model="filterType" class="filter-select">
              <option value="">All Types</option>
              <option value="initial">Initial Assessment</option>
              <option value="annual">Annual Review</option>
              <option value="triggered">Triggered Assessment</option>
              <option value="incident_followup">Incident Follow-up</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="assessmentStore.loading" class="loading-container">
          <LoadingSpinner />
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredAssessments.length === 0" class="empty-state card">
          <ClipboardList class="empty-icon" />
          <h2>No Assessments Found</h2>
          <p v-if="searchQuery || filterStatus || filterType">
            Try adjusting your filters or search query
          </p>
          <p v-else>Get started by creating your first assessment</p>
          <router-link to="/assessments/new" class="btn btn-primary">
            <Plus class="icon" />
            Create Your First Assessment
          </router-link>
        </div>

        <!-- Assessments Grid -->
        <div v-else class="assessments-grid">
          <div
            v-for="assessment in filteredAssessments"
            :key="assessment.id"
            class="assessment-card"
            @click="navigateToAssessment(assessment.id)"
          >
            <div class="assessment-header">
              <div>
                <h3>{{ assessment.vendor_name }}</h3>
                <p class="assessment-meta">
                  {{ formatDate(assessment.assessment_date) }} •
                  {{ assessment.assessment_type_display }}
                </p>
              </div>
              <div class="score-badge" :class="getScoreClass(assessment.overall_score)">
                {{ assessment.overall_score }}
              </div>
            </div>

            <div class="assessment-body">
              <div class="status-row">
                <span class="status-badge" :class="assessment.status">
                  {{ assessment.status_display }}
                </span>
                <span v-if="assessment.assessed_by_name" class="assessed-by">
                  By {{ assessment.assessed_by_name }}
                </span>
              </div>
            </div>

            <div class="assessment-footer">
              <button @click.stop="viewDetails(assessment)" class="action-btn" title="View Details">
                <Eye class="action-icon" />
              </button>
              <button
                v-if="assessment.status === 'draft' || assessment.status === 'in_progress'"
                @click.stop="editAssessment(assessment)"
                class="action-btn"
                title="Edit"
              >
                <Edit class="action-icon" />
              </button>
              <button
                v-if="assessment.status === 'draft'"
                @click.stop="deleteAssessmentConfirm(assessment)"
                class="action-btn danger"
                title="Delete"
              >
                <Trash2 class="action-icon" />
              </button>
            </div>
          </div>
        </div>

        <!-- Summary Stats -->
        <div
          v-if="!assessmentStore.loading && filteredAssessments.length > 0"
          class="summary-stats"
        >
          <div class="summary-item">
            <span class="summary-label">Total Assessments:</span>
            <span class="summary-value">{{ filteredAssessments.length }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Average Score:</span>
            <span class="summary-value">{{ averageScore }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Completed:</span>
            <span class="summary-value">{{ completedCount }}</span>
          </div>
        </div>
      </div>
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
import { Plus, Search, ClipboardList, Eye, Edit, Trash2 } from 'lucide-vue-next'

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
.assessments-page {
  min-height: calc(100vh - 72px);
  padding: 40px 0;
  background: #f5f7fa;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.page-header h1 {
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

/* Filters Section */
.filters-section {
  margin-bottom: 24px;
  padding: 20px;
}

.search-bar {
  position: relative;
  margin-bottom: 16px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
}

/* Loading */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 40px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  color: #d1d5db;
  margin: 0 auto 24px;
}

.empty-state h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 24px;
}

/* Assessments Grid */
.assessments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.assessment-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
}

.assessment-card:hover {
  border-color: #3b82f6;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.assessment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.assessment-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.assessment-meta {
  font-size: 14px;
  color: #6b7280;
}

.score-badge {
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 18px;
}

.score-badge.excellent {
  background: #d1fae5;
  color: #065f46;
}

.score-badge.good {
  background: #dbeafe;
  color: #1e40af;
}

.score-badge.fair {
  background: #fef3c7;
  color: #92400e;
}

.score-badge.poor {
  background: #fee2e2;
  color: #991b1b;
}

.assessment-body {
  margin-bottom: 16px;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.draft {
  background: #f3f4f6;
  color: #6b7280;
}

.status-badge.in_progress {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.completed {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.approved {
  background: #e0e7ff;
  color: #4338ca;
}

.assessed-by {
  font-size: 12px;
  color: #6b7280;
}

.assessment-footer {
  display: flex;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.action-btn {
  padding: 8px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #e5e7eb;
}

.action-btn.danger:hover {
  background: #fee2e2;
}

.action-icon {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.action-btn.danger .action-icon {
  color: #ef4444;
}

/* Summary Stats */
.summary-stats {
  display: flex;
  justify-content: space-around;
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.summary-item {
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}

.summary-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

/* Delete Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.delete-modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 400px;
  width: 100%;
}

.delete-modal h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 16px;
}

.delete-modal p {
  color: #4b5563;
  margin-bottom: 12px;
}

.warning-text {
  color: #ef4444;
  font-weight: 600;
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
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
