<template>
  <div>
    <NavBar />
    <div class="assessment-detail-page">
      <div class="container">
        <!-- Loading State -->
        <div v-if="assessmentStore.loading" class="loading-container">
          <LoadingSpinner />
        </div>

        <!-- Error State -->
        <div v-else-if="!currentAssessment" class="error-state card">
          <AlertCircle class="error-icon" />
          <h2>Assessment Not Found</h2>
          <p>The assessment you're looking for doesn't exist or has been removed.</p>
          <router-link to="/assessments" class="btn btn-primary"> Back to Assessments </router-link>
        </div>

        <!-- Assessment Details -->
        <div v-else>
          <div class="page-header">
            <div>
              <router-link to="/assessments" class="back-link">
                <ArrowLeft class="icon" />
                Back to Assessments
              </router-link>
              <div class="header-title">
                <h1>{{ currentAssessment.vendor_name }}</h1>
                <span class="status-badge" :class="currentAssessment.status">
                  {{ currentAssessment.status_display }}
                </span>
              </div>
              <p class="text-muted">
                {{ currentAssessment.assessment_type_display }} •
                {{ formatDate(currentAssessment.assessment_date) }}
              </p>
            </div>
            <div class="header-actions">
              <button
                v-if="
                  currentAssessment.status === 'draft' || currentAssessment.status === 'in_progress'
                "
                @click="goToQuestionnaire"
                class="btn btn-outline"
              >
                <Edit class="icon" />
                Edit Assessment
              </button>
              <button
                v-if="currentAssessment.status === 'completed' && canApprove"
                @click="approveAssessment"
                class="btn btn-primary"
                :disabled="assessmentStore.loading"
              >
                <CheckCircle class="icon" />
                Approve
              </button>
            </div>
          </div>

          <!-- Score Overview -->
          <div class="score-overview card">
            <div class="score-display">
              <div class="score-circle" :class="getScoreClass(currentAssessment.overall_score)">
                <span class="score-number">{{ currentAssessment.overall_score }}</span>
                <span class="score-label">Overall Score</span>
              </div>
              <div class="score-info">
                <h2>Assessment Score</h2>
                <p class="score-rating" :class="getScoreClass(currentAssessment.overall_score)">
                  {{ getScoreRating(currentAssessment.overall_score) }}
                </p>
                <p class="text-muted">
                  Assessed by: {{ currentAssessment.assessed_by_name || 'N/A' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Category Scores -->
          <div class="category-scores card">
            <h3>
              <BarChart class="section-icon" />
              Category Breakdown
            </h3>
            <div class="scores-grid">
              <div class="score-item">
                <div class="score-header">
                  <span class="score-name">Access Control</span>
                  <span class="score-value">{{ currentAssessment.access_control_score }}/100</span>
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${currentAssessment.access_control_score}%` }"
                  ></div>
                </div>
              </div>

              <div class="score-item">
                <div class="score-header">
                  <span class="score-name">Data Protection</span>
                  <span class="score-value">{{ currentAssessment.data_protection_score }}/100</span>
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${currentAssessment.data_protection_score}%` }"
                  ></div>
                </div>
              </div>

              <div class="score-item">
                <div class="score-header">
                  <span class="score-name">Network Security</span>
                  <span class="score-value"
                    >{{ currentAssessment.network_security_score }}/100</span
                  >
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${currentAssessment.network_security_score}%` }"
                  ></div>
                </div>
              </div>

              <div class="score-item">
                <div class="score-header">
                  <span class="score-name">Incident Response</span>
                  <span class="score-value"
                    >{{ currentAssessment.incident_response_score }}/100</span
                  >
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${currentAssessment.incident_response_score}%` }"
                  ></div>
                </div>
              </div>

              <div class="score-item">
                <div class="score-header">
                  <span class="score-name">Vulnerability Management</span>
                  <span class="score-value"
                    >{{ currentAssessment.vulnerability_management_score }}/100</span
                  >
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${currentAssessment.vulnerability_management_score}%` }"
                  ></div>
                </div>
              </div>

              <div class="score-item">
                <div class="score-header">
                  <span class="score-name">Business Continuity</span>
                  <span class="score-value"
                    >{{ currentAssessment.business_continuity_score }}/100</span
                  >
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${currentAssessment.business_continuity_score}%` }"
                  ></div>
                </div>
              </div>

              <div class="score-item">
                <div class="score-header">
                  <span class="score-name">Security Governance</span>
                  <span class="score-value"
                    >{{ currentAssessment.security_governance_score }}/100</span
                  >
                </div>
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: `${currentAssessment.security_governance_score}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Assessment Details Grid -->
          <div class="details-grid">
            <!-- Notes -->
            <div v-if="currentAssessment.notes" class="detail-card card">
              <h3>
                <FileText class="section-icon" />
                Notes
              </h3>
              <p>{{ currentAssessment.notes }}</p>
            </div>

            <!-- Findings -->
            <div v-if="currentAssessment.findings" class="detail-card card">
              <h3>
                <AlertTriangle class="section-icon" />
                Key Findings
              </h3>
              <p>{{ currentAssessment.findings }}</p>
            </div>

            <!-- Recommendations -->
            <div v-if="currentAssessment.recommendations" class="detail-card card">
              <h3>
                <Lightbulb class="section-icon" />
                Recommendations
              </h3>
              <p>{{ currentAssessment.recommendations }}</p>
            </div>

            <!-- Follow-up -->
            <div v-if="currentAssessment.requires_followup" class="detail-card card">
              <h3>
                <Calendar class="section-icon" />
                Follow-up Required
              </h3>
              <p>
                <strong>Date:</strong> {{ formatDate(currentAssessment.followup_date) }}<br />
                <strong>Status:</strong>
                {{ currentAssessment.followup_completed ? 'Completed' : 'Pending' }}
              </p>
            </div>
          </div>

          <!-- Evidence -->
          <div class="evidence-section card">
            <div class="section-header">
              <h3>
                <Paperclip class="section-icon" />
                Supporting Evidence
              </h3>
              <button @click="showUploadModal = true" class="btn btn-outline btn-sm">
                <Upload class="icon" />
                Upload Evidence
              </button>
            </div>

            <div v-if="evidence.length === 0" class="empty-evidence">
              <p>No evidence uploaded yet</p>
            </div>

            <div v-else class="evidence-list">
              <div v-for="item in evidence" :key="item.id" class="evidence-item">
                <div class="evidence-icon">
                  <File class="icon" />
                </div>
                <div class="evidence-info">
                  <h4>{{ item.title }}</h4>
                  <p>{{ item.description }}</p>
                  <span class="evidence-meta">
                    {{ item.evidence_type_display }} • Uploaded by {{ item.uploaded_by_name }} •
                    {{ formatDate(item.uploaded_at) }}
                  </span>
                </div>
                <button @click="deleteEvidence(item.id)" class="btn-icon-danger">
                  <Trash2 class="icon" />
                </button>
              </div>
            </div>
          </div>

          <!-- Comparison -->
          <div v-if="comparison" class="comparison-section card">
            <h3>
              <TrendingUp class="section-icon" />
              Comparison with Previous Assessment
            </h3>
            <div class="comparison-summary">
              <div class="comparison-item">
                <span class="comparison-label">Previous Score:</span>
                <span class="comparison-value">{{ comparison.previous.overall_score }}</span>
              </div>
              <div class="comparison-item">
                <span class="comparison-label">Current Score:</span>
                <span class="comparison-value">{{ comparison.current.overall_score }}</span>
              </div>
              <div class="comparison-item">
                <span class="comparison-label">Change:</span>
                <span class="comparison-value" :class="comparison.trend">
                  {{ comparison.changes.overall > 0 ? '+' : ''
                  }}{{ comparison.changes.overall }} ({{
                    comparison.improvement_percentage.toFixed(1)
                  }}%)
                </span>
              </div>
              <div class="comparison-item">
                <span class="comparison-label">Trend:</span>
                <span class="comparison-value" :class="comparison.trend">
                  {{ comparison.trend }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Evidence Modal -->
    <div v-if="showUploadModal" class="modal-overlay" @click.self="showUploadModal = false">
      <div class="upload-modal">
        <div class="modal-header">
          <h2>Upload Evidence</h2>
          <button @click="showUploadModal = false" class="close-btn">
            <X class="icon" />
          </button>
        </div>
        <form @submit.prevent="handleUploadEvidence" class="modal-body">
          <div class="form-group">
            <label for="title" class="form-label">Title *</label>
            <input
              id="title"
              v-model="evidenceForm.title"
              type="text"
              class="form-input"
              required
            />
          </div>

          <div class="form-group">
            <label for="evidence_type" class="form-label">Type *</label>
            <select
              id="evidence_type"
              v-model="evidenceForm.evidence_type"
              class="form-input"
              required
            >
              <option value="document">Document</option>
              <option value="screenshot">Screenshot</option>
              <option value="certificate">Certificate</option>
              <option value="report">Report</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label for="description" class="form-label">Description</label>
            <textarea
              id="description"
              v-model="evidenceForm.description"
              class="form-input"
              rows="3"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="file" class="form-label">File *</label>
            <input id="file" type="file" class="form-input" @change="handleFileChange" required />
            <span class="form-hint"
              >Max 50MB. Allowed: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, ZIP</span
            >
          </div>

          <div class="modal-actions">
            <button type="button" @click="showUploadModal = false" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="assessmentStore.loading">
              {{ assessmentStore.loading ? 'Uploading...' : 'Upload' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAssessmentStore } from '../stores/assessment'
import { useCoreStore } from '../stores/core'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import {
  ArrowLeft,
  Edit,
  CheckCircle,
  BarChart,
  FileText,
  AlertTriangle,
  Lightbulb,
  Calendar,
  Paperclip,
  Upload,
  File,
  Trash2,
  TrendingUp,
  AlertCircle,
  X,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const assessmentStore = useAssessmentStore()
const coreStore = useCoreStore()

const showUploadModal = ref(false)
const evidence = ref([])
const comparison = ref(null)
const evidenceForm = ref({
  title: '',
  evidence_type: 'document',
  description: '',
  file: null,
})

const currentAssessment = computed(() => assessmentStore.currentAssessment)
const canApprove = computed(() => ['admin', 'manager'].includes(coreStore.permissions?.role))

const getScoreClass = (score) => {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'fair'
  return 'poor'
}

const getScoreRating = (score) => {
  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Fair'
  return 'Needs Improvement'
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const goToQuestionnaire = () => {
  router.push(`/assessments/${route.params.id}/questionnaire`)
}

const approveAssessment = async () => {
  try {
    await assessmentStore.approveAssessment(route.params.id)
    await assessmentStore.fetchAssessment(route.params.id)
  } catch (error) {
    console.error('Failed to approve assessment:', error)
  }
}

const handleFileChange = (event) => {
  evidenceForm.value.file = event.target.files[0]
}

const handleUploadEvidence = async () => {
  try {
    await assessmentStore.uploadEvidence(route.params.id, evidenceForm.value)
    evidence.value = await assessmentStore.fetchEvidence(route.params.id)
    showUploadModal.value = false
    evidenceForm.value = {
      title: '',
      evidence_type: 'document',
      description: '',
      file: null,
    }
  } catch (error) {
    console.error('Failed to upload evidence:', error)
  }
}

const deleteEvidence = async (evidenceId) => {
  if (confirm('Are you sure you want to delete this evidence?')) {
    try {
      await assessmentStore.deleteEvidence(evidenceId)
      evidence.value = evidence.value.filter((e) => e.id !== evidenceId)
    } catch (error) {
      console.error('Failed to delete evidence:', error)
    }
  }
}

onMounted(async () => {
  await assessmentStore.fetchAssessment(route.params.id)
  evidence.value = await assessmentStore.fetchEvidence(route.params.id)

  // Try to fetch comparison
  try {
    comparison.value = await assessmentStore.compareAssessments(route.params.id)
  } catch (error) {
    // No previous assessment to compare
    console.log('No previous assessment for comparison')
  }
})
</script>

<style scoped>
.assessment-detail-page {
  min-height: calc(100vh - 72px);
  padding: 40px 0;
  background: #f5f7fa;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.error-state {
  text-align: center;
  padding: 60px 40px;
}

.error-icon {
  width: 80px;
  height: 80px;
  color: #ef4444;
  margin: 0 auto 24px;
}

.error-state h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  margin-bottom: 16px;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #2563eb;
}

.icon {
  width: 20px;
  height: 20px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
}

.page-header h1 {
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 12px;
  font-size: 14px;
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

.header-actions {
  display: flex;
  gap: 12px;
}

/* Score Overview */
.score-overview {
  margin-bottom: 32px;
}

.score-display {
  display: flex;
  align-items: center;
  gap: 32px;
}

.score-circle {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 8px solid;
}

.score-circle.excellent {
  background: #d1fae5;
  border-color: #10b981;
}

.score-circle.good {
  background: #dbeafe;
  border-color: #3b82f6;
}

.score-circle.fair {
  background: #fef3c7;
  border-color: #f59e0b;
}

.score-circle.poor {
  background: #fee2e2;
  border-color: #ef4444;
}

.score-number {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
}

.score-label {
  font-size: 14px;
  font-weight: 600;
  margin-top: 8px;
}

.score-info h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.score-rating {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.score-rating.excellent {
  color: #10b981;
}

.score-rating.good {
  color: #3b82f6;
}

.score-rating.fair {
  color: #f59e0b;
}

.score-rating.poor {
  color: #ef4444;
}

/* Category Scores */
.category-scores {
  margin-bottom: 32px;
}

.category-scores h3 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 24px;
}

.section-icon {
  width: 24px;
  height: 24px;
  color: #3b82f6;
}

.scores-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.score-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.score-name {
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
}

.score-value {
  font-size: 14px;
  font-weight: 700;
  color: #3b82f6;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Details Grid */
.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.detail-card h3 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 16px;
}

.detail-card p {
  color: #4b5563;
  line-height: 1.6;
}

/* Evidence Section */
.evidence-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 14px;
}

.empty-evidence {
  text-align: center;
  padding: 40px;
  color: #6b7280;
}

.evidence-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.evidence-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.evidence-icon {
  width: 48px;
  height: 48px;
  background: #e5e7eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.evidence-info {
  flex: 1;
}

.evidence-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.evidence-info p {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
}

.evidence-meta {
  font-size: 12px;
  color: #9ca3af;
}

.btn-icon-danger {
  padding: 8px;
  border: none;
  background: transparent;
  color: #ef4444;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.3s;
}

.btn-icon-danger:hover {
  background: #fee2e2;
}

/* Comparison Section */
.comparison-section h3 {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 20px;
}

.comparison-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.comparison-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.comparison-label {
  font-size: 14px;
  color: #6b7280;
}

.comparison-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.comparison-value.improving {
  color: #10b981;
}

.comparison-value.declining {
  color: #ef4444;
}

.comparison-value.stable {
  color: #6b7280;
}

/* Upload Modal */
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

.upload-modal {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.close-btn {
  padding: 8px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #e5e7eb;
}

.modal-body {
  padding: 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

@media (max-width: 1024px) {
  .scores-grid,
  .details-grid,
  .comparison-summary {
    grid-template-columns: 1fr;
  }

  .score-display {
    flex-direction: column;
    text-align: center;
  }
}
</style>
