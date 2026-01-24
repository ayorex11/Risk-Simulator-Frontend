<template>
  <div>
    <NavBar />
    <div class="profile-page">
      <div class="container">
        <div class="profile-header">
          <h1>Profile</h1>
          <p class="text-muted">Manage your account and organization settings</p>
        </div>

        <div class="profile-grid">
          <!-- Profile Information -->
          <div class="card">
            <div class="card-header-flex">
              <h2>Personal Information</h2>
              <button v-if="!isEditing" @click="startEditing" class="btn btn-secondary btn-sm">
                Edit Profile
              </button>
            </div>

            <form v-if="isEditing" @submit.prevent="handleUpdateProfile" class="mt-3">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">First Name</label>
                  <input v-model="editForm.first_name" type="text" class="form-input" disabled />
                  <span class="form-hint">Contact admin to change name</span>
                </div>
                <div class="form-group">
                  <label class="form-label">Last Name</label>
                  <input v-model="editForm.last_name" type="text" class="form-input" disabled />
                </div>
                <div class="form-group">
                  <label class="form-label">Phone</label>
                  <input v-model="editForm.phone" type="text" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">Department</label>
                  <input v-model="editForm.department" type="text" class="form-input" />
                </div>
                <div class="form-group">
                  <label class="form-label">Job Title</label>
                  <input v-model="editForm.job_title" type="text" class="form-input" />
                </div>
              </div>

              <div class="form-actions mt-4">
                <button
                  type="button"
                  @click="cancelEditing"
                  class="btn btn-secondary"
                  :disabled="coreStore.loading"
                >
                  Cancel
                </button>
                <button type="submit" class="btn btn-primary" :disabled="coreStore.loading">
                  {{ coreStore.loading ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </form>

            <div v-else class="profile-info mt-3">
              <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">{{ currentUser?.email }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Full Name</span>
                <span class="info-value">
                  {{ currentUser?.first_name }} {{ currentUser?.last_name }}
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Phone</span>
                <span class="info-value">{{ currentUser?.profile?.phone || 'Not provided' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Department</span>
                <span class="info-value">{{
                  currentUser?.profile?.department || 'Not provided'
                }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Job Title</span>
                <span class="info-value">{{
                  currentUser?.profile?.job_title || 'Not provided'
                }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Account Status</span>
                <span class="info-value">
                  <span v-if="currentUser?.is_verified" class="badge badge-success">Verified</span>
                  <span v-else class="badge badge-warning">Unverified</span>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Member Since</span>
                <span class="info-value">{{ formatDate(currentUser?.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Organization & Role -->
          <div class="card">
            <h2>Organization & Role</h2>
            <div class="profile-info mt-3">
              <div class="info-row">
                <span class="info-label">Organization</span>
                <span class="info-value">
                  {{ currentUser?.profile?.organization_name || 'No Organization' }}
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Role</span>
                <span class="info-value">
                  <span class="role-badge" :class="currentUser?.profile?.role">
                    {{ userRole }}
                  </span>
                </span>
              </div>
              <div v-if="currentUser?.profile?.organization" class="org-actions mt-4">
                <router-link
                  v-if="isAdmin"
                  to="/organization/settings"
                  class="btn btn-outline btn-block"
                >
                  Manage Organization
                </router-link>
              </div>
              <div v-else class="org-actions mt-4">
                <div class="no-org-notice mb-3">
                  <p class="small text-muted">You are not yet a member of an organization.</p>
                </div>
                <router-link to="/dashboard" class="btn btn-primary btn-block">
                  Search & Join Organization
                </router-link>
              </div>
            </div>
          </div>

          <!-- Change Password -->
          <div class="card">
            <h2>Change Password</h2>
            <form @submit.prevent="handleChangePassword" class="mt-3">
              <div class="form-group">
                <label for="old_password" class="form-label">Current Password</label>
                <div class="password-input-wrapper">
                  <input
                    id="old_password"
                    v-model="passwordForm.old_password"
                    :type="showOldPassword ? 'text' : 'password'"
                    class="form-input"
                    :class="{ error: passwordErrors.old_password }"
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    @click="showOldPassword = !showOldPassword"
                    class="password-toggle"
                    tabindex="-1"
                  >
                    <Eye v-if="!showOldPassword" class="toggle-icon" />
                    <EyeOff v-else class="toggle-icon" />
                  </button>
                </div>
                <span v-if="passwordErrors.old_password" class="form-error">
                  {{ passwordErrors.old_password }}
                </span>
              </div>

              <div class="form-group">
                <label for="new_password" class="form-label">New Password</label>
                <div class="password-input-wrapper">
                  <input
                    id="new_password"
                    v-model="passwordForm.new_password"
                    :type="showNewPassword ? 'text' : 'password'"
                    class="form-input"
                    :class="{ error: passwordErrors.new_password }"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    @click="showNewPassword = !showNewPassword"
                    class="password-toggle"
                    tabindex="-1"
                  >
                    <Eye v-if="!showNewPassword" class="toggle-icon" />
                    <EyeOff v-else class="toggle-icon" />
                  </button>
                </div>
                <span class="form-hint">Must be at least 8 characters</span>
                <span v-if="passwordErrors.new_password" class="form-error">
                  {{ passwordErrors.new_password }}
                </span>
              </div>

              <div class="form-group">
                <label for="confirm_password" class="form-label">Confirm New Password</label>
                <div class="password-input-wrapper">
                  <input
                    id="confirm_password"
                    v-model="passwordForm.confirm_password"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    class="form-input"
                    :class="{ error: passwordErrors.confirm_password }"
                    placeholder="Confirm new password"
                    required
                  />
                  <button
                    type="button"
                    @click="showConfirmPassword = !showConfirmPassword"
                    class="password-toggle"
                    tabindex="-1"
                  >
                    <Eye v-if="!showConfirmPassword" class="toggle-icon" />
                    <EyeOff v-else class="toggle-icon" />
                  </button>
                </div>
                <span v-if="passwordErrors.confirm_password" class="form-error">
                  {{ passwordErrors.confirm_password }}
                </span>
              </div>

              <button type="submit" class="btn btn-primary" :disabled="authStore.loading">
                <span v-if="authStore.loading" class="spinner"></span>
                {{ authStore.loading ? 'Updating...' : 'Update Password' }}
              </button>
            </form>
          </div>
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
import { Eye, EyeOff } from 'lucide-vue-next'

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

const isAdmin = computed(() => currentUser.value?.profile?.role === 'admin')

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

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
    // Backend update_current_user expects fields from UpdateUserProfileSerializer
    // which are: role, phone, department, job_title, preferences
    await coreStore.updateCurrentUser({
      phone: editForm.value.phone,
      department: editForm.value.department,
      job_title: editForm.value.job_title,
    })
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
.profile-page {
  min-height: calc(100vh - 72px);
  padding: 40px 0;
  background: #f5f7fa;
}

.profile-header {
  margin-bottom: 32px;
}

.profile-header h1 {
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.profile-grid {
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}

.card h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 16px;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #6b7280;
  font-size: 14px;
}

.info-value {
  font-weight: 500;
  color: #1f2937;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
}

.badge-warning {
  background: #fef3c7;
  color: #92400e;
}

.role-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.role-badge.admin {
  background: #fee2e2;
  color: #991b1b;
}
.role-badge.manager {
  background: #fef3c7;
  color: #92400e;
}
.role-badge.analyst {
  background: #dbeafe;
  color: #1e40af;
}
.role-badge.viewer {
  background: #f3f4f6;
  color: #374151;
}

.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: color 0.3s;
}

.password-toggle:hover {
  color: #3b82f6;
}

.toggle-icon {
  width: 20px;
  height: 20px;
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
