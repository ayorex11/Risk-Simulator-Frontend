<template>
  <div>
    <NavBar />
    <div class="container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-zone py-20">
        <LoadingSpinner />
      </div>

      <div v-else-if="template">
        <!-- Page Header -->
        <header class="page-header">
          <div class="header-content">
            <div class="header-text">
              <router-link to="/assessments/templates" class="back-link">
                <ChevronLeft class="icon-xs" />
                <span>Return to Registry</span>
              </router-link>
              <div class="header-badge mt-4">
                <Shield class="badge-icon" />
                <span>Protocol Protocol v{{ template.revision || '1.0' }}</span>
              </div>
              <h1 class="page-title">{{ template.name }}</h1>
              <p class="page-subtitle">{{ template.description }}</p>
            </div>
            <div class="header-actions">
              <button @click="openAddQuestionsModal" class="btn btn-primary">
                <Plus class="icon-sm" />
                <span>Inject Checkpoints</span>
              </button>
            </div>
          </div>

          <!-- Template Stats -->
          <div class="toolbar card glass mt-8">
            <div class="toolbar-grid">
              <div class="tool-group">
                <HelpCircle class="tool-icon" />
                <span class="tool-label"
                  >{{ template.template_questions?.length || 0 }} Total Checkpoints</span
                >
              </div>
              <div class="tool-divider"></div>
              <div class="tool-group">
                <Activity class="tool-icon" />
                <span class="tool-label">Active Surveillance</span>
              </div>
            </div>
          </div>
        </header>

        <!-- Questions Inventory -->
        <section class="inventory-section">
          <div
            v-if="!template.template_questions || template.template_questions.length === 0"
            class="empty-mini card glass p-20"
          >
            <HelpCircle class="empty-icon-lg" />
            <p>Scanning complete. System protocol empty.</p>
            <button @click="openAddQuestionsModal" class="btn btn-outline mt-4">
              Initialize Grid
            </button>
          </div>

          <div v-else class="inventory-grid">
            <div v-for="tq in template.template_questions" :key="tq.id" class="inventory-item card">
              <div class="item-id">#{{ tq.order }}</div>
              <div class="item-main">
                <div class="item-header">
                  <span class="badge" :class="tq.question.category">{{
                    tq.question.category_display
                  }}</span>
                  <span v-if="tq.is_required" class="badge mandatory">Mandatory</span>
                </div>
                <h3 class="item-title">{{ tq.question.question_text }}</h3>
                <p v-if="tq.custom_guidance" class="item-guidance">{{ tq.custom_guidance }}</p>
              </div>
              <div class="item-actions">
                <button
                  @click="removeQuestion(tq.id)"
                  class="btn-action danger"
                  title="Remove Logic"
                >
                  <Trash2 class="icon-xs" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Add Questions Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
      <div class="modal card">
        <div class="modal-header">
          <h2>Add Questions to Template</h2>
          <button @click="closeAddModal" class="close-btn"><X /></button>
        </div>
        <div class="modal-body">
          <div class="modal-filters">
            <div class="search-input-wrapper">
              <Search class="search-icon" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search questions..."
                class="form-input"
              />
            </div>
            <select v-model="filterCategory" class="form-input category-select">
              <option value="">All Categories</option>
              <option v-for="cat in categories" :key="cat.value" :value="cat.value">
                {{ cat.label }}
              </option>
            </select>
          </div>

          <div class="questions-selector">
            <div
              v-for="question in availableQuestions"
              :key="question.id"
              class="selectable-question"
              :class="{ selected: selectedQuestionIds.includes(question.id) }"
              @click="toggleQuestionSelection(question.id)"
            >
              <div class="selection-indicator">
                <Check v-if="selectedQuestionIds.includes(question.id)" class="icon-check" />
                <div v-else class="selection-circle"></div>
              </div>
              <div class="question-info">
                <span class="q-text">{{ question.question_text }}</span>
                <span class="badge category-mini">{{ question.category_display }}</span>
              </div>
            </div>
            <div v-if="availableQuestions.length === 0" class="empty-modal-state">
              No questions found.
            </div>
          </div>

          <div class="modal-actions">
            <button @click="closeAddModal" class="btn btn-secondary">Cancel</button>
            <button
              @click="addSelectedQuestions"
              class="btn btn-primary"
              :disabled="selectedQuestionIds.length === 0 || adding"
            >
              {{ adding ? 'Adding...' : `Add ${selectedQuestionIds.length} Questions` }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAssessmentStore } from '../stores/assessment'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import {
  ChevronLeft,
  Plus,
  Trash2,
  Check,
  X,
  Search,
  HelpCircle,
  Shield,
  Activity,
} from 'lucide-vue-next'

const route = useRoute()
const assessmentStore = useAssessmentStore()
const template = ref(null)
const loading = ref(true)
const showAddModal = ref(false)
const adding = ref(false)
const searchQuery = ref('')
const filterCategory = ref('')
const selectedQuestionIds = ref([])

const categories = [
  { value: 'access_control', label: 'Access Control' },
  { value: 'data_protection', label: 'Data Protection' },
  { value: 'network_security', label: 'Network Security' },
  { value: 'incident_response', label: 'Incident Response' },
  { value: 'vulnerability_management', label: 'Vulnerability Management' },
  { value: 'business_continuity', label: 'Business Continuity' },
  { value: 'security_governance', label: 'Security Governance' },
]

const loadTemplate = async () => {
  loading.value = true
  try {
    template.value = await assessmentStore.fetchTemplate(route.params.id)
  } catch (error) {
    console.error('Failed to load template:', error)
  } finally {
    loading.value = false
  }
}

const availableQuestions = computed(() => {
  // Questions not already in the template
  const existingIds = template.value?.template_questions.map((tq) => tq.question.id) || []
  let questions = assessmentStore.questions.filter((q) => !existingIds.includes(q.id))

  if (filterCategory.value) {
    questions = questions.filter((q) => q.category === filterCategory.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    questions = questions.filter((item) => item.question_text.toLowerCase().includes(query))
  }

  return questions
})

const openAddQuestionsModal = async () => {
  searchQuery.value = ''
  filterCategory.value = ''
  selectedQuestionIds.value = []
  showAddModal.value = true
  if (assessmentStore.questions.length === 0) {
    await assessmentStore.fetchQuestions()
  }
}

const closeAddModal = () => {
  showAddModal.value = false
}

const toggleQuestionSelection = (id) => {
  const index = selectedQuestionIds.value.indexOf(id)
  if (index === -1) {
    selectedQuestionIds.value.push(id)
  } else {
    selectedQuestionIds.value.splice(index, 1)
  }
}

const addSelectedQuestions = async () => {
  adding.value = true
  try {
    // In a real app we'd have a bulk update endpoint or individual calls
    // For this demo, let's assume we call a method in the store
    // await assessmentStore.addQuestionsToTemplate(template.value.id, selectedQuestionIds.value)
    console.log('Adding questions:', selectedQuestionIds.value)

    // Refresh
    await loadTemplate()
    closeAddModal()
  } catch (error) {
    console.error('Failed to add questions:', error)
  } finally {
    adding.value = false
  }
}

const removeQuestion = async (tqId) => {
  if (!confirm('Are you sure you want to remove this question from the template?')) return

  try {
    // await assessmentStore.removeQuestionFromTemplate(tqId)
    console.log('Removing template question:', tqId)
    await loadTemplate()
  } catch (error) {
    console.error('Failed to remove question:', error)
  }
}

onMounted(() => {
  loadTemplate()
})
</script>

<style scoped>
/* Base Layout */
.template-detail-page {
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
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
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
  margin: 12px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #64748b;
  font-weight: 500;
  line-height: 1.6;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-decoration: none;
  transition: 0.2s;
}
.back-link:hover {
  color: #3b82f6;
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
  gap: 24px;
}
.tool-group {
  display: flex;
  align-items: center;
  gap: 10px;
}
.tool-icon {
  width: 16px;
  height: 16px;
  color: #94a3b8;
}
.tool-label {
  font-size: 13px;
  font-weight: 800;
  color: #475569;
}
.tool-divider {
  width: 2px;
  height: 20px;
  background: #e2e8f0;
}

/* Inventory Section */
.inventory-section {
  margin-top: 48px;
  animation: fadeIn 0.6s ease-out 0.2s both;
}

.inventory-grid {
  display: grid;
  gap: 16px;
}

.inventory-item {
  background: white;
  border-radius: 20px;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: stretch;
  transition: all 0.2s;
}
.inventory-item:hover {
  transform: translateX(4px);
  border-color: #cbd5e1;
}

.item-id {
  width: 60px;
  background: #f8fafc;
  border-right: 2px solid #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 900;
  color: #94a3b8;
}

.item-main {
  flex: 1;
  padding: 20px 24px;
}

.item-header {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.badge {
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 6px;
}
.badge.access_control {
  background: #eff6ff;
  color: #3b82f6;
}
.badge.mandatory {
  background: #fee2e2;
  color: #ef4444;
}

.item-title {
  font-size: 16px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.5;
  margin-bottom: 8px;
}
.item-guidance {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  margin: 0;
}

.item-actions {
  display: flex;
  align-items: center;
  padding: 0 24px;
  border-left: 2px solid #f1f5f9;
}

.btn-action {
  background: #f8fafc;
  border: none;
  padding: 8px;
  border-radius: 10px;
  cursor: pointer;
  color: #94a3b8;
  transition: 0.2s;
}
.btn-action.danger:hover {
  background: #fef2f2;
  color: #ef4444;
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
  max-width: 800px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.modal-header {
  padding: 32px 40px;
  border-bottom: 2px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.modal-header h2 {
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
}
.modal-body {
  padding: 32px 40px;
  overflow-y: auto;
}

.modal-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}
.search-input-wrapper {
  position: relative;
  flex: 1;
}
.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: #94a3b8;
}
.form-input {
  width: 100%;
  padding: 12px 18px 12px 42px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  font-size: 14px;
  font-weight: 600;
}

.questions-selector {
  border: 2px solid #f1f5f9;
  border-radius: 20px;
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 32px;
}
.selectable-question {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 2px solid #f1f5f9;
  cursor: pointer;
  transition: 0.2s;
}
.selectable-question:hover {
  background: #f8fafc;
}
.selectable-question.selected {
  background: #eff6ff;
  border-color: #dbeafe;
}

.selection-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}
.selected .selection-circle {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
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

.mt-4 {
  margin-top: 16px;
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
  margin-bottom: 24px;
}
.loading-zone {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 100px 0;
}
</style>
