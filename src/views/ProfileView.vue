<template>
  <div class="page-wrapper">
    <NavBar />
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-text">
            <div class="header-badge">
              <User class="badge-icon" />
              <span>Identity Hub</span>
            </div>
            <h1 class="page-title">User Profile</h1>
            <p class="page-subtitle">
              Manage your operational credentials and organizational standing.
            </p>
          </div>
        </div>
      </header>

      <div class="main-grid">
        <!-- Personal Information -->
        <section class="info-card">
          <div class="info-header">
            <h2 class="header-title">
              <div class="icon-bg primary"><CircleUserRound class="icon-xs" /></div>
              Biometrics & Personnel
            </h2>
            <button v-if="!isEditing" @click="startEditing" class="btn btn-outline btn-xs">
              Modify
            </button>
          </div>

          <div class="info-body">
            <form v-if="isEditing" @submit.prevent="handleUpdateProfile">
              <div class="form-vertical">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">First Name</label>
                    <input
                      v-model="editForm.first_name"
                      type="text"
                      class="form-input"
                      :disabled="!isManager"
                    />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Last Name</label>
                    <input
                      v-model="editForm.last_name"
                      type="text"
                      class="form-input"
                      :disabled="!isManager"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Contact Baseline (Phone)</label>
                  <input v-model="editForm.phone" type="text" class="form-input" />
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label">Department</label>
                    <input v-model="editForm.department" type="text" class="form-input" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Job Title</label>
                    <input v-model="editForm.job_title" type="text" class="form-input" />
                  </div>
                </div>

                <div class="form-actions-dock">
                  <button
                    type="button"
                    @click="cancelEditing"
                    class="btn btn-ghost"
                    :disabled="coreStore.loading"
                  >
                    Revert
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="coreStore.loading">
                    {{ coreStore.loading ? 'Syncing...' : 'Apply Changes' }}
                  </button>
                </div>
              </div>
            </form>

            <div v-else class="v-list">
              <div class="v-item no-hover">
                <div class="v-info">
                  <span class="v-title">Email Protocol</span>
                  <span class="v-sub">{{ currentUser?.email }}</span>
                </div>
                <div class="v-meta">
                  <span v-if="currentUser?.is_verified" class="badge-pill success">Verified</span>
                  <span v-else class="badge-pill warning">Pending</span>
                </div>
              </div>
              <div class="v-item no-hover">
                <div class="v-info">
                  <span class="v-title">Personnel Name</span>
                  <span class="v-sub"
                    >{{ currentUser?.first_name }} {{ currentUser?.last_name }}</span
                  >
                </div>
              </div>
              <div class="v-item no-hover">
                <div class="v-info">
                  <span class="v-title">Contact Line</span>
                  <span class="v-sub">{{ currentUser?.profile?.phone || 'Not defined' }}</span>
                </div>
              </div>
              <div class="v-item no-hover">
                <div class="v-info">
                  <span class="v-title">Duty Assignment</span>
                  <span class="v-sub"
                    >{{ currentUser?.profile?.job_title || 'N/A' }} |
                    {{ currentUser?.profile?.department || 'N/A' }}</span
                  >
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="sidebar">
          <!-- Organization & Role -->
          <section class="info-card mb-8">
            <div class="info-header">
              <h2 class="header-title">
                <div class="icon-bg warning"><ShieldCheck class="icon-xs" /></div>
                Command Standing
              </h2>
            </div>
            <div class="info-body">
              <div class="v-list">
                <div class="v-item no-hover">
                  <div class="v-info">
                    <span class="v-title">Organization</span>
                    <span class="v-sub">{{
                      currentUser?.profile?.organization_name || 'Autonomous'
                    }}</span>
                  </div>
                </div>
                <div class="v-item no-hover">
                  <div class="v-info">
                    <span class="v-title">Clearance Level</span>
                    <span class="v-sub capitalize badge-pill" :class="currentUser?.profile?.role">
                      {{ userRole }}
                    </span>
                  </div>
                </div>
              </div>

              <div v-if="currentUser?.profile?.organization" class="mt-8">
                <router-link
                  v-if="isManager"
                  to="/organization/settings"
                  class="btn btn-outline btn-full"
                >
                  <span>Strategic Controls</span>
                </router-link>
              </div>
              <div v-else class="mt-8">
                <router-link to="/dashboard" class="btn btn-primary btn-full">
                  <span>Initiate Affiliation</span>
                </router-link>
              </div>
            </div>
          </section>

          <!-- Change Password -->
          <section class="info-card">
            <div class="info-header">
              <h2 class="header-title">
                <div class="icon-bg primary"><Lock class="icon-xs" /></div>
                Cipher Rotation
              </h2>
            </div>
            <div class="info-body">
              <form @submit.prevent="handleChangePassword">
                <div class="form-group">
                  <label class="form-label">Current Cipher</label>
                  <div class="password-toggle-wrapper">
                    <input
                      v-model="passwordForm.old_password"
                      :type="showOldPassword ? 'text' : 'password'"
                      class="form-input"
                      placeholder="••••••••"
                      required
                    />
                    <button type="button" @click="showOldPassword = !showOldPassword" class="t-btn">
                      <Eye v-if="!showOldPassword" />
                      <EyeOff v-else />
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">New Sequence</label>
                  <div class="password-toggle-wrapper">
                    <input
                      v-model="passwordForm.new_password"
                      :type="showNewPassword ? 'text' : 'password'"
                      class="form-input"
                      placeholder="••••••••"
                      required
                    />
                    <button type="button" @click="showNewPassword = !showNewPassword" class="t-btn">
                      <Eye v-if="!showNewPassword" />
                      <EyeOff v-else />
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Confirm New Sequence</label>
                  <div class="password-toggle-wrapper">
                    <input
                      v-model="passwordForm.confirm_password"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      class="form-input"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      @click="showConfirmPassword = !showConfirmPassword"
                      class="t-btn"
                    >
                      <Eye v-if="!showConfirmPassword" />
                      <EyeOff v-else />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary btn-full mt-4"
                  :disabled="authStore.loading"
                >
                  {{ authStore.loading ? 'Updating...' : 'Rotate Cipher' }}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useCoreStore } from '../stores/core'
import NavBar from '../components/common/NavBar.vue'
import { validatePassword, validatePasswordMatch } from '../utils/validators'
import { Eye, EyeOff, User, ShieldCheck, Lock, CircleUserRound } from 'lucide-vue-next'

const authStore = useAuthStore()
const coreStore = useCoreStore()

const isEditing = ref(false)
const editForm = ref({
  first_name: '',
  last_name: '',
  phone: '',
  department: '',
  job_title: '',
})

const passwordForm = ref({
  old_password: '',
  new_password: '',
  confirm_password: '',
})

const passwordErrors = ref({})
const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const currentUser = computed(() => coreStore.currentUser)

const userRole = computed(() => {
  const role = currentUser.value?.profile?.role || 'viewer'
  return role.charAt(0).toUpperCase() + role.slice(1)
})

const isManager = computed(() => ['admin', 'manager'].includes(currentUser.value?.profile?.role))

const startEditing = () => {
  const user = currentUser.value
  editForm.value = {
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.profile?.phone || '',
    department: user?.profile?.department || '',
    job_title: user?.profile?.job_title || '',
  }
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
}

const handleUpdateProfile = async () => {
  try {
    const promises = []

    // 1. Update Profile Fields (Phone, Department, Job Title)
    // These go to /core/users/me/update/
    const profilePayload = {
      phone: editForm.value.phone,
      department: editForm.value.department,
      job_title: editForm.value.job_title,
    }
    promises.push(coreStore.updateCurrentUser(profilePayload))

    // 2. Update Names (Admins and Managers only)
    // These go to /core/admin/edit/
    if (isManager.value) {
      const namePayload = {
        first_name: editForm.value.first_name,
        last_name: editForm.value.last_name,
      }
      promises.push(coreStore.adminUpdateName(namePayload))
    }

    await Promise.all(promises)
    isEditing.value = false
  } catch (error) {
    console.error('Update profile failed:', error)
  }
}

const validatePasswordForm = () => {
  passwordErrors.value = {}
  let isValid = true

  if (!passwordForm.value.old_password) {
    passwordErrors.value.old_password = 'Current password is required'
    isValid = false
  }

  const passwordError = validatePassword(passwordForm.value.new_password)
  if (passwordError) {
    passwordErrors.value.new_password = passwordError
    isValid = false
  }

  const passwordMatchError = validatePasswordMatch(
    passwordForm.value.new_password,
    passwordForm.value.confirm_password,
  )
  if (passwordMatchError) {
    passwordErrors.value.confirm_password = passwordMatchError
    isValid = false
  }

  return isValid
}

const handleChangePassword = async () => {
  if (!validatePasswordForm()) return

  try {
    await authStore.changePassword(passwordForm.value.old_password, passwordForm.value.new_password)
    // Reset form
    passwordForm.value = {
      old_password: '',
      new_password: '',
      confirm_password: '',
    }
    // Reset visibility states
    showOldPassword.value = false
    showNewPassword.value = false
    showConfirmPassword.value = false
  } catch (error) {
    console.error('Change password failed:', error)
  }
}

onMounted(async () => {
  await coreStore.fetchCurrentUser()
})
</script>

<style scoped>
/* Base Layout */
.page-wrapper {
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
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25);
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

/* Main Grid */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 32px;
  margin-bottom: 56px;
  animation: fadeIn 0.6s ease-out 0.2s both;
}

.info-card {
  background: white;
  border-radius: 32px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
  height: fit-content;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 32px;
  border-bottom: 2px solid #f1f5f9;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.icon-bg {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.icon-bg.warning {
  background: #fff7ed;
  color: #f97316;
}
.icon-bg.primary {
  background: #eff6ff;
  color: #3b82f6;
}

/* V-List Pattern */
.v-list {
  display: flex;
  flex-direction: column;
}

.v-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 2px solid #f1f5f9;
}

.v-item:last-child {
  border-bottom: none;
}

.v-item.no-hover {
  cursor: default;
}

.v-title {
  display: block;
  font-size: 11px;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}

.v-sub {
  font-size: 16px;
  color: #1e293b;
  font-weight: 700;
}

.badge-pill {
  font-size: 11px;
  font-weight: 900;
  padding: 6px 14px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.badge-pill.success {
  background: #ecfdf5;
  color: #059669;
}

.badge-pill.warning {
  background: #fffbeb;
  color: #d97706;
}

.badge-pill.admin {
  background: #fee2e2;
  color: #ef4444;
}

.badge-pill.manager {
  background: #fff7ed;
  color: #f97316;
}

/* Forms */
.info-body {
  padding: 32px 40px;
}

.form-vertical {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  margin-bottom: 28px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 12px;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 10px;
  letter-spacing: 0.06em;
}

.form-input {
  width: 100%;
  padding: 16px 18px;
  border-radius: 14px;
  border: 2px solid #e2e8f0;
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  transition: all 0.2s;
  background: white;
}

.form-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  outline: none;
}

.form-input:disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

.password-toggle-wrapper {
  position: relative;
}
.t-btn {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
}

.form-actions-dock {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 28px;
  border-top: 2px solid #f1f5f9;
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

.btn-primary:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: white;
  color: #475569;
  border: 2px solid #e2e8f0;
}

.btn-outline:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.btn-ghost {
  background: transparent;
  color: #64748b;
  border: 2px solid transparent;
}

.btn-ghost:hover:not(:disabled) {
  background: #f1f5f9;
  color: #475569;
}

.btn-full {
  width: 100%;
  justify-content: center;
}

.btn-xs {
  padding: 8px 16px;
  font-size: 13px;
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

@media (max-width: 1100px) {
  .main-grid {
    grid-template-columns: 1fr;
  }
}

.mb-8 {
  margin-bottom: 32px;
}
.mt-8 {
  margin-top: 32px;
}
.mt-4 {
  margin-top: 16px;
}
.capitalize {
  text-transform: capitalize;
}
</style>
