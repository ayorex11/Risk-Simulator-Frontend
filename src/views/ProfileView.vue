<template>
  <div>
    <NavBar />
    <div class="profile-page">
      <div class="container">
        <div class="profile-header">
          <h1>Profile</h1>
          <p class="text-muted">Manage your account settings</p>
        </div>

        <div class="profile-grid">
          <!-- Profile Information -->
          <div class="card">
            <h2>Profile Information</h2>
            <div class="profile-info mt-3">
              <div class="info-row">
                <span class="info-label">Email</span>
                <span class="info-value">{{ authStore.user?.email }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">First Name</span>
                <span class="info-value">{{ authStore.user?.first_name || 'N/A' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Last Name</span>
                <span class="info-value">{{ authStore.user?.last_name || 'N/A' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Account Status</span>
                <span class="info-value">
                  <span v-if="authStore.user?.is_verified" class="badge badge-success">Verified</span>
                  <span v-else class="badge badge-warning">Unverified</span>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Member Since</span>
                <span class="info-value">{{ formatDate(authStore.user?.created_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Change Password -->
          <div class="card">
            <h2>Change Password</h2>
            <form @submit.prevent="handleChangePassword" class="mt-3">
              <div class="form-group">
                <label for="old_password" class="form-label">Current Password</label>
                <input
                  id="old_password"
                  v-model="passwordForm.old_password"
                  type="password"
                  class="form-input"
                  :class="{ error: passwordErrors.old_password }"
                  placeholder="Enter current password"
                  required
                />
                <span v-if="passwordErrors.old_password" class="form-error">
                  {{ passwordErrors.old_password }}
                </span>
              </div>

              <div class="form-group">
                <label for="new_password" class="form-label">New Password</label>
                <input
                  id="new_password"
                  v-model="passwordForm.new_password"
                  type="password"
                  class="form-input"
                  :class="{ error: passwordErrors.new_password }"
                  placeholder="Enter new password"
                  required
                />
                <span class="form-hint">Must be at least 8 characters</span>
                <span v-if="passwordErrors.new_password" class="form-error">
                  {{ passwordErrors.new_password }}
                </span>
              </div>

              <div class="form-group">
                <label for="confirm_password" class="form-label">Confirm New Password</label>
                <input
                  id="confirm_password"
                  v-model="passwordForm.confirm_password"
                  type="password"
                  class="form-input"
                  :class="{ error: passwordErrors.confirm_password }"
                  placeholder="Confirm new password"
                  required
                />
                <span v-if="passwordErrors.confirm_password" class="form-error">
                  {{ passwordErrors.confirm_password }}
                </span>
              </div>

              <button
                type="submit"
                class="btn btn-primary"
                :disabled="authStore.loading"
              >
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
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import NavBar from '../components/common/NavBar.vue'
import { validatePassword, validatePasswordMatch } from '../utils/validators'

const authStore = useAuthStore()

const passwordForm = ref({
  old_password: '',
  new_password: '',
  confirm_password: ''
})

const passwordErrors = ref({})

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
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
    passwordForm.value.confirm_password
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
    await authStore.changePassword(
      passwordForm.value.old_password,
      passwordForm.value.new_password
    )
    // Reset form
    passwordForm.value = {
      old_password: '',
      new_password: '',
      confirm_password: ''
    }
  } catch (error) {
    console.error('Change password failed:', error)
  }
}
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

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
}
</style>
