<template>
  <div class="nav-wrapper">
    <nav class="navbar glass">
      <div class="navbar-content">

        <!-- Brand -->
        <div class="navbar-brand">
          <router-link to="/dashboard" class="brand-link">
            <Shield class="brand-icon" />
            <span class="brand-text">Scenario Forge</span>
          </router-link>
        </div>

        <!-- Scrollable nav links — Audits intentionally NOT in here -->
        <div class="navbar-center" v-if="authStore.isLoggedIn">
          <router-link to="/dashboard" class="nav-link" title="Dashboard">
            <LayoutDashboard class="nav-icon" />
            <span>Dashboard</span>
          </router-link>
          <router-link v-if="hasOrganization" to="/vendors" class="nav-link" title="Vendors">
            <Building class="nav-icon" />
            <span>Vendors</span>
          </router-link>
          <router-link v-if="hasOrganization" to="/vendors/compare" class="nav-link" title="Comparison">
            <Scale class="nav-icon" />
            <span>Comparison</span>
          </router-link>
          <router-link v-if="hasOrganization" to="/incidents" class="nav-link" title="Incidents">
            <Activity class="nav-icon" />
            <span>Incidents</span>
          </router-link>
          <router-link v-if="hasOrganization" to="/simulations" class="nav-link" title="Simulations">
            <Zap class="nav-icon" />
            <span>Sims</span>
          </router-link>
          <router-link v-if="hasOrganization" to="/processes" class="nav-link" title="Business Processes">
            <Cpu class="nav-icon" />
            <span>Processes</span>
          </router-link>
          <router-link v-if="hasOrganization" to="/processes/dependency-map" class="nav-link" title="Dependency Map">
            <Network class="nav-icon" />
            <span>Map</span>
          </router-link>
          <router-link v-if="hasOrganization" to="/risk-heatmap" class="nav-link" title="Risk Heatmap">
            <Grid class="nav-icon" />
            <span>Heatmap</span>
          </router-link>
        </div>

        <!-- Audits dropdown — sibling of navbar-center, NOT inside it.
             This is the key fix: navbar-center has overflow-x:auto which
             forces overflow-y:hidden, clipping the dropdown. By placing
             this wrapper here in navbar-content (overflow:visible) the
             dropdown menu renders freely below the navbar. -->
        <div
          v-if="authStore.isLoggedIn && hasOrganization"
          class="nav-dropdown-wrapper"
          @mouseenter="handleDropdownEnter"
          @mouseleave="startCloseTimer"
        >
          <router-link
            to="/assessments"
            class="nav-link audits-trigger"
            title="Assessments"
            @click="dropdownOpen = false"
          >
            <ClipboardList class="nav-icon" />
            <span>Audits</span>
            <ChevronDown v-if="isAdmin" class="chevron-icon" :class="{ rotated: dropdownOpen }" />
          </router-link>

          <Transition name="dropdown">
            <div
              v-if="isAdmin && dropdownOpen"
              class="dropdown-menu glass"
              @mouseenter="cancelCloseTimer"
              @mouseleave="startCloseTimer"
            >
              <router-link to="/assessments" class="dropdown-item" @click="dropdownOpen = false">
                <ClipboardList class="dropdown-icon" />
                <div class="item-text">
                  <span class="item-title">Assessments</span>
                  <span class="item-desc">View all assessments</span>
                </div>
              </router-link>
              <router-link to="/assessments/summary" class="dropdown-item" @click="dropdownOpen = false">
                <PieChart class="dropdown-icon" />
                <div class="item-text">
                  <span class="item-title">Summary</span>
                  <span class="item-desc">Portfolio analytics & trends</span>
                </div>
              </router-link>
              <router-link to="/assessments/questions" class="dropdown-item" @click="dropdownOpen = false">
                <Archive class="dropdown-icon" />
                <div class="item-text">
                  <span class="item-title">Question Library</span>
                  <span class="item-desc">Manage master questionnaire</span>
                </div>
              </router-link>
              <router-link to="/assessments/templates" class="dropdown-item" @click="dropdownOpen = false">
                <Layout class="dropdown-icon" />
                <div class="item-text">
                  <span class="item-title">Frameworks</span>
                  <span class="item-desc">Assessment audit templates</span>
                </div>
              </router-link>
            </div>
          </Transition>
        </div>

        <!-- User section -->
        <div class="navbar-user" v-if="authStore.isLoggedIn">
          <router-link to="/profile" class="user-pill">
            <div class="avatar-mini">
              {{ (coreStore.currentUser?.first_name || 'U').charAt(0) }}
            </div>
            <span class="user-name-hide">{{ coreStore.currentUser?.first_name || 'Account' }}</span>
          </router-link>
          <button @click="handleLogout" class="logout-btn desktop-logout-btn" title="Logout">
            <LogOut class="icon-sm" />
          </button>
          <!-- Hamburger — mobile only -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="hamburger-btn"
            :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
          >
            <X v-if="mobileMenuOpen" class="hamburger-icon" />
            <Menu v-else class="hamburger-icon" />
          </button>
        </div>

      </div>
    </nav>

    <!-- Mobile slide-down menu -->
    <Transition name="mobile-menu">
      <div v-if="mobileMenuOpen && authStore.isLoggedIn" class="mobile-panel glass">
        <router-link to="/dashboard" class="mobile-link" @click="mobileMenuOpen = false">
          <LayoutDashboard class="mobile-icon" /><span>Dashboard</span>
        </router-link>
        <template v-if="hasOrganization">
          <router-link to="/vendors" class="mobile-link" @click="mobileMenuOpen = false">
            <Building class="mobile-icon" /><span>Vendors</span>
          </router-link>
          <router-link to="/vendors/compare" class="mobile-link" @click="mobileMenuOpen = false">
            <Scale class="mobile-icon" /><span>Vendor Comparison</span>
          </router-link>
          <router-link to="/incidents" class="mobile-link" @click="mobileMenuOpen = false">
            <Activity class="mobile-icon" /><span>Incidents</span>
          </router-link>
          <router-link to="/simulations" class="mobile-link" @click="mobileMenuOpen = false">
            <Zap class="mobile-icon" /><span>Simulations</span>
          </router-link>
          <router-link to="/processes" class="mobile-link" @click="mobileMenuOpen = false">
            <Cpu class="mobile-icon" /><span>Business Processes</span>
          </router-link>
          <router-link to="/processes/dependency-map" class="mobile-link" @click="mobileMenuOpen = false">
            <Network class="mobile-icon" /><span>Dependency Map</span>
          </router-link>
          <router-link to="/risk-heatmap" class="mobile-link" @click="mobileMenuOpen = false">
            <Grid class="mobile-icon" /><span>Risk Heatmap</span>
          </router-link>
          <router-link to="/assessments" class="mobile-link" @click="mobileMenuOpen = false">
            <ClipboardList class="mobile-icon" /><span>Assessments</span>
          </router-link>
          <template v-if="isAdmin">
            <router-link to="/assessments/summary" class="mobile-link mobile-link-sub" @click="mobileMenuOpen = false">
              <PieChart class="mobile-icon" /><span>Assessment Summary</span>
            </router-link>
            <router-link to="/assessments/questions" class="mobile-link mobile-link-sub" @click="mobileMenuOpen = false">
              <Archive class="mobile-icon" /><span>Question Library</span>
            </router-link>
            <router-link to="/assessments/templates" class="mobile-link mobile-link-sub" @click="mobileMenuOpen = false">
              <Layout class="mobile-icon" /><span>Frameworks</span>
            </router-link>
          </template>
        </template>
        <div class="mobile-divider"></div>
        <button @click="handleLogout" class="mobile-link mobile-logout-link">
          <LogOut class="mobile-icon" /><span>Logout</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useCoreStore } from '../../stores/core'
import { useRouter } from 'vue-router'
import {
  Shield,
  LayoutDashboard,
  Building,
  Zap,
  Cpu,
  ClipboardList,
  LogOut,
  Scale,
  Activity,
  PieChart,
  Archive,
  Layout,
  ChevronDown,
  Network,
  Grid,
  Menu,
  X,
} from 'lucide-vue-next'

const authStore = useAuthStore()
const coreStore = useCoreStore()
const router = useRouter()

const isAdmin = computed(() => ['admin', 'manager'].includes(coreStore.permissions?.role))
const hasOrganization = computed(() => coreStore.hasOrganization)

// Dropdown open state with a small close-timer so the mouse
// can travel from the trigger link down to the menu without
// the dropdown closing mid-move.
const mobileMenuOpen = ref(false)
const dropdownOpen = ref(false)
let closeTimer = null

const handleDropdownEnter = () => {
  cancelCloseTimer()
  dropdownOpen.value = true
}

const startCloseTimer = () => {
  closeTimer = setTimeout(() => {
    dropdownOpen.value = false
  }, 120)
}

const cancelCloseTimer = () => {
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
}

const handleLogout = async () => {
  dropdownOpen.value = false
  mobileMenuOpen.value = false
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
  pointer-events: none;
}

.navbar {
  pointer-events: auto;
  width: 95%;
  max-width: 1200px;
  height: 64px;
  border-radius: 32px;
  padding: 0 12px;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.4);
  /* Must be visible — NOT hidden — so the dropdown can render below */
  overflow: visible;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  gap: 8px;
  /* Must be visible so absolutely-positioned dropdown is not clipped */
  overflow: visible;
}

/* ── Brand ─────────────────────────────────────────────────── */
.navbar-brand {
  flex: 0 0 auto;
  min-width: 160px;
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

/* ── Scrollable center links ───────────────────────────────── */
/* overflow-x:auto + overflow-y:hidden is intentional here.
   The Audits dropdown lives OUTSIDE this element precisely
   because overflow-x:auto would clip overflow-y content. */
.navbar-center {
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.03);
  padding: 4px;
  border-radius: 28px;
  gap: 2px;
  flex: 1;
  min-width: 0;
  height: 48px;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: thin;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
  mask-image: linear-gradient(to right, transparent, black 10px, black 90%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 10px, black 90%, transparent);
}

.navbar-center::-webkit-scrollbar { height: 3px; }
.navbar-center::-webkit-scrollbar-track { background: transparent; margin: 0 20px; }
.navbar-center::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.2); border-radius: 3px; }
.navbar-center::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.3); }

/* ── Nav links ─────────────────────────────────────────────── */
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
  white-space: nowrap;
  flex-shrink: 0;
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

/* Softer active state for the Audits trigger so it doesn't
   look double-selected when viewing a sub-route like /assessments/summary */
.audits-trigger.router-link-active {
  background: rgba(255, 255, 255, 0.8);
  color: var(--primary);
  box-shadow: none;
}

.nav-icon {
  width: 18px;
  height: 18px;
}

/* ── Audits dropdown wrapper ───────────────────────────────── */
.nav-dropdown-wrapper {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  /* No overflow set here — inherits visible from navbar-content */
}

.chevron-icon {
  width: 14px;
  height: 14px;
  margin-left: -2px;
  opacity: 0.5;
  transition: transform 0.2s;
}

.chevron-icon.rotated {
  transform: rotate(180deg);
  opacity: 1;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  width: 280px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 1002;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: white;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  border-radius: 16px;
  pointer-events: auto;
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
  white-space: normal;
}

.dropdown-item:hover {
  background: rgba(59, 130, 246, 0.08);
  color: var(--primary);
}

.dropdown-icon {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  flex-shrink: 0;
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

/* ── Dropdown enter/leave transition ──────────────────────── */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-6px);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* ── User section ──────────────────────────────────────────── */
.navbar-user {
  flex: 0 0 auto;
  min-width: 120px;
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
  white-space: nowrap;
}

.user-pill:hover { transform: scale(1.02); }

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
  flex-shrink: 0;
}

.logout-btn:hover {
  background: #fecaca;
  transform: rotate(5deg);
}

.icon-sm { width: 16px; height: 16px; }

/* ── Glass utility ─────────────────────────────────────────── */
.glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* ── Hamburger button — hidden on desktop ──────────────────── */
.hamburger-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  color: #334155;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}
.hamburger-btn:hover { background: rgba(0, 0, 0, 0.1); }
.hamburger-icon { width: 22px; height: 22px; }

/* ── Mobile panel ──────────────────────────────────────────── */
.mobile-panel {
  pointer-events: auto;
  position: absolute;
  top: calc(100% + 12px);
  left: 0;
  right: 0;
  width: 95%;
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 24px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 999;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.mobile-link {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 13px 16px;
  border-radius: 14px;
  text-decoration: none;
  color: #334155;
  font-size: 15px;
  font-weight: 700;
  transition: background 0.15s;
  border: none;
  background: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
  min-height: 48px;
}
.mobile-link:hover, .mobile-link:active {
  background: rgba(59, 130, 246, 0.08);
  color: var(--primary);
}
.mobile-link.router-link-active {
  background: rgba(59, 130, 246, 0.1);
  color: var(--primary);
}
.mobile-link-sub {
  padding-left: 52px;
  font-weight: 600;
  font-size: 14px;
  color: #64748b;
}
.mobile-icon { width: 20px; height: 20px; flex-shrink: 0; }
.mobile-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 4px 0;
}
.mobile-logout-link { color: #dc2626; }
.mobile-logout-link:hover { background: #fef2f2; color: #dc2626; }

/* Mobile menu transition */
.mobile-menu-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.mobile-menu-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.mobile-menu-enter-from { opacity: 0; transform: translateY(-8px); }
.mobile-menu-leave-to   { opacity: 0; transform: translateY(-8px); }

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 1100px) {
  .navbar-brand { min-width: 50px; }
  .brand-text { display: none; }
  .navbar-user { min-width: 70px; }
  .user-name-hide { display: none; }
  .user-pill { padding: 4px; }
}

@media (max-width: 768px) {
  .navbar { padding: 0 8px; }
  .nav-link { padding: 8px 12px; }
  .nav-link span { display: none; }
  .nav-icon { width: 20px; height: 20px; }
  .brand-link { padding: 8px; }
  .chevron-icon { display: none; }
}

/* At 640px switch to hamburger — hide desktop links, show hamburger */
@media (max-width: 640px) {
  .navbar { width: 95%; }
  .navbar-center { display: none !important; }
  .nav-dropdown-wrapper { display: none !important; }
  .hamburger-btn { display: flex; }
  .desktop-logout-btn { display: none; }
  .navbar-user { min-width: auto; gap: 8px; }
  .user-name-hide { display: none; }
  .user-pill { padding: 4px; }
  .navbar-brand { min-width: auto; }
  .brand-text { display: block; font-size: 15px; }
}
</style>
