<template>
  <div class="page-container">
    <NavBar />
    <div class="container">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-content">
          <div class="header-text">
            <div class="header-badge">
              <Activity class="badge-icon" />
              <span>Operations Overview</span>
            </div>
            <h1 class="page-title">Command Center</h1>
            <p class="page-subtitle">
              Welcome back, {{ currentUser?.first_name || currentUser?.email }}. Global risk systems
              are operational.
            </p>
          </div>
          <div class="header-actions">
            <button v-if="!hasOrganization" @click="showOrgModal = true" class="btn btn-primary">
              <Plus class="icon-sm" />
              <span>Initialize Command</span>
            </button>
            <div v-else class="flex gap-3">
              <router-link to="/vendors/new" class="btn btn-primary">
                <Plus class="icon-sm" />
                <span>Add New Entity</span>
              </router-link>
            </div>
          </div>
        </div>
      </header>

      <!-- No Organization State -->
      <div v-if="!hasOrganization" class="no-org-section">
        <div class="no-org-card">
          <div class="illustration-wrapper">
            <div class="pulse-ring"></div>
            <Building class="illustration-icon" />
          </div>
          <h2 class="no-org-title">Organization Setup Required</h2>
          <p class="no-org-description">
            Connect your simulation environment to an organization to begin risk analysis and supply
            chain mapping.
          </p>
          <div class="no-org-actions">
            <button @click="showOrgModal = true" class="btn btn-primary btn-lg">
              <Plus class="icon-sm" />
              Create New Organization
            </button>
            <button @click="showJoinModal = true" class="btn btn-secondary btn-lg">
              Join Existing
            </button>
          </div>
        </div>
      </div>

      <!-- Dashboard Content -->
      <div v-else-if="dashboardData" class="dashboard-content">
        <!-- Summary Stats -->
        <div class="stats-grid">
          <div v-for="stat in stats" :key="stat.label" class="stat-card">
            <div class="stat-header">
              <span class="stat-label">{{ stat.label }}</span>
              <div class="stat-icon" :style="{ background: stat.bg, color: stat.color }">
                <component :is="stat.icon" class="icon-stat" />
              </div>
            </div>
            <div class="stat-body">
              <div class="stat-value" :class="stat.class">{{ stat.value }}</div>
              <span class="stat-subtitle" v-if="stat.sub">
                <span class="pulse-dot"></span>
                {{ stat.sub }} active entities
              </span>
            </div>
          </div>
        </div>

        <!-- Main Content Grid -->
        <div class="main-grid">
          <!-- Elevated Risk Entities -->
          <section class="content-card">
            <div class="card-header">
              <div class="header-left">
                <div class="header-icon warning">
                  <AlertTriangle class="icon-xs" />
                </div>
                <h2 class="card-title">Elevated Risk Entities</h2>
              </div>
              <router-link to="/vendors" class="card-link">
                View All
                <span class="arrow">→</span>
              </router-link>
            </div>

            <div class="card-body">
              <div v-if="dashboardData?.high_risk_vendors?.length === 0" class="empty-state-mini">
                <ShieldCheck class="empty-icon" />
                <p class="empty-text">All entities within nominal range.</p>
              </div>
              <div v-else class="entity-list">
                <router-link
                  v-for="vendor in dashboardData?.high_risk_vendors"
                  :key="vendor.id"
                  :to="`/vendors/${vendor.id}`"
                  class="entity-item"
                >
                  <div class="entity-info">
                    <div class="entity-avatar">{{ vendor.name.charAt(0) }}</div>
                    <div class="entity-details">
                      <span class="entity-name">{{ vendor.name }}</span>
                      <span class="entity-industry">{{ vendor.industry }}</span>
                    </div>
                  </div>
                  <div class="entity-meta">
                    <div class="risk-badge" :class="getRiskClass(vendor.overall_risk_score)">
                      {{ (vendor.overall_risk_score || 0).toFixed(1) }}
                    </div>
                  </div>
                </router-link>
              </div>
            </div>
          </section>

          <!-- Real-time Simulations -->
          <section class="content-card">
            <div class="card-header">
              <div class="header-left">
                <div class="header-icon primary">
                  <Zap class="icon-xs" />
                </div>
                <h2 class="card-title">Real-time Simulations</h2>
              </div>
              <router-link to="/simulations" class="card-link">
                View All
                <span class="arrow">→</span>
              </router-link>
            </div>

            <div class="card-body">
              <div v-if="dashboardData?.recent_simulations?.length === 0" class="empty-state-mini">
                <Activity class="empty-icon" />
                <p class="empty-text">System ready for simulation launch.</p>
              </div>
              <div v-else class="simulation-list">
                <div
                  v-for="sim in dashboardData?.recent_simulations"
                  :key="sim.id"
                  class="simulation-item"
                >
                  <div class="simulation-info">
                    <div class="simulation-type">
                      <span class="type-badge">{{ sim.scenario_type.replace('_', ' ') }}</span>
                    </div>
                    <div class="simulation-details">
                      <span class="sim-date">{{ formatDate(sim.completed_at) }}</span>
                    </div>
                  </div>
                  <div class="simulation-impact">
                    <span class="impact-label">Impact</span>
                    <span class="impact-value">
                      ${{ formatNumber(sim.total_financial_impact) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Strategic Shortcuts -->
        <div class="shortcuts-section">
          <div class="shortcuts-header">
            <h3 class="shortcuts-title">Strategic Shortcuts</h3>
            <p class="shortcuts-subtitle">Quick access to common operations</p>
          </div>
          <div class="shortcuts-grid">
            <router-link to="/vendors/new" class="shortcut-card">
              <div class="shortcut-icon">🏢</div>
              <div class="shortcut-content">
                <span class="shortcut-label">Onboard Entity</span>
                <span class="shortcut-description">Add new vendor to ecosystem</span>
              </div>
            </router-link>
            <router-link to="/simulations/new" class="shortcut-card">
              <div class="shortcut-icon">⚡</div>
              <div class="shortcut-content">
                <span class="shortcut-label">Trigger Simulation</span>
                <span class="shortcut-description">Run risk scenario analysis</span>
              </div>
            </router-link>
            <router-link to="/assessments" class="shortcut-card">
              <div class="shortcut-icon">📊</div>
              <div class="shortcut-content">
                <span class="shortcut-label">Audit Pipeline</span>
                <span class="shortcut-description">Review security assessments</span>
              </div>
            </router-link>
            <router-link to="/incidents/trends" class="shortcut-card">
              <div class="shortcut-icon">📈</div>
              <div class="shortcut-content">
                <span class="shortcut-label">Risk Analytics</span>
                <span class="shortcut-description">View trends and insights</span>
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <CreateOrganizationModal
      v-if="showOrgModal"
      @close="showOrgModal = false"
      @created="handleOrgCreated"
    />
    <JoinOrganizationModal
      v-if="showJoinModal"
      @close="showJoinModal = false"
      @joined="handleOrgCreated"
      @requested="handleJoinRequested"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCoreStore } from '../stores/core'
import NavBar from '../components/common/NavBar.vue'
import CreateOrganizationModal from '../components/core/CreateOrganizationModal.vue'
import JoinOrganizationModal from '../components/core/JoinOrganizationModal.vue'
import {
  Building,
  AlertTriangle,
  Zap,
  TrendingUp,
  DollarSign,
  Activity,
  Plus,
  ShieldCheck,
} from 'lucide-vue-next'

const coreStore = useCoreStore()
const dashboardData = ref(null)
const showOrgModal = ref(false)
const showJoinModal = ref(false)

const currentUser = computed(() => coreStore.currentUser || coreStore.user)
const hasOrganization = computed(() => coreStore.hasOrganization || !!coreStore.organization)

const stats = computed(() => [
  {
    label: 'Risk Velocity',
    value: (dashboardData.value?.avg_resilience_score || 0).toFixed(1),
    class: getRiskClass(dashboardData.value?.avg_resilience_score),
    icon: Activity,
    bg: '#eff6ff',
    color: '#3b82f6',
    sub: dashboardData.value?.total_vendors || 0,
  },
  {
    label: 'Critical Gaps',
    value: dashboardData.value?.high_risk_vendors?.length || 0,
    class: 'critical',
    icon: AlertTriangle,
    bg: '#fef2f2',
    color: '#ef4444',
  },
  {
    label: 'Global Exposure',
    value: `$${formatNumber(dashboardData.value?.total_financial_exposure || 0)}`,
    class: 'medium',
    icon: DollarSign,
    bg: '#fff7ed',
    color: '#f97316',
  },
  {
    label: 'Recent Uplift',
    value: `${(dashboardData.value?.avg_security_uplift || 0).toFixed(1)}%`,
    class: 'low',
    icon: TrendingUp,
    bg: '#ecfdf5',
    color: '#10b981',
  },
])

const loadDashboard = async () => {
  if (hasOrganization.value) {
    try {
      // Try using fetchDashboard if it exists, otherwise fetchDashboardData
      if (typeof coreStore.fetchDashboard === 'function') {
        await coreStore.fetchDashboard()
        dashboardData.value = coreStore.dashboardData
      } else if (typeof coreStore.fetchDashboardData === 'function') {
        dashboardData.value = await coreStore.fetchDashboardData()
      }
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    }
  }
}

const handleOrgCreated = async () => {
  showOrgModal.value = false
  showJoinModal.value = false

  // Refresh organization and user data
  if (typeof coreStore.fetchOrganization === 'function') {
    await coreStore.fetchOrganization()
  }
  if (typeof coreStore.fetchCurrentUser === 'function') {
    await coreStore.fetchCurrentUser()
  }

  await loadDashboard()
}

const handleJoinRequested = () => {
  showJoinModal.value = false
}

const getRiskClass = (score) => {
  if (score >= 80) return 'critical'
  if (score >= 60) return 'high'
  if (score >= 40) return 'medium'
  return 'low'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

onMounted(async () => {
  // Fetch current user and permissions
  if (typeof coreStore.fetchCurrentUser === 'function') {
    await coreStore.fetchCurrentUser()
  }
  if (typeof coreStore.fetchPermissions === 'function') {
    await coreStore.fetchPermissions()
  }

  // Try to fetch organization
  try {
    if (typeof coreStore.fetchOrganization === 'function') {
      await coreStore.fetchOrganization()
    }
  } catch (error) {
    console.log('No organization found')
  }

  // Load dashboard data if organization exists
  await loadDashboard()
})
</script>

<style scoped>
/* Base Layout */
.page-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px 100px;
}

/* Page Header */
.page-header {
  padding: 48px 0 40px;
  animation: fadeIn 0.5s ease-out;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 32px;
}

.header-text {
  flex: 1;
}

.header-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 16px;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.3);
}

.badge-icon {
  width: 14px;
  height: 14px;
}

.page-title {
  font-size: 48px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0 0 12px 0;
}

.page-subtitle {
  font-size: 16px;
  color: #64748b;
  font-weight: 500;
  line-height: 1.6;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  border: none;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

.btn-secondary {
  background: white;
  color: #475569;
  border: 2px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.btn-lg {
  padding: 16px 32px;
  font-size: 15px;
}

.icon-sm {
  width: 18px;
  height: 18px;
}

.icon-xs {
  width: 16px;
  height: 16px;
}

/* No Organization State */
.no-org-section {
  animation: fadeIn 0.6s ease-out 0.1s both;
}

.no-org-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 40px;
  padding: 80px 60px;
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
}

.illustration-wrapper {
  position: relative;
  width: 140px;
  height: 140px;
  margin: 0 auto 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(0.9);
    opacity: 0.3;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.6;
  }
}

.illustration-icon {
  width: 70px;
  height: 70px;
  color: #3b82f6;
  position: relative;
  z-index: 2;
}

.no-org-title {
  font-size: 32px;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 16px 0;
  letter-spacing: -0.02em;
}

.no-org-description {
  font-size: 16px;
  color: #64748b;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto 40px;
}

.no-org-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* Dashboard Content */
.dashboard-content {
  animation: fadeIn 0.6s ease-out 0.1s both;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 56px;
}

.stat-card {
  background: white;
  border-radius: 24px;
  border: 2px solid #e2e8f0;
  padding: 28px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-stat {
  width: 26px;
  height: 26px;
}

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-value {
  font-size: 40px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1;
  letter-spacing: -0.02em;
}

.stat-value.critical {
  color: #ef4444;
}
.stat-value.high {
  color: #f97316;
}
.stat-value.medium {
  color: #f59e0b;
}
.stat-value.low {
  color: #10b981;
}

.stat-subtitle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background: #3b82f6;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  animation: pulseDot 2s ease-in-out infinite;
}

@keyframes pulseDot {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(59, 130, 246, 0);
  }
}

/* Main Grid */
.main-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 28px;
  margin-bottom: 56px;
}

.content-card {
  background: white;
  border-radius: 32px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s;
}

.content-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28px 32px;
  border-bottom: 2px solid #f1f5f9;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-icon.warning {
  background: #fff7ed;
  color: #f97316;
}

.header-icon.primary {
  background: #eff6ff;
  color: #3b82f6;
}

.card-title {
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.01em;
}

.card-link {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 800;
  color: #3b82f6;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s;
}

.card-link:hover {
  gap: 8px;
  color: #2563eb;
}

.arrow {
  font-size: 16px;
  transition: transform 0.2s;
}

.card-link:hover .arrow {
  transform: translateX(2px);
}

.card-body {
  padding: 0;
}

/* Empty State */
.empty-state-mini {
  padding: 80px 40px;
  text-align: center;
}

.empty-icon {
  width: 56px;
  height: 56px;
  color: #cbd5e1;
  margin: 0 auto 20px;
}

.empty-text {
  font-size: 15px;
  font-weight: 600;
  color: #94a3b8;
  margin: 0;
}

/* Entity List */
.entity-list {
  display: flex;
  flex-direction: column;
}

.entity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 2px solid #f8fafc;
  text-decoration: none;
  transition: all 0.2s;
}

.entity-item:last-child {
  border-bottom: none;
}

.entity-item:hover {
  background: #f8fafc;
  padding-left: 40px;
}

.entity-info {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
}

.entity-avatar {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 900;
  flex-shrink: 0;
}

.entity-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.entity-name {
  font-size: 16px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.2;
}

.entity-industry {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
}

.entity-meta {
  flex-shrink: 0;
}

.risk-badge {
  font-size: 14px;
  font-weight: 900;
  padding: 8px 16px;
  border-radius: 12px;
  letter-spacing: -0.01em;
}

.risk-badge.critical {
  background: #fee2e2;
  color: #991b1b;
}
.risk-badge.high {
  background: #fed7aa;
  color: #9a3412;
}
.risk-badge.medium {
  background: #fef3c7;
  color: #92400e;
}
.risk-badge.low {
  background: #d1fae5;
  color: #065f46;
}

/* Simulation List */
.simulation-list {
  display: flex;
  flex-direction: column;
}

.simulation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 2px solid #f8fafc;
  transition: all 0.2s;
}

.simulation-item:last-child {
  border-bottom: none;
}

.simulation-item:hover {
  background: #f8fafc;
}

.simulation-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.type-badge {
  display: inline-block;
  font-size: 13px;
  font-weight: 800;
  color: #1e293b;
  text-transform: capitalize;
  padding: 6px 14px;
  background: #f1f5f9;
  border-radius: 10px;
  width: fit-content;
}

.sim-date {
  font-size: 13px;
  font-weight: 600;
  color: #94a3b8;
}

.simulation-impact {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.impact-label {
  font-size: 11px;
  font-weight: 800;
  color: #f87171;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.impact-value {
  font-size: 18px;
  font-weight: 900;
  color: #ef4444;
  font-feature-settings: 'tnum';
  letter-spacing: -0.01em;
}

/* Shortcuts Section */
.shortcuts-section {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  border-radius: 40px;
  padding: 56px;
  color: white;
  position: relative;
  overflow: hidden;
}

.shortcuts-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.shortcuts-header {
  margin-bottom: 40px;
  position: relative;
  z-index: 1;
}

.shortcuts-title {
  font-size: 32px;
  font-weight: 900;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.shortcuts-subtitle {
  font-size: 15px;
  color: #94a3b8;
  font-weight: 500;
  margin: 0;
}

.shortcuts-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  position: relative;
  z-index: 1;
}

.shortcut-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 28px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  text-decoration: none;
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.shortcut-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-6px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.shortcut-icon {
  width: 56px;
  height: 56px;
  background: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.shortcut-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.shortcut-label {
  font-size: 16px;
  font-weight: 800;
  line-height: 1.2;
}

.shortcut-description {
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
  line-height: 1.4;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .shortcuts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }

  .header-actions {
    width: 100%;
  }

  .btn {
    flex: 1;
    justify-content: center;
  }

  .main-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .shortcuts-section {
    padding: 40px 32px;
    border-radius: 32px;
  }

  .shortcuts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 16px 80px;
  }

  .page-header {
    padding: 32px 0 28px;
  }

  .page-title {
    font-size: 36px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stat-card {
    padding: 24px;
  }

  .stat-value {
    font-size: 36px;
  }

  .no-org-card {
    padding: 60px 32px;
    border-radius: 32px;
  }

  .no-org-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn-lg {
    width: 100%;
    justify-content: center;
  }

  .card-header {
    padding: 24px;
  }

  .entity-item,
  .simulation-item {
    padding: 20px 24px;
  }

  .shortcuts-title {
    font-size: 24px;
  }
}
</style>
