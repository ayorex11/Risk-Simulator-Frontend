<template>
  <div class="page-container">
    <NavBar />
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-text">
            <div class="header-badge">
              <Workflow class="badge-icon" />
              <span>Operations</span>
            </div>
            <h1 class="page-title">Business Processes</h1>
            <p class="page-subtitle">
              Manage critical operational processes and their vendor dependencies.
            </p>
          </div>
          <div class="header-actions">
            <button @click="openCreateModal" class="btn btn-primary">
              <Plus class="icon-sm" />
              <span>Add Process</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Loading -->
      <div v-if="loading" class="loading-zone">
        <LoadingSpinner />
      </div>

      <!-- Empty State -->
      <div v-else-if="processes.length === 0" class="empty-state">
        <div class="empty-illustration">
          <div class="pulse-ring primary"></div>
          <Workflow class="illustration-icon" />
        </div>
        <h2 class="empty-title">No Processes Defined</h2>
        <p class="empty-description">
          Define your business processes to enable cascading impact analysis in simulations.
        </p>
        <button @click="openCreateModal" class="btn btn-primary">
          <Plus class="icon-sm" /> Add First Process
        </button>
      </div>

      <!-- Process Table -->
      <div v-else class="table-wrapper">
        <table class="process-table">
          <thead>
            <tr>
              <th>Process Name</th>
              <th>Department</th>
              <th>Criticality</th>
              <th>Hourly Cost</th>
              <th>Linked Vendors</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="proc in processes" :key="proc.id" class="table-row">
              <td>
                <span class="proc-name">{{ proc.name }}</span>
              </td>
              <td>
                <span class="dept-badge">{{ proc.department || '—' }}</span>
              </td>
              <td>
                <div class="crit-bar-wrap">
                  <div
                    class="crit-bar"
                    :class="getCritClass(proc.criticality_level)"
                    :style="{ width: `${(proc.criticality_level / 5) * 100}%` }"
                  ></div>
                  <span class="crit-label">{{ proc.criticality_level }}/5</span>
                </div>
              </td>
              <td>
                <span class="cost-val">${{ formatNumber(proc.hourly_operating_cost) }}/hr</span>
              </td>
              <td>
                <span class="vendor-count">{{ (proc.dependent_vendors || []).length }} vendor(s)</span>
              </td>
              <td>
                <div class="action-group">
                  <button @click="openEditModal(proc)" class="action-btn edit" title="Edit">
                    <Edit class="icon-xs" />
                  </button>
                  <button @click="confirmDelete(proc)" class="action-btn delete" title="Delete">
                    <Trash2 class="icon-xs" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Footer Stats -->
      <footer v-if="!loading && processes.length > 0" class="fleet-stats">
        <div class="f-stat">
          <span class="f-label">Total Processes</span>
          <span class="f-val">{{ processes.length }}</span>
        </div>
        <div class="f-stat">
          <span class="f-label">Avg Criticality</span>
          <span class="f-val">{{ avgCriticality }}</span>
        </div>
        <div class="f-stat">
          <span class="f-label">Total Hourly Exposure</span>
          <span class="f-val">${{ formatNumber(totalHourlyCost) }}/hr</span>
        </div>
      </footer>
    </div>

    <!-- Create / Edit Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h2>{{ editingProcess ? 'Edit Process' : 'Add Business Process' }}</h2>
          <button @click="closeModal" class="close-btn"><X class="icon" /></button>
        </div>

        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="form-group">
            <label class="form-label">Process Name *</label>
            <input
              v-model="form.name"
              type="text"
              class="form-input"
              :class="{ error: formErrors.name }"
              placeholder="e.g. Payment Processing"
              required
            />
            <span v-if="formErrors.name" class="form-error">
              {{ Array.isArray(formErrors.name) ? formErrors.name[0] : formErrors.name }}
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea
              v-model="form.description"
              class="form-input"
              rows="3"
              placeholder="Briefly describe this business process"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Department</label>
              <input
                v-model="form.department"
                type="text"
                class="form-input"
                placeholder="e.g. Finance"
              />
              <span v-if="formErrors.department" class="form-error">
                {{ Array.isArray(formErrors.department) ? formErrors.department[0] : formErrors.department }}
              </span>
            </div>

            <div class="form-group">
              <label class="form-label">Criticality Level (1–5) *</label>
              <select v-model.number="form.criticality_level" class="form-input" required>
                <option value="1">1 — Low</option>
                <option value="2">2 — Below Average</option>
                <option value="3">3 — Moderate</option>
                <option value="4">4 — High</option>
                <option value="5">5 — Critical</option>
              </select>
              <span v-if="formErrors.criticality_level" class="form-error">
                {{ Array.isArray(formErrors.criticality_level) ? formErrors.criticality_level[0] : formErrors.criticality_level }}
              </span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Hourly Operating Cost (USD)</label>
            <input
              v-model.number="form.hourly_operating_cost"
              type="number"
              min="0"
              step="0.01"
              class="form-input"
              placeholder="0.00"
            />
            <span v-if="formErrors.hourly_operating_cost" class="form-error">
              {{ Array.isArray(formErrors.hourly_operating_cost) ? formErrors.hourly_operating_cost[0] : formErrors.hourly_operating_cost }}
            </span>
          </div>

          <div class="form-group">
            <label class="form-label">Dependent Vendors</label>
            <div class="vendor-select-box">
              <div v-if="vendorList.length === 0" class="vendor-empty">No vendors available.</div>
              <label
                v-for="v in vendorList"
                :key="v.id"
                class="vendor-check-item"
              >
                <input
                  type="checkbox"
                  :value="v.id"
                  v-model="form.dependent_vendors"
                  class="check-input"
                />
                <span class="v-name">{{ v.name }}</span>
                <span class="v-industry">{{ v.industry }}</span>
              </label>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="closeModal" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting" class="spinner"></span>
              {{ submitting ? 'Saving...' : editingProcess ? 'Update Process' : 'Create Process' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <DeleteConfirmationModal
      v-if="showDeleteModal"
      :item-name="processToDelete?.name"
      title="Delete Business Process"
      confirm-text="Confirm Delete"
      @close="showDeleteModal = false"
      @confirm="handleDelete"
    >
      <template #description>
        Deleting <strong>{{ processToDelete?.name }}</strong> will remove it from all dependency
        maps and simulation cascading impact calculations.
      </template>
    </DeleteConfirmationModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import simulationService from '../services/simulationService'
import vendorService from '../services/vendorService'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal.vue'
import { Plus, Edit, Trash2, X, Workflow } from 'lucide-vue-next'

const toast = useToast()

const loading = ref(false)
const submitting = ref(false)
const processes = ref([])
const vendorList = ref([])
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingProcess = ref(null)
const processToDelete = ref(null)
const formErrors = ref({})

const defaultForm = () => ({
  name: '',
  description: '',
  department: '',
  criticality_level: 3,
  hourly_operating_cost: 0,
  dependent_vendors: [],
})

const form = ref(defaultForm())

// --- Computed ---
const avgCriticality = computed(() => {
  if (!processes.value.length) return '0.0'
  const total = processes.value.reduce((s, p) => s + (p.criticality_level || 0), 0)
  return (total / processes.value.length).toFixed(1)
})

const totalHourlyCost = computed(() =>
  processes.value.reduce((s, p) => s + (parseFloat(p.hourly_operating_cost) || 0), 0),
)

// --- Helpers ---
const getCritClass = (level) => {
  if (level >= 5) return 'critical'
  if (level >= 4) return 'high'
  if (level >= 3) return 'medium'
  return 'low'
}

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return new Intl.NumberFormat('en-US').format(num)
}

// --- Data Fetching ---
const fetchProcesses = async () => {
  loading.value = true
  try {
    const data = await simulationService.getProcesses()
    processes.value = Array.isArray(data) ? data : data?.results || []
  } catch (err) {
    toast.error(err.response?.data?.error || 'Failed to load business processes')
  } finally {
    loading.value = false
  }
}

const fetchVendors = async () => {
  try {
    const data = await vendorService.getVendors()
    vendorList.value = Array.isArray(data) ? data : data?.results || []
  } catch {
    // Non-critical — vendor list for linking
  }
}

// --- Modal Helpers ---
const openCreateModal = () => {
  editingProcess.value = null
  form.value = defaultForm()
  formErrors.value = {}
  showModal.value = true
}

const openEditModal = (proc) => {
  editingProcess.value = proc
  form.value = {
    name: proc.name || '',
    department: proc.department || '',
    criticality_level: proc.criticality_level || 3,
    hourly_operating_cost: parseFloat(proc.hourly_operating_cost) || 0,
    dependent_vendors: (proc.dependent_vendors || []).map((v) =>
      typeof v === 'object' ? v.id : v,
    ),
  }
  formErrors.value = {}
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingProcess.value = null
  form.value = defaultForm()
  formErrors.value = {}
}

// --- CRUD ---
const handleSubmit = async () => {
  formErrors.value = {}
  submitting.value = true
  try {
    if (editingProcess.value) {
      await simulationService.updateProcess(editingProcess.value.id, form.value)
      toast.success('Process updated successfully!')
    } else {
      await simulationService.createProcess(form.value)
      toast.success('Process created successfully!')
    }
    closeModal()
    await fetchProcesses()
  } catch (err) {
    const data = err.response?.data
    if (err.response?.status === 400 && data && typeof data === 'object' && !data.error) {
      formErrors.value = data
    } else {
      toast.error(data?.error || data?.detail || 'Failed to save process')
    }
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (proc) => {
  processToDelete.value = proc
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!processToDelete.value) return
  try {
    await simulationService.deleteProcess(processToDelete.value.id)
    toast.success('Process deleted')
    showDeleteModal.value = false
    processToDelete.value = null
    await fetchProcesses()
  } catch (err) {
    toast.error(err.response?.data?.error || 'Failed to delete process')
  }
}

onMounted(async () => {
  await Promise.all([fetchProcesses(), fetchVendors()])
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
}
.container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 24px 100px;
}

/* Header */
.page-header { padding: 48px 0 40px; animation: fadeIn 0.5s ease-out; }
.header-content { display: flex; justify-content: space-between; align-items: flex-end; gap: 32px; }
.header-text { flex: 1; }
.header-badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white; border-radius: 12px; font-size: 11px; font-weight: 800;
  text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(59,130,246,0.25);
}
.badge-icon { width: 14px; height: 14px; }
.page-title { font-size: 44px; font-weight: 900; color: #0f172a; line-height: 1.1; letter-spacing: -0.03em; margin: 0 0 10px; }
.page-subtitle { font-size: 16px; color: #64748b; font-weight: 500; margin: 0; }
.header-actions { display: flex; gap: 12px; }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 14px 24px; border-radius: 14px; font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all 0.2s; border: none; text-decoration: none;
}
.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white; box-shadow: 0 4px 14px rgba(59,130,246,0.3);
}
.btn-primary:hover { box-shadow: 0 6px 20px rgba(59,130,246,0.4); transform: translateY(-2px); }
.btn-secondary { background: white; color: #475569; border: 2px solid #e2e8f0; }
.btn-secondary:hover { background: #f8fafc; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
.icon-sm { width: 18px; height: 18px; }
.icon-xs { width: 16px; height: 16px; }

/* Loading / Empty */
.loading-zone { display: flex; justify-content: center; padding: 120px 0; }
.empty-state { text-align: center; padding: 80px 0; }
.empty-illustration { position: relative; width: 80px; height: 80px; margin: 0 auto 24px; display: flex; align-items: center; justify-content: center; }
.pulse-ring { position: absolute; border-radius: 50%; animation: pulse 2s infinite; }
.pulse-ring.primary { width: 80px; height: 80px; border: 2px solid rgba(59,130,246,0.2); }
.illustration-icon { width: 36px; height: 36px; color: #3b82f6; position: relative; z-index: 1; }
.empty-title { font-size: 24px; font-weight: 900; color: #0f172a; margin: 0 0 12px; }
.empty-description { font-size: 15px; color: #64748b; max-width: 400px; margin: 0 auto 28px; }

/* Table */
.table-wrapper {
  background: white; border-radius: 24px; border: 2px solid #e2e8f0;
  overflow-x: auto; animation: fadeIn 0.5s ease-out 0.1s both;
  -webkit-overflow-scrolling: touch;
}
.process-table { width: 100%; border-collapse: collapse; }
.process-table thead { background: #f8fafc; }
.process-table th {
  padding: 16px 24px; text-align: left; font-size: 11px; font-weight: 900;
  color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em;
  border-bottom: 2px solid #e2e8f0;
}
.table-row { transition: background 0.15s; }
.table-row:hover { background: #f8fafc; }
.process-table td { padding: 18px 24px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
.process-table tr:last-child td { border-bottom: none; }

.proc-name { font-weight: 800; color: #0f172a; font-size: 15px; }
.dept-badge { padding: 4px 10px; background: #f1f5f9; color: #475569; border-radius: 8px; font-size: 12px; font-weight: 700; }
.cost-val { font-weight: 700; color: #f97316; }
.vendor-count { color: #3b82f6; font-weight: 700; font-size: 13px; }

/* Criticality bar */
.crit-bar-wrap { display: flex; align-items: center; gap: 10px; }
.crit-bar { height: 6px; border-radius: 3px; transition: width 0.3s; flex-shrink: 0; max-width: 80px; }
.crit-bar.low { background: #10b981; }
.crit-bar.medium { background: #f59e0b; }
.crit-bar.high { background: #f97316; }
.crit-bar.critical { background: #ef4444; }
.crit-label { font-size: 12px; font-weight: 800; color: #64748b; white-space: nowrap; }

/* Actions */
.action-group { display: flex; gap: 8px; }
.action-btn {
  width: 36px; height: 36px; border-radius: 10px; border: 2px solid #e2e8f0;
  background: white; cursor: pointer; display: flex; align-items: center;
  justify-content: center; transition: all 0.2s;
}
.action-btn.edit:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
.action-btn.delete:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

/* Footer Stats */
.fleet-stats {
  margin-top: 32px; display: flex; gap: 40px; justify-content: center;
  padding: 24px; background: white; border-radius: 20px; border: 2px solid #e2e8f0;
  animation: fadeIn 0.5s ease-out 0.2s both;
}
.f-stat { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.f-label { font-size: 11px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; }
.f-val { font-size: 20px; font-weight: 900; color: #0f172a; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 24px;
}
.modal-container {
  background: white; border-radius: 20px; width: 100%; max-width: 680px;
  max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.25);
}
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 24px; border-bottom: 1px solid #e2e8f0;
  position: sticky; top: 0; background: white; z-index: 10;
}
.modal-header h2 { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
.close-btn { background: #f1f5f9; border: none; border-radius: 8px; padding: 8px; cursor: pointer; color: #64748b; }
.close-btn:hover { background: #e2e8f0; color: #0f172a; }
.icon { width: 20px; height: 20px; }
.modal-body { padding: 24px; }

/* Form */
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-group { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
.form-label { font-size: 13px; font-weight: 700; color: #334155; }
.form-input {
  padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 12px;
  font-size: 14px; font-weight: 500; color: #1e293b; transition: border-color 0.2s;
  background: white;
}
.form-input:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.form-input.error { border-color: #ef4444; }
.form-error { font-size: 12px; color: #ef4444; font-weight: 600; }

/* Vendor multi-select box */
.vendor-select-box {
  border: 2px solid #e2e8f0; border-radius: 12px; max-height: 220px;
  overflow-y: auto; background: #f8fafc;
}
.vendor-empty { padding: 24px; text-align: center; color: #94a3b8; font-size: 13px; }
.vendor-check-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 16px; border-bottom: 1px solid #e2e8f0;
  cursor: pointer; transition: background 0.15s;
}
.vendor-check-item:last-child { border-bottom: none; }
.vendor-check-item:hover { background: #eff6ff; }
.check-input { width: 16px; height: 16px; accent-color: #3b82f6; cursor: pointer; }
.v-name { font-size: 14px; font-weight: 700; color: #1e293b; flex: 1; }
.v-industry { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; }

.modal-footer {
  display: flex; justify-content: flex-end; gap: 12px;
  padding-top: 24px; border-top: 1px solid #e2e8f0; margin-top: 8px;
}

.spinner {
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.15; }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .form-row { grid-template-columns: 1fr; }
  .page-title { font-size: 32px; }
  .header-content { flex-direction: column; align-items: flex-start; gap: 20px; }
}

@media (max-width: 640px) {
  .container { padding: 0 16px 80px; }
  .page-title { font-size: 28px; }
  .page-header { padding: 28px 0 24px; }
  .header-actions { width: 100%; }
  .header-actions .btn { width: 100%; justify-content: center; }
  .fleet-stats { flex-direction: column; gap: 16px; align-items: center; }
  .modal-overlay { align-items: flex-end; padding: 0; }
  .modal-container { border-radius: 20px 20px 0 0; max-width: 100%; max-height: 92vh; }
  .modal-header { padding: 20px 16px; }
  .modal-body { padding: 16px; }
  .modal-footer { flex-direction: column-reverse; gap: 8px; }
  .modal-footer .btn { width: 100%; justify-content: center; padding: 14px; }
}

@media (max-width: 480px) {
  .container { padding: 0 12px 80px; }
  .page-title { font-size: 24px; }
  .process-table th,
  .process-table td { padding: 12px 16px; }
}

@media (max-width: 375px) {
  .container { padding: 0 10px 80px; }
  .page-title { font-size: 22px; }
}
</style>
