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

            <div class="card mt-4 danger-zone">
              <h2>Danger Zone</h2>
              <p class="text-muted small">
                Once you delete an organization, there is no going back. Please be certain.
              </p>
              <button class="btn btn-danger btn-block mt-3" disabled>Delete Organization</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCoreStore } from '../stores/core'
import NavBar from '../components/common/NavBar.vue'
import { AlertTriangle, Users, UserPlus } from 'lucide-vue-next'

const coreStore = useCoreStore()
const loading = ref(true)
const saving = ref(false)
const organization = ref(null)

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

.danger-zone h2 {
  color: #ef4444;
}

@media (max-width: 768px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
}
</style>
