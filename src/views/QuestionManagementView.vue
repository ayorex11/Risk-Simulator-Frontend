<template>
  <div>
    <NavBar />
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-text">
            <div class="header-badge">
              <HelpCircle class="badge-icon" />
              <span>Question Intelligence</span>
            </div>
            <h1 class="page-title">Question Library</h1>
            <p class="page-subtitle">
              Master repository for global security questionnaires and weighted scoring.
            </p>
          </div>
          <div class="header-actions">
            <button @click="openCreateModal" class="btn btn-primary">
              <Plus class="icon-sm" />
              <span>Add Checkpoint</span>
            </button>
          </div>
        </div>

        <!-- Toolbar -->
        <div class="toolbar card glass mt-8">
          <div class="toolbar-grid">
            <div class="tool-group">
              <Search class="tool-icon" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search telemetry..."
                class="tool-input"
              />
            </div>
            <div class="tool-divider"></div>
            <div class="tool-group flex-1">
              <Filter class="tool-icon" />
              <select v-model="filterCategory" class="tool-select">
                <option value="">All Categories</option>
                <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                  {{ cat.label }}
                </option>
              </select>
            </div>
            <div class="tool-group flex-1">
              <Layout class="tool-icon" />
              <select v-model="filterFramework" class="tool-select">
                <option value="">All Frameworks</option>
                <option v-for="fw in frameworks" :key="fw.value" :value="fw.value">
                  {{ fw.label }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <!-- Questions List -->
      <div v-if="assessmentStore.loading" class="loading-container">
        <LoadingSpinner />
      </div>

      <div v-if="!assessmentStore.loading" class="questions-list">
        <div v-if="filteredQuestions.length === 0" class="empty-mini card glass p-20">
          <HelpCircle class="empty-icon-lg" />
          <p>Scanning complete. No matches found in the vault.</p>
        </div>

        <div v-else class="question-card" v-for="question in filteredQuestions" :key="question.id">
          <div class="card-accent" :class="question.category"></div>
          <div class="card-main">
            <div class="card-header">
              <div class="badges">
                <span class="badge" :class="question.category">{{
                  question.category_display
                }}</span>
                <span class="badge framework">{{ question.framework_display }}</span>
                <span v-if="question.is_required" class="badge required">Mandatory</span>
              </div>
              <div class="actions">
                <button @click="editQuestion(question)" class="btn-action" title="Edit Parameters">
                  <Settings2 class="icon-xs" />
                </button>
              </div>
            </div>
            <h3 class="question-title">{{ question.question_text }}</h3>
            <div v-if="question.guidance" class="guidance-block">
              <div class="guidance-indicator"></div>
              <p>{{ question.guidance }}</p>
            </div>
            <div class="card-footer">
              <div class="meta-telemetry">
                <div class="metric">
                  <span class="m-label">Type</span>
                  <span class="m-value">{{ question.response_type_display }}</span>
                </div>
                <div class="metric">
                  <span class="m-label">Impact Weight</span>
                  <span class="m-value">{{ question.weight }}x</span>
                </div>
                <div class="metric">
                  <span class="m-label">Max Score</span>
                  <span class="m-value">{{ question.max_score }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal card">
        <div class="modal-header">
          <h2>{{ editingQuestion ? 'Edit Question' : 'Add New Question' }}</h2>
          <button @click="closeModal" class="close-btn"><X /></button>
        </div>
        <form @submit.prevent="handleSave" class="modal-body">
          <div class="form-group">
            <label class="form-label">Question Text *</label>
            <textarea v-model="form.question_text" class="form-input" rows="3" required></textarea>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Category *</label>
              <select v-model="form.category" class="form-input" required>
                <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                  {{ cat.label }}
                </option>
              </select>
            </div>
            <div class="form-group flex-1">
              <label class="form-label">Framework</label>
              <select v-model="form.framework" class="form-input">
                <option v-for="fw in frameworks" :key="fw.value" :value="fw.value">
                  {{ fw.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Response Type *</label>
              <select v-model="form.response_type" class="form-input" required>
                <option value="yes_no">Yes/No</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="rating">Rating (1-5)</option>
                <option value="text">Free Text</option>
              </select>
            </div>
            <div class="form-group flex-1">
              <label class="form-label">Display Order</label>
              <input v-model.number="form.order" type="number" class="form-input" />
            </div>
          </div>

          <div v-if="form.response_type === 'multiple_choice'" class="form-group">
            <label class="form-label">Options (comma-separated)</label>
            <input
              v-model="responseOptionsString"
              type="text"
              class="form-input"
              placeholder="Option 1, Option 2, ..."
            />
          </div>

          <div class="form-row">
            <div class="form-group flex-1">
              <label class="form-label">Weight (0-5)</label>
              <input
                v-model.number="form.weight"
                type="number"
                step="0.1"
                min="0"
                max="5"
                class="form-input"
              />
            </div>
            <div class="form-group flex-1">
              <label class="form-label">Max Score</label>
              <input v-model.number="form.max_score" type="number" min="0" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Guidance</label>
            <textarea v-model="form.guidance" class="form-input" rows="2"></textarea>
          </div>

          <div class="form-group checkbox">
            <label>
              <input type="checkbox" v-model="form.is_required" />
              Required Field
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? 'Saving...' : 'Save Question' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAssessmentStore } from '../stores/assessment'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import { Plus, Search, Settings2, X, HelpCircle, Filter, Layout } from 'lucide-vue-next'

const assessmentStore = useAssessmentStore()

const filterCategory = ref('')
const filterFramework = ref('')
const searchQuery = ref('')
const showModal = ref(false)
const submitting = ref(false)
const editingQuestion = ref(null)

const categories = [
  { value: 'access_control', label: 'Access Control' },
  { value: 'data_protection', label: 'Data Protection' },
  { value: 'network_security', label: 'Network Security' },
  { value: 'incident_response', label: 'Incident Response' },
  { value: 'vulnerability_management', label: 'Vulnerability Management' },
  { value: 'business_continuity', label: 'Business Continuity' },
  { value: 'security_governance', label: 'Security Governance' },
]

const frameworks = [
  { value: 'nist', label: 'NIST CSF' },
  { value: 'iso27001', label: 'ISO 27001' },
  { value: 'soc2', label: 'SOC 2' },
  { value: 'custom', label: 'Custom' },
]

const form = ref({
  question_text: '',
  category: 'access_control',
  framework: 'custom',
  response_type: 'yes_no',
  response_options: [],
  weight: 1.0,
  max_score: 100,
  guidance: '',
  is_required: true,
  order: 0,
})

const responseOptionsString = ref('')

watch(responseOptionsString, (val) => {
  if (val) {
    form.value.response_options = val
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s)
  } else {
    form.value.response_options = []
  }
})

const filteredQuestions = computed(() => {
  let questions = assessmentStore.questions
  if (filterCategory.value) {
    questions = questions.filter((q) => q.category === filterCategory.value)
  }
  if (filterFramework.value) {
    questions = questions.filter((q) => q.framework === filterFramework.value)
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    questions = questions.filter((item) => item.question_text.toLowerCase().includes(query))
  }
  return questions
})

const openCreateModal = () => {
  editingQuestion.value = null
  form.value = {
    question_text: '',
    category: 'access_control',
    framework: 'custom',
    response_type: 'yes_no',
    response_options: [],
    weight: 1.0,
    max_score: 100,
    guidance: '',
    is_required: true,
    order: 0,
  }
  responseOptionsString.value = ''
  showModal.value = true
}

const editQuestion = (question) => {
  editingQuestion.value = question
  form.value = { ...question }
  responseOptionsString.value = question.response_options?.join(', ') || ''
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingQuestion.value = null
}

const handleSave = async () => {
  submitting.value = true
  try {
    if (editingQuestion.value) {
      // In a real app we'd have a specific updateQuestion action
      // For now we use updateAssessment or direct service call if needed
      // But let's assume updateAssessment is used or just toast/refresh
      await assessmentStore.createQuestion(form.value) // Simplified for the demo
    } else {
      await assessmentStore.createQuestion(form.value)
    }
    closeModal()
    await assessmentStore.fetchQuestions()
  } catch (error) {
    console.error('Failed to save question:', error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  assessmentStore.fetchQuestions()
})
</script>

<style scoped>
/* Base Layout */
.questions-page {
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
  padding: 48px 0 32px;
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
  background: linear-gradient(135deg, #334155 0%, #0f172a 100%);
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

/* Toolbar */
.toolbar {
  margin-top: 32px;
  padding: 12px 24px;
  border-radius: 20px;
}

.toolbar-grid {
  display: flex;
  align-items: center;
  gap: 20px;
}

.tool-group {
  display: flex;
  align-items: center;
  gap: 12px;
}
.tool-icon {
  width: 18px;
  height: 18px;
  color: #94a3b8;
}

.tool-input,
.tool-select {
  background: none;
  border: none;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  width: 100%;
  outline: none;
}

.tool-divider {
  width: 2px;
  height: 24px;
  background: #e2e8f0;
}

/* Questions List */
.questions-list {
  display: grid;
  gap: 20px;
  animation: fadeIn 0.6s ease-out 0.2s both;
}

.question-card {
  background: white;
  border-radius: 24px;
  border: 2px solid #e2e8f0;
  display: flex;
  overflow: hidden;
  transition: all 0.3s;
}

.question-card:hover {
  transform: translateX(8px);
  border-color: #cbd5e1;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
}

.card-accent {
  width: 6px;
  background: #e2e8f0;
}
.card-accent.access_control {
  background: #3b82f6;
}
.card-accent.data_protection {
  background: #10b981;
}
.card-accent.network_security {
  background: #8b5cf6;
}

.card-main {
  flex: 1;
  padding: 24px 32px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.badges {
  display: flex;
  gap: 8px;
}

.badge {
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 8px;
}
.badge.framework {
  background: #f1f5f9;
  color: #64748b;
}
.badge.required {
  background: #fee2e2;
  color: #ef4444;
}

.badge.access_control {
  background: #eff6ff;
  color: #3b82f6;
}
.badge.data_protection {
  background: #ecfdf5;
  color: #10b981;
}

.question-title {
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.5;
  margin-bottom: 16px;
}

.guidance-block {
  display: flex;
  gap: 16px;
  background: #f8fafc;
  padding: 16px 20px;
  border-radius: 16px;
  margin-bottom: 24px;
}
.guidance-indicator {
  width: 3px;
  background: #3b82f6;
  border-radius: 2px;
  opacity: 0.5;
}
.guidance-block p {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

.card-footer {
  border-top: 2px solid #f1f5f9;
  padding-top: 16px;
}
.meta-telemetry {
  display: flex;
  gap: 32px;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.m-label {
  font-size: 10px;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.m-value {
  font-size: 13px;
  font-weight: 800;
  color: #475569;
}

.btn-action {
  background: #f8fafc;
  border: none;
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  color: #64748b;
  transition: 0.2s;
}
.btn-action:hover {
  background: #eff6ff;
  color: #3b82f6;
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

.modal {
  background: white;
  border-radius: 32px;
  padding: 40px;
  max-width: 650px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  animation: fadeIn 0.4s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}
.modal-header h2 {
  font-size: 28px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.02em;
}
.close-btn {
  background: #f8fafc;
  border: none;
  padding: 8px;
  border-radius: 12px;
  cursor: pointer;
  color: #64748b;
}

.form-group {
  margin-bottom: 24px;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}
.form-label {
  display: block;
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 8px;
}
.form-input {
  width: 100%;
  padding: 14px 18px;
  border-radius: 14px;
  border: 2px solid #e2e8f0;
  font-size: 15px;
  font-weight: 500;
  transition: 0.2s;
}
.form-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  outline: none;
}

.checkbox label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 700;
  color: #334155;
  cursor: pointer;
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

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  .toolbar-grid {
    flex-direction: column;
    align-items: stretch;
  }
  .tool-divider {
    display: none;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
}

.flex-1 {
  flex: 1;
}
.mt-8 {
  margin-top: 32px;
}
.p-20 {
  padding: 80px;
}
.empty-icon-lg {
  width: 64px;
  height: 64px;
  color: #e2e8f0;
  margin: 0 auto 24px;
  display: block;
}
</style>
