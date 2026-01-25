<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>{{ isEdit ? 'Edit Vendor' : 'Add New Vendor' }}</h2>
        <button @click="$emit('close')" class="close-btn">
          <X class="icon" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- Basic Information -->
        <div class="form-section">
          <h3 class="section-title">Basic Information</h3>

          <div class="form-group">
            <label for="name" class="form-label">Vendor Name *</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              class="form-input"
              :class="{ error: errors.name }"
              placeholder="Enter vendor name"
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
                <option value="Financial Services">Financial Services</option>
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
          </div>

          <div class="form-group">
            <label for="website" class="form-label">Website</label>
            <input
              id="website"
              v-model="formData.website"
              type="url"
              class="form-input"
              placeholder="https://example.com"
            />
          </div>

          <div class="form-group">
            <label for="services_provided" class="form-label">Services Provided *</label>
            <textarea
              id="services_provided"
              v-model="formData.services_provided"
              class="form-input"
              :class="{ error: errors.services_provided }"
              rows="3"
              placeholder="Describe the services this vendor provides"
              required
            ></textarea>
            <span v-if="errors.services_provided" class="form-error">{{
              errors.services_provided
            }}</span>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="form-section">
          <h3 class="section-title">Contact Information</h3>

          <div class="form-group">
            <label for="contact_name" class="form-label">Contact Name *</label>
            <input
              id="contact_name"
              v-model="formData.contact_name"
              type="text"
              class="form-input"
              placeholder="Primary contact person"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="contact_email" class="form-label">Contact Email *</label>
              <input
                id="contact_email"
                v-model="formData.contact_email"
                type="email"
                class="form-input"
                placeholder="contact@vendor.com"
                required
              />
            </div>

            <div class="form-group">
              <label for="contact_phone" class="form-label">Contact Phone</label>
              <input
                id="contact_phone"
                v-model="formData.contact_phone"
                type="tel"
                class="form-input"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>
        </div>

        <!-- Contract Information -->
        <div class="form-section">
          <h3 class="section-title">Contract Information</h3>

          <div class="form-row">
            <div class="form-group">
              <label for="contract_start_date" class="form-label">Contract Start Date *</label>
              <input
                id="contract_start_date"
                v-model="formData.contract_start_date"
                type="date"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label for="contract_end_date" class="form-label">Contract End Date *</label>
              <input
                id="contract_end_date"
                v-model="formData.contract_end_date"
                type="date"
                class="form-input"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="contract_value" class="form-label">Contract Value (USD) *</label>
            <input
              id="contract_value"
              v-model="formData.contract_value"
              type="number"
              step="0.01"
              min="0"
              class="form-input"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <!-- Dependency Information -->
        <div class="form-section">
          <h3 class="section-title">Supply Chain Dependencies</h3>
          <div class="form-group">
            <label class="form-label">Upstream Dependencies (Vendors this entity depends on)</label>
            <div class="dependency-selector card shadow-sm">
              <div v-if="availableVendors.length > 5" class="p-2 border-bottom">
                <input
                  v-model="depSearchQuery"
                  type="text"
                  placeholder="Search available vendors..."
                  class="search-input-xs"
                />
              </div>
              <div v-if="availableVendors.length === 0" class="p-8 text-center text-muted text-sm">
                <div class="mb-2 opacity-50"><Building class="mx-auto" /></div>
                No other vendors available to link as dependencies.
              </div>
              <div v-else class="dependency-grid">
                <div v-for="v in availableVendors" :key="v.id" class="dep-checkbox-item">
                  <label class="checkbox-label-sm">
                    <input
                      type="checkbox"
                      :value="v.id"
                      v-model="formData.dependent_vendors"
                      class="form-checkbox-sm"
                    />
                    <div class="flex flex-col overflow-hidden">
                      <span class="dep-name-txt truncate">{{ v.name }}</span>
                      <span class="dep-industry-txt truncate">{{ v.industry }}</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
            <p class="form-hint text-xs mt-2">
              Mapping these helps the risk simulator calculate cascading failure impacts.
            </p>
          </div>
        </div>

        <!-- Risk Factors -->
        <div class="form-section">
          <h3 class="section-title">Risk Assessment Factors</h3>

          <div class="form-group">
            <label for="security_posture_score" class="form-label">
              Security Posture Score (0-100)
              <span class="label-hint">{{ formData.security_posture_score }}</span>
            </label>
            <input
              id="security_posture_score"
              v-model.number="formData.security_posture_score"
              type="range"
              min="0"
              max="100"
              class="form-range"
            />
            <div class="range-labels">
              <span>Poor (0)</span>
              <span>Excellent (100)</span>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="data_sensitivity_level" class="form-label">
                Data Sensitivity Level (1-5)
                <span class="label-hint">{{ formData.data_sensitivity_level }}</span>
              </label>
              <input
                id="data_sensitivity_level"
                v-model.number="formData.data_sensitivity_level"
                type="range"
                min="1"
                max="5"
                class="form-range"
              />
              <div class="range-labels">
                <span>Low (1)</span>
                <span>High (5)</span>
              </div>
            </div>

            <div class="form-group">
              <label for="service_criticality_level" class="form-label">
                Service Criticality (1-5)
                <span class="label-hint">{{ formData.service_criticality_level }}</span>
              </label>
              <input
                id="service_criticality_level"
                v-model.number="formData.service_criticality_level"
                type="range"
                min="1"
                max="5"
                class="form-range"
              />
              <div class="range-labels">
                <span>Low (1)</span>
                <span>Critical (5)</span>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="incident_history_score" class="form-label">
                Incident History Score (0-100)
                <span class="label-hint">{{ formData.incident_history_score }}</span>
              </label>
              <input
                id="incident_history_score"
                v-model.number="formData.incident_history_score"
                type="range"
                min="0"
                max="100"
                class="form-range"
              />
              <div class="range-labels">
                <span>Many Incidents (0)</span>
                <span>No Incidents (100)</span>
              </div>
            </div>

            <div class="form-group">
              <label for="compliance_score" class="form-label">
                Compliance Score (0-100)
                <span class="label-hint">{{ formData.compliance_score }}</span>
              </label>
              <input
                id="compliance_score"
                v-model.number="formData.compliance_score"
                type="range"
                min="0"
                max="100"
                class="form-range"
              />
              <div class="range-labels">
                <span>None (0)</span>
                <span>Excellent (100)</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="third_party_dependencies_score" class="form-label">
              Third-Party Dependencies Risk (0-100)
              <span class="label-hint">{{ formData.third_party_dependencies_score }}</span>
            </label>
            <input
              id="third_party_dependencies_score"
              v-model.number="formData.third_party_dependencies_score"
              type="range"
              min="0"
              max="100"
              class="form-range"
            />
            <div class="range-labels">
              <span>Low Risk (0)</span>
              <span>High Risk (100)</span>
            </div>
          </div>
        </div>

        <!-- Additional Information -->
        <div class="form-section">
          <h3 class="section-title">Additional Information</h3>

          <div class="form-group">
            <label for="notes" class="form-label">Notes</label>
            <textarea
              id="notes"
              v-model="formData.notes"
              class="form-input"
              rows="3"
              placeholder="Add any additional notes or comments"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input v-model="formData.is_active" type="checkbox" class="form-checkbox" />
              <span>Vendor is active</span>
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">Cancel</button>
          <button type="submit" class="btn btn-primary" :disabled="vendorStore.loading">
            <span v-if="vendorStore.loading" class="spinner"></span>
            {{ vendorStore.loading ? 'Saving...' : isEdit ? 'Update Vendor' : 'Create Vendor' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useVendorStore } from '../../stores/vendor'
import { X, Building } from 'lucide-vue-next'

const props = defineProps({
  vendor: {
    type: Object,
    default: null,
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'save'])
const vendorStore = useVendorStore()
const depSearchQuery = ref('')

const availableVendors = computed(() => {
  return vendorStore.vendors
    .filter((v) => v.id !== props.vendor?.id)
    .filter((v) => {
      if (!depSearchQuery.value) return true
      const q = depSearchQuery.value.toLowerCase()
      return v.name.toLowerCase().includes(q) || v.industry.toLowerCase().includes(q)
    })
})

const formData = ref({
  name: '',
  industry: '',
  country: '',
  website: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  services_provided: '',
  contract_start_date: '',
  contract_end_date: '',
  contract_value: 0,
  security_posture_score: 50,
  data_sensitivity_level: 3,
  service_criticality_level: 3,
  incident_history_score: 100,
  compliance_score: 0,
  third_party_dependencies_score: 0,
  is_active: true,
  notes: '',
  dependent_vendors: [],
})

const errors = ref({})

onMounted(async () => {
  // Ensure vendors are available for dependency mapping
  if (vendorStore.vendors.length === 0) {
    await vendorStore.fetchVendors()
  }

  if (props.isEdit && props.vendor) {
    // Populate form with existing vendor data
    Object.keys(formData.value).forEach((key) => {
      if (props.vendor[key] !== undefined) {
        formData.value[key] = props.vendor[key]
      }
    })

    // Explicitly handle dependencies if they come as objects
    if (props.vendor.dependent_vendors && props.vendor.dependent_vendors.length > 0) {
      if (typeof props.vendor.dependent_vendors[0] === 'object') {
        formData.value.dependent_vendors = props.vendor.dependent_vendors.map((v) => v.id)
      } else {
        formData.value.dependent_vendors = props.vendor.dependent_vendors
      }
    }
  }
})

const validateForm = () => {
  errors.value = {}
  let isValid = true

  if (!formData.value.name.trim()) {
    errors.value.name = 'Vendor name is required'
    isValid = false
  }

  if (!formData.value.industry) {
    errors.value.industry = 'Industry is required'
    isValid = false
  }

  if (!formData.value.country.trim()) {
    errors.value.country = 'Country is required'
    isValid = false
  }

  if (!formData.value.services_provided.trim()) {
    errors.value.services_provided = 'Services provided is required'
    isValid = false
  }

  if (new Date(formData.value.contract_end_date) < new Date(formData.value.contract_start_date)) {
    errors.value.contract_end_date = 'End date must be after start date'
    isValid = false
  }

  return isValid
}

const handleSubmit = async () => {
  if (!validateForm()) return

  try {
    if (props.isEdit) {
      await vendorStore.updateVendor(props.vendor.id, formData.value)
    } else {
      await vendorStore.createVendor(formData.value)
    }
    emit('save')
    emit('close')
  } catch (error) {
    console.error('Failed to save vendor:', error)
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
  max-width: 800px;
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
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
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

.form-section {
  margin-bottom: 32px;
  padding-bottom: 32px;
  border-bottom: 1px solid #e5e7eb;
}

.form-section:last-of-type {
  border-bottom: none;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-range {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  outline: none;
  -webkit-appearance: none;
}

.form-range::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

.form-range::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}

.label-hint {
  float: right;
  font-weight: 700;
  color: #3b82f6;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #6b7280;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-weight: 500;
  color: #374151;
}

.form-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.modal-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  position: sticky;
  bottom: 0;
  background: white;
}

/* Dependency Selector */
.dependency-selector {
  margin-top: 12px;
  max-height: 280px;
  overflow-y: auto;
  border-radius: 12px;
  padding: 0;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
}

.search-input-xs {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-size: 12px;
  background: white;
}

.dependency-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 8px;
  padding: 12px;
}

.dep-checkbox-item {
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.dep-checkbox-item:hover {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.checkbox-label-sm {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  width: 100%;
}

.form-checkbox-sm {
  width: 16px;
  height: 16px;
  accent-color: var(--primary);
}

.dep-name-txt {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  display: block;
}

.dep-industry-txt {
  font-size: 10px;
  color: #94a3b8;
  font-weight: 800;
  text-transform: uppercase;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }
}
</style>
