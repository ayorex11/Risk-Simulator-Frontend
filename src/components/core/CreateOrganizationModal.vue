<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Create Organization</h2>
        <button @click="$emit('close')" class="close-btn">
          <X class="icon" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <div class="form-group">
          <label for="name" class="form-label">Organization Name *</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            class="form-input"
            :class="{ error: errors.name }"
            placeholder="Enter organization name"
            required
          />
          <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="industry" class="form-label">Industry *</label>
            <select
              id="industry"
              v-model="formData.industry"
              class="form-input"
              :class="{ error: errors.industry }"
              required
            >
              <option value="">Select industry</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Financial">Financial Services</option>
              <option value="Retail">Retail</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Professional Services">Professional Services</option>
              <option value="Education">Education</option>
              <option value="Government">Government</option>
              <option value="Other">Other</option>
            </select>
            <span v-if="errors.industry" class="form-error">{{ errors.industry }}</span>
          </div>

          <div class="form-group">
            <label for="size" class="form-label">Organization Size *</label>
            <select
              id="size"
              v-model="formData.size"
              class="form-input"
              :class="{ error: errors.size }"
              required
            >
              <option value="">Select size</option>
              <option value="Small">Small (1-50 employees)</option>
              <option value="Medium">Medium (51-250 employees)</option>
              <option value="Large">Large (251-1000 employees)</option>
              <option value="Enterprise">Enterprise (1000+ employees)</option>
            </select>
            <span v-if="errors.size" class="form-error">{{ errors.size }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="country" class="form-label">Country *</label>
          <input
            id="country"
            v-model="formData.country"
            type="text"
            class="form-input"
            :class="{ error: errors.country }"
            placeholder="Enter country"
            required
          />
          <span v-if="errors.country" class="form-error">{{ errors.country }}</span>
        </div>

        <div class="modal-footer">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" :disabled="coreStore.loading">
            <span v-if="coreStore.loading" class="spinner"></span>
            {{ coreStore.loading ? 'Creating...' : 'Create Organization' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCoreStore } from '../../stores/core'
import { X } from 'lucide-vue-next'

const emit = defineEmits(['close', 'created'])
const coreStore = useCoreStore()

const formData = ref({
  name: '',
  industry: '',
  size: '',
  country: '',
  config: {}
})

const errors = ref({})

const validateForm = () => {
  errors.value = {}
  let isValid = true

  if (!formData.value.name.trim()) {
    errors.value.name = 'Organization name is required'
    isValid = false
  }

  if (!formData.value.industry) {
    errors.value.industry = 'Industry is required'
    isValid = false
  }

  if (!formData.value.size) {
    errors.value.size = 'Organization size is required'
    isValid = false
  }

  if (!formData.value.country.trim()) {
    errors.value.country = 'Country is required'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    await coreStore.createOrganization(formData.value)
    emit('created')
  } catch (error) {
    console.error('Failed to create organization:', error)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.close-btn {
  padding: 8px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.close-btn:hover {
  background: #e5e7eb;
}

.icon {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  margin-top: 24px;
  border-top: 1px solid #e5e7eb;
}
</style>
