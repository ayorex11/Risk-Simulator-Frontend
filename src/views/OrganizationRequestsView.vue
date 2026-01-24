<template>
  <div>
    <NavBar />
    <div class="requests-page">
      <div class="container">
        <div class="requests-header">
          <router-link to="/organization/settings" class="back-link"
            >← Back to Settings</router-link
          >
          <h1>Join Requests</h1>
          <p class="text-muted">Manage users who want to join your organization</p>
        </div>

        <div class="card">
          <div v-if="coreStore.loading && requests.length === 0" class="loading-state">
            <div class="spinner"></div>
            <p>Fetching requests...</p>
          </div>

          <div v-else-if="requests.length === 0" class="empty-state">
            <UserPlus class="empty-icon" />
            <h3>No Pending Requests</h3>
            <p>All join requests have been processed.</p>
          </div>

          <div v-else class="requests-list">
            <div v-for="request in requests" :key="request.id" class="request-item">
              <div class="user-info">
                <div class="user-avatar">
                  {{ request.user?.user_first_name?.[0] || request.user?.user_email?.[0] }}
                </div>
                <div class="user-details">
                  <h3>{{ request.user?.user_first_name }} {{ request.user?.user_last_name }}</h3>
                  <p>{{ request.user?.user_email }}</p>
                  <span class="request-date"
                    >Requested on {{ formatDate(request.created_at) }}</span
                  >
                </div>
              </div>

              <div class="request-actions">
                <button
                  @click="handleApprove(request.id)"
                  class="btn btn-primary"
                  :disabled="processingId === request.id"
                >
                  <Check v-if="processingId !== request.id" class="icon" />
                  <span v-else class="spinner-small"></span>
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCoreStore } from '../stores/core'
import NavBar from '../components/common/NavBar.vue'
import { UserPlus, Check } from 'lucide-vue-next'

const coreStore = useCoreStore()
const processingId = ref(null)

const requests = computed(() => coreStore.organizationRequests)

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const handleApprove = async (requestId) => {
  try {
    processingId.value = requestId
    await coreStore.approveRequest(requestId)
  } catch (error) {
    console.error('Failed to approve request:', error)
  } finally {
    processingId.value = null
  }
}

onMounted(async () => {
  await coreStore.fetchOrganizationRequests()
})
</script>

<style scoped>
.requests-page {
  min-height: calc(100vh - 72px);
  padding: 40px 0;
  background: #f5f7fa;
}

.requests-header {
  margin-bottom: 32px;
}

.back-link {
  display: block;
  margin-bottom: 16px;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
}

.requests-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.loading-state,
.empty-state {
  padding: 60px;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.requests-list {
  display: flex;
  flex-direction: column;
}

.request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.request-item:last-child {
  border-bottom: none;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
  text-transform: uppercase;
}

.user-details h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.user-details p {
  color: #6b7280;
  margin: 4px 0;
}

.request-date {
  font-size: 13px;
  color: #9ca3af;
}

.request-actions {
  display: flex;
  gap: 12px;
}

.icon {
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  display: inline-block;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
