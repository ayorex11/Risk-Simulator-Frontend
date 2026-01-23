<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card card">
        <div class="auth-header">
          <h1>Create Account</h1>
          <p class="text-muted">Sign up to get started</p>
        </div>

        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label for="first_name" class="form-label">First Name</label>
            <input
              id="first_name"
              v-model="formData.first_name"
              type="text"
              class="form-input"
              :class="{ error: errors.first_name }"
              placeholder="Enter your first name"
              required
            />
            <span v-if="errors.first_name" class="form-error">{{ errors.first_name }}</span>
          </div>

          <div class="form-group">
            <label for="last_name" class="form-label">Last Name (Optional)</label>
            <input
              id="last_name"
              v-model="formData.last_name"
              type="text"
              class="form-input"
              placeholder="Enter your last name"
            />
          </div>

          <div class="form-group">
            <label for="email" class="form-label">Email Address</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              class="form-input"
              :class="{ error: errors.email }"
              placeholder="Enter your email"
              required
            />
            <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <div class="password-input-wrapper">
              <input
                id="password"
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ error: errors.password }"
                placeholder="Create a password"
                required
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="password-toggle"
                tabindex="-1"
              >
                <Eye v-if="!showPassword" class="toggle-icon" />
                <EyeOff v-else class="toggle-icon" />
              </button>
            </div>
            <span class="form-hint">Must be at least 8 characters</span>
            <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
          </div>

          <div class="form-group">
            <label for="password2" class="form-label">Confirm Password</label>
            <div class="password-input-wrapper">
              <input
                id="password2"
                v-model="formData.password2"
                :type="showPassword2 ? 'text' : 'password'"
                class="form-input"
                :class="{ error: errors.password2 }"
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                @click="showPassword2 = !showPassword2"
                class="password-toggle"
                tabindex="-1"
              >
                <Eye v-if="!showPassword2" class="toggle-icon" />
                <EyeOff v-else class="toggle-icon" />
              </button>
            </div>
            <span v-if="errors.password2" class="form-error">{{ errors.password2 }}</span>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-full"
            :disabled="authStore.loading"
          >
            <span v-if="authStore.loading" class="spinner"></span>
            {{ authStore.loading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>

        <div class="auth-footer">
          <p class="text-muted text-sm">
            Already have an account?
            <router-link to="/login" class="link">Sign in</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { validateEmail, validatePassword, validatePasswordMatch } from '../../utils/validators'
import { Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  password2: ''
})

const errors = ref({})
const showPassword = ref(false)
const showPassword2 = ref(false)

const validateForm = () => {
  errors.value = {}
  let isValid = true

  if (!formData.value.first_name) {
    errors.value.first_name = 'First name is required'
    isValid = false
  }

  if (!formData.value.email) {
    errors.value.email = 'Email is required'
    isValid = false
  } else if (!validateEmail(formData.value.email)) {
    errors.value.email = 'Invalid email format'
    isValid = false
  }

  const passwordError = validatePassword(formData.value.password)
  if (passwordError) {
    errors.value.password = passwordError
    isValid = false
  }

  const passwordMatchError = validatePasswordMatch(
    formData.value.password,
    formData.value.password2
  )
  if (passwordMatchError) {
    errors.value.password2 = passwordMatchError
    isValid = false
  }

  return isValid
}

const handleRegister = async () => {
  if (!validateForm()) return

  try {
    await authStore.register(formData.value)
    router.push('/login')
  } catch (error) {
    console.error('Registration failed:', error)
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

.auth-footer {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}
</style>
