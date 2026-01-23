<template>
  <nav class="navbar">
    <div class="container navbar-content">
      <div class="navbar-brand">
        <router-link to="/dashboard" class="brand-link">
          <Shield class="brand-icon" />
          <h2>Scenario Forge</h2>
        </router-link>
      </div>

      <div class="navbar-menu" v-if="authStore.isLoggedIn">
        <router-link to="/dashboard" class="nav-link">
          <LayoutDashboard class="nav-icon" />
          Dashboard
        </router-link>
        <router-link to="/vendors" class="nav-link">
          <Building class="nav-icon" />
          Vendors
        </router-link>
        <router-link to="/simulations" class="nav-link">
          <Zap class="nav-icon" />
          Simulations
        </router-link>
        <router-link to="/assessments" class="nav-link">
          <ClipboardList class="nav-icon" />
          Assessments
        </router-link>

        <div class="navbar-user">
          <div class="user-info">
            <span class="user-name">{{ authStore.user?.first_name || authStore.user?.email }}</span>
            <span class="user-role">{{ userRole }}</span>
          </div>
          <button @click="handleLogout" class="btn btn-secondary btn-sm">
            <LogOut class="icon" />
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useCoreStore } from '../../stores/core'
import { useRouter } from 'vue-router'
import { Shield, LayoutDashboard, Building, Zap, ClipboardList, LogOut } from 'lucide-vue-next'

const authStore = useAuthStore()
const coreStore = useCoreStore()
const router = useRouter()

const userRole = computed(() => {
  const role = coreStore.permissions?.role
  if (!role) return ''
  return role.charAt(0).toUpperCase() + role.slice(1)
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0;
  height: 72px;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: #1f2937;
  transition: opacity 0.3s;
}

.brand-link:hover {
  opacity: 0.8;
}

.brand-icon {
  width: 32px;
  height: 32px;
  color: #3b82f6;
}

.brand-link h2 {
  font-size: 24px;
  font-weight: 700;
  color: #3b82f6;
  margin: 0;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: flex-end;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #4b5563;
  font-weight: 600;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.3s;
  font-size: 15px;
}

.nav-link:hover {
  color: #3b82f6;
  background: #eff6ff;
}

.nav-link.router-link-active {
  color: #3b82f6;
  background: #eff6ff;
}

.nav-icon {
  width: 18px;
  height: 18px;
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-left: 24px;
  margin-left: 24px;
  border-left: 2px solid #e5e7eb;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.user-name {
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
}

.user-role {
  color: #6b7280;
  font-size: 12px;
}

.btn-sm {
  padding: 8px 16px;
  font-size: 14px;
}

.icon {
  width: 16px;
  height: 16px;
}

@media (max-width: 1024px) {
  .navbar-menu {
    display: none;
  }
}
</style>
