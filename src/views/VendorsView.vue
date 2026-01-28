<template>
  <div class="page-container">
    <NavBar />
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-text">
            <div class="header-badge">
              <Building class="badge-icon" />
              <span>Infrastructure</span>
            </div>
            <h1 class="page-title">Vendor Ecosystem</h1>
            <p class="page-subtitle">Manage and audit your third-party relationship network.</p>
          </div>
          <div class="header-actions">
            <button v-if="isManager" @click="router.push('/vendors/new')" class="btn btn-primary">
              <Plus class="icon-sm" />
              <span>Add New Vendor</span>
            </button>
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
            placeholder="Search by name, industry, or country..."
            class="search-input"
          />
        </div>
        <div class="filter-group">
          <div class="select-wrapper">
            <Filter class="select-icon" />
            <select v-model="filterRiskLevel" class="modern-select">
              <option value="">Risk Level</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div class="select-wrapper">
            <Briefcase class="select-icon" />
            <select v-model="filterIndustry" class="modern-select">
              <option value="">Industry</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Financial Services">Financial Services</option>
              <option value="Retail">Retail</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="select-wrapper">
            <Activity class="select-icon" />
            <select v-model="filterStatus" class="modern-select">
              <option value="">Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
          <button
            v-if="searchQuery || filterRiskLevel || filterIndustry || filterStatus"
            @click="resetFilters"
            class="btn-clear"
            title="Clear Filters"
          >
            <X class="icon-xs" />
            <span class="clear-text">Clear</span>
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div v-if="vendorStore.loading" class="loading-zone py-20">
        <LoadingSpinner />
      </div>

      <div v-else-if="filteredVendors.length === 0" class="empty-state">
        <div class="empty-illustration">
          <div class="pulse-ring primary"></div>
          <div class="pulse-ring secondary"></div>
          <Building class="illustration-icon" />
        </div>
        <h2 class="empty-title">Zero Entities Detected</h2>
        <p class="empty-description">
          Refine your search or onboard a new vendor to your security ecosystem.
        </p>
        <div class="empty-actions">
          <button @click="resetFilters" class="btn btn-secondary">Clear All Filters</button>
          <button v-if="isManager" @click="router.push('/vendors/new')" class="btn btn-primary">
            Log New Entity
          </button>
        </div>
      </div>

      <div v-else class="vendors-grid">
        <div
          v-for="vendor in filteredVendors"
          :key="vendor.id"
          class="vendor-card"
          @click="navigateToVendor(vendor.id)"
        >
          <div class="card-edge" :class="getRiskClass(vendor.overall_risk_score)"></div>

          <div class="card-header">
            <span class="industry-badge">{{ vendor.industry }}</span>
            <div class="risk-score-pill" :class="getRiskClass(vendor.overall_risk_score)">
              {{ (vendor.overall_risk_score || 0).toFixed(2) }}
            </div>
          </div>

          <div class="card-body">
            <h3 class="vendor-title">{{ vendor.name }}</h3>
            <p class="vendor-description">{{ vendor.services_provided }}</p>

            <div class="vendor-stats">
              <div class="stat-item">
                <span class="stat-label">Jurisdiction</span>
                <div class="stat-value-group">
                  <Globe class="mini-icon" />
                  <span class="stat-value">{{ vendor.country }}</span>
                </div>
              </div>
              <div class="stat-item align-right">
                <span class="stat-label">Renewal</span>
                <div class="stat-value-group">
                  <Calendar class="mini-icon" />
                  <span class="stat-value">{{ formatDate(vendor.contract_end_date) }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="status-pill" :class="{ active: vendor.is_active }">
              <span class="status-dot"></span>
              <span class="status-text">{{
                vendor.is_active ? 'Production' : 'Off-contract'
              }}</span>
            </div>
            <div v-if="isManager" class="card-actions" @click.stop>
              <button @click="editVendor(vendor)" class="action-btn edit" title="Edit">
                <Edit class="icon-xs" />
              </button>
              <button
                @click="deleteVendorConfirm(vendor)"
                class="action-btn delete"
                title="Archive"
              >
                <Trash2 class="icon-xs" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footnote Stats -->
      <footer v-if="!vendorStore.loading && filteredVendors.length > 0" class="fleet-stats">
        <div class="f-stat">
          <span class="f-label">Entities Monitored</span>
          <span class="f-val">{{ filteredVendors.length }}</span>
        </div>
        <div class="f-stat">
          <span class="f-label">Aggregate Risk Index</span>
          <span class="f-val">{{ averageRiskScore }}</span>
        </div>
        <div class="f-stat">
          <span class="f-label">Total Portfolio Exposure</span>
          <span class="f-val">${{ totalContractValue }}</span>
        </div>
      </footer>
    </div>
    <!-- Modals -->
    <VendorModal
      v-if="showEditModal"
      :vendor="selectedVendor"
      :is-edit="true"
      @close="closeEditModal"
      @save="handleVendorUpdated"
    />

    <DeleteConfirmationModal
      v-if="showDeleteModal"
      :item-name="vendorToDelete?.name"
      title="Archive System Resource"
      confirm-text="Confirm Permanent Archive"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    >
      <template #description>
        You are about to archive <strong>{{ vendorToDelete?.name }}</strong
        >. This will purge all associated risk assessments, telemetry logs, and simulation histories
        from the security dashboard.
      </template>
    </DeleteConfirmationModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVendorStore } from '../stores/vendor'
import { useCoreStore } from '../stores/core'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import VendorModal from '../components/vendors/VendorModal.vue'
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal.vue'
import {
  Plus,
  Search,
  Building,
  Calendar,
  Globe,
  Edit,
  Trash2,
  Filter,
  Activity,
  Briefcase,
  X,
} from 'lucide-vue-next'

const router = useRouter()
const vendorStore = useVendorStore()
const coreStore = useCoreStore()

const isManager = computed(() => coreStore.isManager)

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
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    vendors = vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(query) ||
        v.industry.toLowerCase().includes(query) ||
        v.country.toLowerCase().includes(query),
    )
  }
  if (filterRiskLevel.value) {
    vendors = vendors.filter((v) => v.risk_level === filterRiskLevel.value)
  }
  if (filterIndustry.value) {
    vendors = vendors.filter((v) => v.industry === filterIndustry.value)
  }
  if (filterStatus.value) {
    const isActive = filterStatus.value === 'active'
    vendors = vendors.filter((v) => v.is_active === isActive)
  }
  return vendors
})

const averageRiskScore = computed(() => {
  if (filteredVendors.value.length === 0) return '0.000'
  const total = filteredVendors.value.reduce((sum, v) => sum + (v.overall_risk_score || 0), 0)
  return (total / filteredVendors.value.length).toFixed(3)
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
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  return new Intl.NumberFormat('en-US').format(num)
}

const navigateToVendor = (id) => router.push(`/vendors/${id}`)
const editVendor = (v) => {
  selectedVendor.value = v
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
const deleteVendorConfirm = (v) => {
  vendorToDelete.value = v
  showDeleteModal.value = true
}
const confirmDelete = async () => {
  if (vendorToDelete.value) {
    await vendorStore.deleteVendor(vendorToDelete.value.id)
    showDeleteModal.value = false
    vendorToDelete.value = null
  }
}

onMounted(() => vendorStore.fetchVendors())
</script>

<style scoped>
/* Base Layout */
.page-container {
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
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(71, 85, 105, 0.25);
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

/* Vendors Grid */
.vendors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 28px;
  margin-bottom: 56px;
  animation: fadeIn 0.6s ease-out 0.2s both;
}

/* Card Styling */
.vendor-card {
  position: relative;
  background: white;
  border-radius: 32px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.vendor-card:hover {
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

.vendor-card:hover .card-edge {
  width: 7px;
}

.card-edge.low {
  background: linear-gradient(to bottom, #10b981, #059669);
}
.card-edge.medium {
  background: linear-gradient(to bottom, #f59e0b, #d97706);
}
.card-edge.high {
  background: linear-gradient(to bottom, #f97316, #ea580c);
}
.card-edge.critical {
  background: linear-gradient(to bottom, #ef4444, #dc2626);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 32px 24px;
}

.industry-badge {
  font-size: 11px;
  font-weight: 900;
  color: #64748b;
  background: #f1f5f9;
  padding: 6px 14px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.risk-score-pill {
  font-size: 16px;
  font-weight: 900;
  padding: 6px 14px;
  border-radius: 10px;
}

.risk-score-pill.low {
  background: #d1fae5;
  color: #065f46;
}

.risk-score-pill.medium {
  background: #fef3c7;
  color: #92400e;
}

.risk-score-pill.high {
  background: #fed7aa;
  color: #9a3412;
}

.risk-score-pill.critical {
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

.vendor-title {
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}

.vendor-description {
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
  min-height: 48px;
}

.vendor-stats {
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

.stat-value-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.mini-icon {
  width: 14px;
  height: 14px;
  color: #64748b;
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

.status-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #cbd5e1;
}
.status-pill.active .status-dot {
  background: #10b981;
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}
.status-text {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
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

/* Footnote Stats */
.fleet-stats {
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

/* Empty State */
.empty-state {
  text-align: center;
  padding: 100px 40px;
  background: white;
  border-radius: 32px;
  border: 2px solid #e2e8f0;
  animation: fadeIn 0.6s ease-out both;
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
  color: #3b82f6;
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
  border: 3px solid rgba(59, 130, 246, 0.3);
}
.pulse-ring.secondary {
  width: 130%;
  height: 130%;
  border: 2px solid rgba(59, 130, 246, 0.15);
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
  margin-bottom: 16px;
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
  .header-content {
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
  .vendors-grid {
    grid-template-columns: 1fr;
  }
  .fleet-stats {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (max-width: 1024px) {
  .control-panel {
    flex-direction: column;
    align-items: stretch;
  }
  .filter-group {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }
  .fleet-stats {
    flex-direction: column;
    gap: 24px;
  }
  .f-stat.border-x {
    border: none;
    padding: 0;
  }
}
</style>
