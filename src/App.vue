<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  // Fetch profile if authenticated
  if (authStore.isLoggedIn) {
    authStore.fetchProfile().catch(() => {
      // Silent fail, token might be expired
    })
  }
})
</script>

<style>
#app {
  min-height: 100vh;
}
</style>
