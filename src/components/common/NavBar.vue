<template>
  <nav class="navbar">
    <div class="container navbar-content">
      <div class="navbar-brand">
        <router-link to="/dashboard" class="brand-link">
          <h2>Scenario Forge</h2>
        </router-link>
      </div>

      <div class="navbar-menu" v-if="authStore.isLoggedIn">
        <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
        <router-link to="/profile" class="nav-link">Profile</router-link>

        <div class="navbar-user">
          <span class="user-email">{{ authStore.user?.email }}</span>
          <button @click="handleLogout" class="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-link {
  text-decoration: none;
  color: #1f2937;
}

.brand-link h2 {
  font-size: 24px;
  font-weight: 700;
  color: #3b82f6;
}

.navbar-menu {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  text-decoration: none;
  color: #4b5563;
  font-weight: 600;
  transition: color 0.3s ease;
  padding: 8px 16px;
  border-radius: 6px;
}

.nav-link:hover {
  color: #3b82f6;
  background: #eff6ff;
}

.nav-link.router-link-active {
  color: #3b82f6;
  background: #eff6ff;
}

.navbar-user {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-left: 24px;
  border-left: 2px solid #e5e7eb;
}

.user-email {
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}
</style>
