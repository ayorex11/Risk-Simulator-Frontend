<template>
  <div>
    <NavBar />
    <div class="dashboard-page">
      <div class="container">
        <div class="dashboard-header">
          <h1>Dashboard</h1>
          <p class="text-muted">Welcome back, {{ authStore.user?.first_name || authStore.user?.email }}!</p>
        </div>

        <div class="dashboard-content">
          <div class="card">
            <h2>Dashboard</h2>
            <p class="text-muted mt-2">
              This is your main dashboard. Once we integrate the other apps (vendors, assessments, simulations),
              you'll see your risk data and analytics here.
            </p>

            <div class="stats-grid mt-4">
              <div class="stat-card">
                <div class="stat-icon" style="background: #dbeafe; color: #2563eb;">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p class="stat-label">Total Assessments</p>
                  <p class="stat-value">0</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon" style="background: #d1fae5; color: #059669;">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <p class="stat-label">Active Vendors</p>
                  <p class="stat-value">0</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon" style="background: #fef3c7; color: #d97706;">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p class="stat-label">Simulations Run</p>
                  <p class="stat-value">0</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-icon" style="background: #fee2e2; color: #dc2626;">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p class="stat-label">High Risk Items</p>
                  <p class="stat-value">0</p>
                </div>
              </div>
            </div>
          </div>

          <div class="quick-actions mt-4">
            <h3 class="mb-3">Quick Actions</h3>
            <div class="actions-grid">
              <button class="action-card" disabled>
                <span class="action-icon">📊</span>
                <span>New Assessment</span>
              </button>
              <button class="action-card" disabled>
                <span class="action-icon">🏢</span>
                <span>Add Vendor</span>
              </button>
              <button class="action-card" disabled>
                <span class="action-icon">⚡</span>
                <span>Run Simulation</span>
              </button>
              <button class="action-card" disabled>
                <span class="action-icon">📈</span>
                <span>View Reports</span>
              </button>
            </div>
            <p class="text-muted text-sm mt-3">
              <em>These features will be available once we integrate the other apps.</em>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import NavBar from '../components/common/NavBar.vue'

const authStore = useAuthStore()
</script>

<style scoped>
.dashboard-page {
  min-height: calc(100vh - 72px);
  padding: 40px 0;
  background: #f5f7fa;
}

.dashboard-header {
  margin-bottom: 32px;
}

.dashboard-header h1 {
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.dashboard-content h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
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

.stat-icon svg {
  width: 32px;
  height: 32px;
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

.quick-actions h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 2px dashed #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  font-weight: 600;
  color: #4b5563;
}

.action-card:not(:disabled):hover {
  border-color: #3b82f6;
  background: #eff6ff;
  transform: translateY(-2px);
}

.action-card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-icon {
  font-size: 32px;
}
</style>
