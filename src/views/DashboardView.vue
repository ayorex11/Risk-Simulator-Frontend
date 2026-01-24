<template>
  <div>
    <NavBar />
    <div class="dashboard-page">
      <div class="container">
        <div class="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p class="text-muted">
              Welcome back, {{ currentUser?.first_name || currentUser?.email }}!
            </p>
          </div>
          <div class="header-actions">
            <button v-if="!hasOrganization" @click="showOrgModal = true" class="btn btn-primary">
              <Building class="icon" />
              Create Organization
            </button>
          </div>
        </div>

        <!-- No Organization State -->
        <div v-if="!hasOrganization" class="no-org-state card">
          <Building class="no-org-icon" />
          <h2>No Organization Found</h2>
          <p>You need to create or join an organization to access the risk simulator features.</p>
          <div class="no-org-actions">
            <button @click="showOrgModal = true" class="btn btn-primary">
              Create Organization
            </button>
            <button @click="showJoinModal = true" class="btn btn-secondary">
              Join Existing Organization
            </button>
          </div>
        </div>

        <!-- Dashboard Content -->
        <div v-else>
          <!-- Summary Stats -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon" style="background: #dbeafe; color: #2563eb">
                <Building />
              </div>
              <div>
                <p class="stat-label">Total Vendors</p>
                <p class="stat-value">{{ dashboardData?.summary?.total_vendors || 0 }}</p>
                <p class="stat-subtext">{{ dashboardData?.summary?.active_vendors || 0 }} active</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon" style="background: #fee2e2; color: #dc2626">
                <AlertTriangle />
              </div>
              <div>
                <p class="stat-label">High Risk Vendors</p>
                <p class="stat-value">{{ dashboardData?.summary?.high_risk_vendors_count || 0 }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon" style="background: #fef3c7; color: #d97706">
                <Zap />
              </div>
              <div>
                <p class="stat-label">Simulations Run</p>
                <p class="stat-value">{{ dashboardData?.summary?.total_simulations || 0 }}</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon" style="background: #d1fae5; color: #059669">
                <TrendingUp />
              </div>
              <div>
                <p class="stat-label">Avg Risk Score</p>
                <p class="stat-value">
                  {{ Math.round(dashboardData?.summary?.average_risk_score || 0) }}
                </p>
              </div>
            </div>

            <!-- New Stats -->
            <div class="stat-card">
              <div class="stat-icon" style="background: #e0e7ff; color: #4338ca">
                <DollarSign />
              </div>
              <div>
                <p class="stat-label">Estimated Impact</p>
                <p class="stat-value">
                  ${{ formatNumber(dashboardData?.summary?.total_estimated_impact) }}
                </p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon" style="background: #ffedd5; color: #9a3412">
                <Activity />
              </div>
              <div>
                <p class="stat-label">Recent Incidents</p>
                <p class="stat-value">{{ dashboardData?.summary?.recent_incidents || 0 }}</p>
                <p class="stat-subtext">Last 6 months</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon" style="background: #f3e8ff; color: #7e22ce">
                <ClipboardCheck />
              </div>
              <div>
                <p class="stat-label">Pending Assessments</p>
                <p class="stat-value">{{ dashboardData?.summary?.pending_assessments || 0 }}</p>
              </div>
            </div>
          </div>

          <!-- High Risk Vendors -->
          <div class="dashboard-section">
            <div class="card">
              <div class="card-header">
                <h2>High Risk Vendors</h2>
                <router-link to="/vendors" class="link">View All →</router-link>
              </div>
              <div v-if="dashboardData?.high_risk_vendors?.length === 0" class="empty-state-small">
                <p>No high-risk vendors identified</p>
              </div>
              <div v-else class="vendor-list">
                <div
                  v-for="vendor in dashboardData?.high_risk_vendors"
                  :key="vendor.id"
                  class="vendor-item"
                >
                  <div class="vendor-info">
                    <h3>{{ vendor.name }}</h3>
                    <p>{{ vendor.industry }}</p>
                  </div>
                  <div class="risk-badge" :class="getRiskClass(vendor.overall_risk_score)">
                    {{ vendor.overall_risk_score }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Simulations -->
          <div class="dashboard-section">
            <div class="card">
              <div class="card-header">
                <h2>Recent Simulations</h2>
                <router-link to="/simulations" class="link">View All →</router-link>
              </div>
              <div v-if="dashboardData?.recent_simulations?.length === 0" class="empty-state-small">
                <p>No simulations run yet</p>
              </div>
              <div v-else class="simulation-list">
                <div
                  v-for="sim in dashboardData?.recent_simulations"
                  :key="sim.id"
                  class="simulation-item"
                >
                  <div class="simulation-info">
                    <h3>{{ sim.scenario_type }}</h3>
                    <p>{{ formatDate(sim.completed_at) }}</p>
                  </div>
                  <div class="simulation-impact">
                    ${{ formatNumber(sim.total_financial_impact) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <h3>Quick Actions</h3>
            <div class="actions-grid">
              <router-link to="/vendors/new" class="action-card">
                <span class="action-icon">🏢</span>
                <span>Add Vendor</span>
              </router-link>
              <router-link to="/simulations/new" class="action-card">
                <span class="action-icon">⚡</span>
                <span>Run Simulation</span>
              </router-link>
              <router-link to="/assessments" class="action-card">
                <span class="action-icon">📊</span>
                <span>New Assessment</span>
              </router-link>
              <router-link to="/reports" class="action-card">
                <span class="action-icon">📈</span>
                <span>View Reports</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Organization Modal -->
    <CreateOrganizationModal
      v-if="showOrgModal"
      @close="showOrgModal = false"
      @created="handleOrgCreated"
    />

    <!-- Join Organization Modal -->
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
} from 'lucide-vue-next'

const coreStore = useCoreStore()

const showOrgModal = ref(false)
const showJoinModal = ref(false)

const currentUser = computed(() => coreStore.currentUser)
const dashboardData = computed(() => coreStore.dashboardData)
const hasOrganization = computed(() => coreStore.hasOrganization)

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
  return new Intl.NumberFormat('en-US').format(num)
}

const handleOrgCreated = async () => {
  showOrgModal.value = false
  await coreStore.fetchOrganization()
  await coreStore.fetchDashboard()
}

const handleJoinRequested = async () => {
  showJoinModal.value = false
  // Refresh user data to show pending status if applicable
  await coreStore.fetchCurrentUser()
}

onMounted(async () => {
  await coreStore.fetchCurrentUser()
  await coreStore.fetchPermissions()

  try {
    await coreStore.fetchOrganization()
    await coreStore.fetchDashboard()
  } catch {
    // User might not have an organization yet
    console.log('No organization found')
  }
})
</script>

<style scoped>
.dashboard-page {
  min-height: calc(100vh - 72px);
  padding: 40px 0;
  background: #f5f7fa;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.dashboard-header h1 {
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.icon {
  width: 20px;
  height: 20px;
}

/* No Organization State */
.no-org-state {
  text-align: center;
  padding: 60px 40px;
}

.no-org-icon {
  width: 80px;
  height: 80px;
  color: #d1d5db;
  margin: 0 auto 24px;
}

.no-org-state h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 12px;
}

.no-org-state p {
  color: #6b7280;
  margin-bottom: 24px;
}

.no-org-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

/* Dashboard Sections */
.dashboard-section {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.card-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

/* Vendor List */
.vendor-list {
  padding: 24px;
}

.vendor-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #e5e7eb;
}

.vendor-item:last-child {
  border-bottom: none;
}

.vendor-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.vendor-info p {
  font-size: 14px;
  color: #6b7280;
}

.risk-badge {
  padding: 6px 12px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
}

.risk-badge.critical {
  background: #fee2e2;
  color: #991b1b;
}

.risk-badge.high {
  background: #fef3c7;
  color: #92400e;
}

.risk-badge.medium {
  background: #fef9c3;
  color: #854d0e;
}

.risk-badge.low {
  background: #d1fae5;
  color: #065f46;
}

/* Simulation List */
.simulation-list {
  padding: 24px;
}

.simulation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #e5e7eb;
}

.simulation-item:last-child {
  border-bottom: none;
}

.simulation-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  text-transform: capitalize;
}

.simulation-info p {
  font-size: 14px;
  color: #6b7280;
}

.simulation-impact {
  font-size: 18px;
  font-weight: 700;
  color: #dc2626;
}

/* Quick Actions */
.quick-actions {
  margin-top: 32px;
}

.quick-actions h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 16px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.action-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #4b5563;
  font-weight: 600;
  transition: all 0.3s ease;
}

.action-card:hover {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: translateY(-2px);
}

.action-icon {
  font-size: 32px;
}

.empty-state-small {
  padding: 40px;
  text-align: center;
  color: #6b7280;
}

@media (max-width: 1024px) {
  .stats-grid,
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
