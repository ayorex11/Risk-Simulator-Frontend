<template>
  <div>
    <NavBar />
    <div class="vendors-page">
      <div class="container">
        <div class="page-header">
          <div>
            <h1>Vendors</h1>
            <p class="text-muted">Manage and monitor your third-party vendors</p>
          </div>
          <router-link to="/vendors/new" class="btn btn-primary">
            <Plus class="icon" />
            Add Vendor
          </router-link>
        </div>

        <!-- Filters and Search -->
        <div class="filters-section card">
          <div class="search-bar">
            <Search class="search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search vendors..."
              class="search-input"
            />
          </div>
          <div class="filters">
            <select v-model="filterRiskLevel" class="filter-select">
              <option value="">All Risk Levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select v-model="filterIndustry" class="filter-select">
              <option value="">All Industries</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Financial Services">Financial Services</option>
              <option value="Retail">Retail</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Other">Other</option>
            </select>
            <select v-model="filterStatus" class="filter-select">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="vendorStore.loading" class="loading-container">
          <LoadingSpinner />
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredVendors.length === 0" class="empty-state card">
          <Building class="empty-icon" />
          <h2>No Vendors Found</h2>
          <p v-if="searchQuery || filterRiskLevel || filterIndustry || filterStatus">
            Try adjusting your filters or search query
          </p>
          <p v-else>Get started by adding your first vendor</p>
          <router-link to="/vendors/new" class="btn btn-primary">
            <Plus class="icon" />
            Add Your First Vendor
          </router-link>
        </div>

        <!-- Vendors Grid -->
        <div v-else class="vendors-grid">
          <div
            v-for="vendor in filteredVendors"
            :key="vendor.id"
            class="vendor-card"
            @click="navigateToVendor(vendor.id)"
          >
            <div class="vendor-header">
              <div>
                <h3>{{ vendor.name }}</h3>
                <p class="vendor-meta">{{ vendor.industry }} • {{ vendor.country }}</p>
              </div>
              <div class="risk-badge" :class="getRiskClass(vendor.overall_risk_score)">
                {{ vendor.overall_risk_score || 0 }}
              </div>
            </div>

            <div class="vendor-body">
              <p class="vendor-services">{{ vendor.services_provided }}</p>

              <div class="vendor-stats">
                <div class="stat-item">
                  <Calendar class="stat-icon" />
                  <span>{{ formatDate(vendor.contract_end_date) }}</span>
                </div>
                <div class="stat-item">
                  <DollarSign class="stat-icon" />
                  <span>${{ formatNumber(vendor.contract_value) }}</span>
                </div>
              </div>
            </div>

            <div class="vendor-footer">
              <span class="status-badge" :class="{ active: vendor.is_active }">
                {{ vendor.is_active ? 'Active' : 'Inactive' }}
              </span>
              <div class="vendor-actions" @click.stop>
                <button @click="editVendor(vendor)" class="action-btn" title="Edit">
                  <Edit class="action-icon" />
                </button>
                <button
                  @click="deleteVendorConfirm(vendor)"
                  class="action-btn danger"
                  title="Delete"
                >
                  <Trash2 class="action-icon" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary Stats -->
        <div v-if="!vendorStore.loading && filteredVendors.length > 0" class="summary-stats">
          <div class="summary-item">
            <span class="summary-label">Total Vendors:</span>
            <span class="summary-value">{{ filteredVendors.length }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Average Risk Score:</span>
            <span class="summary-value">{{ averageRiskScore }}</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">Total Contract Value:</span>
            <span class="summary-value">${{ totalContractValue }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Vendor Modal -->
    <VendorModal
      v-if="showEditModal"
      :vendor="selectedVendor"
      :is-edit="true"
      @close="closeEditModal"
      @save="handleVendorUpdated"
    />

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="delete-modal">
        <h2>Delete Vendor</h2>
        <p>
          Are you sure you want to delete <strong>{{ vendorToDelete?.name }}</strong
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
import { useVendorStore } from '../stores/vendor'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import VendorModal from '../components/vendors/VendorModal.vue'
import { Plus, Search, Building, Calendar, DollarSign, Edit, Trash2 } from 'lucide-vue-next'

const router = useRouter()
const vendorStore = useVendorStore()

const searchQuery = ref('')
const filterRiskLevel = ref('')
const filterIndustry = ref('')
const filterStatus = ref('')
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedVendor = ref(null)
const vendorToDelete = ref(null)

const filteredVendors = computed(() => {
  let vendors = vendorStore.vendors

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    vendors = vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(query) ||
        v.industry.toLowerCase().includes(query) ||
        v.country.toLowerCase().includes(query),
    )
  }

  // Risk level filter
  if (filterRiskLevel.value) {
    vendors = vendors.filter((v) => v.risk_level === filterRiskLevel.value)
  }

  // Industry filter
  if (filterIndustry.value) {
    vendors = vendors.filter((v) => v.industry === filterIndustry.value)
  }

  // Status filter
  if (filterStatus.value) {
    const isActive = filterStatus.value === 'active'
    vendors = vendors.filter((v) => v.is_active === isActive)
  }

  return vendors
})

const averageRiskScore = computed(() => {
  if (filteredVendors.value.length === 0) return 0
  const total = filteredVendors.value.reduce((sum, v) => sum + (v.overall_risk_score || 0), 0)
  return Math.round(total / filteredVendors.value.length)
})

const totalContractValue = computed(() => {
  const total = filteredVendors.value.reduce(
    (sum, v) => sum + (parseFloat(v.contract_value) || 0),
    0,
  )
  return formatNumber(total)
})

const getRiskClass = (score) => {
  if (score >= 76) return 'critical'
  if (score >= 51) return 'high'
  if (score >= 26) return 'medium'
  return 'low'
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatNumber = (num) => {
  if (!num) return '0'
  return new Intl.NumberFormat('en-US').format(num)
}

const navigateToVendor = (id) => {
  router.push(`/vendors/${id}`)
}

const editVendor = (vendor) => {
  selectedVendor.value = vendor
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedVendor.value = null
}

const handleVendorUpdated = () => {
  closeEditModal()
  vendorStore.fetchVendors()
}

const deleteVendorConfirm = (vendor) => {
  vendorToDelete.value = vendor
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (vendorToDelete.value) {
    await vendorStore.deleteVendor(vendorToDelete.value.id)
    showDeleteModal.value = false
    vendorToDelete.value = null
  }
}

onMounted(() => {
  vendorStore.fetchVendors()
})
</script>

<style scoped>
.vendors-page {
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

/* Vendors Grid */
.vendors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.vendor-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
}

.vendor-card:hover {
  border-color: #3b82f6;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.vendor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.vendor-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.vendor-meta {
  font-size: 14px;
  color: #6b7280;
}

.risk-badge {
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
}

.risk-badge.critical {
  background: #fee2e2;
  color: #991b1b;
}

.risk-badge.high {
  background: #fef3c7;
  color: #92400e;
}

.risk-badge.medium {
  background: #fef9c3;
  color: #854d0e;
}

.risk-badge.low {
  background: #d1fae5;
  color: #065f46;
}

.vendor-body {
  margin-bottom: 16px;
}

.vendor-services {
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.vendor-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
}

.stat-icon {
  width: 16px;
  height: 16px;
}

.vendor-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background: #f3f4f6;
  color: #6b7280;
}

.status-badge.active {
  background: #d1fae5;
  color: #065f46;
}

.vendor-actions {
  display: flex;
  gap: 8px;
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
  .vendors-grid {
    grid-template-columns: 1fr;
  }

  .summary-stats {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
