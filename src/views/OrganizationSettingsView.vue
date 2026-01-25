<template>
  <div>
    <NavBar />
    <div class="settings-page">
      <div class="container">
        <div class="settings-header">
          <router-link to="/profile" class="back-link">← Back to Profile</router-link>
          <h1>Organization Settings</h1>
          <p class="text-muted">Manage your organization's core information</p>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading organization details...</p>
        </div>

        <div v-else-if="!organization" class="error-state">
          <AlertTriangle class="error-icon" />
          <h2>Organization Not Found</h2>
          <p>You don't seem to be associated with an organization.</p>
          <router-link to="/dashboard" class="btn btn-primary mt-4">Go to Dashboard</router-link>
        </div>

        <div v-else class="settings-grid">
          <div class="card main-form">
            <h2>General Information</h2>
            <form @submit.prevent="handleUpdate" class="mt-4">
              <div class="form-group">
                <label class="form-label">Organization Name</label>
                <input v-model="form.name" type="text" class="form-input" required />
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Industry</label>
                  <input v-model="form.industry" type="text" class="form-input" required />
                </div>
                <div class="form-group">
                  <label class="form-label">Country</label>
                  <input v-model="form.country" type="text" class="form-input" required />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Organization Size</label>
                <select v-model="form.size" class="form-input" required>
                  <option value="Small">Small (1-50 employees)</option>
                  <option value="Medium">Medium (51-250 employees)</option>
                  <option value="Large">Large (251-1000 employees)</option>
                  <option value="Enterprise">Enterprise (1000+ employees)</option>
                </select>
              </div>

              <div class="form-actions mt-4">
                <button type="submit" class="btn btn-primary" :disabled="saving">
                  {{ saving ? 'Saving Changes...' : 'Save Changes' }}
                </button>
              </div>
            </form>
          </div>

          <div class="side-info">
            <div class="card">
              <h2>Quotas & Stats</h2>
              <div class="stats-list mt-3">
                <div class="stat-item">
                  <span class="stat-label">Total Members</span>
                  <span class="stat-value">{{ organization.user_count }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Registered Vendors</span>
                  <span class="stat-value">{{ organization.vendor_count }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Created on</span>
                  <span class="stat-value">{{ formatDate(organization.created_at) }}</span>
                </div>
              </div>
              <div class="mt-4">
                <router-link to="/organization/members" class="btn btn-outline btn-block">
                  <Users class="icon" />
                  Manage Members
                </router-link>
                <router-link to="/organization/requests" class="btn btn-outline btn-block mt-2">
                  <UserPlus class="icon" />
                  Join Requests
                </router-link>
              </div>
            </div>

            <div class="card mt-6 danger-zone-premium glass shadow-lg border-red-100">
              <div class="flex items-center gap-3 mb-6">
                <div class="dz-icon-bg"><Trash2 class="icon-sm" /></div>
                <h2 class="text-xl font-black text-slate-900">Danger Zone</h2>
              </div>
              <p class="text-slate-500 text-sm leading-relaxed mb-8">
                Purging an entire organization is a
                <span class="text-red-600 font-bold">critical operation</span>. All associated
                vendors, simulations, and user profiles will be immediately disconnected.
              </p>
              <button
                @click="showDeleteOrgModal = true"
                class="btn btn-danger btn-block py-4 font-black shadow-xl"
              >
                Initialize Organization Purge
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <DeleteConfirmationModal
      v-if="showDeleteOrgModal"
      :item-name="organization?.name"
      title="Purge Active Organization"
      confirm-text="Initialize Permanent Purge"
      @close="showDeleteOrgModal = false"
      @confirm="handleOrgDelete"
    >
      <template #description>
        You are about to permanently purge <strong>{{ organization?.name }}</strong
        >. This operation is restricted to system administrators and cannot be undone.
      </template>
    </DeleteConfirmationModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCoreStore } from '../stores/core'
import NavBar from '../components/common/NavBar.vue'
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal.vue'
import { AlertTriangle, Users, UserPlus, Trash2 } from 'lucide-vue-next'

const coreStore = useCoreStore()
const loading = ref(true)
const saving = ref(false)
const organization = ref(null)
const showDeleteOrgModal = ref(false)

const form = ref({
  name: '',
  industry: '',
  size: '',
  country: '',
})

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const fetchOrg = async () => {
  try {
    loading.value = true
    const data = await coreStore.fetchOrganization()
    organization.value = data
    form.value = {
      name: data.name,
      industry: data.industry,
      size: data.size,
      country: data.country,
    }
  } catch (error) {
    console.error('Failed to fetch org:', error)
  } finally {
    loading.value = false
  }
}

const handleUpdate = async () => {
  try {
    saving.value = true
    const updated = await coreStore.updateOrganization(form.value)
    organization.value = updated
  } catch (error) {
    console.error('Update failed:', error)
  } finally {
    saving.value = false
  }
}

const handleOrgDelete = () => {
  alert('For security reasons, organization deletion must be requested via support.')
  showDeleteOrgModal.value = false
}

onMounted(fetchOrg)
</script>

<style scoped>
.settings-page {
  min-height: calc(100vh - 72px);
  padding: 40px 0;
  background: #f5f7fa;
}

.settings-header {
  margin-bottom: 32px;
}

.back-link {
  display: block;
  margin-bottom: 16px;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
}

.settings-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.settings-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 60px;
}

.error-icon {
  width: 64px;
  height: 64px;
  color: #ef4444;
  margin-bottom: 16px;
}

.stats-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.stat-label {
  color: #6b7280;
  font-size: 14px;
}

.stat-value {
  font-weight: 600;
  color: #1f2937;
}

.icon {
  width: 18px;
  height: 18px;
}

/* Danger Zone Premium */
.danger-zone-premium {
  border: 1px solid #fee2e2;
  background: white;
}
.dz-icon-bg {
  width: 32px;
  height: 32px;
  background: #fee2e2;
  color: #ef4444;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
