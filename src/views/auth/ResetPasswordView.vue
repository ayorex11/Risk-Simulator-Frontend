<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card card">
        <div class="auth-header">
          <h1>Reset Password</h1>
          <p class="text-muted">Enter your new password</p>
        </div>

        <div v-if="resetSuccess" class="success-content text-center">
          <div class="success-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2>Password Reset Successful!</h2>
          <p class="text-muted mb-3">Your password has been reset successfully.</p>
          <router-link to="/login" class="btn btn-primary">
            Go to Login
          </router-link>
        </div>

        <form v-else @submit.prevent="handleResetPassword" class="auth-form">
          <div class="form-group">
            <label for="new_password" class="form-label">New Password</label>
            <input
              id="new_password"
              v-model="formData.new_password"
              type="password"
              class="form-input"
              :class="{ error: errors.new_password }"
              placeholder="Enter new password"
              required
            />
            <span class="form-hint">Must be at least 8 characters</span>
            <span v-if="errors.new_password" class="form-error">{{ errors.new_password }}</span>
          </div>

          <div class="form-group">
            <label for="new_password2" class="form-label">Confirm New Password</label>
            <input
              id="new_password2"
              v-model="formData.new_password2"
              type="password"
              class="form-input"
              :class="{ error: errors.new_password2 }"
              placeholder="Confirm new password"
              required
            />
            <span v-if="errors.new_password2" class="form-error">{{ errors.new_password2 }}</span>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-full"
            :disabled="authStore.loading"
          >
            <span v-if="authStore.loading" class="spinner"></span>
            {{ authStore.loading ? 'Resetting...' : 'Reset Password' }}
          </button>
        </form>

        <div class="auth-footer" v-if="!resetSuccess">
          <router-link to="/login" class="link">
            Back to Login
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { validatePassword, validatePasswordMatch } from '../../utils/validators'

const route = useRoute()
const authStore = useAuthStore()

const formData = ref({
  new_password: '',
  new_password2: ''
})

const errors = ref({})
const resetSuccess = ref(false)
const token = ref('')

onMounted(() => {
  token.value = route.params.token
  if (!token.value) {
    errors.value.general = 'Invalid reset link'
  }
})

const validateForm = () => {
  errors.value = {}
  let isValid = true

  const passwordError = validatePassword(formData.value.new_password)
  if (passwordError) {
    errors.value.new_password = passwordError
    isValid = false
  }

  const passwordMatchError = validatePasswordMatch(
    formData.value.new_password,
    formData.value.new_password2
  )
  if (passwordMatchError) {
    errors.value.new_password2 = passwordMatchError
    isValid = false
  }

  return isValid
}

const handleResetPassword = async () => {
  if (!validateForm()) return

  try {
    await authStore.resetPassword(
      token.value,
      formData.value.new_password,
      formData.value.new_password2
    )
    resetSuccess.value = true
  } catch (error) {
    console.error('Reset password failed:', error)
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.auth-container {
  width: 100%;
  max-width: 440px;
}

.auth-card {
  background: white;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.auth-form {
  margin-bottom: 24px;
}

.auth-footer {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #d1fae5;
  color: #059669;
}

.success-icon svg {
  width: 48px;
  height: 48px;
  stroke-width: 3;
}

.success-content h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
}
</style>
