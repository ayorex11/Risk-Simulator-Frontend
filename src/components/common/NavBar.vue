<template>
  <div class="nav-wrapper">
    <nav class="navbar glass">
      <div class="navbar-content">
        <div class="navbar-brand">
          <router-link to="/dashboard" class="brand-link">
            <Shield class="brand-icon" />
            <span class="brand-text">Scenario Forge</span>
          </router-link>
        </div>

        <div class="navbar-center" v-if="authStore.isLoggedIn">
          <router-link to="/dashboard" class="nav-link" title="Dashboard">
            <LayoutDashboard class="nav-icon" />
            <span>Dashboard</span>
          </router-link>
          <router-link to="/vendors" class="nav-link" title="Vendors">
            <Building class="nav-icon" />
            <span>Vendors</span>
          </router-link>
          <router-link to="/vendors/compare" class="nav-link" title="Comparison">
            <Scale class="nav-icon" />
            <span>Comparison</span>
          </router-link>
          <router-link to="/incidents" class="nav-link" title="Incidents">
            <Activity class="nav-icon" />
            <span>Incidents</span>
          </router-link>
          <router-link to="/simulations" class="nav-link" title="Simulations">
            <Zap class="nav-icon" />
            <span>Sims</span>
          </router-link>
          <!-- Audits Dropdown -->
          <div class="nav-dropdown-wrapper">
            <router-link to="/assessments" class="nav-link" title="Assessments">
              <ClipboardList class="nav-icon" />
              <span>Audits</span>
              <ChevronDown v-if="isAdmin" class="chevron-icon" />
            </router-link>

            <div v-if="isAdmin" class="dropdown-menu card glass">
              <router-link to="/assessments/summary" class="dropdown-item">
                <PieChart class="dropdown-icon" />
                <div class="item-text">
                  <span class="item-title">Summary</span>
                  <span class="item-desc">Portfolio analytics & trends</span>
                </div>
              </router-link>
              <router-link to="/assessments/questions" class="dropdown-item">
                <Archive class="dropdown-icon" />
                <div class="item-text">
                  <span class="item-title">Question Library</span>
                  <span class="item-desc">Manage master questionnaire</span>
                </div>
              </router-link>
              <router-link to="/assessments/templates" class="dropdown-item">
                <Layout class="dropdown-icon" />
                <div class="item-text">
                  <span class="item-title">Frameworks</span>
                  <span class="item-desc">Assessment audit templates</span>
                </div>
              </router-link>
            </div>
          </div>
        </div>

        <div class="navbar-user" v-if="authStore.isLoggedIn">
          <router-link to="/profile" class="user-pill">
            <div class="avatar-mini">
              {{ (coreStore.currentUser?.first_name || 'U').charAt(0) }}
            </div>
            <span class="user-name-hide">{{ coreStore.currentUser?.first_name || 'Account' }}</span>
          </router-link>
          <button @click="handleLogout" class="logout-btn" title="Logout">
            <LogOut class="icon-sm" />
          </button>
        </div>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useCoreStore } from '../../stores/core'
import { useRouter } from 'vue-router'
import {
  Shield,
  LayoutDashboard,
  Building,
  Zap,
  ClipboardList,
  LogOut,
  Scale,
  Activity,
  PieChart,
  Archive,
  Layout,
  ChevronDown,
} from 'lucide-vue-next'

const authStore = useAuthStore()
const coreStore = useCoreStore()
const router = useRouter()

const isAdmin = computed(() => ['admin', 'manager'].includes(coreStore.permissions?.role))

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.nav-wrapper {
  position: sticky;
  top: 16px;
  left: 0;
  right: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  pointer-events: none; /* Allow clicking through wrapper */
}

.navbar {
  pointer-events: auto; /* Re-enable clicks for navbar itself */
  width: 95%;
  max-width: 1200px;
  height: 64px;
  border-radius: 32px;
  padding: 0 12px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

/* Brand Section */
.navbar-brand {
  flex: 0 0 200px;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 20px;
}

.brand-icon {
  width: 28px;
  height: 28px;
  color: var(--primary);
}

.brand-text {
  font-weight: 800;
  font-size: 18px;
  color: #1e293b;
  letter-spacing: -0.02em;
}

/* Center Menu */
.navbar-center {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.03);
  padding: 4px;
  border-radius: 28px;
  gap: 2px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #64748b;
  padding: 8px 16px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.8);
  color: var(--primary);
}

.nav-link.router-link-active {
  background: white;
  color: var(--primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.nav-icon {
  width: 18px;
  height: 18px;
}

/* User Section */
.navbar-user {
  flex: 0 0 200px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px 4px 4px;
  background: white;
  border-radius: 20px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  color: #334155;
  border: 1px solid var(--border-light);
  transition: transform 0.2s;
}

.user-pill:hover {
  transform: scale(1.02);
}

.avatar-mini {
  width: 28px;
  height: 28px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
}

.logout-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #fecaca;
  transform: rotate(5deg);
}

.icon-sm {
  width: 16px;
  height: 16px;
}

.chevron-icon {
  width: 14px;
  height: 14px;
  margin-left: -2px;
  opacity: 0.5;
  transition: transform 0.2s;
}

.nav-link:hover .chevron-icon {
  transform: rotate(180deg);
  opacity: 1;
}

/* Dropdown Menu */
.nav-dropdown-wrapper {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  width: 280px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1001;
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.nav-dropdown-wrapper:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  text-decoration: none;
  color: #475569;
  transition: all 0.2s;
}

.dropdown-item:hover {
  background: rgba(59, 130, 246, 0.08);
  color: var(--primary);
}

.dropdown-icon {
  width: 18px;
  height: 18px;
  margin-top: 2px;
}

.item-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-title {
  font-size: 14px;
  font-weight: 700;
}

.item-desc {
  font-size: 11px;
  font-weight: 500;
  color: #94a3b8;
}

@media (max-width: 1100px) {
  .nav-link span,
  .brand-text,
  .user-name-hide,
  .chevron-icon {
    display: none;
  }
  .navbar-brand,
  .navbar-user {
    flex: 0 0 auto;
  }
}
</style>
