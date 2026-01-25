<template>
  <div class="page-container">
    <NavBar />
    <main class="dashboard-page py-8">
      <div class="container overflow-visible">
        <!-- Header -->
        <header class="dashboard-header mb-8">
          <div>
            <h1 class="text-3xl font-black tracking-tight">Executive Dashboard</h1>
            <p class="text-muted font-medium">
              Welcome back, {{ currentUser?.first_name || currentUser?.email }}. Here's your risk
              overview.
            </p>
          </div>
          <div class="header-actions">
            <button v-if="!hasOrganization" @click="showOrgModal = true" class="btn btn-primary">
              <Building class="icon" />
              Initialize Organization
            </button>
            <div v-else class="flex gap-4">
              <router-link to="/vendors/new" class="btn btn-primary">
                <Plus class="icon" /> Add Vendor
              </router-link>
            </div>
          </div>
        </header>

        <!-- No Organization State -->
        <div v-if="!hasOrganization" class="no-org-section card glass py-20 text-center">
          <div class="illustration-placeholder mb-8">
            <Building class="large-icon text-primary opacity-20" />
          </div>
          <h2 class="text-2xl font-bold mb-4">Organization Setup Required</h2>
          <p class="text-muted max-w-md mx-auto mb-8">
            Connect your simulation environment to an organization to begin risk analysis and supply
            chain mapping.
          </p>
          <div class="flex justify-center gap-4">
            <button @click="showOrgModal = true" class="btn btn-primary lg">
              Create New Organization
            </button>
            <button @click="showJoinModal = true" class="btn btn-secondary lg">
              Join Existing
            </button>
          </div>
        </div>

        <!-- Dashboard Content -->
        <div v-else class="dashboard-content animate-in">
          <!-- Summary Stats -->
          <div class="stats-grid mb-8">
            <div v-for="stat in stats" :key="stat.label" class="stat-card-premium card">
              <div class="stat-inner">
                <div class="stat-info">
                  <span class="stat-label-modern">{{ stat.label }}</span>
                  <div class="stat-value-modern" :class="stat.class">{{ stat.value }}</div>
                  <span class="stat-trend" v-if="stat.sub">
                    <span class="text-primary font-bold">{{ stat.sub }}</span> active
                  </span>
                </div>
                <div class="stat-visual" :style="{ background: stat.bg, color: stat.color }">
                  <component :is="stat.icon" class="icon-stat" />
                </div>
              </div>
            </div>
          </div>

          <div class="main-grid">
            <!-- Left Column: Critical Info -->
            <div class="info-column space-y-8">
              <section class="card overflow-hidden h-full">
                <div class="section-header-modern">
                  <h2 class="flex items-center gap-2">
                    <AlertTriangle class="text-orange-500" /> High Risk Vendors
                  </h2>
                  <router-link
                    to="/vendors"
                    class="text-xs font-black text-primary uppercase tracking-widest hover:underline"
                    >Full View</router-link
                  >
                </div>
                <div class="card-body p-0">
                  <div v-if="dashboardData?.high_risk_vendors?.length === 0" class="empty-mini">
                    <p>Portfolio is currently optimized.</p>
                  </div>
                  <div v-else class="premium-list">
                    <router-link
                      v-for="vendor in dashboardData?.high_risk_vendors"
                      :key="vendor.id"
                      :to="`/vendors/${vendor.id}`"
                      class="premium-item hover-shift"
                    >
                      <div class="item-main">
                        <span class="item-title">{{ vendor.name }}</span>
                        <span class="item-sub">{{ vendor.industry }}</span>
                      </div>
                      <div class="item-meta">
                        <div class="risk-pill" :class="getRiskClass(vendor.overall_risk_score)">
                          {{ (vendor.overall_risk_score || 0).toFixed(2) }}
                        </div>
                      </div>
                    </router-link>
                  </div>
                </div>
              </section>
            </div>

            <!-- Right Column: Activity -->
            <div class="activity-column space-y-8">
              <section class="card h-full">
                <div class="section-header-modern">
                  <h2 class="flex items-center gap-2">
                    <Zap class="text-blue-500" /> Recent Simulations
                  </h2>
                  <router-link
                    to="/simulations"
                    class="text-xs font-black text-primary uppercase tracking-widest hover:underline"
                    >History</router-link
                  >
                </div>
                <div class="card-body p-0">
                  <div v-if="dashboardData?.recent_simulations?.length === 0" class="empty-mini">
                    <p>Ready to launch your first simulation.</p>
                  </div>
                  <div v-else class="premium-list">
                    <div
                      v-for="sim in dashboardData?.recent_simulations"
                      :key="sim.id"
                      class="premium-item"
                    >
                      <div class="item-main">
                        <span class="item-title capitalize">{{
                          sim.scenario_type.replace('_', ' ')
                        }}</span>
                        <span class="item-sub">{{ formatDate(sim.completed_at) }}</span>
                      </div>
                      <div class="item-meta">
                        <span class="font-mono font-black text-red-600">
                          ${{ formatNumber(sim.total_financial_impact) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>

          <!-- Bottom: Quick Actions Floating -->
          <div
            class="quick-access-bar mt-12 bg-white p-6 rounded-3xl border border-slate-100 shadow-xl flex items-center justify-between"
          >
            <h3 class="text-lg font-black uppercase tracking-tighter">Command Center</h3>
            <div class="flex gap-4">
              <router-link to="/vendors/new" class="action-pill">
                <span class="action-icon-bg">🏢</span> Add Vendor
              </router-link>
              <router-link to="/simulations/new" class="action-pill">
                <span class="action-icon-bg">⚡</span> Kill Switch Sim
              </router-link>
              <router-link to="/assessments" class="action-pill">
                <span class="action-icon-bg">📊</span> Audit Portal
              </router-link>
              <router-link to="/incidents/trends" class="action-pill">
                <span class="action-icon-bg">📈</span> Risk Trends
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <CreateOrganizationModal
      v-if="showOrgModal"
      @close="showOrgModal = false"
      @created="handleOrgCreated"
    />
    <JoinOrganizationModal
      v-if="showJoinModal"
      @close="showJoinModal = false"
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
  ClipboardCheck,
  Plus,
  ArrowRight,
} from 'lucide-vue-next'

const coreStore = useCoreStore()

const showOrgModal = ref(false)
const showJoinModal = ref(false)

const currentUser = computed(() => coreStore.currentUser)
const dashboardData = computed(() => coreStore.dashboardData)
const hasOrganization = computed(() => coreStore.hasOrganization)

const stats = computed(() => [
  {
    label: 'Managed Vendors',
    value: dashboardData.value?.summary?.total_vendors || 0,
    sub: dashboardData.value?.summary?.active_vendors || 0,
    icon: Building,
    bg: '#eff6ff',
    color: '#3b82f6',
  },
  {
    label: 'Risk Exposure',
    value: `${(dashboardData.value?.summary?.average_risk_score || 0).toFixed(2)}`,
    class: getRiskClass(dashboardData.value?.summary?.average_risk_score),
    icon: TrendingUp,
    bg: '#f8fafc',
    color: '#64748b',
  },
  {
    label: 'High-Alert',
    value: dashboardData.value?.summary?.high_risk_vendors_count || 0,
    class: 'text-red-500',
    icon: AlertTriangle,
    bg: '#fff1f2',
    color: '#e11d48',
  },
  {
    label: 'Projected Impact',
    value: `$${formatNumber(dashboardData.value?.summary?.total_estimated_impact)}`,
    icon: DollarSign,
    bg: '#f0fdf4',
    color: '#16a34a',
  },
])

const getRiskClass = (score) => {
  if (score >= 76) return 'critical'
  if (score >= 51) return 'high'
  if (score >= 26) return 'medium'
  return 'low'
}

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return new Intl.NumberFormat('en-US').format(num)
}

const handleOrgCreated = async () => {
  showOrgModal.value = false
  await coreStore.fetchOrganization()
  await coreStore.fetchDashboard()
}

const handleJoinRequested = async () => {
  showJoinModal.value = false
  await coreStore.fetchCurrentUser()
}

onMounted(async () => {
  await coreStore.fetchCurrentUser()
  await coreStore.fetchPermissions()
  try {
    await coreStore.fetchOrganization()
    await coreStore.fetchDashboard()
  } catch {
    console.log('No organization found')
  }
})
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  background: var(--bg-main);
}

.dashboard-page {
  padding-top: 40px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

/* Stats Premium */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.stat-card-premium {
  padding: 0;
  overflow: hidden;
  border: none;
  background: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.stat-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
}

.stat-label-modern {
  display: block;
  font-size: 12px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 8px;
}

.stat-value-modern {
  font-size: 32px;
  font-weight: 900;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-value-modern.critical {
  color: #dc2626;
}
.stat-value-modern.high {
  color: #f59e0b;
}
.stat-value-modern.medium {
  color: #eab308;
}
.stat-value-modern.low {
  color: #10b981;
}

.stat-trend {
  font-size: 12px;
  color: #64748b;
}

.stat-visual {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-stat {
  width: 28px;
  height: 28px;
}

/* Layout Grid */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.section-header-modern {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
}

.section-header-modern h2 {
  font-size: 18px;
  font-weight: 800;
  color: #1e293b;
}

/* Premium List */
.premium-list {
  display: flex;
  flex-direction: column;
}

.premium-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  text-decoration: none;
  transition: all 0.2s;
}

.premium-item:last-child {
  border-bottom: none;
}

.premium-item.hover-shift:hover {
  background: #f8fafc;
  padding-left: 30px;
}

.item-title {
  display: block;
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 2px;
}

.item-sub {
  font-size: 12px;
  color: #64748b;
}

.risk-pill {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 900;
}

.risk-pill.critical {
  background: #fee2e2;
  color: #b91c1c;
}
.risk-pill.high {
  background: #fef3c7;
  color: #b45309;
}
.risk-pill.medium {
  background: #fef9c3;
  color: #854d0e;
}
.risk-pill.low {
  background: #d1fae5;
  color: #065e46;
}

/* Quick Access */
.action-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px;
  background: #f8fafc;
  border-radius: 30px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 800;
  color: #1e293b;
  transition: all 0.2s;
  border: 1px solid #e2e8f0;
}

.action-pill:hover {
  background: white;
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.action-icon-bg {
  width: 28px;
  height: 28px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.empty-mini {
  padding: 60px 40px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
  font-weight: 600;
}

.animate-in {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
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

@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .main-grid {
    grid-template-columns: 1fr;
  }
  .quick-access-bar {
    flex-direction: column;
    gap: 20px;
    text-align: center;
    border-radius: 20px;
  }
  .quick-access-bar div {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
  }
}
</style>
