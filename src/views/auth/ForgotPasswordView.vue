<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card card">
        <div class="auth-header">
          <h1>Forgot Password?</h1>
          <p class="text-muted">Enter your email to receive a reset link</p>
        </div>

        <div v-if="emailSent" class="alert alert-success">
          <p>Password reset link has been sent to your email. Please check your inbox.</p>
        </div>

        <form v-else @submit.prevent="handleForgotPassword" class="auth-form">
          <div class="form-group">
            <label for="email" class="form-label">Email Address</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              :class="{ error: errors.email }"
              placeholder="Enter your email"
              required
            />
            <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-full"
            :disabled="authStore.loading"
          >
            <span v-if="authStore.loading" class="spinner"></span>
            {{ authStore.loading ? 'Sending...' : 'Send Reset Link' }}
          </button>
        </form>

        <div class="auth-footer">
          <router-link to="/login" class="link">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 16px; height: 16px; display: inline; margin-right: 4px;">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Login
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { validateEmail } from '../../utils/validators'

const authStore = useAuthStore()

const email = ref('')
const emailSent = ref(false)
const errors = ref({})

const validateForm = () => {
  errors.value = {}
  let isValid = true

  if (!email.value) {
    errors.value.email = 'Email is required'
    isValid = false
  } else if (!validateEmail(email.value)) {
    errors.value.email = 'Invalid email format'
    isValid = false
  }

  return isValid
}

const handleForgotPassword = async () => {
  if (!validateForm()) return

  try {
    await authStore.forgotPassword(email.value)
    emailSent.value = true
  } catch (error) {
    console.error('Forgot password failed:', error)
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
</style>
