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
                v-if="comparison"
                @click="goToComparison"
                class="btn btn-outline"
                title="View comparison with previous assessment"
              >
                <TrendingUp class="icon" />
                Comparison
              </button>
              <button
                v-if="
                  currentAssessment.status === 'draft' || currentAssessment.status === 'in_progress'
                "
                @click="goToQuestionnaire"
                class="btn btn-outline"
              >
                <Edit class="icon" />
                Edit Questionnaire
              </button>
              <button
                v-if="
                  currentAssessment.status === 'draft' || currentAssessment.status === 'in_progress'
                "
                @click="showEditFindingsModal = true"
                class="btn btn-secondary"
              >
                <FileText class="icon" />
                Edit Findings
              </button>
              <button
                v-if="currentAssessment.status === 'completed' && canApprove"
                @click="approveAssessment"
                class="btn btn-primary"
                :disabled="assessmentStore.loading"
              >
                <CheckCircle class="icon" />
                Approve Assessment
              </button>
            </div>
          </div>

          <!-- Premium Score Banner -->
          <div class="score-banner card glass shadow-lg">
            <div class="banner-content">
              <div class="score-hero">
                <div
                  class="score-ring-wrapper"
                  :class="getScoreClass(currentAssessment.overall_score)"
                >
                  <div class="score-ring">
                    <span class="score-number">{{ currentAssessment.overall_score }}</span>
                    <span class="score-label">Points</span>
                  </div>
                  <div class="glow"></div>
                </div>
                <div class="score-text">
                  <span
                    class="rating-badge"
                    :class="getScoreClass(currentAssessment.overall_score)"
                  >
                    {{ getScoreRating(currentAssessment.overall_score) }}
                  </span>
                  <h2>Security Performance</h2>
                  <p class="assessor-info">
                    Certified by
                    <strong>{{ currentAssessment.assessed_by_name || 'System' }}</strong>
                  </p>
                </div>
              </div>

              <!-- Comparison Mini Card -->
              <div v-if="comparison" @click="goToComparison" class="comparison-mini card clickable">
                <div class="mini-header">
                  <TrendingUp v-if="comparison.trend === 'improving'" class="trend-icon" />
                  <TrendingDown v-else-if="comparison.trend === 'declining'" class="trend-icon" />
                  <span>{{ comparison.trend.toUpperCase() }}</span>
                </div>
                <div class="mini-value" :class="comparison.trend">
                  {{ comparison.changes.overall > 0 ? '+' : '' }}{{ comparison.changes.overall }}
                  <span class="percentage"
                    >({{ Math.round(comparison.improvement_percentage) }}%)</span
                  >
                </div>
                <div class="mini-footer">vs Previous Audit</div>
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
              <div v-for="(label, key) in categoryLabelMap" :key="key" class="score-card-mini">
                <div class="mini-score-header">
                  <span class="mini-cat-label">{{ label }}</span>
                  <span class="mini-cat-value">{{ currentAssessment[key + '_score'] || 0 }}%</span>
                </div>
                <div class="mini-progress">
                  <div
                    class="mini-progress-fill"
                    :class="getScoreClass(currentAssessment[key + '_score'] || 0)"
                    :style="{ width: `${currentAssessment[key + '_score'] || 0}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Assessment Details Grid -->
          <div class="details-grid">
            <!-- Management Details -->
            <div class="detail-card card findings-card">
              <div class="detail-header">
                <h3>
                  <FileText class="section-icon" />
                  Findings & Summary
                </h3>
                <button
                  v-if="currentAssessment.status !== 'approved'"
                  @click="showEditFindingsModal = true"
                  class="btn-text"
                >
                  Edit
                </button>
              </div>
              <div class="findings-content">
                <div class="content-group">
                  <label>General Notes</label>
                  <p>{{ currentAssessment.notes || 'No notes provided.' }}</p>
                </div>
                <div class="content-group">
                  <label>Key Findings</label>
                  <p>{{ currentAssessment.findings || 'No findings recorded yet.' }}</p>
                </div>
                <div class="content-group">
                  <label>Recommendations</label>
                  <p>
                    {{ currentAssessment.recommendations || 'No recommendations recorded yet.' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Follow-up -->
            <div class="detail-card card followup-card">
              <h3>
                <Calendar class="section-icon" />
                Management & Follow-up
              </h3>
              <div class="followup-details">
                <div class="info-row">
                  <span class="label">Requires Follow-up:</span>
                  <span class="value" :class="{ highlight: currentAssessment.requires_followup }">
                    {{ currentAssessment.requires_followup ? 'Yes' : 'No' }}
                  </span>
                </div>
                <div v-if="currentAssessment.requires_followup" class="info-row">
                  <span class="label">Follow-up Date:</span>
                  <span class="value">{{ formatDate(currentAssessment.followup_date) }}</span>
                </div>
                <div v-if="currentAssessment.requires_followup" class="info-row">
                  <span class="label">Follow-up Status:</span>
                  <span
                    class="status-pill"
                    :class="currentAssessment.followup_completed ? 'completed' : 'pending'"
                  >
                    {{ currentAssessment.followup_completed ? 'Completed' : 'Pending' }}
                  </span>
                </div>
                <div v-if="currentAssessment.approved_by" class="approval-info">
                  <label>Approval Information</label>
                  <p>Approved on {{ formatDate(currentAssessment.approved_at) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Evidence -->
          <div class="evidence-section card">
            <div class="section-header">
              <h3>
                <Paperclip class="section-icon" />
                Supporting Evidence
              </h3>
              <button
                v-if="canUploadEvidence"
                @click="showUploadModal = true"
                class="btn btn-outline btn-sm"
              >
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
                <button
                  v-if="canDeleteEvidence(item)"
                  @click="deleteEvidence(item.id)"
                  class="btn-icon-danger"
                >
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

    <!-- Edit Findings Modal -->
    <div
      v-if="showEditFindingsModal"
      class="modal-overlay"
      @click.self="showEditFindingsModal = false"
    >
      <div class="edit-findings-modal">
        <div class="modal-header">
          <h2>Edit Findings & Recommendations</h2>
          <button @click="showEditFindingsModal = false" class="close-btn">
            <X class="icon" />
          </button>
        </div>
        <form @submit.prevent="handleUpdateFindings" class="modal-body">
          <div class="form-group">
            <label class="form-label">Internal Notes</label>
            <textarea v-model="findingsForm.notes" class="form-input" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Key Findings</label>
            <textarea v-model="findingsForm.findings" class="form-input" rows="4"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Recommendations</label>
            <textarea v-model="findingsForm.recommendations" class="form-input" rows="4"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" v-model="findingsForm.requires_followup" />
                Requires Follow-up
              </label>
            </div>
            <div v-if="findingsForm.requires_followup" class="form-group">
              <label class="form-label">Follow-up Date</label>
              <input type="date" v-model="findingsForm.followup_date" class="form-input" required />
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showEditFindingsModal = false" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="assessmentStore.loading">
              Save Changes
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
const showEditFindingsModal = ref(false)
const evidence = ref([])
const comparison = ref(null)

const categoryLabelMap = {
  access_control: 'Access Control',
  data_protection: 'Data Protection',
  network_security: 'Network Security',
  incident_response: 'Incident Response',
  vulnerability_management: 'Vulnerability Management',
  business_continuity: 'Business Continuity',
  security_governance: 'Security Governance',
}

const evidenceForm = ref({
  title: '',
  evidence_type: 'document',
  description: '',
  file: null,
})

const findingsForm = ref({
  notes: '',
  findings: '',
  recommendations: '',
  requires_followup: false,
  followup_date: '',
})

const currentAssessment = computed(() => assessmentStore.currentAssessment)
const canApprove = computed(() => ['admin', 'manager'].includes(coreStore.permissions?.role))
const canUploadEvidence = computed(() =>
  ['admin', 'manager', 'analyst'].includes(coreStore.permissions?.role),
)

const canDeleteEvidence = (item) => {
  // Can delete if admin or if user uploaded it
  const currentUser = coreStore.currentUser
  return coreStore.permissions?.role === 'admin' || item.uploaded_by === currentUser?.id
}

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

const goToComparison = () => {
  router.push(`/assessments/${route.params.id}/compare`)
}

const approveAssessment = async () => {
  try {
    await assessmentStore.approveAssessment(route.params.id)
    await assessmentStore.fetchAssessment(route.params.id)
  } catch (error) {
    console.error('Failed to approve assessment:', error)
  }
}

const handleUpdateFindings = async () => {
  try {
    await assessmentStore.updateAssessment(route.params.id, findingsForm.value)
    showEditFindingsModal.value = false
    await assessmentStore.fetchAssessment(route.params.id)
  } catch (error) {
    console.error('Failed to update findings:', error)
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
  const assessment = await assessmentStore.fetchAssessment(route.params.id)
  evidence.value = await assessmentStore.fetchEvidence(route.params.id)

  if (assessment) {
    findingsForm.value = {
      notes: assessment.notes || '',
      findings: assessment.findings || '',
      recommendations: assessment.recommendations || '',
      requires_followup: assessment.requires_followup || false,
      followup_date: assessment.followup_date || '',
    }
  }

  // Try to fetch comparison
  try {
    comparison.value = await assessmentStore.compareAssessments(route.params.id)
  } catch {
    // No previous assessment to compare
    console.log('No previous assessment for comparison')
  }
})
</script>

<style scoped>
/* Reuse all the existing styles from your original file */
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

/* Score Banner */
.score-banner {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  margin-bottom: 32px;
  overflow: hidden;
  position: relative;
  padding: 32px !important;
}

.banner-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.score-hero {
  display: flex;
  align-items: center;
  gap: 32px;
}

.score-ring-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
}

.score-ring {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 4px solid #e2e8f0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 2;
}

.excellent .score-ring {
  border-color: #10b981;
}
.good .score-ring {
  border-color: #3b82f6;
}
.fair .score-ring {
  border-color: #f59e0b;
}
.poor .score-ring {
  border-color: #ef4444;
}

.glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150%;
  height: 150%;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.15;
  z-index: 1;
}

.excellent .glow {
  background: #10b981;
}
.good .glow {
  background: #3b82f6;
}
.fair .glow {
  background: #f59e0b;
}
.poor .glow {
  background: #ef4444;
}

.score-number {
  font-size: 48px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
}

.score-label {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.score-text h2 {
  font-size: 28px;
  font-weight: 800;
  color: #1e293b;
  margin: 12px 0 4px;
}

.rating-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.rating-badge.excellent {
  background: #dcfce7;
  color: #15803d;
}
.rating-badge.good {
  background: #dbeafe;
  color: #1d4ed8;
}
.rating-badge.fair {
  background: #fef3c7;
  color: #b45309;
}
.rating-badge.poor {
  background: #fee2e2;
  color: #b91c1c;
}

.assessor-info {
  color: #64748b;
  font-size: 14px;
}

/* Comparison Mini */
.comparison-mini {
  padding: 20px !important;
  width: 180px;
  text-align: center;
  transition: all 0.2s;
}

.comparison-mini.clickable:hover {
  transform: translateY(-4px);
  border-color: #3b82f6;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.mini-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 800;
  color: #94a3b8;
  margin-bottom: 8px;
}

.mini-value {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 4px;
}

.mini-value.improving {
  color: #10b981;
}
.mini-value.declining {
  color: #ef4444;
}

.percentage {
  font-size: 14px;
  font-weight: 600;
  opacity: 0.8;
}

.mini-footer {
  font-size: 11px;
  font-weight: 600;
  color: #94a3b8;
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

/* Category Grid */
.score-card-mini {
  background: white;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.mini-score-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.mini-cat-label {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
}
.mini-cat-value {
  font-size: 13px;
  font-weight: 800;
  color: #1e293b;
}

.mini-progress {
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.mini-progress-fill.excellent {
  background: #10b981;
}
.mini-progress-fill.good {
  background: #3b82f6;
}
.mini-progress-fill.fair {
  background: #f59e0b;
}
.mini-progress-fill.poor {
  background: #ef4444;
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

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.btn-text {
  background: none;
  border: none;
  color: #3b82f6;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
}

.btn-text:hover {
  text-decoration: underline;
}

.findings-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content-group label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.content-group p {
  color: #4b5563;
  line-height: 1.6;
}

.followup-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.info-row .label {
  font-size: 14px;
  color: #6b7280;
}

.info-row .value {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.info-row .value.highlight {
  color: #ef4444;
}

.status-pill {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-pill.completed {
  background: #d1fae5;
  color: #065f46;
}

.status-pill.pending {
  background: #fef3c7;
  color: #92400e;
}

.approval-info {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
}

.approval-info label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  margin-bottom: 4px;
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

.upload-modal,
.edit-findings-modal {
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

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-hint {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.form-row {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
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

@media (max-width: 768px) {
  .scores-grid,
  .details-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
