<template>
  <div class="page-wrapper">
    <NavBar />
    <div class="settings-page">
      <div class="container">
        <!-- Header -->
        <header class="page-header">
          <router-link to="/profile" class="back-link">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M10 12L6 8l4-4" />
            </svg>
            <span>Back to Profile</span>
          </router-link>
          <h1 class="page-title">Organization Settings</h1>
          <p class="page-subtitle">Manage your organization's core information and team access</p>
        </header>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <div class="spinner-large"></div>
          <p class="loading-text">Loading organization details...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="!organization" class="error-container">
          <div class="error-icon-wrapper">
            <AlertTriangle class="error-icon" />
          </div>
          <h2 class="error-title">Organization Not Found</h2>
          <p class="error-description">You don't seem to be associated with an organization.</p>
          <router-link to="/dashboard" class="btn btn-primary"> Return to Dashboard </router-link>
        </div>

        <!-- Settings Content -->
        <div v-else class="settings-grid">
          <!-- Main Form -->
          <div class="main-column">
            <div class="settings-card">
              <div class="card-header">
                <h2 class="card-title">General Information</h2>
                <p class="card-subtitle">Update your organization's basic details</p>
              </div>

              <form @submit.prevent="handleUpdate" class="settings-form">
                <div class="form-group">
                  <label class="form-label">Organization Name</label>
                  <input
                    v-model="form.name"
                    type="text"
                    class="form-input"
                    placeholder="Enter organization name"
                    required
                  />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Industry</label>
                    <input
                      v-model="form.industry"
                      type="text"
                      class="form-input"
                      placeholder="e.g., Technology, Healthcare"
                      required
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Country</label>
                    <input
                      v-model="form.country"
                      type="text"
                      class="form-input"
                      placeholder="e.g., United States"
                      required
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Organization Size</label>
                  <select v-model="form.size" class="form-select" required>
                    <option value="" disabled>Select organization size</option>
                    <option value="Small">Small (1-50 employees)</option>
                    <option value="Medium">Medium (51-250 employees)</option>
                    <option value="Large">Large (251-1000 employees)</option>
                    <option value="Enterprise">Enterprise (1000+ employees)</option>
                  </select>
                </div>

                <div class="form-actions">
                  <button type="submit" class="btn btn-primary btn-lg" :disabled="saving">
                    <span v-if="!saving">Save Changes</span>
                    <span v-else class="flex items-center gap-2">
                      <div class="spinner-sm"></div>
                      Saving Changes...
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Sidebar -->
          <div class="sidebar-column">
            <!-- Stats Card -->
            <div class="stats-card">
              <div class="card-header">
                <h2 class="card-title">Organization Overview</h2>
              </div>

              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-icon members">
                    <Users class="icon-sm" />
                  </div>
                  <div class="stat-content">
                    <span class="stat-label">Total Members</span>
                    <span class="stat-value">{{ organization.user_count || 0 }}</span>
                  </div>
                </div>

                <div class="stat-item">
                  <div class="stat-icon vendors">
                    <svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div class="stat-content">
                    <span class="stat-label">Registered Vendors</span>
                    <span class="stat-value">{{ organization.vendor_count || 0 }}</span>
                  </div>
                </div>

                <div class="stat-item">
                  <div class="stat-icon date">
                    <svg class="icon-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div class="stat-content">
                    <span class="stat-label">Created On</span>
                    <span class="stat-value">{{ formatDate(organization.created_at) }}</span>
                  </div>
                </div>
              </div>

              <div class="card-actions">
                <router-link to="/organization/members" class="action-button primary">
                  <Users class="icon-sm" />
                  <span>Manage Members</span>
                </router-link>
                <router-link to="/organization/requests" class="action-button secondary">
                  <UserPlus class="icon-sm" />
                  <span>Join Requests</span>
                </router-link>
              </div>
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
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
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

    // Show success notification (you can implement a toast system)
    console.log('Organization updated successfully')
  } catch (error) {
    console.error('Update failed:', error)
    // Show error notification
  } finally {
    saving.value = false
  }
}

onMounted(fetchOrg)
</script>

<style scoped>
/* Base Layout */
.page-wrapper {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
}

.settings-page {
  padding: 48px 0 100px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Header */
.page-header {
  margin-bottom: 48px;
  animation: fadeIn 0.5s ease-out;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 20px;
  padding: 8px 12px;
  border-radius: 10px;
  transition: all 0.2s;
}

.back-link:hover {
  background: #eff6ff;
  gap: 12px;
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
  font-size: 17px;
  color: #64748b;
  font-weight: 500;
  line-height: 1.6;
  margin: 0;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 40px;
  animation: fadeIn 0.6s ease-out 0.1s both;
}

.spinner-large {
  width: 56px;
  height: 56px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 24px;
}

.loading-text {
  font-size: 16px;
  font-weight: 600;
  color: #64748b;
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 40px;
  animation: fadeIn 0.6s ease-out 0.1s both;
}

.error-icon-wrapper {
  width: 100px;
  height: 100px;
  background: #fef2f2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
}

.error-icon {
  width: 48px;
  height: 48px;
  color: #ef4444;
}

.error-title {
  font-size: 32px;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 16px 0;
}

.error-description {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 32px 0;
}

/* Settings Grid */
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 480px;
  gap: 32px;
  animation: fadeIn 0.6s ease-out 0.1s both;
}

/* Settings Card */
.settings-card {
  background: white;
  border-radius: 32px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
}

.card-header {
  padding: 32px 40px;
  border-bottom: 2px solid #f1f5f9;
}

.card-title {
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 6px 0;
  letter-spacing: -0.02em;
}

.card-subtitle {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
  margin: 0;
}

/* Form */
.settings-form {
  padding: 40px;
}

.form-group {
  margin-bottom: 28px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 800;
  color: #334155;
  margin-bottom: 10px;
  letter-spacing: -0.01em;
}

.form-input,
.form-select {
  width: 100%;
  padding: 16px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
  background: white;
  transition: all 0.2s;
}

.form-input::placeholder {
  color: #94a3b8;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 18px;
  padding-right: 48px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-actions {
  margin-top: 32px;
  padding-top: 32px;
  border-top: 2px solid #f1f5f9;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 14px;
  font-size: 15px;
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

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-lg {
  padding: 18px 36px;
  font-size: 16px;
}

.btn-block {
  width: 100%;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(239, 68, 68, 0.3);
}

.btn-danger:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4);
  transform: translateY(-2px);
}

.icon-sm {
  width: 18px;
  height: 18px;
}

/* Spinner */
.spinner-sm {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Stats Card */
.stats-card {
  background: white;
  border-radius: 32px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
}

.stats-grid {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.members {
  background: #eff6ff;
  color: #3b82f6;
}

.stat-icon.vendors {
  background: #f0fdf4;
  color: #10b981;
}

.stat-icon.date {
  background: #fef3c7;
  color: #f59e0b;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.stat-label {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-size: 24px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.card-actions {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 2px solid #f1f5f9;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
}

.action-button.primary {
  background: #eff6ff;
  color: #2563eb;
  border: 2px solid #dbeafe;
}

.action-button.primary:hover {
  background: #dbeafe;
  transform: translateY(-2px);
}

.action-button.secondary {
  background: #f8fafc;
  color: #475569;
  border: 2px solid #e2e8f0;
}

.action-button.secondary:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-2px);
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
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .sidebar-column {
    order: -1;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 16px;
  }

  .settings-page {
    padding: 32px 0 80px;
  }

  .page-title {
    font-size: 36px;
  }

  .page-subtitle {
    font-size: 15px;
  }

  .settings-card,
  .stats-card {
    border-radius: 24px;
  }

  .card-header,
  .settings-form {
    padding-left: 24px;
    padding-right: 24px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    padding: 20px;
  }

  .card-actions {
    padding: 20px;
  }
}
</style>
