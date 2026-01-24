<template>
  <div>
    <NavBar />
    <div class="create-assessment-page">
      <div class="container">
        <div class="page-header">
          <div>
            <router-link to="/assessments" class="back-link">
              <ArrowLeft class="icon" />
              Back to Assessments
            </router-link>
            <h1>Create New Assessment</h1>
            <p class="text-muted">Start a new vendor security assessment</p>
          </div>
        </div>

        <div class="create-form card">
          <form @submit.prevent="handleSubmit">
            <div class="form-section">
              <h3>Assessment Details</h3>

              <div class="form-group">
                <label for="vendor" class="form-label">Vendor *</label>
                <select
                  id="vendor"
                  v-model="formData.vendor"
                  class="form-input"
                  :class="{ error: errors.vendor }"
                  required
                >
                  <option value="">Select vendor</option>
                  <option v-for="vendor in vendors" :key="vendor.id" :value="vendor.id">
                    {{ vendor.name }}
                  </option>
                </select>
                <span v-if="errors.vendor" class="form-error">{{ errors.vendor }}</span>
              </div>

              <div class="form-group">
                <label for="assessment_type" class="form-label">Assessment Type *</label>
                <select
                  id="assessment_type"
                  v-model="formData.assessment_type"
                  class="form-input"
                  required
                >
                  <option value="">Select type</option>
                  <option value="initial">Initial Assessment</option>
                  <option value="annual">Annual Review</option>
                  <option value="triggered">Triggered Assessment</option>
                  <option value="incident_followup">Incident Follow-up</option>
                </select>
              </div>

              <div class="form-group">
                <label for="status" class="form-label">Status</label>
                <select id="status" v-model="formData.status" class="form-input">
                  <option value="draft">Draft</option>
                  <option value="in_progress">In Progress</option>
                </select>
              </div>

              <div class="form-group">
                <label for="notes" class="form-label">Notes</label>
                <textarea
                  id="notes"
                  v-model="formData.notes"
                  class="form-input"
                  rows="3"
                  placeholder="Add any initial notes..."
                ></textarea>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="handleCancel" class="btn btn-secondary">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="assessmentStore.loading">
                <span v-if="assessmentStore.loading" class="spinner"></span>
                {{ assessmentStore.loading ? 'Creating...' : 'Create Assessment' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAssessmentStore } from '../stores/assessment'
import { useVendorStore } from '../stores/vendor'
import NavBar from '../components/common/NavBar.vue'
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const assessmentStore = useAssessmentStore()
const vendorStore = useVendorStore()

const vendors = ref([])
const formData = ref({
  vendor: '',
  assessment_type: '',
  status: 'draft',
  notes: '',
  // Initialize all category scores to 0
  access_control_score: 0,
  data_protection_score: 0,
  network_security_score: 0,
  incident_response_score: 0,
  vulnerability_management_score: 0,
  business_continuity_score: 0,
  security_governance_score: 0,
  responses: {},
  findings: '',
  recommendations: '',
  requires_followup: false,
})

const errors = ref({})

const validateForm = () => {
  errors.value = {}
  let isValid = true

  if (!formData.value.vendor) {
    errors.value.vendor = 'Please select a vendor'
    isValid = false
  }

  if (!formData.value.assessment_type) {
    errors.value.assessment_type = 'Please select an assessment type'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    const assessment = await assessmentStore.createAssessment(formData.value)
    // Navigate to questionnaire if status is in_progress, otherwise to detail
    if (formData.value.status === 'in_progress') {
      router.push(`/assessments/${assessment.id}/questionnaire`)
    } else {
      router.push(`/assessments/${assessment.id}`)
    }
  } catch (error) {
    console.error('Failed to create assessment:', error)
  }
}

const handleCancel = () => {
  router.push('/assessments')
}

onMounted(async () => {
  // Fetch active vendors
  await vendorStore.fetchVendors({ is_active: true })
  vendors.value = vendorStore.vendors.filter((v) => v.is_active)
})
</script>

<style scoped>
.create-assessment-page {
  min-height: calc(100vh - 72px);
  padding: 40px 0;
  background: #f5f7fa;
}

.page-header {
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

.page-header h1 {
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.create-form {
  max-width: 800px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 32px;
}

.form-section h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}
</style>
