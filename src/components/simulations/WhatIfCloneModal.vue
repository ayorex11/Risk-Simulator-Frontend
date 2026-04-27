<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Run What-If Analysis</h2>
        <button @click="$emit('close')" class="close-btn">
          <X class="icon" />
        </button>
      </div>

      <div class="modal-body">
        <p class="text-muted">
          Clone this simulation with new parameters to instantly preview alternative scenario outcomes.
        </p>

        <div v-if="loading" class="loading-zone">
          <LoadingSpinner />
        </div>

        <div v-else class="form-grid">
          <!-- Name -->
          <div class="form-group">
            <label class="form-label">New Simulation Name</label>
            <input v-model="newName" type="text" class="form-input" />
          </div>

          <div class="params-divider"><span>Adjust Parameters</span></div>

          <!-- Schema-driven parameter fields -->
          <div v-if="paramSchema" class="params-grid">
            <div
              v-for="(desc, key) in paramSchema.parameter_descriptions"
              :key="key"
              class="form-group"
            >
              <label class="form-label">
                {{ formatLabel(key) }}
                <span class="param-hint">{{ desc }}</span>
              </label>

              <!-- Boolean -->
              <div v-if="paramSchema.parameter_types[key] === 'boolean'" class="toggle-wrapper">
                <button
                  type="button"
                  class="toggle-btn"
                  :class="{ active: modifiedParameters[key] }"
                  @click="modifiedParameters[key] = !modifiedParameters[key]"
                >
                  {{ modifiedParameters[key] ? 'Yes' : 'No' }}
                </button>
              </div>

              <!-- Select dropdown -->
              <select
                v-else-if="paramSchema.parameter_types[key] === 'select'"
                v-model="modifiedParameters[key]"
                class="form-input form-select"
              >
                <option
                  v-for="opt in getOptions(key)"
                  :key="opt"
                  :value="opt"
                >
                  {{ formatLabel(opt) }}
                </option>
              </select>

              <!-- Multi-select checkboxes -->
              <div
                v-else-if="paramSchema.parameter_types[key] === 'multi-select'"
                class="multi-select"
              >
                <label
                  v-for="opt in getOptions(key)"
                  :key="opt"
                  class="checkbox-label"
                  :class="{ checked: Array.isArray(modifiedParameters[key]) && modifiedParameters[key].includes(opt) }"
                >
                  <input
                    type="checkbox"
                    :value="opt"
                    v-model="modifiedParameters[key]"
                    class="checkbox-input"
                  />
                  <span class="checkbox-text">{{ opt }}</span>
                </label>
              </div>

              <!-- Number with enforced min/max -->
              <div v-else class="number-wrapper">
                <input
                  v-model.number="modifiedParameters[key]"
                  type="number"
                  class="form-input"
                  :min="paramSchema.parameter_constraints[key]?.min"
                  :max="paramSchema.parameter_constraints[key]?.max"
                  :step="paramSchema.parameter_constraints[key]?.step || 1"
                  @blur="clampValue(key)"
                />
                <span
                  v-if="paramSchema.parameter_constraints[key]?.min !== undefined"
                  class="constraint-hint"
                >
                  {{ paramSchema.parameter_constraints[key].min }}
                  –
                  {{ paramSchema.parameter_constraints[key].max }}
                </span>
              </div>

              <!-- Validation error -->
              <span v-if="fieldErrors[key]" class="field-error">{{ fieldErrors[key] }}</span>
            </div>
          </div>

          <!-- Fallback: no schema loaded -->
          <div v-else class="empty-schema">
            <p>Could not load parameter schema. You can still proceed with default parameters.</p>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button type="button" @click="$emit('close')" class="btn btn-secondary">Cancel</button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="submitting || !newName.trim()"
              @click="handleSubmit"
            >
              <span v-if="submitting" class="spinner"></span>
              {{ submitting ? 'Running...' : 'Run Analysis' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSimulationStore } from '../../stores/simulation'
import LoadingSpinner from '../common/LoadingSpinner.vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  baseSimulation: { type: Object, required: true }
})
const emit = defineEmits(['close', 'completed'])

const simulationStore = useSimulationStore()

const newName         = ref('')
const modifiedParameters = ref({})
const paramSchema     = ref(null)   // full schema from /scenario-parameters/
const loading         = ref(true)
const submitting      = ref(false)
const fieldErrors     = ref({})

// ── Helpers ───────────────────────────────────────────────────────────────

const formatLabel = (key) =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

/** Return the array of options for select / multi-select fields */
const getOptions = (key) => {
  const constraints = paramSchema.value?.parameter_constraints?.[key]
  if (Array.isArray(constraints)) return constraints
  return []
}

/**
 * Clamp a number field to its min/max after the user leaves the input.
 * Also enforces step rounding for fields like cascade_probability.
 */
const clampValue = (key) => {
  const c = paramSchema.value?.parameter_constraints?.[key]
  if (!c || typeof c !== 'object' || Array.isArray(c)) return

  let val = Number(modifiedParameters.value[key])
  if (isNaN(val)) return

  if (c.min !== undefined && val < c.min) val = c.min
  if (c.max !== undefined && val > c.max) val = c.max

  // Round to step precision if step is defined (e.g. 0.1)
  if (c.step !== undefined) {
    const decimals = (c.step.toString().split('.')[1] || '').length
    val = parseFloat(val.toFixed(decimals))
  }

  modifiedParameters.value[key] = val

  // Clear any previous error for this field
  delete fieldErrors.value[key]
}

/** Client-side validation before submitting */
const validate = () => {
  fieldErrors.value = {}
  if (!paramSchema.value) return true

  for (const [key, type] of Object.entries(paramSchema.value.parameter_types || {})) {
    const c = paramSchema.value.parameter_constraints?.[key]
    const val = modifiedParameters.value[key]

    if (type === 'number' && c && typeof c === 'object' && !Array.isArray(c)) {
      const num = Number(val)
      if (c.min !== undefined && num < c.min)
        fieldErrors.value[key] = `Minimum value is ${c.min}`
      if (c.max !== undefined && num > c.max)
        fieldErrors.value[key] = `Maximum value is ${c.max}`
    }

    if (type === 'multi-select' && (!Array.isArray(val) || val.length === 0))
      fieldErrors.value[key] = 'Select at least one option'
  }

  return Object.keys(fieldErrors.value).length === 0
}

// ── Lifecycle ─────────────────────────────────────────────────────────────

onMounted(async () => {
  newName.value = `${props.baseSimulation.name} (What-If)`

  try {
    // Fetch the full schema so we get types, constraints, and options
    const templateId = props.baseSimulation.scenario_template
    if (templateId) {
      paramSchema.value = await simulationStore.fetchScenarioParameters(templateId)
    }

    // Deep-clone the base simulation's current parameters as the starting point
    modifiedParameters.value = props.baseSimulation.parameters
      ? JSON.parse(JSON.stringify(props.baseSimulation.parameters))
      : {}

    // Ensure multi-select fields are arrays
    if (paramSchema.value?.parameter_types) {
      for (const [key, type] of Object.entries(paramSchema.value.parameter_types)) {
        if (type === 'multi-select' && !Array.isArray(modifiedParameters.value[key])) {
          modifiedParameters.value[key] = modifiedParameters.value[key]
            ? [modifiedParameters.value[key]]
            : []
        }
      }
    }
  } catch {
    // Schema load failure is non-fatal; we still let the user proceed
  } finally {
    loading.value = false
  }
})

// ── Submit ────────────────────────────────────────────────────────────────

const handleSubmit = async () => {
  if (!validate()) return

  submitting.value = true
  try {
    const payload = {
      base_simulation_id: props.baseSimulation.id,
      scenario_name:      newName.value.trim(),
      parameter_changes:  modifiedParameters.value,
      auto_execute:       true,
    }
    const result = await simulationStore.whatIfAnalysis(payload)
    // The backend returns { new_simulation: {...}, ... }
    emit('completed', result.new_simulation ?? result)
  } catch {
    // Error toast already handled by the store
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}
.modal-container {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 640px;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 28px;
  border-bottom: 2px solid #f1f5f9;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}
.modal-header h2 { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0; }
.close-btn { background: none; border: none; cursor: pointer; color: #64748b; padding: 4px; }
.close-btn:hover { color: #0f172a; }
.icon { width: 20px; height: 20px; }

.modal-body { padding: 28px; }
.text-muted { color: #64748b; font-size: 14px; margin: 0 0 24px; }

.loading-zone { display: flex; justify-content: center; padding: 48px 0; }

.form-grid { display: flex; flex-direction: column; gap: 20px; }

/* Name field */
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label {
  font-size: 12px; font-weight: 800; color: #334155;
  text-transform: uppercase; letter-spacing: 0.04em;
}
.param-hint {
  display: block; font-size: 11px; font-weight: 500;
  color: #94a3b8; text-transform: none; letter-spacing: 0; margin-top: 2px;
}
.form-input {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  background: white;
  width: 100%;
  box-sizing: border-box;
  transition: border-color 0.2s;
}
.form-input:focus { border-color: #7c3aed; outline: none; }
.form-select { cursor: pointer; }

/* Divider */
.params-divider {
  display: flex; align-items: center; justify-content: center;
  padding: 4px 0; position: relative;
}
.params-divider::before {
  content: '';
  position: absolute;
  left: 0; right: 0;
  height: 1px;
  background: #e2e8f0;
}
.params-divider span {
  position: relative;
  background: white;
  padding: 0 16px;
  font-size: 11px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Params grid */
.params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

/* Toggle */
.toggle-wrapper { display: flex; }
.toggle-btn {
  padding: 10px 24px; border-radius: 10px;
  border: 2px solid #e2e8f0; background: white;
  font-size: 14px; font-weight: 700; color: #64748b;
  cursor: pointer; transition: all 0.2s;
}
.toggle-btn.active { background: #7c3aed; color: white; border-color: #7c3aed; }

/* Multi-select */
.multi-select { display: flex; flex-wrap: wrap; gap: 8px; }
.checkbox-label {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 14px;
  border: 2px solid #e2e8f0; border-radius: 10px;
  cursor: pointer; transition: all 0.2s;
  font-size: 13px; font-weight: 600; color: #475569;
}
.checkbox-label:hover { border-color: #c4b5fd; }
.checkbox-label.checked { border-color: #7c3aed; background: #faf5ff; color: #7c3aed; }
.checkbox-input { width: 14px; height: 14px; accent-color: #7c3aed; }
.checkbox-text { text-transform: capitalize; }

/* Number */
.number-wrapper { display: flex; flex-direction: column; gap: 4px; }
.constraint-hint { font-size: 11px; color: #94a3b8; font-weight: 600; }

/* Errors */
.field-error { font-size: 12px; color: #ef4444; font-weight: 600; }

/* Empty schema fallback */
.empty-schema {
  padding: 20px; background: #f8fafc;
  border: 1px dashed #cbd5e1; border-radius: 12px;
  text-align: center;
}
.empty-schema p { color: #64748b; font-size: 14px; margin: 0; }

/* Footer */
.modal-footer {
  display: flex; justify-content: flex-end; gap: 12px;
  padding-top: 24px;
  border-top: 2px solid #f1f5f9;
}
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 24px; border-radius: 12px;
  font-size: 14px; font-weight: 700;
  cursor: pointer; border: none; transition: all 0.2s;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary { background: white; border: 2px solid #e2e8f0; color: #475569; }
.btn-secondary:hover { background: #f8fafc; }
.btn-primary {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
}
.btn-primary:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
  transform: translateY(-2px);
}
.spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
