<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <div class="flex items-center gap-3">
          <div class="header-icon-bg primary-soft"><ShieldCheck /></div>
          <div>
            <h2 class="text-xl font-black">
              {{ certification ? 'Modify Certification' : 'New Compliance Record' }}
            </h2>
            <p class="text-xs text-muted font-bold uppercase tracking-widest">
              Compliance Registry
            </p>
          </div>
        </div>
        <button @click="$emit('close')" class="close-btn">
          <X class="icon" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body custom-scrollbar">
        <!-- Certificate Identity -->
        <div class="form-section-premium">
          <h3 class="section-tag">Certificate Identity</h3>
          <div class="form-group">
            <label for="certification_type" class="form-label-modern">Standard/Framework *</label>
            <select
              id="certification_type"
              v-model="formData.certification_type"
              class="form-input-premium"
              required
            >
              <option value="iso27001">ISO 27001 (ISMS)</option>
              <option value="iso27017">ISO 27017 (Cloud Security)</option>
              <option value="iso27018">ISO 27018 (Cloud Privacy)</option>
              <option value="soc2_type1">SOC 2 Type I</option>
              <option value="soc2_type2">SOC 2 Type II</option>
              <option value="pci_dss">PCI DSS</option>
              <option value="hipaa">HIPAA Compliant</option>
              <option value="gdpr">GDPR Compliant</option>
              <option value="nist_csf">NIST CSF</option>
              <option value="fedramp_low">FedRAMP Low</option>
              <option value="fedramp_moderate">FedRAMP Moderate</option>
              <option value="fedramp_high">FedRAMP High</option>
              <option value="other">Other Framework</option>
            </select>
          </div>

          <div class="form-group">
            <label for="certification_body" class="form-label-modern"
              >Issuing Body (Auditor) *</label
            >
            <input
              id="certification_body"
              v-model="formData.certification_body"
              type="text"
              class="form-input-premium"
              placeholder="e.g. BSI, Deloitte, Internal Compliance"
              required
            />
          </div>

          <div class="form-group">
            <label for="certificate_number" class="form-label-modern"
              >Certificate Reference Code</label
            >
            <input
              id="certificate_number"
              v-model="formData.certificate_number"
              type="text"
              class="form-input-premium"
              placeholder="e.g. CERT-2024-X99"
            />
          </div>
        </div>

        <!-- Timeline & Verification -->
        <div class="form-section-premium">
          <h3 class="section-tag">Validity & Verification</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="issue_date" class="form-label-modern">Issue Date *</label>
              <input
                id="issue_date"
                v-model="formData.issue_date"
                type="date"
                class="form-input-premium"
                required
              />
            </div>

            <div class="form-group">
              <label for="expiry_date" class="form-label-modern">Expiration Date *</label>
              <input
                id="expiry_date"
                v-model="formData.expiry_date"
                type="date"
                class="form-input-premium"
                required
              />
            </div>
          </div>

          <div class="form-group">
            <label for="verification_url" class="form-label-modern">Public Verification URL</label>
            <div class="input-with-icon">
              <Globe class="prefix" />
              <input
                id="verification_url"
                v-model="formData.verification_url"
                type="url"
                class="form-input-premium pl-10"
                placeholder="https://trust.vendor.com/verify/..."
              />
            </div>
          </div>
        </div>

        <!-- Status & Intel -->
        <div class="form-section-premium">
          <h3 class="section-tag">Status & Intelligence</h3>
          <div class="form-group mb-6">
            <label class="toggle-pill">
              <input type="checkbox" v-model="formData.is_active" />
              <div class="toggle-track"></div>
              <span class="toggle-label">Certificate is currently in force</span>
            </label>
          </div>

          <div class="form-group">
            <label for="notes" class="form-label-modern">Compliance Notes</label>
            <textarea
              id="notes"
              v-model="formData.notes"
              class="form-input-premium"
              rows="3"
              placeholder="Scope highlights or audit exceptions..."
            ></textarea>
          </div>
        </div>

        <div class="modal-footer glass sticky bottom-0">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">Discard</button>
          <button type="submit" class="btn btn-primary lg shadow-xl" :disabled="loading">
            <span v-if="loading" class="spinner-mini mr-2"></span>
            {{ certification ? 'Update Certification' : 'Commit New Certificate' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useVendorStore } from '../../stores/vendor'
import { X, ShieldCheck, Globe } from 'lucide-vue-next'

const props = defineProps({
  vendorId: { type: [Number, String], required: true },
  certification: { type: Object, default: null },
})

const emit = defineEmits(['close', 'save'])
const vendorStore = useVendorStore()
const loading = ref(false)

const formData = ref({
  vendor: props.vendorId,
  certification_type: 'iso27001', // backend uses lowercase keys
  certification_body: '',
  issue_date: new Date().toISOString().split('T')[0],
  expiry_date: '',
  is_active: true,
  certificate_number: '',
  verification_url: '',
  notes: '',
})

onMounted(() => {
  if (props.certification) {
    Object.keys(formData.value).forEach((key) => {
      // Logic for case normalization if cert_type comes back uppercase from legacy
      if (key === 'certification_type' && props.certification[key]) {
        formData.value[key] = props.certification[key].toLowerCase()
      } else if (props.certification[key] !== undefined) {
        formData.value[key] = props.certification[key]
      }
    })
  }
})

const handleSubmit = async () => {
  loading.value = true
  try {
    if (props.certification) {
      await vendorStore.updateCertification(props.certification.id, formData.value)
    } else {
      await vendorStore.createCertification(formData.value)
    }
    emit('save')
    emit('close')
  } catch (error) {
    console.error('Failed to save certification:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-container {
  background: #f8fafc;
  border-radius: 32px;
  width: 100%;
  max-width: 600px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 30px 100px -20px rgba(0, 0, 0, 0.4);
}

.modal-header {
  padding: 32px;
  border-bottom: 1px solid #e2e8f0;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-icon-bg {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-icon-bg.primary-soft {
  background: #eff6ff;
  color: var(--primary);
}

.close-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
}
.close-btn:hover {
  background: #e2e8f0;
  transform: rotate(90deg);
}

.modal-body {
  padding: 32px;
  overflow-y: auto;
  flex: 1;
}

.form-section-premium {
  margin-bottom: 40px;
}
.section-tag {
  font-size: 11px;
  font-weight: 900;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 24px;
  border-left: 3px solid var(--primary);
  padding-left: 12px;
}

.form-label-modern {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 8px;
}
.form-input-premium {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 15px;
  font-weight: 500;
  transition: 0.2s;
}
.form-input-premium:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 4px var(--primary-soft);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.input-with-icon {
  position: relative;
}
.prefix {
  position: absolute;
  left: 14px;
  top: 12px;
  height: 18px;
  width: 18px;
  color: #94a3b8;
}

.toggle-pill {
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
}
.toggle-pill input {
  display: none;
}
.toggle-track {
  width: 48px;
  height: 26px;
  border-radius: 13px;
  background: #cbd5e1;
  position: relative;
  transition: 0.3s;
}
.toggle-track::after {
  content: '';
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  position: absolute;
  left: 3px;
  top: 3px;
  transition: 0.3s;
}
.toggle-pill input:checked + .toggle-track {
  background: var(--primary);
}
.toggle-pill input:checked + .toggle-track::after {
  transform: translateX(22px);
}
.toggle-label {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.modal-footer {
  padding: 24px 32px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  z-index: 20;
}

.spinner-mini {
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}
</style>
