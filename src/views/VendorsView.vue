<template>
  <div class="page-container">
    <NavBar />
    <main class="vendors-page py-8">
      <div class="container">
        <!-- Header -->
        <header class="page-header mb-8">
          <div>
            <h1 class="text-3xl font-black tracking-tight">Vendor Ecosystem</h1>
            <p class="text-muted font-medium">
              Manage and audit your third-party relationship network.
            </p>
          </div>
          <router-link to="/vendors/new" class="btn btn-primary lg">
            <Plus class="icon" /> Add New Vendor
          </router-link>
        </header>

        <!-- Search & Control Room -->
        <section class="control-panel card glass mb-8">
          <div class="search-box">
            <Search class="search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Filter by name, industry, or country..."
              class="search-input-premium"
            />
          </div>
          <div class="filter-group">
            <div class="filter-item">
              <label class="tiny-label">Risk Level</label>
              <select v-model="filterRiskLevel" class="premium-select">
                <option value="">All Levels</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div class="filter-item">
              <label class="tiny-label">Industry</label>
              <select v-model="filterIndustry" class="premium-select">
                <option value="">All Industries</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Financial Services">Financial Services</option>
                <option value="Retail">Retail</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="filter-item">
              <label class="tiny-label">Status</label>
              <select v-model="filterStatus" class="premium-select">
                <option value="">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Content Area -->
        <div v-if="vendorStore.loading" class="loading-zone py-20">
          <LoadingSpinner />
        </div>

        <div v-else-if="filteredVendors.length === 0" class="empty-state-premium card py-20">
          <div class="empty-bg-icon"><Building /></div>
          <h2 class="text-xl font-bold mb-2">No matches found</h2>
          <p class="text-muted mb-8">Refine your search or add a new vendor to your ecosystem.</p>
          <router-link to="/vendors/new" class="btn btn-primary">
            <Plus class="icon" /> Onboard First Vendor
          </router-link>
        </div>

        <div v-else class="vendors-grid modern-grid mb-12">
          <div
            v-for="vendor in filteredVendors"
            :key="vendor.id"
            class="vendor-card-premium card hover-lift"
            @click="navigateToVendor(vendor.id)"
          >
            <div class="v-card-header">
              <div class="v-main-info">
                <h3>{{ vendor.name }}</h3>
                <span class="v-tag">{{ vendor.industry }}</span>
              </div>
              <div class="v-risk-zone">
                <div class="risk-score-pill" :class="getRiskClass(vendor.overall_risk_score)">
                  {{ (vendor.overall_risk_score || 0).toFixed(3) }}
                </div>
              </div>
            </div>

            <div class="v-card-body">
              <p class="v-description">{{ vendor.services_provided }}</p>
              <div class="v-stats-row">
                <div class="v-stat">
                  <Globe class="mini-icon" />
                  <span>{{ vendor.country }}</span>
                </div>
                <div class="v-stat">
                  <Calendar class="mini-icon" />
                  <span>Renew: {{ formatDate(vendor.contract_end_date) }}</span>
                </div>
              </div>
            </div>

            <div class="v-card-footer">
              <div class="v-status">
                <span class="dot" :class="{ active: vendor.is_active }"></span>
                <span class="status-text">{{
                  vendor.is_active ? 'Production' : 'Off-contract'
                }}</span>
              </div>
              <div class="v-actions" @click.stop>
                <button @click="editVendor(vendor)" class="icon-btn-lite" title="Edit Properties">
                  <Edit class="icon-xs" />
                </button>
                <button
                  @click="deleteVendorConfirm(vendor)"
                  class="icon-btn-lite danger"
                  title="Archive Vendor"
                >
                  <Trash2 class="icon-xs" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footnote Stats -->
        <footer
          v-if="!vendorStore.loading && filteredVendors.length > 0"
          class="fleet-stats glass p-8 rounded-3xl flex justify-around"
        >
          <div class="f-stat">
            <span class="f-label">Fleet Size</span>
            <span class="f-val">{{ filteredVendors.length }}</span>
          </div>
          <div class="f-stat border-x px-12 border-slate-200">
            <span class="f-label">Avg Aggregate Risk</span>
            <span class="f-val">{{ averageRiskScore }}</span>
          </div>
          <div class="f-stat">
            <span class="f-label">Total Contract Exposure</span>
            <span class="f-val">${{ totalContractValue }}</span>
          </div>
        </footer>
      </div>
    </main>

    <!-- Modals -->
    <VendorModal
      v-if="showEditModal"
      :vendor="selectedVendor"
      :is-edit="true"
      @close="closeEditModal"
      @save="handleVendorUpdated"
    />
    <div v-if="showDeleteModal" class="modal-overlay glass" @click.self="showDeleteModal = false">
      <div class="card delete-confirmation-card p-10 max-w-md w-full">
        <h2 class="text-2xl font-black mb-4">Archive Vendor?</h2>
        <p class="text-slate-600 mb-8">
          Are you sure you want to remove <strong>{{ vendorToDelete?.name }}</strong
          >? This will purge all associated risk assessments.
        </p>
        <div class="flex gap-4 justify-end">
          <button @click="showDeleteModal = false" class="btn btn-secondary">Cancel</button>
          <button @click="confirmDelete" class="btn btn-danger">Confirm Archive</button>
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
import { Plus, Search, Building, Calendar, Globe, Edit, Trash2 } from 'lucide-vue-next'

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
.page-container {
  min-height: 100vh;
  background: var(--bg-main);
}
.vendors-page {
  padding-top: 40px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

/* Control Panel */
.control-panel {
  padding: 12px;
  border-radius: 24px;
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  color: #94a3b8;
}

.search-input-premium {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: none;
  background: white;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 500;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02);
}

.search-input-premium:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--primary-soft);
}

.filter-group {
  display: flex;
  gap: 12px;
}
.filter-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.tiny-label {
  font-size: 10px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  margin-left: 8px;
}

.premium-select {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  background: white;
  color: #1e293b;
  cursor: pointer;
}

/* Grid */
.modern-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.vendor-card-premium {
  padding: 24px;
  cursor: pointer;
}

.v-card-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.v-main-info h3 {
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 4px;
}
.v-tag {
  font-size: 11px;
  font-weight: 700;
  color: var(--primary);
  background: var(--primary-soft);
  padding: 2px 8px;
  border-radius: 6px;
  text-transform: uppercase;
}

.risk-score-pill {
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 900;
}
.risk-score-pill.critical {
  background: #fee2e2;
  color: #991b1b;
}
.risk-score-pill.high {
  background: #fef3c7;
  color: #92400e;
}
.risk-score-pill.medium {
  background: #fef9c3;
  color: #854d0e;
}
.risk-score-pill.low {
  background: #d1fae5;
  color: #065f46;
}

.v-description {
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 20px;
  height: 42px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.v-stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
}
.v-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
}
.mini-icon {
  width: 14px;
  height: 14px;
}

.v-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.v-status {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #cbd5e1;
}
.dot.active {
  background: #10b981;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
}
.status-text {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}

.icon-btn-lite {
  padding: 8px;
  border-radius: 8px;
  border: none;
  background: #f8fafc;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
}
.icon-btn-lite:hover {
  background: #f1f5f9;
  color: var(--primary);
}
.icon-btn-lite.danger:hover {
  background: #fee2e2;
  color: #ef4444;
}
.icon-xs {
  width: 16px;
  height: 16px;
}

/* Footnote */
.f-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.f-label {
  font-size: 11px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}
.f-val {
  font-size: 20px;
  font-weight: 900;
  color: #1e293b;
}

.empty-bg-icon {
  font-size: 48px;
  opacity: 0.1;
  color: var(--primary);
  margin-bottom: 16px;
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
