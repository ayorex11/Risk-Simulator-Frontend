<template>
  <div class="analytics-page">
    <NavBar />
    <main class="main-content custom-scrollbar">
      <div class="container py-12">
        <!-- Header Section -->
        <header class="executive-header mb-12 animate-in">
          <div class="flex items-center gap-4 mb-4">
            <div class="header-icon-bg primary shadow-glow"><BarChart3 /></div>
            <span class="header-tag">Global Intelligence</span>
          </div>
          <div class="flex justify-between items-end">
            <div>
              <h1 class="text-4xl font-black tracking-tight text-slate-900">
                Incident Trends <span class="text-primary">&</span> Metrics
              </h1>
              <p class="text-slate-500 font-medium max-w-2xl mt-2 text-lg">
                Real-time tracking of security vectors and aggregate financial exposure across the
                global vendor ecosystem.
              </p>
            </div>
            <div class="header-actions flex gap-4">
              <router-link to="/incidents" class="btn btn-outline">
                <ChevronLeft class="icon-sm" /> Back to Records
              </router-link>
              <router-link to="/vendors" class="btn-executive">
                <Building2 class="icon-sm" /> Infrastructure Overview
              </router-link>
            </div>
          </div>
        </header>

        <div v-if="loading" class="flex flex-col items-center justify-center py-40 animate-pulse">
          <LoadingSpinner />
          <p class="mt-4 text-slate-400 font-black uppercase text-xs tracking-widest">
            Aggregating Global Telemetry...
          </p>
        </div>

        <div v-else-if="trends" class="analytics-grid space-y-12">
          <!-- Top Row: Executive Stats -->
          <div class="stats-grid grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="exec-card stat-primary animate-in" style="--delay: 0.1s">
              <div class="card-icon"><Activity /></div>
              <div class="card-body">
                <span class="stat-label">System-Wide Events</span>
                <span class="stat-value">{{ trends.total_incidents }}</span>
              </div>
              <div class="card-footer">Total Volume</div>
            </div>

            <div class="exec-card stat-danger animate-in" style="--delay: 0.2s">
              <div class="card-icon"><DollarSign /></div>
              <div class="card-body">
                <span class="stat-label">Financial Impact</span>
                <span class="stat-value"
                  >${{ formatNumberShort(trends.total_financial_impact) }}</span
                >
              </div>
              <div class="card-footer text-red-600">Aggregate Exposure</div>
            </div>

            <div class="exec-card stat-warning animate-in" style="--delay: 0.3s">
              <div class="card-icon"><Clock /></div>
              <div class="card-body">
                <span class="stat-label">Avg. Resolution</span>
                <span class="stat-value">{{ trends.average_downtime.toFixed(1) }}h</span>
              </div>
              <div class="card-footer">Mean Time to Recovery</div>
            </div>

            <div class="exec-card stat-critical animate-in" style="--delay: 0.4s">
              <div class="card-icon"><Zap /></div>
              <div class="card-body">
                <span class="stat-label">Catastrophic Failures</span>
                <span class="stat-value">{{ trends.by_severity?.critical || 0 }}</span>
              </div>
              <div class="card-footer text-orange-600">Immediate Action Required</div>
            </div>
          </div>

          <!-- Middle Row: Distribution & Specifics -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Distribution by Type -->
            <div class="card-premium lg:col-span-2 p-8 animate-in" style="--delay: 0.5s">
              <div class="card-header-lite mb-8">
                <div class="flex items-center gap-3">
                  <div class="header-inner-icon blue"><ShieldAlert /></div>
                  <h3 class="text-xl font-black text-slate-800">Vector Type Distribution</h3>
                </div>
              </div>
              <div class="intensity-grid">
                <div v-for="(count, type) in trends.by_type" :key="type" class="intensity-item">
                  <div class="flex justify-between items-center mb-3">
                    <span class="type-name uppercase tracking-wider">{{
                      type.replace('_', ' ')
                    }}</span>
                    <span class="type-count"
                      >{{ count }} <span class="text-slate-400 font-normal">Events</span></span
                    >
                  </div>
                  <div class="intensity-track">
                    <div
                      class="intensity-fill bg-gradient-to-r from-blue-500 to-indigo-600"
                      :style="{ width: `${(count / trends.total_incidents) * 100}%` }"
                    ></div>
                    <div class="intensity-ghost"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Most Affected Entities -->
            <div class="card-premium p-8 animate-in" style="--delay: 0.6s">
              <div class="card-header-lite mb-8">
                <div class="flex items-center gap-3">
                  <div class="header-inner-icon red"><Target /></div>
                  <h3 class="text-xl font-black text-slate-800">High Risk Entities</h3>
                </div>
              </div>
              <div class="entities-list space-y-4">
                <div
                  v-for="(v, index) in trends.most_affected_vendors"
                  :key="index"
                  class="entity-card-mini"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex flex-col">
                      <span class="entity-name">{{ v.vendor__name }}</span>
                      <span class="entity-id uppercase">Sector Intelligence</span>
                    </div>
                    <div class="incident-badge badge-danger">
                      {{ v.count }} <span class="font-normal opacity-70">Incidents</span>
                    </div>
                  </div>
                </div>
                <div v-if="trends.most_affected_vendors?.length === 0" class="empty-intel">
                  <p>No critical data detected.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Row: Global Severity Mapping -->
          <div class="card-premium p-12 bg-executive animate-in" style="--delay: 0.7s">
            <div class="flex flex-col items-center text-center mb-12">
              <span class="font-black text-primary uppercase tracking-[0.3em] text-xs mb-2"
                >Global Heatmap</span
              >
              <h3 class="text-3xl font-black text-slate-900">Incident Severity Breakdown</h3>
              <div
                class="h-1 w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent mt-4 opacity-30"
              ></div>
            </div>

            <div class="severity-visual-grid flex items-end justify-center gap-8 h-64">
              <div
                v-for="sev in ['low', 'medium', 'high', 'critical']"
                :key="sev"
                class="sev-v-row flex-1 max-w-[140px] group"
              >
                <div class="flex flex-col items-center">
                  <span class="sev-count group-hover:scale-125 transition-transform duration-300">{{
                    trends.by_severity?.[sev] || 0
                  }}</span>
                  <div
                    class="sev-pillar shadow-xl"
                    :class="`bg-${sev}-sev`"
                    :style="{
                      height: `${Math.max(((trends.by_severity?.[sev] || 0) / trends.total_incidents) * 180, 10)}px`,
                    }"
                  >
                    <div class="pillar-glass"></div>
                  </div>
                  <span class="sev-label uppercase">{{ sev }}</span>
                </div>
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
.analytics-page {
  min-height: 100vh;
  background: #fdfdfd;
  display: flex;
  flex-direction: column;
}
.main-content {
  flex: 1;
}

/* Executive Header */
.executive-header h1 {
  letter-spacing: -0.04em;
}
.header-tag {
  font-size: 10px;
  font-weight: 900;
  text-transform: uppercase;
  color: var(--primary);
  letter-spacing: 0.2em;
  border: 1px solid var(--primary-soft);
  padding: 4px 10px;
  border-radius: 20px;
}
.header-icon-bg {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  border: 1px solid #f1f5f9;
}
.shadow-glow {
  box-shadow: 0 4px 20px -5px var(--primary-soft);
}

.btn-executive {
  padding: 12px 24px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  color: #475569;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}
.btn-executive:hover {
  background: #f8fafc;
  transform: translateY(-2px);
  border-color: var(--primary);
  color: var(--primary);
}

/* Executive Cards */
.exec-card {
  background: white;
  padding: 32px 24px;
  border-radius: 24px;
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: 0.3s;
  position: relative;
  overflow: hidden;
}
.exec-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  border-radius: 2px;
  opacity: 0.5;
}
.exec-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}
.stat-label {
  display: block;
  font-size: 11px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 4px;
}
.stat-value {
  display: block;
  font-size: 32px;
  font-weight: 950;
  color: #0f172a;
  letter-spacing: -0.02em;
}
.card-footer {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
  margin-top: auto;
}

.stat-primary .card-icon {
  background: #eff6ff;
  color: #3b82f6;
}
.stat-primary::before {
  background: #3b82f6;
}
.stat-danger .card-icon {
  background: #fff1f2;
  color: #ef4444;
}
.stat-danger::before {
  background: #ef4444;
}
.stat-warning .card-icon {
  background: #fffbeb;
  color: #f59e0b;
}
.stat-warning::before {
  background: #f59e0b;
}
.stat-critical .card-icon {
  background: #fdf2f8;
  color: #db2777;
}
.stat-critical::before {
  background: #db2777;
}

/* Intensity Grid */
.intensity-item {
  margin-bottom: 24px;
}
.type-name {
  font-size: 11px;
  font-weight: 900;
  color: #64748b;
}
.type-count {
  font-size: 14px;
  font-weight: 800;
  color: #1e293b;
}
.intensity-track {
  height: 10px;
  background: #f1f5f9;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}
.intensity-fill {
  height: 100%;
  border-radius: 10px;
  transition: 1s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  z-index: 2;
}
.intensity-ghost {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: sweep 3s infinite linear;
}

/* Entity Cards */
.entity-card-mini {
  padding: 16px;
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  transition: 0.2s;
}
.entity-card-mini:hover {
  border-color: var(--primary);
  background: #fcfdfe;
  transform: translateX(5px);
}
.entity-name {
  font-size: 15px;
  font-weight: 800;
  color: #1e293b;
  display: block;
}
.entity-id {
  font-size: 10px;
  font-weight: 700;
  color: #94a3b8;
}
.incident-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 900;
}
.badge-danger {
  background: #fee2e2;
  color: #ef4444;
}

/* Severity Pillars */
.sev-pillar {
  width: 100%;
  border-radius: 12px 12px 4px 4px;
  transition: 1s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}
.pillar-glass {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.1), transparent, rgba(0, 0, 0, 0.05));
}
.sev-label {
  font-size: 10px;
  font-weight: 950;
  letter-spacing: 0.1em;
  color: #94a3b8;
  margin-top: 16px;
}
.sev-count {
  font-size: 24px;
  font-weight: 950;
  margin-bottom: 8px;
  color: #1e293b;
}

.bg-low-sev {
  background: #10b981;
  box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.3);
}
.bg-medium-sev {
  background: #eab308;
  box-shadow: 0 10px 20px -5px rgba(234, 179, 8, 0.3);
}
.bg-high-sev {
  background: #f59e0b;
  box-shadow: 0 10px 20px -5px rgba(245, 158, 11, 0.3);
}
.bg-critical-sev {
  background: #dc2626;
  box-shadow: 0 10px 20px -5px rgba(220, 38, 38, 0.3);
}

/* Animation Base */
.animate-in {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
  animation-delay: var(--delay, 0s);
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes sweep {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(200%);
  }
}

.card-premium {
  background: white;
  border-radius: 32px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}
.header-inner-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-inner-icon.blue {
  background: #eff6ff;
  color: #3b82f6;
}
.header-inner-icon.red {
  background: #fff1f2;
  color: #ef4444;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f8fafc;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 4px;
}
</style>
