<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card card">
        <div class="verification-content">
          <div v-if="authStore.loading" class="text-center">
            <LoadingSpinner message="Verifying your email..." />
          </div>

          <div v-else-if="verificationSuccess" class="success-content">
            <div class="success-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1>Email Verified!</h1>
            <p class="text-muted">Your email has been successfully verified.</p>
            <router-link to="/login" class="btn btn-primary mt-3">
              Go to Login
            </router-link>
          </div>

          <div v-else class="error-content">
            <div class="error-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1>Verification Failed</h1>
            <p class="text-muted">{{ errorMessage }}</p>

            <div class="resend-section mt-3">
              <p class="text-sm text-muted mb-2">Need a new verification link?</p>
              <form @submit.prevent="handleResend" class="resend-form">
                <input
                  v-model="resendEmail"
                  type="email"
                  class="form-input"
                  placeholder="Enter your email"
                  required
                />
                <button
                  type="submit"
                  class="btn btn-primary mt-2"
                  :disabled="authStore.loading"
                >
                  {{ authStore.loading ? 'Sending...' : 'Resend Verification' }}
                </button>
              </form>
            </div>

            <router-link to="/login" class="link mt-3" style="display: block; text-align: center;">
              Back to Login
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import LoadingSpinner from '../../components/common/LoadingSpinner.vue'

const route = useRoute()
const authStore = useAuthStore()

const verificationSuccess = ref(false)
const errorMessage = ref('')
const resendEmail = ref('')

onMounted(async () => {
  const token = route.params.token

  if (!token) {
    errorMessage.value = 'Invalid verification link'
    return
  }

  try {
    await authStore.verifyEmail(token)
    verificationSuccess.value = true
  } catch (error) {
    verificationSuccess.value = false
    errorMessage.value = error.response?.data?.error || 'Verification failed. The link may have expired.'
  }
})

const handleResend = async () => {
  if (!resendEmail.value) return

  try {
    await authStore.resendVerification(resendEmail.value)
  } catch (error) {
    console.error('Resend failed:', error)
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
  max-width: 500px;
}

.auth-card {
  background: white;
  border-radius: 16px;
  padding: 48px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.verification-content {
  text-align: center;
}

.success-icon,
.error-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-icon {
  background: #d1fae5;
  color: #059669;
}

.error-icon {
  background: #fee2e2;
  color: #dc2626;
}

.success-icon svg,
.error-icon svg {
  width: 48px;
  height: 48px;
  stroke-width: 3;
}

.verification-content h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
}

.resend-section {
  background: #f9fafb;
  padding: 24px;
  border-radius: 8px;
  margin-top: 24px;
}

.resend-form {
  max-width: 300px;
  margin: 0 auto;
}
</style>
