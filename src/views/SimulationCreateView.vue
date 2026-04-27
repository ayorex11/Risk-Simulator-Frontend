<template>
  <div class="page-container">
    <NavBar />
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-content">
          <button @click="router.push('/simulations')" class="back-btn">
            <ArrowLeft class="icon-sm" />
            <span>Back to Simulations</span>
          </button>
          <div class="header-text">
            <div class="header-badge">
              <Zap class="badge-icon" />
              <span>New Simulation</span>
            </div>
            <h1 class="page-title">Configure Simulation</h1>
            <p class="page-subtitle">Select a scenario, target vendor, and configure parameters.</p>
          </div>
        </div>
      </header>

      <!-- Progress Steps -->
      <div class="stepper">
        <div
          v-for="(stepInfo, index) in steps"
          :key="index"
          class="step"
          :class="{ active: step === index, completed: step > index }"
        >
          <div class="step-number">
            <CheckCircle v-if="step > index" class="step-check" />
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="step-label">{{ stepInfo }}</span>
        </div>
      </div>

      <!-- Step 1: Choose Scenario -->
      <div v-if="step === 0" class="step-content">
        <h2 class="step-title">Select Scenario Type</h2>
        <p class="step-desc">Choose the type of cyber incident to simulate.</p>

        <div v-if="loadingTemplates" class="loading-zone">
          <LoadingSpinner />
        </div>

        <div v-else class="scenario-grid">
          <div
            v-for="template in scenarioTemplates"
            :key="template.id"
            class="scenario-card"
            :class="{ selected: form.scenario_template === template.id }"
            @click="selectTemplate(template)"
          >
            <div class="scenario-icon">{{ getScenarioEmoji(template.scenario_type) }}</div>
            <h3 class="scenario-name">{{ template.name }}</h3>
            <p class="scenario-desc">{{ template.description }}</p>
            <div v-if="form.scenario_template === template.id" class="selected-indicator">
              <CheckCircle class="check-icon" />
            </div>
          </div>
        </div>
      </div>

      <!-- Step 2: Choose Vendor -->
      <div v-if="step === 1" class="step-content">
        <h2 class="step-title">Select Target Vendor</h2>
        <p class="step-desc">Choose the vendor to model the incident against.</p>

        <div class="vendor-search-wrapper">
          <Search class="vendor-search-icon" />
          <input
            v-model="vendorSearch"
            type="text"
            placeholder="Search vendors..."
            class="vendor-search-input"
          />
        </div>

        <div class="vendor-grid">
          <div
            v-for="vendor in filteredVendors"
            :key="vendor.id"
            class="vendor-option"
            :class="{ selected: form.target_vendor === vendor.id }"
            @click="form.target_vendor = vendor.id"
          >
            <div class="vendor-avatar">{{ vendor.name.charAt(0) }}</div>
            <div class="vendor-info">
              <span class="vendor-name">{{ vendor.name }}</span>
              <span class="vendor-industry">{{ vendor.industry }}</span>
            </div>
            <div v-if="form.target_vendor === vendor.id" class="selected-indicator">
              <CheckCircle class="check-icon" />
            </div>
          </div>
        </div>
      </div>

      <!-- Step 3: Configure Parameters -->
      <div v-if="step === 2" class="step-content">
        <h2 class="step-title">Configure Parameters</h2>
        <p class="step-desc">Set the scenario parameters. Defaults are pre-filled.</p>

        <div v-if="loadingParams" class="loading-zone">
          <LoadingSpinner />
        </div>

        <div v-else class="params-form">
          <div class="form-group">
            <label class="form-label">Simulation Name</label>
            <input
              v-model="form.name"
              type="text"
              class="form-input"
              placeholder="e.g. Q1 Ransomware Test"
            />
            <span v-if="errors.name" class="form-error">{{ errors.name }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea
              v-model="form.description"
              class="form-input"
              rows="3"
              placeholder="Briefly describe the purpose of this simulation"
            ></textarea>
            <span v-if="errors.description" class="form-error">{{ errors.description }}</span>
          </div>

          <div class="params-divider">
            <span>Scenario Parameters</span>
          </div>

          <div v-if="parameterSchema" class="params-grid">
            <div
              v-for="(desc, key) in parameterSchema.parameter_descriptions"
              :key="key"
              class="form-group"
            >
              <label class="form-label">
                {{ formatParamLabel(key) }}
                <span class="param-hint">{{ desc }}</span>
              </label>

              <!-- Boolean -->
              <div v-if="parameterSchema.parameter_types[key] === 'boolean'" class="toggle-wrapper">
                <button
                  class="toggle-btn"
                  :class="{ active: form.parameters[key] }"
                  @click="form.parameters[key] = !form.parameters[key]"
                >
                  {{ form.parameters[key] ? 'Yes' : 'No' }}
                </button>
              </div>

              <!-- Select -->
              <select
                v-else-if="parameterSchema.parameter_types[key] === 'select'"
                v-model="form.parameters[key]"
                class="form-select"
              >
                <option v-for="opt in getSelectOptions(key)" :key="opt" :value="opt">
                  {{ formatParamLabel(opt) }}
                </option>
              </select>

              <!-- Multi-Select -->
              <div
                v-else-if="parameterSchema.parameter_types[key] === 'multi-select'"
                class="multi-select"
              >
                <label v-for="opt in getSelectOptions(key)" :key="opt" class="checkbox-label">
                  <input
                    type="checkbox"
                    :value="opt"
                    v-model="form.parameters[key]"
                    class="checkbox-input"
                  />
                  <span class="checkbox-text">{{ opt }}</span>
                </label>
              </div>

              <!-- Number -->
              <input
                v-else
                v-model.number="form.parameters[key]"
                type="number"
                class="form-input"
                :min="parameterSchema.parameter_constraints[key]?.min"
                :max="parameterSchema.parameter_constraints[key]?.max"
                :step="parameterSchema.parameter_constraints[key]?.step || 1"
              />
            </div>
          </div>

          <!-- Example Scenarios -->
          <div v-if="parameterSchema?.example_scenarios?.length" class="examples-section">
            <h4 class="examples-title">Quick-Fill Examples</h4>
            <div class="examples-grid">
              <button
                v-for="(example, idx) in parameterSchema.example_scenarios"
                :key="idx"
                class="example-btn"
                @click="applyExample(example)"
              >
                <span class="example-name">{{ example.name }}</span>
                <span class="example-impact">{{ example.estimated_impact }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Step 4: Monte Carlo & Review -->
      <div v-if="step === 3" class="step-content">
        <h2 class="step-title">Advanced Options & Review</h2>
        <p class="step-desc">Enable Monte Carlo simulation for probabilistic analysis.</p>

        <div class="review-section">
          <!-- Monte Carlo Toggle -->
          <div class="mc-card">
            <div class="mc-header">
              <div class="mc-info">
                <h3 class="mc-title">Monte Carlo Simulation</h3>
                <p class="mc-desc">
                  Run thousands of iterations to get statistical distributions of impact ranges.
                </p>
              </div>
              <button
                class="toggle-btn lg"
                :class="{ active: form.use_monte_carlo }"
                @click="form.use_monte_carlo = !form.use_monte_carlo"
              >
                {{ form.use_monte_carlo ? 'Enabled' : 'Disabled' }}
              </button>
            </div>
            <div v-if="form.use_monte_carlo" class="mc-options">
              <label class="form-label">Iterations (1,000 – 10,000)</label>
              <input
                v-model.number="form.monte_carlo_iterations"
                type="range"
                min="1000"
                max="10000"
                step="100"
                class="range-input"
              />
              <span class="range-value"
                >{{ form.monte_carlo_iterations.toLocaleString() }} iterations</span
              >
            </div>
          </div>

          <!-- Review Summary -->
          <div class="review-card">
            <h3 class="review-title">Simulation Summary</h3>
            <div class="review-grid">
              <div class="review-item">
                <span class="review-label">Scenario</span>
                <span class="review-value">{{ selectedTemplateName }}</span>
              </div>
              <div class="review-item">
                <span class="review-label">Vendor</span>
                <span class="review-value">{{ selectedVendorName }}</span>
              </div>
              <div class="review-item">
                <span class="review-label">Simulation Name</span>
                <span class="review-value">{{ form.name || '—' }}</span>
              </div>
              <div class="review-item">
                <span class="review-label">Monte Carlo</span>
                <span class="review-value">{{
                  form.use_monte_carlo ? `${form.monte_carlo_iterations} iterations` : 'Disabled'
                }}</span>
              </div>
              <div class="review-item">
                <span class="review-label">Parameters</span>
                <span class="review-value"
                  >{{ Object.keys(form.parameters).length }} configured</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="step-nav">
        <button v-if="step > 0" @click="step--" class="btn btn-secondary">
          <ArrowLeft class="icon-sm" />
          Back
        </button>
        <div class="nav-spacer"></div>
        <button v-if="step < 3" @click="nextStep" class="btn btn-primary" :disabled="!canProceed">
          Continue
          <ArrowRight class="icon-sm" />
        </button>
        <button v-else @click="submitSimulation" class="btn btn-primary" :disabled="submitting">
          <Zap v-if="!submitting" class="icon-sm" />
          {{ submitting ? 'Creating...' : 'Create Simulation' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSimulationStore } from '../stores/simulation'
import { useVendorStore } from '../stores/vendor'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import { ArrowLeft, ArrowRight, Zap, Search, CheckCircle } from 'lucide-vue-next'

const router = useRouter()
const simulationStore = useSimulationStore()
const vendorStore = useVendorStore()

const steps = ['Scenario', 'Vendor', 'Parameters', 'Review']
const step = ref(0)
const loadingTemplates = ref(false)
const loadingParams = ref(false)
const submitting = ref(false)
const vendorSearch = ref('')
const scenarioTemplates = ref([])
const parameterSchema = ref(null)

const form = ref({
  name: '',
  description: '',
  scenario_template: null,
  target_vendor: null,
  parameters: {},
  use_monte_carlo: false,
  monte_carlo_iterations: 1000,
  tags: [],
})

const errors = ref({})

const filteredVendors = computed(() => {
  const vendors = vendorStore.vendors || []
  if (!vendorSearch.value) return vendors
  const q = vendorSearch.value.toLowerCase()
  return vendors.filter(
    (v) => v.name.toLowerCase().includes(q) || (v.industry && v.industry.toLowerCase().includes(q)),
  )
})

const selectedTemplateName = computed(() => {
  const t = scenarioTemplates.value.find((t) => t.id === form.value.scenario_template)
  return t?.name || '—'
})

const selectedVendorName = computed(() => {
  const v = (vendorStore.vendors || []).find((v) => v.id === form.value.target_vendor)
  return v?.name || '—'
})

const canProceed = computed(() => {
  if (step.value === 0) return !!form.value.scenario_template
  if (step.value === 1) return !!form.value.target_vendor
  if (step.value === 2) return !!form.value.name
  return true
})

const getScenarioEmoji = (type) => {
  const map = {
    data_breach: '🔓',
    ransomware: '💀',
    service_disruption: '⚠️',
    supply_chain: '🔗',
    multi_vendor: '🌐',
  }
  return map[type] || '⚡'
}

const formatParamLabel = (key) => {
  return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const getSelectOptions = (key) => {
  const constraints = parameterSchema.value?.parameter_constraints?.[key]
  if (Array.isArray(constraints)) return constraints
  // For select fields, try to get from default_parameters or return empty
  const defaultVal = parameterSchema.value?.default_parameters?.[key]
  if (Array.isArray(defaultVal)) return defaultVal
  return []
}

const selectTemplate = async (template) => {
  form.value.scenario_template = template.id
  // Pre-generate name
  form.value.name = `${template.name} - ${new Date().toLocaleDateString()}`
}

const nextStep = async () => {
  if (step.value === 0 && form.value.scenario_template) {
    // Load parameters for next step when going from step 0 to step 2
    loadingParams.value = true
    try {
      parameterSchema.value = await simulationStore.fetchScenarioParameters(
        form.value.scenario_template,
      )
      // Initialize parameters with defaults
      if (parameterSchema.value?.default_parameters) {
        form.value.parameters = { ...parameterSchema.value.default_parameters }
      }
      // Initialize multi-select arrays
      if (parameterSchema.value?.parameter_types) {
        for (const [key, type] of Object.entries(parameterSchema.value.parameter_types)) {
          if (type === 'multi-select' && !Array.isArray(form.value.parameters[key])) {
            form.value.parameters[key] = form.value.parameters[key]
              ? [form.value.parameters[key]]
              : []
          }
        }
      }
    } catch {
      // Keep empty params
    } finally {
      loadingParams.value = false
    }
  }
  step.value++
}

const applyExample = (example) => {
  form.value.parameters = { ...example.parameters }
  form.value.name = example.name + ' - ' + selectedVendorName.value
}

const submitSimulation = async () => {
  submitting.value = true
  try {
    const payload = {
      ...form.value,
      parameters: form.value.parameters
    }
    const result = await simulationStore.createSimulation(payload)
    if (result && result.fieldErrors) {
      Object.keys(result.fieldErrors).forEach(key => {
        const val = result.fieldErrors[key]
        errors.value[key] = Array.isArray(val) ? val[0] : val
      })
      return
    }
    
    // Setup background execution message if needed
    if (form.value.auto_execute) {
      // Logic for auto-execution
    }
    router.push(`/simulations/${result.id}`)
  } catch {
    // Error is handled by store toast
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  loadingTemplates.value = true
  try {
    scenarioTemplates.value = await simulationStore.fetchScenarioTemplates()
  } catch {
    // handled by store
  } finally {
    loadingTemplates.value = false
  }

  // Load vendors for step 2
  if (!vendorStore.vendors?.length) {
    vendorStore.fetchVendors()
  }
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
}
.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px 100px;
}

/* Header */
.page-header {
  padding: 48px 0 32px;
  animation: fadeIn 0.5s ease-out;
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: none;
  background: none;
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 20px;
  transition: color 0.2s;
}
.back-btn:hover {
  color: #7c3aed;
}
.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.25);
}
.badge-icon {
  width: 14px;
  height: 14px;
}
.page-title {
  font-size: 40px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0 0 12px;
}
.page-subtitle {
  font-size: 16px;
  color: #64748b;
  font-weight: 500;
  margin: 0;
}

/* Stepper */
.stepper {
  display: flex;
  gap: 8px;
  margin-bottom: 48px;
  animation: fadeIn 0.5s ease-out 0.1s both;
}
.step {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-radius: 16px;
  background: white;
  border: 2px solid #e2e8f0;
  transition: all 0.3s;
}
.step.active {
  border-color: #7c3aed;
  background: #faf5ff;
}
.step.completed {
  border-color: #10b981;
  background: #ecfdf5;
}
.step-number {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 900;
  color: #64748b;
  flex-shrink: 0;
}
.step.active .step-number {
  background: #7c3aed;
  color: white;
}
.step.completed .step-number {
  background: #10b981;
  color: white;
}
.step-check {
  width: 18px;
  height: 18px;
}
.step-label {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
}
.step.active .step-label {
  color: #7c3aed;
}
.step.completed .step-label {
  color: #059669;
}

/* Step Content */
.step-content {
  animation: fadeIn 0.4s ease-out;
  margin-bottom: 40px;
}
.step-title {
  font-size: 28px;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 8px;
}
.step-desc {
  font-size: 15px;
  color: #64748b;
  margin: 0 0 32px;
}
.loading-zone {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

/* Scenario Grid */
.scenario-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}
.scenario-card {
  position: relative;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 24px;
  padding: 32px 28px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}
.scenario-card:hover {
  border-color: #c4b5fd;
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(124, 58, 237, 0.08);
}
.scenario-card.selected {
  border-color: #7c3aed;
  background: #faf5ff;
  box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
}
.scenario-icon {
  font-size: 48px;
  margin-bottom: 16px;
}
.scenario-name {
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 8px;
}
.scenario-desc {
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}
.selected-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
}
.check-icon {
  width: 24px;
  height: 24px;
  color: #7c3aed;
}

/* Vendor Grid */
.vendor-search-wrapper {
  position: relative;
  margin-bottom: 24px;
}
.vendor-search-icon {
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  color: #94a3b8;
  pointer-events: none;
}
.vendor-search-input {
  width: 100%;
  padding: 16px 20px 16px 52px;
  border-radius: 16px;
  border: 2px solid #e2e8f0;
  background: white;
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.vendor-search-input:focus {
  border-color: #7c3aed;
  outline: none;
}
.vendor-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}
.vendor-option {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.2s;
}
.vendor-option:hover {
  border-color: #c4b5fd;
}
.vendor-option.selected {
  border-color: #7c3aed;
  background: #faf5ff;
}
.vendor-avatar {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
  font-size: 20px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.vendor-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.vendor-name {
  font-size: 16px;
  font-weight: 800;
  color: #0f172a;
}
.vendor-industry {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

/* Parameters Form */
.params-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-label {
  font-size: 13px;
  font-weight: 800;
  color: #334155;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.param-hint {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
  text-transform: none;
  letter-spacing: 0;
  margin-top: 2px;
}
.form-input,
.form-select,
.form-textarea {
  padding: 14px 18px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 500;
  color: #1e293b;
  background: white;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}
.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  border-color: #7c3aed;
  outline: none;
}
.form-textarea {
  resize: vertical;
  font-family: inherit;
}
.params-divider {
  text-align: center;
  padding: 16px 0;
}
.params-divider span {
  font-size: 12px;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: #f8fafc;
  padding: 4px 16px;
  border-radius: 8px;
}
.params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}
.toggle-wrapper {
  display: flex;
}
.toggle-btn {
  padding: 10px 24px;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  background: white;
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}
.toggle-btn.active {
  background: #7c3aed;
  color: white;
  border-color: #7c3aed;
}
.toggle-btn.lg {
  padding: 12px 28px;
  font-size: 15px;
}
.multi-select {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}
.checkbox-label:hover {
  border-color: #c4b5fd;
}
.checkbox-input:checked + .checkbox-text {
  color: #7c3aed;
  font-weight: 700;
}
.checkbox-text {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  text-transform: capitalize;
}

/* Examples */
.examples-section {
  margin-top: 16px;
  padding-top: 24px;
  border-top: 2px solid #f1f5f9;
}
.examples-title {
  font-size: 14px;
  font-weight: 900;
  color: #64748b;
  margin: 0 0 16px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.examples-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.example-btn {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  background: white;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}
.example-btn:hover {
  border-color: #c4b5fd;
  background: #faf5ff;
}
.example-name {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}
.example-impact {
  font-size: 12px;
  font-weight: 600;
  color: #7c3aed;
}

/* Monte Carlo & Review */
.review-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.mc-card,
.review-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 24px;
  padding: 32px;
}
.mc-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}
.mc-title {
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 8px;
}
.mc-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}
.mc-options {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.range-input {
  width: 100%;
  accent-color: #7c3aed;
}
.range-value {
  font-size: 14px;
  font-weight: 700;
  color: #7c3aed;
  text-align: center;
}
.review-title {
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 24px;
}
.review-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.review-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.review-label {
  font-size: 11px;
  font-weight: 900;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.review-value {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

/* Step Navigation */
.step-nav {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 0;
  border-top: 2px solid #f1f5f9;
}
.nav-spacer {
  flex: 1;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 28px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-decoration: none;
  white-space: nowrap;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
}
.btn-primary {
  background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
}
.btn-primary:hover:not(:disabled) {
  box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
  transform: translateY(-2px);
}
.btn-secondary {
  background: white;
  color: #475569;
  border: 2px solid #e2e8f0;
}
.btn-secondary:hover {
  background: #f8fafc;
}
.icon-sm {
  width: 18px;
  height: 18px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .stepper {
    flex-direction: column;
  }
  .scenario-grid {
    grid-template-columns: 1fr;
  }
  .params-grid {
    grid-template-columns: 1fr;
  }
  .review-grid {
    grid-template-columns: 1fr;
  }
}
</style>
