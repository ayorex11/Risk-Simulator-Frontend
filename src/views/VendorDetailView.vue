<template>
  <div>
    <NavBar />
    <div class="vendor-detail-page">
      <div class="container">
        <!-- Loading State -->
        <div v-if="vendorStore.loading" class="loading-container">
          <LoadingSpinner />
        </div>

        <!-- Error State -->
        <div v-else-if="!currentVendor" class="error-state card">
          <AlertCircle class="error-icon" />
          <h2>Vendor Not Found</h2>
          <p>The vendor you're looking for doesn't exist or has been removed.</p>
          <router-link to="/vendors" class="btn btn-primary"> Back to Vendors </router-link>
        </div>

        <!-- Vendor Details -->
        <div v-else>
          <div class="page-header">
            <div>
              <router-link to="/vendors" class="back-link">
                <ArrowLeft class="icon" />
                Back to Vendors
              </router-link>
              <div class="header-title">
                <h1>{{ currentVendor.name }}</h1>
                <span class="status-badge" :class="{ active: currentVendor.is_active }">
                  {{ currentVendor.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <p class="text-muted">{{ currentVendor.industry }} • {{ currentVendor.country }}</p>
            </div>
            <div class="header-actions">
              <button
                @click="recalculateRisk"
                class="btn btn-outline"
                :disabled="vendorStore.loading"
              >
                <RefreshCw class="icon" />
                Recalculate Risk
              </button>
              <button @click="showEditModal = true" class="btn btn-primary">
                <Edit class="icon" />
                Edit Vendor
              </button>
            </div>
          </div>

          <!-- Risk Score Overview -->
          <div class="risk-overview card">
            <div class="risk-score-display">
              <div class="risk-circle" :class="getRiskClass(currentVendor.overall_risk_score)">
                <span class="risk-number">{{ currentVendor.overall_risk_score || 0 }}</span>
                <span class="risk-label">Risk Score</span>
              </div>
              <div class="risk-info">
                <h2>Overall Risk Assessment</h2>
                <p class="risk-level" :class="getRiskClass(currentVendor.overall_risk_score)">
                  {{ getRiskLevelText(currentVendor.overall_risk_score) }}
                </p>
                <p class="text-muted">Last updated: {{ formatDate(currentVendor.updated_at) }}</p>
              </div>
            </div>
          </div>

          <!-- Details Grid -->
          <div class="details-grid">
            <!-- Basic Information -->
            <div class="detail-card card">
              <h3>
                <Building class="section-icon" />
                Basic Information
              </h3>
              <div class="detail-rows">
                <div class="detail-row">
                  <span class="detail-label">Website</span>
                  <a
                    v-if="currentVendor.website"
                    :href="currentVendor.website"
                    target="_blank"
                    class="detail-value link"
                  >
                    {{ currentVendor.website }}
                  </a>
                  <span v-else class="detail-value text-muted">Not provided</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Services Provided</span>
                  <span class="detail-value">{{ currentVendor.services_provided }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Notes</span>
                  <span class="detail-value">{{ currentVendor.notes || 'No notes' }}</span>
                </div>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="detail-card card">
              <h3>
                <User class="section-icon" />
                Contact Information
              </h3>
              <div class="detail-rows">
                <div class="detail-row">
                  <span class="detail-label">Contact Name</span>
                  <span class="detail-value">{{ currentVendor.contact_name }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Email</span>
                  <a :href="`mailto:${currentVendor.contact_email}`" class="detail-value link">
                    {{ currentVendor.contact_email }}
                  </a>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Phone</span>
                  <span class="detail-value">{{
                    currentVendor.contact_phone || 'Not provided'
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Contract Information -->
            <div class="detail-card card">
              <h3>
                <FileText class="section-icon" />
                Contract Information
              </h3>
              <div class="detail-rows">
                <div class="detail-row">
                  <span class="detail-label">Contract Start</span>
                  <span class="detail-value">{{
                    formatDate(currentVendor.contract_start_date)
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Contract End</span>
                  <span class="detail-value">{{
                    formatDate(currentVendor.contract_end_date)
                  }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Contract Value</span>
                  <span class="detail-value"
                    >${{ formatNumber(currentVendor.contract_value) }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Risk Factors -->
            <div class="detail-card card full-width">
              <h3>
                <Shield class="section-icon" />
                Risk Assessment Factors
              </h3>
              <div class="risk-factors">
                <div class="risk-factor">
                  <div class="factor-header">
                    <span class="factor-label">Security Posture</span>
                    <span class="factor-value">{{ currentVendor.security_posture_score }}/100</span>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: `${currentVendor.security_posture_score}%` }"
                    ></div>
                  </div>
                </div>

                <div class="risk-factor">
                  <div class="factor-header">
                    <span class="factor-label">Data Sensitivity Level</span>
                    <span class="factor-value">{{ currentVendor.data_sensitivity_level }}/5</span>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: `${(currentVendor.data_sensitivity_level / 5) * 100}%` }"
                    ></div>
                  </div>
                </div>

                <div class="risk-factor">
                  <div class="factor-header">
                    <span class="factor-label">Service Criticality</span>
                    <span class="factor-value"
                      >{{ currentVendor.service_criticality_level }}/5</span
                    >
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: `${(currentVendor.service_criticality_level / 5) * 100}%` }"
                    ></div>
                  </div>
                </div>

                <div class="risk-factor">
                  <div class="factor-header">
                    <span class="factor-label">Incident History</span>
                    <span class="factor-value">{{ currentVendor.incident_history_score }}/100</span>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: `${currentVendor.incident_history_score}%` }"
                    ></div>
                  </div>
                </div>

                <div class="risk-factor">
                  <div class="factor-header">
                    <span class="factor-label">Compliance Score</span>
                    <span class="factor-value">{{ currentVendor.compliance_score }}/50</span>
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill"
                      :style="{ width: `${(currentVendor.compliance_score / 50) * 100}%` }"
                    ></div>
                  </div>
                </div>

                <div class="risk-factor">
                  <div class="factor-header">
                    <span class="factor-label">Third-Party Dependencies Risk</span>
                    <span class="factor-value"
                      >{{ currentVendor.third_party_dependencies_score }}/50</span
                    >
                  </div>
                  <div class="progress-bar">
                    <div
                      class="progress-fill danger"
                      :style="{
                        width: `${(currentVendor.third_party_dependencies_score / 50) * 100}%`,
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Danger Zone -->
          <div class="danger-zone card">
            <h3>Danger Zone</h3>
            <p>Once you delete a vendor, there is no going back. Please be certain.</p>
            <button @click="deleteVendorConfirm" class="btn btn-danger">
              <Trash2 class="icon" />
              Delete Vendor
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Modal -->
    <VendorModal
      v-if="showEditModal"
      :vendor="currentVendor"
      :is-edit="true"
      @close="showEditModal = false"
      @save="handleVendorUpdated"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="delete-modal">
        <h2>Delete Vendor</h2>
        <p>
          Are you sure you want to delete <strong>{{ currentVendor?.name }}</strong
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
import { useRoute, useRouter } from 'vue-router'
import { useVendorStore } from '../stores/vendor'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import VendorModal from '../components/vendors/VendorModal.vue'
import {
  ArrowLeft,
  Edit,
  RefreshCw,
  Building,
  User,
  FileText,
  Shield,
  Trash2,
  AlertCircle,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const vendorStore = useVendorStore()

const showEditModal = ref(false)
const showDeleteModal = ref(false)

const currentVendor = computed(() => vendorStore.currentVendor)

const getRiskClass = (score) => {
  if (score >= 76) return 'critical'
  if (score >= 51) return 'high'
  if (score >= 26) return 'medium'
  return 'low'
}

const getRiskLevelText = (score) => {
  if (score >= 76) return 'Critical Risk'
  if (score >= 51) return 'High Risk'
  if (score >= 26) return 'Medium Risk'
  return 'Low Risk'
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatNumber = (num) => {
  if (!num) return '0'
  return new Intl.NumberFormat('en-US').format(num)
}

const recalculateRisk = async () => {
  await vendorStore.recalculateRisk(route.params.id)
  await vendorStore.fetchVendor(route.params.id)
}

const handleVendorUpdated = async () => {
  showEditModal.value = false
  await vendorStore.fetchVendor(route.params.id)
}

const deleteVendorConfirm = () => {
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  await vendorStore.deleteVendor(route.params.id)
  showDeleteModal.value = false
  router.push('/vendors')
}

onMounted(() => {
  vendorStore.fetchVendor(route.params.id)
})
</script>

<style scoped>
.vendor-detail-page {
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

.error-state p {
  color: #6b7280;
  margin-bottom: 24px;
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
  background: #f3f4f6;
  color: #6b7280;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Risk Overview */
.risk-overview {
  margin-bottom: 32px;
}

.risk-score-display {
  display: flex;
  align-items: center;
  gap: 32px;
}

.risk-circle {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 8px solid;
}

.risk-circle.critical {
  background: #fee2e2;
  border-color: #dc2626;
}

.risk-circle.high {
  background: #fef3c7;
  border-color: #f59e0b;
}

.risk-circle.medium {
  background: #fef9c3;
  border-color: #eab308;
}

.risk-circle.low {
  background: #d1fae5;
  border-color: #10b981;
}

.risk-number {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
}

.risk-label {
  font-size: 14px;
  font-weight: 600;
  margin-top: 8px;
}

.risk-info h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.risk-level {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
}

.risk-level.critical {
  color: #dc2626;
}

.risk-level.high {
  color: #f59e0b;
}

.risk-level.medium {
  color: #eab308;
}

.risk-level.low {
  color: #10b981;
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
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 20px;
}

.section-icon {
  width: 24px;
  height: 24px;
  color: #3b82f6;
}

.detail-rows {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
}

.detail-value {
  font-size: 16px;
  color: #1f2937;
}

.full-width {
  grid-column: 1 / -1;
}

/* Risk Factors */
.risk-factors {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.risk-factor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.factor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.factor-label {
  font-size: 14px;
  font-weight: 600;
  color: #4b5563;
}

.factor-value {
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

.progress-fill.danger {
  background: #ef4444;
}

/* Danger Zone */
.danger-zone {
  border: 2px solid #fee2e2;
  background: #fef2f2;
}

.danger-zone h3 {
  font-size: 18px;
  font-weight: 700;
  color: #dc2626;
  margin-bottom: 8px;
}

.danger-zone p {
  color: #6b7280;
  margin-bottom: 16px;
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

@media (max-width: 1024px) {
  .details-grid,
  .risk-factors {
    grid-template-columns: 1fr;
  }

  .risk-score-display {
    flex-direction: column;
    text-align: center;
  }
}
</style>
