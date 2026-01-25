<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container wider">
      <div class="modal-header">
        <div class="flex items-center gap-3">
          <div class="header-icon-bg danger"><AlertTriangle /></div>
          <div>
            <h2 class="text-xl font-black">
              {{ incident ? 'Modify Incident Trace' : 'Log New Security Event' }}
            </h2>
            <p class="text-xs text-muted font-bold uppercase tracking-widest">
              Incident Response Unit
            </p>
          </div>
        </div>
        <button @click="$emit('close')" class="close-btn">
          <X class="icon" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-body custom-scrollbar">
        <!-- Event Identity -->
        <div class="form-section-premium">
          <h3 class="section-tag">Event Identity</h3>
          <div class="form-group">
            <label for="title" class="form-label-modern">Incident Title *</label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              class="form-input-premium"
              placeholder="Short descriptive title of the event"
              required
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="incident_type" class="form-label-modern">Vector Type *</label>
              <select
                id="incident_type"
                v-model="formData.incident_type"
                class="form-input-premium"
                required
              >
                <option value="data_breach">Data Breach</option>
                <option value="ransomware">Ransomware</option>
                <option value="ddos">DDoS Attack</option>
                <option value="outage">Service Outage</option>
                <option value="supply_chain">Supply Chain Attack</option>
                <option value="insider_threat">Insider Threat</option>
                <option value="malware">Malware Infection</option>
                <option value="phishing">Phishing Attack</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div class="form-group">
              <label for="severity" class="form-label-modern">Impact Severity *</label>
              <select id="severity" v-model="formData.severity" class="form-input-premium" required>
                <option value="low">Low Impact</option>
                <option value="medium">Medium Impact</option>
                <option value="high">High Alert</option>
                <option value="critical">Critical/Catastrophic</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="incident_date" class="form-label-modern">Detection/Incident Date *</label>
            <input
              id="incident_date"
              v-model="formData.incident_date"
              type="date"
              class="form-input-premium"
              required
            />
          </div>

          <div class="form-group">
            <label for="description" class="form-label-modern"
              >Full Briefing (Detailed Description) *</label
            >
            <textarea
              id="description"
              v-model="formData.description"
              class="form-input-premium"
              rows="3"
              placeholder="Provide a detailed timeline and impact summary..."
              required
            ></textarea>
          </div>
        </div>

        <!-- Quantitative Impact -->
        <div class="form-section-premium">
          <h3 class="section-tag">Quantitative Telemetry</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="financial_impact" class="form-label-modern">Financial Loss (USD)</label>
              <div class="input-with-icon">
                <span class="prefix">$</span>
                <input
                  id="financial_impact"
                  v-model.number="formData.financial_impact"
                  type="number"
                  step="0.01"
                  class="form-input-premium pl-8"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div class="form-group">
              <label for="downtime_hours" class="form-label-modern"
                >Operational Downtime (Hrs)</label
              >
              <input
                id="downtime_hours"
                v-model.number="formData.downtime_hours"
                type="number"
                step="0.1"
                class="form-input-premium"
                placeholder="0.0"
              />
            </div>
            <div class="form-group">
              <label for="records_affected" class="form-label-modern"
                >Data Records Compromised</label
              >
              <input
                id="records_affected"
                v-model.number="formData.records_affected"
                type="number"
                class="form-input-premium"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <!-- Speed of Response -->
        <div class="form-section-premium">
          <h3 class="section-tag">Response Latency (Hours)</h3>
          <div class="form-row-triple">
            <div class="form-group">
              <label for="time_to_detect_hours" class="form-label-modern">To Detect</label>
              <input
                id="time_to_detect_hours"
                v-model.number="formData.time_to_detect_hours"
                type="number"
                step="0.1"
                class="form-input-premium"
                placeholder="0.0"
              />
            </div>
            <div class="form-group">
              <label for="time_to_contain_hours" class="form-label-modern">To Contain</label>
              <input
                id="time_to_contain_hours"
                v-model.number="formData.time_to_contain_hours"
                type="number"
                step="0.1"
                class="form-input-premium"
                placeholder="0.0"
              />
            </div>
            <div class="form-group">
              <label for="time_to_recover_hours" class="form-label-modern">To Recover</label>
              <input
                id="time_to_recover_hours"
                v-model.number="formData.time_to_recover_hours"
                type="number"
                step="0.1"
                class="form-input-premium"
                placeholder="0.0"
              />
            </div>
          </div>
        </div>

        <!-- Post-Mortem & Remediation -->
        <div class="form-section-premium">
          <h3 class="section-tag">Intelligence & Post-Mortem</h3>
          <div class="form-group">
            <label for="root_cause" class="form-label-modern">Root Cause Analysis</label>
            <textarea
              id="root_cause"
              v-model="formData.root_cause"
              class="form-input-premium"
              rows="2"
              placeholder="Primary point of failure..."
            ></textarea>
          </div>
          <div class="form-group">
            <label for="remediation_actions" class="form-label-modern"
              >Remediation Actions Taken</label
            >
            <textarea
              id="remediation_actions"
              v-model="formData.remediation_actions"
              class="form-input-premium"
              rows="2"
              placeholder="Steps taken to prevent recurrence..."
            ></textarea>
          </div>
          <div class="form-group">
            <label for="lessons_learned" class="form-label-modern">Organizational Lessons</label>
            <textarea
              id="lessons_learned"
              v-model="formData.lessons_learned"
              class="form-input-premium"
              rows="2"
              placeholder="Key takeaways..."
            ></textarea>
          </div>

          <div class="flex flex-col gap-4 mt-6">
            <label class="toggle-pill">
              <input type="checkbox" v-model="formData.remediation_completed" />
              <div class="toggle-track"></div>
              <span class="toggle-label">Remediation fully completed and verified</span>
            </label>
            <label class="toggle-pill">
              <input type="checkbox" v-model="formData.publicly_disclosed" />
              <div class="toggle-track"></div>
              <span class="toggle-label">This event has been publicly disclosed</span>
            </label>
          </div>

          <div v-if="formData.publicly_disclosed" class="form-group mt-4 animate-in-fast">
            <label for="disclosure_url" class="form-label-modern">Disclosure URL/Notice</label>
            <input
              id="disclosure_url"
              v-model="formData.disclosure_url"
              type="url"
              class="form-input-premium"
              placeholder="https://..."
            />
          </div>
        </div>

        <div class="modal-footer glass sticky bottom-0">
          <button type="button" @click="$emit('close')" class="btn btn-secondary">Discard</button>
          <button type="submit" class="btn btn-primary lg shadow-xl" :disabled="loading">
            <span v-if="loading" class="spinner-mini mr-2"></span>
            {{ incident ? 'Update Event Record' : 'Commit Incident Trace' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useVendorStore } from '../../stores/vendor'
import { X, AlertTriangle } from 'lucide-vue-next'

const props = defineProps({
  vendorId: { type: [Number, String], required: true },
  incident: { type: Object, default: null },
})

const emit = defineEmits(['close', 'save'])
const vendorStore = useVendorStore()
const loading = ref(false)

const formData = ref({
  vendor: props.vendorId,
  title: '',
  incident_type: 'outage', // backend: 'outage' not 'service_outage'
  severity: 'medium',
  incident_date: new Date().toISOString().split('T')[0],
  description: '',
  records_affected: 0,
  downtime_hours: 0,
  financial_impact: 0,
  time_to_detect_hours: 0,
  time_to_contain_hours: 0,
  time_to_recover_hours: 0,
  root_cause: '',
  lessons_learned: '',
  remediation_actions: '',
  remediation_completed: false,
  publicly_disclosed: false,
  disclosure_url: '',
})

onMounted(() => {
  if (props.incident) {
    Object.keys(formData.value).forEach((key) => {
      if (props.incident[key] !== undefined) {
        formData.value[key] = props.incident[key]
      }
    })
  }
})

const handleSubmit = async () => {
  loading.value = true
  try {
    // Ensure numeric fields are actually numbers or null
    ;[
      'financial_impact',
      'downtime_hours',
      'records_affected',
      'time_to_detect_hours',
      'time_to_contain_hours',
      'time_to_recover_hours',
    ].forEach((key) => {
      formData.value[key] = Number(formData.value[key]) || 0
    })

    if (props.incident) {
      await vendorStore.updateIncident(props.incident.id, formData.value)
    } else {
      await vendorStore.createIncident(formData.value)
    }
    emit('save')
    emit('close')
  } catch (error) {
    console.error('Failed to save incident:', error)
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

.modal-container.wider {
  max-width: 800px;
}
.modal-container {
  background: #f8fafc;
  border-radius: 32px;
  width: 100%;
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
.header-icon-bg.danger {
  background: #fee2e2;
  color: #ef4444;
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
  margin-bottom: 48px;
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
.form-row-triple {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

.input-with-icon {
  position: relative;
}
.prefix {
  position: absolute;
  left: 14px;
  top: 12px;
  color: #94a3b8;
  font-weight: 700;
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
.animate-in-fast {
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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
