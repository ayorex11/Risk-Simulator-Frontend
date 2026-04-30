<template>
  <div class="page-container">
    <NavBar />
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-text">
            <div class="header-badge">
              <Zap class="badge-icon" />
              <span>Risk Engine</span>
            </div>
            <h1 class="page-title">Simulation Hub</h1>
            <p class="page-subtitle">
              Model cyber incidents, quantify financial impact, and stress-test your vendor
              ecosystem.
            </p>
          </div>
          <div class="header-actions">
            <router-link v-if="canCreate" to="/simulations/new" class="btn btn-primary">
              <Plus class="icon-sm" />
              <span>Run New Simulation</span>
            </router-link>
            <router-link to="/simulations/summary" class="btn btn-secondary">
              <BarChart3 class="icon-sm" />
              <span>Summary</span>
            </router-link>
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
            placeholder="Search simulations..."
            class="search-input"
          />
        </div>
        <div class="filter-group">
          <div class="select-wrapper">
            <Filter class="select-icon" />
            <select v-model="filterStatus" class="modern-select">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div class="select-wrapper">
            <Zap class="select-icon" />
            <select v-model="filterScenario" class="modern-select">
              <option value="">Scenario Type</option>
              <option value="data_breach">Data Breach</option>
              <option value="ransomware">Ransomware</option>
              <option value="service_disruption">Service Disruption</option>
              <option value="supply_chain">Supply Chain</option>
              <option value="multi_vendor">Multi-Vendor</option>
            </select>
          </div>
          <button
            v-if="searchQuery || filterStatus || filterScenario"
            @click="resetFilters"
            class="btn-clear"
            title="Clear Filters"
          >
            <X class="icon-xs" />
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="simulationStore.loading" class="loading-zone py-20">
        <LoadingSpinner />
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredSimulations.length === 0" class="empty-state">
        <div class="empty-illustration">
          <div class="pulse-ring primary"></div>
          <div class="pulse-ring secondary"></div>
          <Zap class="illustration-icon" />
        </div>
        <h2 class="empty-title">No Simulations Found</h2>
        <p class="empty-description">
          Launch your first risk simulation to model potential cyber incidents and quantify their
          financial impact.
        </p>
        <div class="empty-actions">
          <button @click="resetFilters" class="btn btn-secondary">Clear Filters</button>
          <router-link v-if="canCreate" to="/simulations/new" class="btn btn-primary">
            Run Simulation
          </router-link>
        </div>
      </div>

      <!-- Simulations Grid -->
      <div v-else class="simulations-grid">
        <div
          v-for="sim in filteredSimulations"
          :key="sim.id"
          class="sim-card"
          @click="navigateToSimulation(sim.id)"
        >
          <div class="card-edge" :class="getStatusClass(sim.status)"></div>

          <div class="card-header">
            <div style="display:flex; align-items:center; gap: 12px;">
              <input type="checkbox" :value="sim.id" v-model="selectedSimulations" @click.stop class="compare-checkbox" />
              <span class="scenario-badge">{{ formatScenarioType(sim.scenario_name) }}</span>
            </div>
            <div class="status-pill" :class="getStatusClass(sim.status)">
              <span v-if="sim.status === 'running'" class="status-pulse"></span>
              <span class="status-text">{{ sim.status }}</span>
            </div>
          </div>

          <div class="card-body">
            <h3 class="sim-title">{{ sim.name }}</h3>
            <p class="sim-vendor">
              <Building class="mini-icon" />
              {{ sim.vendor_name }}
            </p>

            <div class="sim-stats">
              <div class="stat-item">
                <span class="stat-label">Created</span>
                <div class="stat-value-group">
                  <Calendar class="mini-icon" />
                  <span class="stat-value">{{ formatDate(sim.created_at) }}</span>
                </div>
              </div>
              <div class="stat-item align-right">
                <span class="stat-label">Runtime</span>
                <div class="stat-value-group">
                  <Clock class="mini-icon" />
                  <span class="stat-value">{{
                    sim.execution_time ? sim.execution_time.toFixed(1) + 's' : '—'
                  }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <span class="created-by">{{ sim.created_by_name || 'System' }}</span>
            <div v-if="isAdmin" class="card-actions" @click.stop>
              <button
                v-if="sim.status === 'pending' || sim.status === 'failed'"
                @click="deleteSimulationConfirm(sim)"
                class="action-btn delete"
                title="Delete"
              >
                <Trash2 class="icon-xs" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Stats -->
      <footer v-if="!simulationStore.loading && filteredSimulations.length > 0" class="fleet-stats">
        <div class="f-stat">
          <span class="f-label">Total Simulations</span>
          <span class="f-val">{{ filteredSimulations.length }}</span>
        </div>
        <div class="f-stat">
          <span class="f-label">Completed</span>
          <span class="f-val">{{
            filteredSimulations.filter((s) => s.status === 'completed').length
          }}</span>
        </div>
        <div class="f-stat">
          <span class="f-label">Pending</span>
          <span class="f-val">{{
            filteredSimulations.filter((s) => s.status === 'pending').length
          }}</span>
        </div>
      </footer>

      <!-- Floating Action Bar for Comparison -->
      <div v-if="selectedSimulations.length > 1" class="compare-fab">
        <span class="compare-text">{{ selectedSimulations.length }} Selected</span>
        <button @click="goToComparison" class="btn btn-primary" style="padding: 10px 20px;">Compare Scenarios</button>
      </div>
    </div>

    <!-- Delete Modal -->
    <DeleteConfirmationModal
      v-if="showDeleteModal"
      :item-name="simToDelete?.name"
      title="Delete Simulation"
      confirm-text="Confirm Delete"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    >
      <template #description>
        You are about to permanently delete <strong>{{ simToDelete?.name }}</strong
        >. This action cannot be undone.
      </template>
    </DeleteConfirmationModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSimulationStore } from '../stores/simulation'
import { useCoreStore } from '../stores/core'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal.vue'
import {
  Plus,
  Search,
  Zap,
  Calendar,
  Clock,
  Building,
  Trash2,
  Filter,
  X,
  BarChart3,
} from 'lucide-vue-next'

const router = useRouter()
const simulationStore = useSimulationStore()
const coreStore = useCoreStore()

const canCreate = computed(() =>
  ['admin', 'manager', 'analyst'].includes(coreStore.permissions?.role),
)
const isAdmin = computed(() => coreStore.permissions?.role === 'admin')

const searchQuery = ref('')
const filterStatus = ref('')
const filterScenario = ref('')
const showDeleteModal = ref(false)
const simToDelete = ref(null)

const selectedSimulations = ref([])

const goToComparison = () => {
  const q = selectedSimulations.value.map(id => `id=${id}`).join('&')
  router.push(`/simulations/compare?${q}`)
}

const filteredSimulations = computed(() => {
  let sims = simulationStore.simulations
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    sims = sims.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        (s.vendor_name && s.vendor_name.toLowerCase().includes(q)) ||
        (s.scenario_name && s.scenario_name.toLowerCase().includes(q)),
    )
  }
  if (filterStatus.value) {
    sims = sims.filter((s) => s.status === filterStatus.value)
  }
  if (filterScenario.value) {
    sims = sims.filter((s) => {
      const scenarioName = (s.scenario_name || '').toLowerCase().replace(/\s+/g, '_')
      return scenarioName.includes(filterScenario.value)
    })
  }
  return sims
})

const resetFilters = () => {
  searchQuery.value = ''
  filterStatus.value = ''
  filterScenario.value = ''
}

const getStatusClass = (status) => {
  const map = { pending: 'pending', running: 'running', completed: 'completed', failed: 'failed' }
  return map[status] || 'pending'
}

const formatScenarioType = (name) => name || 'Unknown'

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const navigateToSimulation = (id) => router.push(`/simulations/${id}`)

const deleteSimulationConfirm = (sim) => {
  simToDelete.value = sim
  showDeleteModal.value = true
}

const confirmDelete = async () => {
  if (simToDelete.value) {
    await simulationStore.deleteSimulation(simToDelete.value.id)
    showDeleteModal.value = false
    simToDelete.value = null
  }
}

onMounted(() => simulationStore.fetchSimulations())
</script>

<style scoped>
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
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
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
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
}
.btn-primary:hover {
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
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
.search-input:focus {
  border-color: #7c3aed;
  box-shadow:
    0 0 0 4px rgba(124, 58, 237, 0.1),
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
  min-width: 170px;
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
.modern-select:focus {
  border-color: #7c3aed;
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
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
}
.btn-clear:hover {
  background: #fef2f2;
  border-color: #fecaca;
}

/* Loading */
.loading-zone {
  display: flex;
  justify-content: center;
  padding: 80px 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 0;
  animation: fadeIn 0.6s ease-out;
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
.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;
}
.pulse-ring.primary {
  border: 3px solid rgba(124, 58, 237, 0.2);
}
.pulse-ring.secondary {
  border: 3px solid rgba(124, 58, 237, 0.1);
  animation-delay: 1s;
}
.illustration-icon {
  width: 70px;
  height: 70px;
  color: #7c3aed;
  position: relative;
  z-index: 2;
}
.empty-title {
  font-size: 28px;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 12px;
}
.empty-description {
  font-size: 16px;
  color: #64748b;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto 32px;
}
.empty-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* Grid */
.simulations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(380px, 100%), 1fr));
  gap: 28px;
  margin-bottom: 56px;
  animation: fadeIn 0.6s ease-out 0.2s both;
}

/* Card */
.sim-card {
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
.sim-card:hover {
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
.sim-card:hover .card-edge {
  width: 7px;
}
.card-edge.pending {
  background: linear-gradient(to bottom, #94a3b8, #64748b);
}
.card-edge.running {
  background: linear-gradient(to bottom, #3b82f6, #2563eb);
}
.card-edge.completed {
  background: linear-gradient(to bottom, #10b981, #059669);
}
.card-edge.failed {
  background: linear-gradient(to bottom, #ef4444, #dc2626);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 32px 24px;
}
.scenario-badge {
  font-size: 11px;
  font-weight: 900;
  color: #7c3aed;
  background: #f3e8ff;
  padding: 6px 14px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.status-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: capitalize;
}
.status-pill.pending {
  background: #f1f5f9;
  color: #64748b;
}
.status-pill.running {
  background: #eff6ff;
  color: #3b82f6;
}
.status-pill.completed {
  background: #ecfdf5;
  color: #059669;
}
.status-pill.failed {
  background: #fef2f2;
  color: #dc2626;
}
.status-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3b82f6;
  animation: pulseDot 1.5s ease-in-out infinite;
}

.card-body {
  padding: 0 32px 28px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sim-title {
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}
.sim-vendor {
  font-size: 14px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
}

.sim-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding-top: 16px;
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
.created-by {
  font-size: 13px;
  font-weight: 600;
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
.action-btn.delete:hover {
  background: #fef2f2;
  color: #ef4444;
  border-color: #fecaca;
}

/* Footer Stats */
.fleet-stats {
  display: flex;
  justify-content: center;
  gap: 60px;
  padding: 32px 0;
  border-top: 2px solid #f1f5f9;
  animation: fadeIn 0.6s ease-out 0.3s both;
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
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}
.f-val {
  font-size: 28px;
  font-weight: 900;
  color: #0f172a;
}

/* Compare Checkbox and FAB */
.compare-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #7c3aed;
}
.compare-fab {
  position: fixed;
  bottom: 40px;
  right: 40px;
  background: white;
  padding: 16px 24px;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  display: flex;
  align-items: center;
  gap: 20px;
  z-index: 100;
  border: 2px solid #e2e8f0;
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.compare-text { font-weight: 800; color: #1e293b; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes pulse {
  0%,
  100% {
    transform: scale(0.9);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.6;
  }
}
@keyframes pulseDot {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .page-title { font-size: 32px; }
  .header-content { flex-direction: column; align-items: flex-start; }
  .toolbar { flex-direction: column; }
  .simulations-grid { grid-template-columns: 1fr; }
  .fleet-stats { gap: 32px; }
}

@media (max-width: 640px) {
  .container { padding: 0 16px 80px; }
  .page-title { font-size: 28px; }
  .page-header { padding: 28px 0 24px; }
  .toolbar { margin-bottom: 32px; }
  .card-header { padding: 20px 24px; }
  .card-body { padding: 0 24px 20px; }
  .card-footer { padding: 16px 24px; }
  .header-actions { width: 100%; flex-wrap: wrap; }
  .header-actions .btn { flex: 1; justify-content: center; }
  .fleet-stats { flex-direction: column; gap: 16px; padding: 24px 0; }
  .empty-state { padding: 48px 16px; }
  .empty-title { font-size: 22px; }
  .empty-actions { flex-direction: column; }
  .empty-actions .btn { width: 100%; justify-content: center; }
}

@media (max-width: 480px) {
  .container { padding: 0 12px 80px; }
  .page-title { font-size: 24px; }
  .compare-fab {
    bottom: 16px;
    right: 12px;
    left: 12px;
    padding: 12px 16px;
    border-radius: 16px;
    gap: 12px;
  }
  .sim-title { font-size: 18px; }
  .select-wrapper { min-width: 0; flex: 1; }
}

@media (max-width: 375px) {
  .container { padding: 0 10px 80px; }
  .page-title { font-size: 22px; }
}
</style>
