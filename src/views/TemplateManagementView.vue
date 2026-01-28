<template>
  <div>
    <NavBar />
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-text">
            <div class="header-badge">
              <Layout class="badge-icon" />
              <span>Framework Library</span>
            </div>
            <h1 class="page-title">Assessment Templates</h1>
            <p class="page-subtitle">Standardized blueprints for vendor security audits.</p>
          </div>
          <div class="header-actions">
            <button @click="openCreateModal" class="btn btn-primary">
              <Plus class="icon-sm" />
              <span>Blueprint Entry</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Templates Grid -->
      <div v-if="assessmentStore.loading" class="loading-container">
        <LoadingSpinner />
      </div>

      <div v-else class="templates-grid">
        <div v-if="assessmentStore.templates.length === 0" class="empty-state">
          <div class="empty-illustration">
            <Layout class="illustration-icon" />
          </div>
          <h2 class="empty-title">Library Vacant</h2>
          <p class="empty-description">
            Initialize your security protocols by adding your first assessment framework.
          </p>
        </div>

        <div
          v-else
          class="template-card"
          v-for="template in assessmentStore.templates"
          :key="template.id"
        >
          <div class="card-edge" :class="{ default: template.is_default }"></div>

          <div class="card-header">
            <span class="framework-badge">{{ template.framework_display }}</span>
            <span v-if="template.is_default" class="default-pill">Active Default</span>
          </div>

          <div class="card-body">
            <h3 class="template-name">{{ template.name }}</h3>
            <p class="template-desc">{{ template.description }}</p>

            <div class="template-stats">
              <div class="stat-item">
                <HelpCircle class="stat-icon" />
                <span>{{ template.question_count }} Checkpoints</span>
              </div>
              <div class="stat-item">
                <Calendar class="stat-icon" />
                <span>Revision: {{ formatDate(template.updated_at) }}</span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <router-link
              :to="`/assessments/templates/${template.id}`"
              class="btn btn-secondary btn-full"
            >
              Configure Protocol
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal card">
        <div class="modal-header">
          <h2>Create New Template</h2>
          <button @click="closeModal" class="close-btn"><X /></button>
        </div>
        <form @submit.prevent="handleSave" class="modal-body">
          <div class="form-group">
            <label class="form-label">Template Name *</label>
            <input
              v-model="form.name"
              type="text"
              class="form-input"
              placeholder="e.g., NIST CSF v2.0"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Description *</label>
            <textarea v-model="form.description" class="form-input" rows="3" required></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Framework</label>
            <select v-model="form.framework" class="form-input">
              <option value="nist">NIST CSF</option>
              <option value="iso27001">ISO 27001</option>
              <option value="soc2">SOC 2</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div class="form-group checkbox">
            <label>
              <input type="checkbox" v-model="form.is_default" />
              Set as Default Template
            </label>
          </div>

          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              {{ submitting ? 'Creating...' : 'Create Template' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAssessmentStore } from '../stores/assessment'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import { Plus, Layout, Calendar, HelpCircle, X } from 'lucide-vue-next'

const assessmentStore = useAssessmentStore()
const showModal = ref(false)
const submitting = ref(false)

const form = ref({
  name: '',
  description: '',
  framework: 'custom',
  is_default: false,
})

const openCreateModal = () => {
  form.value = {
    name: '',
    description: '',
    framework: 'custom',
    is_default: false,
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const handleSave = async () => {
  submitting.value = true
  try {
    await assessmentStore.createTemplate(form.value)
    closeModal()
    await assessmentStore.fetchTemplates()
  } catch (error) {
    console.error('Failed to create template:', error)
  } finally {
    submitting.value = false
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
  assessmentStore.fetchTemplates()
})
</script>

<style scoped>
/* Base Layout */
.templates-page {
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
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
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

/* Templates Grid */
.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 28px;
  margin-bottom: 48px;
  animation: fadeIn 0.6s ease-out 0.2s both;
}

.template-card {
  position: relative;
  background: white;
  border-radius: 24px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.template-card:hover {
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
  background: #e2e8f0;
  transition: all 0.3s;
}

.card-edge.default {
  background: #10b981;
}
.template-card:hover .card-edge {
  width: 7px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px 20px;
}

.framework-badge {
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  background: #f1f5f9;
  padding: 4px 12px;
  border-radius: 10px;
  text-transform: uppercase;
}

.default-pill {
  font-size: 11px;
  font-weight: 900;
  color: #059669;
  background: #ecfdf5;
  padding: 4px 12px;
  border-radius: 10px;
  text-transform: uppercase;
}

.card-body {
  padding: 0 28px 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.template-name {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}
.template-desc {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  line-height: 1.6;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 66px;
}

.template-stats {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 16px;
  border-top: 2px solid #f1f5f9;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 700;
  color: #475569;
}
.stat-icon {
  width: 16px;
  height: 16px;
  color: #94a3b8;
}

.card-footer {
  padding: 18px 28px;
  background: #f8fafc;
  border-top: 2px solid #f1f5f9;
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 100px 40px;
  background: white;
  border-radius: 32px;
  border: 2px solid #e2e8f0;
}

.empty-illustration {
  width: 140px;
  height: 140px;
  margin: 0 auto 40px;
  background: #f8fafc;
  border-radius: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.illustration-icon {
  width: 72px;
  height: 72px;
  color: #cbd5e1;
}

.empty-title {
  font-size: 36px;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 16px;
}
.empty-description {
  font-size: 16px;
  color: #64748b;
  max-width: 480px;
  margin: 0 auto;
  line-height: 1.6;
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
  max-width: 500px;
  width: 90%;
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

@media (max-width: 900px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }
  .templates-grid {
    grid-template-columns: 1fr;
  }
}
</style>
