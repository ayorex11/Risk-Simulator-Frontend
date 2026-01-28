<template>
  <div class="analytics-page">
    <NavBar />
    <main class="main-content custom-scrollbar">
      <div class="container">
        <!-- Header Section -->
        <header class="page-header">
          <div class="header-top">
            <div class="header-badge-wrapper">
              <div class="header-icon-bg">
                <BarChart3 class="icon-sm" />
              </div>
              <span class="header-badge">Global Intelligence</span>
            </div>
          </div>
          <div class="header-content">
            <div class="header-text">
              <h1 class="page-title">
                Incident Trends <span class="title-accent">&</span> Metrics
              </h1>
              <p class="page-subtitle">
                Real-time tracking of security vectors and aggregate financial exposure across the
                global vendor ecosystem.
              </p>
            </div>
            <div class="header-actions">
              <router-link to="/incidents" class="btn btn-secondary">
                <ChevronLeft class="icon-sm" />
                <span>Back to Records</span>
              </router-link>
              <router-link to="/vendors" class="btn btn-primary">
                <Building2 class="icon-sm" />
                <span>Infrastructure Overview</span>
              </router-link>
            </div>
          </div>
        </header>

        <!-- Loading State -->
        <div v-if="loading" class="loading-container">
          <LoadingSpinner />
          <p class="loading-text">Aggregating Global Telemetry...</p>
        </div>

        <!-- Analytics Content -->
        <div v-else-if="trends" class="analytics-content">
          <!-- Executive Stats -->
          <div class="stats-grid">
            <div class="stat-card stat-primary">
              <div class="stat-icon">
                <Activity class="icon-stat" />
              </div>
              <div class="stat-body">
                <span class="stat-label">System-Wide Events</span>
                <span class="stat-value">{{ trends.total_incidents }}</span>
                <span class="stat-footer">Total Volume</span>
              </div>
              <div class="stat-indicator"></div>
            </div>

            <div class="stat-card stat-danger">
              <div class="stat-icon">
                <DollarSign class="icon-stat" />
              </div>
              <div class="stat-body">
                <span class="stat-label">Financial Impact</span>
                <span class="stat-value">${{ formatNumberShort(trends.total_financial_impact) }}</span>
                <span class="stat-footer critical">Aggregate Exposure</span>
              </div>
              <div class="stat-indicator"></div>
            </div>

            <div class="stat-card stat-warning">
              <div class="stat-icon">
                <Clock class="icon-stat" />
              </div>
              <div class="stat-body">
                <span class="stat-label">Avg. Resolution</span>
                <span class="stat-value">{{ trends.average_downtime.toFixed(1) }}h</span>
                <span class="stat-footer">Mean Time to Recovery</span>
              </div>
              <div class="stat-indicator"></div>
            </div>

            <div class="stat-card stat-critical">
              <div class="stat-icon">
                <Zap class="icon-stat" />
              </div>
              <div class="stat-body">
                <span class="stat-label">Critical Failures</span>
                <span class="stat-value">{{ trends.by_severity?.critical || 0 }}</span>
                <span class="stat-footer warning">Immediate Action Required</span>
              </div>
              <div class="stat-indicator"></div>
            </div>
          </div>

          <!-- Distribution & Affected Vendors -->
          <div class="main-grid">
            <!-- Vector Type Distribution -->
            <div class="distribution-card">
              <div class="card-header">
                <div class="header-icon-wrapper blue">
                  <ShieldAlert class="header-icon" />
                </div>
                <h3 class="card-title">Vector Type Distribution</h3>
              </div>
              <div class="card-body">
                <div class="distribution-list">
                  <div v-for="(count, type) in trends.by_type" :key="type" class="distribution-item">
                    <div class="distribution-info">
                      <span class="type-name">{{ type.replace('_', ' ') }}</span>
                      <span class="type-count">
                        <span class="count-number">{{ count }}</span>
                        <span class="count-label">Events</span>
                      </span>
                    </div>
                    <div class="distribution-track">
                      <div
                        class="distribution-fill"
                        :style="{ width: `${(count / trends.total_incidents) * 100}%` }"
                      ></div>
                      <div class="distribution-shimmer"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- High Risk Entities -->
            <div class="entities-card">
              <div class="card-header">
                <div class="header-icon-wrapper red">
                  <Target class="header-icon" />
                </div>
                <h3 class="card-title">High Risk Entities</h3>
              </div>
              <div class="card-body">
                <div v-if="trends.most_affected_vendors?.length === 0" class="empty-state">
                  <ShieldAlert class="empty-icon" />
                  <p class="empty-text">No critical data detected</p>
                </div>
                <div v-else class="entities-list">
                  <div
                    v-for="(v, index) in trends.most_affected_vendors"
                    :key="index"
                    class="entity-item"
                  >
                    <div class="entity-info">
                      <div class="entity-avatar">{{ v.vendor__name.charAt(0) }}</div>
                      <div class="entity-details">
                        <span class="entity-name">{{ v.vendor__name }}</span>
                        <span class="entity-sector">Sector Intelligence</span>
                      </div>
                    </div>
                    <div class="entity-badge">
                      <span class="badge-count">{{ v.count }}</span>
                      <span class="badge-label">Incidents</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Severity Breakdown -->
          <div class="severity-card">
            <div class="severity-header">
              <span class="severity-badge">Global Heatmap</span>
              <h3 class="severity-title">Incident Severity Breakdown</h3>
              <div class="severity-divider"></div>
            </div>

            <div class="severity-visualization">
              <div
                v-for="sev in ['low', 'medium', 'high', 'critical']"
                :key="sev"
                class="severity-column"
              >
                <span class="severity-count">{{ trends.by_severity?.[sev] || 0 }}</span>
                <div
                  class="severity-bar"
                  :class="`severity-${sev}`"
                  :style="{
                    height: `${Math.max(((trends.by_severity?.[sev] || 0) / trends.total_incidents) * 220, 12)}px`,
                  }"
                >
                  <div class="bar-shine"></div>
                  <div class="bar-glow"></div>
                </div>
                <span class="severity-label">{{ sev }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useVendorStore } from '../stores/vendor'
import NavBar from '../components/common/NavBar.vue'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import {
  BarChart3,
  Building2,
  Activity,
  DollarSign,
  Clock,
  Zap,
  ShieldAlert,
  Target,
  ChevronLeft,
} from 'lucide-vue-next'

const vendorStore = useVendorStore()
const loading = ref(true)
const trends = ref(null)

onMounted(async () => {
  try {
    trends.value = await vendorStore.fetchIncidentTrends()
  } finally {
    loading.value = false
  }
})

const formatNumberShort = (num) => {
  if (!num) return '0'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return new Intl.NumberFormat('en-US').format(num)
}
</script>

<style scoped>
/* Base Layout */
.analytics-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc 0%, #ffffff 100%);
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
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

.header-top {
  margin-bottom: 20px;
}

.header-badge-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.header-icon-bg {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: white;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.icon-sm {
  width: 20px;
  height: 20px;
}

.header-badge {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: #3b82f6;
  letter-spacing: 0.1em;
  padding: 6px 14px;
  border-radius: 12px;
  border: 2px solid #dbeafe;
  background: #eff6ff;
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

.page-title {
  font-size: 48px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin: 0 0 12px 0;
}

.title-accent {
  color: #3b82f6;
}

.page-subtitle {
  font-size: 17px;
  color: #64748b;
  font-weight: 500;
  line-height: 1.6;
  max-width: 700px;
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

.btn-secondary {
  background: white;
  color: #475569;
  border: 2px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
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

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120px 40px;
  animation: fadeIn 0.6s ease-out 0.1s both;
}

.loading-text {
  font-size: 13px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 24px;
}

/* Analytics Content */
.analytics-content {
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
  padding: 32px 28px;
  display: flex;
  gap: 20px;
  align-items: flex-start;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.08);
  border-color: #cbd5e1;
}

.stat-indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 5px;
  height: 100%;
  transition: width 0.3s;
}

.stat-card:hover .stat-indicator {
  width: 7px;
}

.stat-card.stat-primary .stat-indicator {
  background: linear-gradient(to bottom, #3b82f6, #2563eb);
}
.stat-card.stat-danger .stat-indicator {
  background: linear-gradient(to bottom, #ef4444, #dc2626);
}
.stat-card.stat-warning .stat-indicator {
  background: linear-gradient(to bottom, #f59e0b, #d97706);
}
.stat-card.stat-critical .stat-indicator {
  background: linear-gradient(to bottom, #db2777, #be185d);
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

.stat-card.stat-primary .stat-icon {
  background: #eff6ff;
  color: #3b82f6;
}
.stat-card.stat-danger .stat-icon {
  background: #fef2f2;
  color: #ef4444;
}
.stat-card.stat-warning .stat-icon {
  background: #fff7ed;
  color: #f59e0b;
}
.stat-card.stat-critical .stat-icon {
  background: #fdf2f8;
  color: #db2777;
}

.icon-stat {
  width: 28px;
  height: 28px;
}

.stat-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.stat-label {
  font-size: 12px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.stat-value {
  font-size: 40px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1;
  letter-spacing: -0.02em;
}

.stat-footer {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  margin-top: 4px;
}

.stat-footer.critical {
  color: #ef4444;
}

.stat-footer.warning {
  color: #f59e0b;
}

/* Main Grid */
.main-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 28px;
  margin-bottom: 56px;
}

/* Distribution Card */
.distribution-card {
  background: white;
  border-radius: 32px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 32px 40px;
  border-bottom: 2px solid #f1f5f9;
}

.header-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-icon-wrapper.blue {
  background: #eff6ff;
  color: #3b82f6;
}

.header-icon-wrapper.red {
  background: #fef2f2;
  color: #ef4444;
}

.header-icon {
  width: 24px;
  height: 24px;
}

.card-title {
  font-size: 22px;
  font-weight: 900;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.01em;
}

.card-body {
  padding: 40px;
}

/* Distribution List */
.distribution-list {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.distribution-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.distribution-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.type-name {
  font-size: 14px;
  font-weight: 800;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.type-count {
  display: flex;
  align-items: center;
  gap: 6px;
}

.count-number {
  font-size: 18px;
  font-weight: 900;
  color: #0f172a;
}

.count-label {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
}

.distribution-track {
  height: 12px;
  background: #f1f5f9;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.distribution-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #6366f1 100%);
  border-radius: 10px;
  transition: width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  box-shadow: 0 0 16px rgba(59, 130, 246, 0.3);
}

.distribution-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 3s infinite linear;
}

@keyframes shimmer {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(200%);
  }
}

/* Entities Card */
.entities-card {
  background: white;
  border-radius: 32px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 32px;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #cbd5e1;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 14px;
  font-weight: 600;
  color: #94a3b8;
  margin: 0;
}

.entities-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.entity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  transition: all 0.2s;
}

.entity-item:hover {
  background: white;
  border-color: #3b82f6;
  transform: translateX(6px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
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
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
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

.entity-sector {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.entity-badge {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  padding: 10px 18px;
  background: #fee2e2;
  border-radius: 12px;
  flex-shrink: 0;
}

.badge-count {
  font-size: 20px;
  font-weight: 900;
  color: #991b1b;
  line-height: 1;
}

.badge-label {
  font-size: 10px;
  font-weight: 700;
  color: #ef4444;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Severity Card */
.severity-card {
  background: white;
  border-radius: 40px;
  border: 2px solid #e2e8f0;
  padding: 60px;
  overflow: hidden;
  position: relative;
}

.severity-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -20%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

.severity-header {
  text-align: center;
  margin-bottom: 56px;
  position: relative;
  z-index: 1;
}

.severity-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 900;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 12px;
}

.severity-title {
  font-size: 36px;
  font-weight: 900;
  color: #0f172a;
  margin: 0 0 20px 0;
  letter-spacing: -0.02em;
}

.severity-divider {
  height: 2px;
  width: 120px;
  background: linear-gradient(90deg, transparent, #3b82f6, transparent);
  margin: 0 auto;
  opacity: 0.3;
}

.severity-visualization {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 48px;
  min-height: 320px;
  position: relative;
  z-index: 1;
}

.severity-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 140px;
  transition: all 0.3s;
}

.severity-column:hover {
  transform: translateY(-8px);
}

.severity-count {
  font-size: 32px;
  font-weight: 900;
  color: #0f172a;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
  transition: all 0.3s;
}

.severity-column:hover .severity-count {
  transform: scale(1.2);
}

.severity-bar {
  width: 100%;
  border-radius: 16px 16px 6px 6px;
  transition: all 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.bar-shine {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, transparent 20%, rgba(255, 255, 255, 0.3) 50%, transparent 80%);
}

.bar-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 40%;
  background: linear-gradient(to top, rgba(255, 255, 255, 0.2), transparent);
}

.severity-bar.severity-low {
  background: linear-gradient(to top, #10b981, #34d399);
  box-shadow: 0 12px 32px rgba(16, 185, 129, 0.3);
}

.severity-bar.severity-medium {
  background: linear-gradient(to top, #f59e0b, #fbbf24);
  box-shadow: 0 12px 32px rgba(245, 158, 11, 0.3);
}

.severity-bar.severity-high {
  background: linear-gradient(to top, #f97316, #fb923c);
  box-shadow: 0 12px 32px rgba(249, 115, 22, 0.3);
}

.severity-bar.severity-critical {
  background: linear-gradient(to top, #dc2626, #ef4444);
  box-shadow: 0 12px 32px rgba(220, 38, 38, 0.4);
}

.severity-label {
  font-size: 13px;
  font-weight: 900;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 20px;
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

/* Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
  height: 10px;
  width: 10px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f8fafc;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .main-grid {
    grid-template-columns: 1fr;
  }

  .severity-visualization {
    gap: 32px;
  }

  .severity-column {
    flex: 0 0 100px;
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
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .severity-card {
    padding: 40px 32px;
    border-radius: 32px;
  }

  .severity-visualization {
    gap: 20px;
  }

  .severity-column {
    flex: 0 0 70px;
  }

  .severity-count {
    font-size: 24px;
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

  .page-subtitle {
    font-size: 15px;
  }

  .stat-card {
    padding: 24px;
  }

  .stat-value {
    font-size: 32px;
  }

  .card-header,
  .card-body {
    padding: 24px;
  }

  .severity-title {
    font-size: 28px;
  }
}
</style>
