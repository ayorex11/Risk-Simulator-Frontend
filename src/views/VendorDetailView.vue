<template>
  <div class="page-container">
    <NavBar />

    <main class="vendor-detail-page py-8">
      <div class="container overflow-visible">
        <!-- Loading -->
        <div v-if="vendorStore.loading && !currentVendor" class="flex justify-center py-20">
          <LoadingSpinner />
        </div>

        <!-- Error -->
        <div v-else-if="!currentVendor" class="card glass p-20 text-center max-w-2xl mx-auto">
          <AlertCircle class="large-icon text-red-500 mb-6 mx-auto" />
          <h2 class="text-2xl font-black mb-4">Vendor Trace Lost</h2>
          <p class="text-muted mb-8">
            This vendor profile is no longer accessible or has been purged from the ecosystem.
          </p>
          <router-link to="/vendors" class="btn btn-primary lg">Return to Fleet</router-link>
        </div>

        <!-- Main View -->
        <div v-else class="animate-in">
          <!-- Premium Hero Section -->
          <header class="vendor-hero mb-8">
            <div class="hero-main card glass">
              <div class="hero-left">
                <router-link to="/vendors" class="back-pill mb-6">
                  <ArrowLeft class="icon-xs" /> Back to Ecosystem
                </router-link>
                <div class="flex items-center gap-4 mb-2">
                  <h1 class="text-4xl font-black tracking-tighter">{{ currentVendor.name }}</h1>
                  <span
                    class="status-indicator"
                    :class="{ active: currentVendor.is_active }"
                  ></span>
                </div>
                <div class="hero-tags">
                  <span class="h-tag">{{ currentVendor.industry }}</span>
                  <span class="h-tag">{{ currentVendor.country }}</span>
                  <span class="h-tag-outline" v-if="currentVendor.is_active"
                    >Active Production</span
                  >
                </div>
              </div>

              <div class="hero-right">
                <div
                  class="risk-summary-card"
                  :class="getRiskClass(currentVendor.overall_risk_score)"
                >
                  <div class="r-val-big">
                    {{ (currentVendor.overall_risk_score || 0).toFixed(3) }}
                  </div>
                  <div class="r-label-big">AGGREGATE RISK</div>
                  <div class="r-status-big">
                    {{ getRiskLevelText(currentVendor.overall_risk_score) }}
                  </div>
                </div>
              </div>
            </div>

            <div class="hero-actions-floating mt-4">
              <div class="flex gap-3">
                <button
                  @click="recalculateRisk"
                  class="btn btn-secondary shadow-sm"
                  :disabled="vendorStore.loading"
                >
                  <RefreshCw class="icon-sm" :class="{ 'animate-spin': vendorStore.loading }" />
                  Recalculate
                </button>
                <button @click="showEditModal = true" class="btn btn-primary shadow-lg">
                  <Edit class="icon-sm" /> Edit Profile
                </button>
              </div>
            </div>
          </header>

          <!-- Tabs Interface -->
          <section class="tab-system">
            <div class="tabs-island glass mb-6">
              <div class="tabs-inner">
                <button
                  v-for="tab in [
                    'overview',
                    'history',
                    'supply-chain',
                    'incidents',
                    'compliance',
                    'contacts',
                  ]"
                  :key="tab"
                  @click="activeTab = tab"
                  class="t-btn"
                  :class="{ active: activeTab === tab }"
                >
                  {{ tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ') }}
                </button>
              </div>
            </div>

            <div class="tab-content card shadow-xl">
              <!-- Overview Tab -->
              <div v-if="activeTab === 'overview'" class="tab-grid animate-in-fast">
                <div class="tab-col">
                  <div class="section-title-premium">
                    <Building class="icon-primary" /> Profile Details
                  </div>
                  <div class="data-group">
                    <div class="data-item">
                      <label>Primary Gateway</label>
                      <a
                        v-if="currentVendor.website"
                        :href="currentVendor.website"
                        target="_blank"
                        class="link-premium"
                      >
                        {{ currentVendor.website }} <ExternalLink class="icon-xs" />
                      </a>
                      <span v-else class="val-muted">Unspecified</span>
                    </div>
                    <div class="data-item">
                      <label>Domain of Service</label>
                      <span class="val-bold">{{ currentVendor.services_provided }}</span>
                    </div>
                    <div class="data-item">
                      <label>Intelligence Notes</label>
                      <p class="val-text">
                        {{ currentVendor.notes || 'No security notes recorded for this entity.' }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="tab-col">
                  <div class="section-title-premium">
                    <FileText class="icon-primary" /> Contractual Data
                  </div>
                  <div class="data-group">
                    <div class="data-item">
                      <label>Fiscal Exposure</label>
                      <span class="val-hero text-red-600"
                        >${{ formatNumber(currentVendor.contract_value) }}</span
                      >
                    </div>
                    <div class="data-item">
                      <label>Operational Liaison</label>
                      <span class="val-bold">{{ currentVendor.contact_name }}</span>
                    </div>
                    <div class="data-item">
                      <label>Service Termination Date</label>
                      <span class="val-bold">{{
                        formatDate(currentVendor.contract_end_date)
                      }}</span>
                    </div>
                  </div>
                </div>

                <div class="tab-full mt-8">
                  <div class="section-title-premium">
                    <Shield class="icon-primary" /> Vector Risk Factors
                  </div>
                  <div class="risk-factors-grid">
                    <div v-for="factor in riskFactors" :key="factor.label" class="factor-card-lite">
                      <div class="f-head">
                        <span class="f-name">{{ factor.label }}</span>
                        <span class="f-num">{{ factor.value }}/{{ factor.max }}</span>
                      </div>
                      <div class="f-bar-bg">
                        <div
                          class="f-bar-fill"
                          :style="{ width: `${(factor.value / factor.max) * 100}%` }"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Risk History Tab -->
              <div v-if="activeTab === 'history'" class="tab-pane animate-in-fast">
                <div class="pane-head-premium">
                  <History class="icon-primary lg" />
                  <div>
                    <h3>Risk Evolution Trace</h3>
                    <p>Timeline of past security assessments and score variations.</p>
                  </div>
                </div>
                <div v-if="vendorStore.riskHistory?.length === 0" class="empty-state-lite">
                  No historical traces available in current telemetry.
                </div>
                <div v-else class="trace-list">
                  <div
                    v-for="(entry, index) in vendorStore.riskHistory"
                    :key="index"
                    class="trace-item hover-shift"
                  >
                    <div class="trace-main">
                      <span class="trace-date">{{ formatDateFull(entry.date) }}</span>
                      <span class="trace-assessor" v-if="entry.assessed_by"
                        >Audited by {{ entry.assessed_by }}</span
                      >
                    </div>
                    <div class="trace-pill" :class="getRiskClass(entry.overall_score)">
                      {{ entry.overall_score }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Supply Chain Tab -->
              <div v-if="activeTab === 'supply-chain'" class="tab-pane animate-in-fast">
                <div class="pane-head-premium">
                  <GitBranch class="icon-primary lg" />
                  <div>
                    <h3>Supply Chain Dependencies</h3>
                    <p>Mapping of upstream infrastructure and downstream cascading dependencies.</p>
                  </div>
                </div>
                <div class="supply-grid-premium mt-8">
                  <div class="supply-stack">
                    <h3 class="stack-title">Upstream (Depends On)</h3>
                    <div
                      v-if="vendorStore.dependencies?.depends_on?.length === 0"
                      class="empty-mini"
                    >
                      No direct dependencies mapped.
                    </div>
                    <div v-else class="stack-list">
                      <router-link
                        v-for="dep in vendorStore.dependencies?.depends_on"
                        :key="dep.id"
                        :to="`/vendors/${dep.id}`"
                        class="stack-item"
                      >
                        <span class="s-name">{{ dep.name }}</span>
                        <div class="s-risk" :class="getRiskClass(dep.overall_risk_score)">
                          {{ dep.risk_level }}
                        </div>
                      </router-link>
                    </div>
                  </div>
                  <div class="supply-stack border-l border-slate-100 pl-8">
                    <h3 class="stack-title">Downstream (Depended By)</h3>
                    <div
                      v-if="vendorStore.dependencies?.depended_by?.length === 0"
                      class="empty-mini"
                    >
                      No dependents detected.
                    </div>
                    <div v-else class="stack-list">
                      <router-link
                        v-for="dep in vendorStore.dependencies?.depended_by"
                        :key="dep.id"
                        :to="`/vendors/${dep.id}`"
                        class="stack-item"
                      >
                        <span class="s-name">{{ dep.name }}</span>
                        <div class="s-risk" :class="getRiskClass(dep.overall_risk_score)">
                          {{ dep.risk_level }}
                        </div>
                      </router-link>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Incidents Tab -->
              <div v-if="activeTab === 'incidents'" class="tab-pane animate-in-fast">
                <div class="pane-head-premium">
                  <AlertTriangle class="icon-primary lg text-red-500" />
                  <div>
                    <h3>Security Incidents</h3>
                    <p>Historical record of detected breaches, outages, and leakage events.</p>
                  </div>
                </div>
                <div v-if="currentVendor.incident_history?.length === 0" class="empty-state-lite">
                  Clean telemetry. No incidents on record for this entity.
                </div>
                <div class="incident-board mt-8">
                  <div
                    v-for="incident in currentVendor.incident_history"
                    :key="incident.id"
                    class="i-card-premium hover-lift"
                  >
                    <div class="i-head">
                      <div class="flex items-center gap-3">
                        <span class="i-sev" :class="incident.severity"></span>
                        <span class="i-title">{{ incident.title }}</span>
                      </div>
                      <span class="i-date">{{ formatDate(incident.incident_date) }}</span>
                    </div>
                    <p class="i-body">{{ incident.description }}</p>
                    <div class="i-foot">
                      <div class="impact-metrics">
                        <span class="impact-txt"
                          >Exposure:
                          <span class="font-black text-red-600"
                            >${{ formatNumber(incident.financial_impact) }}</span
                          ></span
                        >
                        <span class="impact-divider mx-3 text-slate-200">|</span>
                        <span class="impact-txt capitalize"
                          >Type:
                          <span class="font-bold text-slate-700">{{
                            incident.incident_type.replace('_', ' ')
                          }}</span></span
                        >
                      </div>
                      <div class="flex gap-2">
                        <button
                          @click="editIncident(incident)"
                          class="icon-btn-lite"
                          title="Edit Incident Record"
                        >
                          <Edit class="icon-xs" />
                        </button>
                        <button
                          @click="confirmDeleteIncident(incident)"
                          class="icon-btn-lite danger"
                          title="Delete record"
                        >
                          <Trash2 class="icon-xs" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mt-8 flex justify-center">
                  <button @click="showIncidentModal = true" class="btn btn-primary lg shadow-lg">
                    <Plus class="icon-sm" /> Report New Incident
                  </button>
                </div>
              </div>

              <!-- Compliance Tab -->
              <div v-if="activeTab === 'compliance'" class="tab-pane animate-in-fast">
                <div class="pane-head-premium">
                  <ShieldCheck class="icon-primary lg text-green-500" />
                  <div>
                    <h3>Compliance Certificates</h3>
                    <p>Verification status of ISO, SOC2, and data protection standards.</p>
                  </div>
                </div>
                <div v-if="currentVendor.certifications?.length === 0" class="empty-state-lite">
                  No valid certifications uploaded.
                </div>
                <div v-else class="c-grid-premium">
                  <div
                    v-for="cert in currentVendor.certifications"
                    :key="cert.id"
                    class="c-card"
                    :class="{ expired: cert.is_expired }"
                  >
                    <div class="c-icon-bg">
                      <ShieldCheck v-if="!cert.is_expired" class="c-icon" />
                      <AlertCircle v-else class="c-icon text-red-500" />
                    </div>
                    <div class="c-main">
                      <div class="flex justify-between items-start">
                        <h4>{{ cert.certification_type_display }}</h4>
                        <div class="flex gap-1">
                          <button
                            @click="editCertification(cert)"
                            class="icon-btn-lite"
                            title="Update Certification"
                          >
                            <Edit class="icon-xs" />
                          </button>
                          <button
                            @click="confirmDeleteCert(cert)"
                            class="icon-btn-lite danger"
                            title="Remove Certificate"
                          >
                            <Trash2 class="icon-xs" />
                          </button>
                        </div>
                      </div>
                      <p class="c-body-txt">{{ cert.certification_body }}</p>
                      <div class="c-exp">
                        <span class="f-label">EXPIRES</span>
                        <span class="f-val-c" :class="{ 'text-red-600': cert.is_expired }">{{
                          formatDate(cert.expiry_date)
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="mt-12 flex justify-center">
                  <button @click="showCertModal = true" class="btn btn-primary lg shadow-lg">
                    <Plus class="icon-sm" /> Add Certification
                  </button>
                </div>
              </div>

              <!-- Contacts Tab -->
              <div v-if="activeTab === 'contacts'" class="tab-pane animate-in-fast">
                <div class="pane-head-premium mb-8">
                  <User class="icon-primary lg" />
                  <div>
                    <h3>Personnel Registry</h3>
                    <p>Incident responders and technical liaisons for this organization.</p>
                  </div>
                </div>
                <div class="contacts-board">
                  <!-- Primary (From Vendor) -->
                  <div class="contact-card-premium primary">
                    <span class="role-tag">Primary Owner</span>
                    <h4>{{ currentVendor.contact_name }}</h4>
                    <div class="c-links">
                      <a :href="`mailto:${currentVendor.contact_email}`"
                        ><Mail class="icon-xs" /> {{ currentVendor.contact_email }}</a
                      >
                      <span v-if="currentVendor.contact_phone"
                        ><Phone class="icon-xs" /> {{ currentVendor.contact_phone }}</span
                      >
                    </div>
                  </div>
                  <!-- Additional -->
                  <div
                    v-for="contact in vendorStore.vendorContacts"
                    :key="contact.id"
                    class="contact-card-premium"
                  >
                    <span class="role-tag secondary">{{ contact.contact_type }}</span>
                    <h4>{{ contact.name }}</h4>
                    <p class="c-title-txt" v-if="contact.title">{{ contact.title }}</p>
                    <div class="c-links">
                      <a :href="`mailto:${contact.email}`"
                        ><Mail class="icon-xs" /> {{ contact.email }}</a
                      >
                      <span v-if="contact.phone"
                        ><Phone class="icon-xs" /> {{ contact.phone }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Warning Section -->
          <footer
            class="detail-footer mt-12 bg-red-50 border border-red-100 rounded-3xl p-8 flex items-center justify-between"
          >
            <div>
              <h3 class="text-red-700 font-black uppercase text-sm mb-1">Danger Zone</h3>
              <p class="text-red-500 text-sm">
                Purging this entity is permanent and removes all risk and simulation history.
              </p>
            </div>
            <button @click="deleteVendorConfirm" class="btn btn-danger lg shadow-lg">
              <Trash2 class="icon-sm" /> Archive Resource
            </button>
          </footer>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <VendorModal
      v-if="showEditModal"
      :vendor="currentVendor"
      :is-edit="true"
      @close="showEditModal = false"
      @save="handleVendorUpdated"
    />

    <IncidentModal
      v-if="showIncidentModal"
      :vendor-id="route.params.id"
      :incident="selectedIncident"
      @close="closeIncidentModal"
      @save="fetchData"
    />

    <CertificationModal
      v-if="showCertModal"
      :vendor-id="route.params.id"
      :certification="selectedCert"
      @close="closeCertModal"
      @save="fetchData"
    />

    <DeleteConfirmationModal
      v-if="showDeleteModal"
      :item-name="currentVendor?.name"
      title="Archive System Resource"
      confirm-text="Confirm Permanent Archive"
      @close="showDeleteModal = false"
      @confirm="confirmDelete"
    >
      <template #description>
        You are about to archive <strong>{{ currentVendor?.name }}</strong
        >. This will purge all associated risk assessments, telemetry logs, and simulation histories
        from the security dashboard.
      </template>
    </DeleteConfirmationModal>

    <DeleteConfirmationModal
      v-if="itemToDelete && itemToDeleteType === 'incident'"
      :item-name="itemToDelete.title"
      title="Purge Incident Record"
      confirm-text="Confirm Purge"
      @close="closeDeleteModal"
      @confirm="handleDeleteItem"
    />

    <DeleteConfirmationModal
      v-if="itemToDelete && itemToDeleteType === 'certification'"
      :item-name="itemToDelete.certification_type_display"
      title="Revoke Compliance Record"
      confirm-text="Revoke Record"
      @close="closeDeleteModal"
      @confirm="handleDeleteItem"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVendorStore } from '../stores/vendor'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import VendorModal from '../components/vendors/VendorModal.vue'
import IncidentModal from '../components/vendors/IncidentModal.vue'
import CertificationModal from '../components/vendors/CertificationModal.vue'
import DeleteConfirmationModal from '../components/common/DeleteConfirmationModal.vue'
import {
  ArrowLeft,
  Edit,
  RefreshCw,
  Building,
  User,
  FileText,
  Shield,
  Trash2,
  AlertCircle,
  History,
  GitBranch,
  AlertTriangle,
  ShieldCheck,
  Mail,
  Phone,
  ExternalLink,
  Plus,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const vendorStore = useVendorStore()

const showEditModal = ref(false)
const showDeleteModal = ref(false)
const showIncidentModal = ref(false)
const showCertModal = ref(false)
const activeTab = ref('overview')

const selectedIncident = ref(null)
const selectedCert = ref(null)
const itemToDelete = ref(null)
const itemToDeleteType = ref(null)

const currentVendor = computed(() => vendorStore.currentVendor)

const riskFactors = computed(() => [
  { label: 'Security Posture', value: currentVendor.value?.security_posture_score, max: 100 },
  { label: 'Data Sensitivity', value: currentVendor.value?.data_sensitivity_level, max: 5 },
  { label: 'Service Criticality', value: currentVendor.value?.service_criticality_level, max: 5 },
  { label: 'Incident History', value: currentVendor.value?.incident_history_score, max: 100 },
  { label: 'Regulatory Compliance', value: currentVendor.value?.compliance_score, max: 100 },
  {
    label: 'Third-Party Risk',
    value: currentVendor.value?.third_party_dependencies_score,
    max: 100,
  },
])

const getRiskClass = (score) => {
  if (score >= 76) return 'critical'
  if (score >= 51) return 'high'
  if (score >= 26) return 'medium'
  return 'low'
}

const getRiskLevelText = (score) => {
  if (score >= 76) return 'Critical Risk Environment'
  if (score >= 51) return 'High-Alert Security Level'
  if (score >= 26) return 'Moderate Security Profile'
  return 'Optimized Security Profile'
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatDateFull = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatNumber = (num) => {
  if (!num) return '0'
  return new Intl.NumberFormat('en-US').format(num)
}

const recalculateRisk = async () => {
  await vendorStore.recalculateRisk(route.params.id)
  await vendorStore.fetchVendor(route.params.id)
}

const handleVendorUpdated = async () => {
  showEditModal.value = false
  await vendorStore.fetchVendor(route.params.id)
}

const deleteVendorConfirm = () => (showDeleteModal.value = true)

const confirmDelete = async () => {
  await vendorStore.deleteVendor(route.params.id)
  showDeleteModal.value = false
  router.push('/vendors')
}

const editIncident = (incident) => {
  selectedIncident.value = incident
  showIncidentModal.value = true
}

const confirmDeleteIncident = (incident) => {
  itemToDelete.value = incident
  itemToDeleteType.value = 'incident'
}

const editCertification = (cert) => {
  selectedCert.value = cert
  showCertModal.value = true
}

const confirmDeleteCert = (cert) => {
  itemToDelete.value = cert
  itemToDeleteType.value = 'certification'
}

const handleDeleteItem = async () => {
  if (!itemToDelete.value) return

  if (itemToDeleteType.value === 'incident') {
    await vendorStore.deleteIncident(itemToDelete.value.id)
  } else if (itemToDeleteType.value === 'certification') {
    await vendorStore.deleteCertification(itemToDelete.value.id)
  }

  await vendorStore.fetchVendor(route.params.id)
  closeDeleteModal()
}

const closeDeleteModal = () => {
  itemToDelete.value = null
  itemToDeleteType.value = null
}

const closeIncidentModal = () => {
  showIncidentModal.value = false
  selectedIncident.value = null
}

const closeCertModal = () => {
  showCertModal.value = false
  selectedCert.value = null
}

const fetchData = async () => {
  const id = route.params.id
  await vendorStore.fetchVendor(id)
  if (activeTab.value === 'history') await vendorStore.fetchRiskHistory(id)
  else if (activeTab.value === 'supply-chain') await vendorStore.fetchDependencies(id)
  else if (activeTab.value === 'contacts') await vendorStore.fetchVendorContacts(id)
}

watch(activeTab, () => fetchData())
onMounted(() => fetchData())
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: var(--bg-main);
}
.animate-in {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.animate-in-fast {
  animation: fadeIn 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Hero Section */
.vendor-hero {
  position: relative;
}
.hero-main {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  padding: 40px;
}

.back-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 800;
  color: #94a3b8;
  text-decoration: none;
  padding: 6px 12px;
  background: #f8fafc;
  border-radius: 20px;
  transition: all 0.2s;
}
.back-pill:hover {
  background: #f1f5f9;
  color: var(--primary);
  transform: translateX(-4px);
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #cbd5e1;
}
.status-indicator.active {
  background: #10b981;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
}

.hero-tags {
  display: flex;
  gap: 8px;
}
.h-tag {
  font-size: 12px;
  font-weight: 800;
  color: #64748b;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 8px;
  text-transform: uppercase;
}
.h-tag-outline {
  font-size: 12px;
  font-weight: 800;
  color: #10b981;
  border: 1px solid #10b981;
  padding: 3px 9px;
  border-radius: 8px;
  text-transform: uppercase;
}

/* Big Risk Card */
.risk-summary-card {
  width: 240px;
  padding: 24px;
  border-radius: 24px;
  text-align: center;
  border-bottom: 6px solid transparent;
}
.risk-summary-card.critical {
  background: #fff1f2;
  border-color: #e11d48;
  color: #be123c;
}
.risk-summary-card.high {
  background: #fffbeb;
  border-color: #f59e0b;
  color: #b45309;
}
.risk-summary-card.medium {
  background: #fefce8;
  border-color: #eab308;
  color: #854d0e;
}
.risk-summary-card.low {
  background: #f0fdf4;
  border-color: #16a34a;
  color: #15803d;
}

.r-val-big {
  font-size: 40px;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 4px;
}
.r-label-big {
  font-size: 10px;
  font-weight: 800;
  opacity: 0.6;
  letter-spacing: 0.1em;
}
.r-status-big {
  font-size: 13px;
  font-weight: 800;
  margin-top: 12px;
}

.hero-actions-floating {
  display: flex;
  justify-content: flex-start;
}

/* Tabs system */
.tabs-island {
  padding: 4px;
  border-radius: 40px;
  display: inline-block;
}
.tabs-inner {
  display: flex;
  gap: 4px;
}
.t-btn {
  padding: 10px 24px;
  border-radius: 36px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.t-btn:hover {
  background: rgba(0, 0, 0, 0.03);
}
.t-btn.active {
  background: white;
  color: var(--primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* Tab Content */
.tab-content {
  padding: 40px;
  min-height: 500px;
}
.tab-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
}

.section-title-premium {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: 900;
  color: #1e293b;
  margin-bottom: 32px;
  text-transform: uppercase;
  letter-spacing: -0.01em;
}
.icon-primary {
  width: 20px;
  height: 20px;
  color: var(--primary);
}
.icon-primary.lg {
  width: 40px;
  height: 40px;
}

.data-group {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.data-item label {
  display: block;
  font-size: 10px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 4px;
}
.val-bold {
  font-size: 16px;
  font-weight: 700;
  color: #334155;
}
.val-hero {
  font-size: 24px;
  font-weight: 900;
}
.val-text {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
}
.link-premium {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Risk Factors Grid */
.risk-factors-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.factor-card-lite {
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #f1f5f9;
}
.f-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}
.f-name {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}
.f-num {
  font-size: 12px;
  font-weight: 900;
  color: var(--primary);
}
.f-bar-bg {
  height: 6px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}
.f-bar-fill {
  height: 100%;
  background: var(--primary);
  border-radius: 10px;
}

/* Pane head */
.pane-head-premium {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
}
.pane-head-premium h3 {
  font-size: 20px;
  font-weight: 900;
  color: #1e293b;
}
.pane-head-premium p {
  font-size: 14px;
  color: #64748b;
}

/* Trace list */
.trace-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.trace-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #fcfdfe;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
}
.trace-date {
  display: block;
  font-size: 15px;
  font-weight: 800;
  color: #1e293b;
}
.trace-assessor {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
}
.trace-pill {
  padding: 6px 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 900;
}
.trace-pill.critical {
  background: #fee2e2;
  color: #b91c1c;
}
.trace-pill.high {
  background: #fef3c7;
  color: #92400e;
}
.trace-pill.medium {
  background: #fef9c3;
  color: #854d0e;
}
.trace-pill.low {
  background: #d1fae5;
  color: #065e46;
}

/* Supply Chain */
.supply-grid-premium {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
}
.stack-title {
  font-size: 14px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.stack-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.stack-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  text-decoration: none;
  transition: 0.2s;
}
.stack-item:hover {
  border-color: var(--primary);
  transform: translateX(4px);
}
.s-name {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}
.s-risk {
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 6px;
}

/* Incident Board */
.incident-board {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.i-card-premium {
  padding: 24px;
  background: #fffcfc;
  border: 1px solid #fee2e2;
  border-radius: 20px;
}
.i-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.i-sev {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.i-sev.critical {
  background: #dc2626;
  box-shadow: 0 0 8px #dc2626;
}
.i-title {
  font-weight: 800;
  color: #1e293b;
  flex: 1;
}
.i-date {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 700;
}
.i-body {
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 20px;
}
.i-foot {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 800;
  border-top: 1px solid #fee2e2;
  padding-top: 16px;
}
.impact-txt {
  color: #dc2626;
}
.i-cat {
  opacity: 0.5;
}

/* Compliance */
.c-grid-premium {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.c-card {
  display: flex;
  gap: 16px;
  padding: 24px;
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
}
.c-card.expired {
  background: #fffafb;
  border-color: #fee2e2;
}
.c-icon-bg {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
}
.c-main h4 {
  font-size: 16px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 2px;
}
.c-body-txt {
  font-size: 12px;
  color: #94a3b8;
  margin-bottom: 12px;
}
.c-exp .f-label {
  font-size: 9px;
  font-weight: 800;
  opacity: 0.4;
}
.c-exp .f-val-c {
  display: block;
  font-size: 12px;
  font-weight: 900;
}

/* Contacts Board */
.contacts-board {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}
.contact-card-premium {
  padding: 24px;
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 20px;
  position: relative;
}
.role-tag {
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  color: var(--primary);
  background: var(--primary-soft);
  padding: 4px 10px;
  border-radius: 20px;
  display: inline-block;
  margin-bottom: 16px;
}
.role-tag.secondary {
  color: #64748b;
  background: #f1f5f9;
}
.contact-card-premium h4 {
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 4px;
}
.c-title-txt {
  font-size: 13px;
  color: #94a3b8;
  margin-bottom: 16px;
  font-weight: 600;
}
.c-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.c-links a {
  font-size: 13px;
  color: var(--primary);
  text-decoration: none;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}
.c-links span {
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon-xs {
  width: 14px;
  height: 14px;
}
.icon-sm {
  width: 18px;
  height: 18px;
}
.large-icon {
  width: 64px;
  height: 64px;
}

@media (max-width: 1024px) {
  .hero-main {
    flex-direction: column;
    gap: 32px;
    text-align: center;
  }
  .risk-summary-card {
    width: 100%;
  }
  .tab-grid,
  .supply-grid-premium {
    grid-template-columns: 1fr;
  }
  .supply-stack.border-l {
    border: none;
    padding: 0;
    margin-top: 32px;
  }
  .risk-factors-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
