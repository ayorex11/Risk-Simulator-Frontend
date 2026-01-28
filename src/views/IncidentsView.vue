<template>
  <div class="incidents-page">
    <NavBar />
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-text">
            <div class="header-badge">
              <ShieldAlert class="badge-icon" />
              <span>Security Operations</span>
            </div>
            <h1 class="page-title">Active Incidents</h1>
            <p class="page-subtitle">
              Monitor and manage security events across the ecosystem.
            </p>
          </div>
          <div class="header-actions">
            <router-link to="/incidents/trends" class="btn btn-outline">
              <BarChart3 class="icon-sm" />
              <span>View Trends</span>
            </router-link>
            <button @click="showReportModal = true" class="btn btn-primary">
              <Plus class="icon-sm" />
              <span>Report Incident</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Search & Filters -->
      <div class="toolbar">
        <div class="search-wrapper">
          <Search class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search incidents, vendors, descriptions..."
            class="search-input"
          />
        </div>
        <div class="filter-group">
          <div class="select-wrapper">
            <Filter class="select-icon" />
            <select v-model="filterSeverity" class="modern-select">
              <option value="">All Severities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
          <div class="select-wrapper">
            <ShieldAlert class="select-icon" />
            <select v-model="filterType" class="modern-select">
              <option value="">All Types</option>
              <option value="data_breach">Data Breach</option>
              <option value="service_outage">Service Outage</option>
              <option value="malware">Malware</option>
              <option value="unauthorized_access">Unauthorized Access</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button
            v-if="searchQuery || filterSeverity || filterType"
            @click="resetFilters"
            class="btn-clear"
            title="Clear Filters"
          >
            <X class="icon-xs" />
            <span class="clear-text">Clear</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="vendorStore.loading" class="loading-container">
        <LoadingSpinner />
      </div>

      <!-- Empty State -->
      <div
        v-else-if="filteredIncidents.length === 0"
        class="empty-state"
      >
        <div class="empty-illustration">
          <div class="pulse-ring primary"></div>
          <div class="pulse-ring secondary"></div>
          <ShieldCheck class="illustration-icon" />
        </div>
        <h2 class="empty-title">All Systems Clear</h2>
        <p class="empty-description">
          No active incidents matched your current filters. Your vendor ecosystem appears stable.
        </p>
        <div class="empty-actions">
          <button @click="resetFilters" class="btn btn-secondary">
            Clear All Filters
          </button>
          <button @click="showReportModal = true" class="btn btn-primary">
            Log New Incident
          </button>
        </div>
      </div>

      <!-- Incidents Grid -->
      <div
        v-else
        class="incidents-grid"
      >
        <div
          v-for="incident in filteredIncidents"
          :key="incident.id"
          class="incident-card"
        >
          <div class="card-edge" :class="incident.severity"></div>

          <div class="card-header">
            <span class="severity-badge" :class="incident.severity">
              {{ incident.severity }}
            </span>
            <span class="incident-id">
              #{{ incident.id.split('-')[0] }}
            </span>
          </div>

          <div class="card-body">
            <h3 class="incident-title">
              {{ incident.title }}
            </h3>

            <router-link
              :to="`/vendors/${incident.vendor}`"
              class="vendor-link"
            >
              <div class="vendor-avatar">{{ incident.vendor_name?.charAt(0) }}</div>
              <span class="vendor-name">{{ incident.vendor_name }}</span>
              <ExternalLink class="link-icon" />
            </router-link>

            <p class="incident-description">
              {{ incident.description }}
            </p>

            <div class="incident-stats">
              <div class="stat-item">
                <span class="stat-label">Occurred On</span>
                <span class="stat-value">{{ formatDate(incident.incident_date) }}</span>
              </div>
              <div class="stat-item align-right">
                <span class="stat-label danger">Financial Impact</span>
                <span class="stat-value impact">${{ formatNumber(incident.financial_impact) }}</span>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <span class="type-tag">
              {{ incident.incident_type_display || incident.incident_type.replace('_', ' ') }}
            </span>
            <div class="card-actions">
              <button @click="editIncident(incident)" class="action-btn edit" title="Edit">
                <Edit class="icon-xs" />
              </button>
              <button @click="confirmDelete(incident)" class="action-btn delete" title="Delete">
                <Trash2 class="icon-xs" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <IncidentModal
      v-if="showReportModal"
      @close="closeModal"
      @save="onIncidentSaved"
      :incident="selectedIncident"
    />

    <DeleteConfirmationModal
      v-if="incidentToDelete"
      :item-name="incidentToDelete.title"
      title="Erase Incident Trace"
      @close="incidentToDelete = null"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useVendorStore } from '../stores/vendor'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import IncidentModal from '../components/vendors/IncidentModal.vue'
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal.vue'
import {
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  BarChart3,
  Edit,
  Trash2,
  ExternalLink,
  Filter,
  X,
} from 'lucide-vue-next'

const vendorStore = useVendorStore()
const searchQuery = ref('')
const filterSeverity = ref('')
const filterType = ref('')
const showReportModal = ref(false)
const selectedIncident = ref(null)
const incidentToDelete = ref(null)

const filteredIncidents = computed(() => {
  let list = vendorStore.incidents

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.vendor_name?.toLowerCase().includes(q),
    )
  }

  if (filterSeverity.value) {
    list = list.filter((i) => i.severity === filterSeverity.value)
  }

  if (filterType.value) {
    list = list.filter((i) => i.incident_type === filterType.value)
  }

  return list
})

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatNumber = (num) => {
  if (!num) return '0'
  return new Intl.NumberFormat('en-US').format(num)
}

const resetFilters = () => {
  searchQuery.value = ''
  filterSeverity.value = ''
  filterType.value = ''
}

const editIncident = (incident) => {
  selectedIncident.value = incident
  showReportModal.value = true
}

const closeModal = () => {
  showReportModal.value = false
  selectedIncident.value = null
}

const onIncidentSaved = async () => {
  closeModal()
  await vendorStore.fetchIncidents()
}

const confirmDelete = (incident) => {
  incidentToDelete.value = incident
}

const handleDelete = async () => {
  if (incidentToDelete.value) {
    await vendorStore.deleteIncident(incidentToDelete.value.id)
    incidentToDelete.value = null
  }
}

onMounted(async () => {
  await vendorStore.fetchIncidents()
})
</script>

<style scoped>
/* Base Layout */
.incidents-page {
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
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
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

.btn-outline {
  background: white;
  color: #475569;
  border: 2px solid #e2e8f0;
}

.btn-outline:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
  transform: translateY(-1px);
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
  background: #f1f5f9;
  color: #475569;
  border: 2px solid transparent;
}

.btn-secondary:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
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
  margin-bottom: 48px;
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
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1), 0 1px 3px rgba(0, 0, 0, 0.04);
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
  padding: 100px 40px;
  background: white;
  border-radius: 32px;
  border: 2px solid #e2e8f0;
  margin-top: 20px;
  animation: fadeIn 0.6s ease-out 0.2s both;
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
  color: #10b981;
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
  border: 3px solid rgba(16, 185, 129, 0.3);
}

.pulse-ring.secondary {
  width: 130%;
  height: 130%;
  border: 2px solid rgba(16, 185, 129, 0.15);
  animation-delay: 0.5s;
}

@keyframes pulse {
  0%, 100% {
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
  margin: 0 0 16px 0;
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

/* Incidents Grid */
.incidents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 28px;
  animation: fadeIn 0.6s ease-out 0.2s both;
}

/* Incident Cards */
.incident-card {
  position: relative;
  background: white;
  border-radius: 24px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.incident-card:hover {
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

.incident-card:hover .card-edge {
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
  padding: 24px 28px 20px;
}

.severity-badge {
  font-size: 11px;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 6px 14px;
  border-radius: 10px;
  display: inline-block;
}

.severity-badge.low {
  background: #d1fae5;
  color: #065f46;
}
.severity-badge.medium {
  background: #fef3c7;
  color: #92400e;
}
.severity-badge.high {
  background: #fed7aa;
  color: #9a3412;
}
.severity-badge.critical {
  background: #fee2e2;
  color: #991b1b;
}

.incident-id {
  font-size: 12px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.card-body {
  padding: 0 28px 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.incident-title {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.3;
  letter-spacing: -0.01em;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.vendor-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  transition: all 0.2s;
  width: fit-content;
  padding: 6px 12px 6px 6px;
  margin: -6px 0 -6px -6px;
  border-radius: 12px;
}

.vendor-link:hover {
  background: #f1f5f9;
}

.vendor-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 900;
  flex-shrink: 0;
}

.vendor-name {
  font-size: 14px;
  font-weight: 700;
  color: #475569;
  transition: color 0.2s;
}

.vendor-link:hover .vendor-name {
  color: #3b82f6;
}

.link-icon {
  width: 14px;
  height: 14px;
  color: #94a3b8;
  opacity: 0;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.vendor-link:hover .link-icon {
  opacity: 1;
}

.incident-description {
  font-size: 14px;
  color: #64748b;
  line-height: 1.7;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.incident-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding-top: 20px;
  border-top: 2px solid #f1f5f9;
  margin-top: auto;
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
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.stat-label.danger {
  color: #f87171;
}

.stat-value {
  font-size: 15px;
  font-weight: 700;
  color: #334155;
}

.stat-value.impact {
  font-size: 17px;
  font-weight: 900;
  color: #0f172a;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 28px;
  background: #f8fafc;
  border-top: 2px solid #f1f5f9;
}

.type-tag {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  background: white;
  padding: 6px 14px;
  border-radius: 10px;
  text-transform: capitalize;
  border: 1px solid #e2e8f0;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 2px solid transparent;
  background: white;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
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

/* Animations */
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

/* Responsive */
@media (max-width: 1200px) {
  .incidents-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }
}

@media (max-width: 900px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }

  .header-actions {
    width: 100%;
  }

  .btn {
    flex: 1;
    justify-content: center;
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

  .incidents-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 16px 60px;
  }

  .page-header {
    padding: 32px 0 28px;
  }

  .page-title {
    font-size: 36px;
  }

  .header-actions {
    flex-direction: column;
    gap: 10px;
  }

  .toolbar {
    margin-bottom: 32px;
  }

  .card-header,
  .card-body,
  .card-footer {
    padding-left: 20px;
    padding-right: 20px;
  }

  .incident-title {
    font-size: 20px;
  }
}
</style>
