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
        <p class="mb-4 text-muted">
          Clone this simulation with new parameters to instantly preview alternative scenario outcomes.
        </p>
        <div v-if="loading" class="loading-zone">
          <LoadingSpinner />
        </div>
        <form v-else @submit.prevent="handleSubmit" class="form-grid">
          <div class="form-group">
            <label class="form-label">New Simulation Name</label>
            <input
              v-model="newName"
              type="text"
              class="form-input"
              required
            />
          </div>

          <div class="params-divider">
            <span>Adjust Parameters</span>
          </div>

          <div class="params-grid">
            <div v-for="(value, key) in modifiedParameters" :key="key" class="form-group">
              <label class="form-label">{{ formatParamLabel(key) }}</label>
              <!-- Try to infer type from value, simplified approach -->
              <input
                v-if="typeof value === 'number'"
                v-model.number="modifiedParameters[key]"
                type="number"
                class="form-input"
              />
              <div v-else-if="typeof value === 'boolean'" class="toggle-wrapper">
                <button
                  type="button"
                  class="toggle-btn"
                  :class="{ active: modifiedParameters[key] }"
                  @click="modifiedParameters[key] = !modifiedParameters[key]"
                >
                  {{ modifiedParameters[key] ? 'Yes' : 'No' }}
                </button>
              </div>
              <input
                v-else
                v-model="modifiedParameters[key]"
                type="text"
                class="form-input"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="$emit('close')" class="btn btn-secondary">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting" class="spinner"></span>
              {{ submitting ? 'Running...' : 'Run Analysis' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSimulationStore } from '../../stores/simulation'
import LoadingSpinner from '../common/LoadingSpinner.vue'
import { X } from 'lucide-vue-next'

const props = defineProps({
  baseSimulation: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'completed'])
const router = useRouter()
const simulationStore = useSimulationStore()

const newName = ref('')
const modifiedParameters = ref({})
const loading = ref(true)
const submitting = ref(false)

onMounted(() => {
  newName.value = `${props.baseSimulation.name} (What-If Clone)`
  
  if (props.baseSimulation.parameters) {
    // deep clone
    modifiedParameters.value = JSON.parse(JSON.stringify(props.baseSimulation.parameters))
  }
  loading.value = false
})

const formatParamLabel = (key) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const handleSubmit = async () => {
  submitting.value = true
  try {
    const payload = {
      base_simulation_id: props.baseSimulation.id,
      new_name: newName.value,
      modified_parameters: modifiedParameters.value,
      auto_execute: true
    }
    
    // There is no explicit WhatIf store action, use service directly or store
    const result = await simulationStore.whatIfAnalysis(payload)
    emit('completed', result)
  } catch (error) {
    console.error('What-If failed', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 0;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
}
.modal-header h2 { font-size: 20px; font-weight: 700; margin: 0; }
.close-btn { background: none; border: none; cursor: pointer; color: #64748b; }
.close-btn:hover { color: #0f172a; }

.modal-body { padding: 24px; }
.text-muted { color: #64748b; font-size: 14px; }

.params-divider {
  margin: 24px 0;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.params-divider span {
  position: absolute;
  background: white;
  padding: 0 16px;
  color: #94a3b8;
  font-weight: 600;
  font-size: 13px;
}

.params-grid {
  display: grid;
  gap: 16px;
}

.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-label { font-size: 13px; font-weight: 700; color: #334155; }
.form-input { padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; }

.toggle-btn {
  padding: 10px 20px;
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
.toggle-btn.active { background: #10b981; color: white; }

.modal-footer {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn { padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; border: none; }
.btn-secondary { background: white; border: 2px solid #e2e8f0; color: #475569; }
.btn-primary { background: var(--primary, #3b82f6); color: white; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
</style>
