<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-container">
      <div class="modal-header">
        <h2>Join Organization</h2>
        <button @click="$emit('close')" class="close-btn">
          <X class="icon" />
        </button>
      </div>

      <div class="modal-body">
        <div class="search-section">
          <label class="form-label">Search Organization</label>
          <div class="search-input-wrapper">
            <Search class="search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              class="form-input search-input"
              placeholder="Enter organization name or ID..."
            />
          </div>
        </div>

        <div class="results-section mt-4">
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Searching...</p>
          </div>

          <div v-else-if="results.length > 0" class="results-list">
            <div v-for="org in results" :key="org.id" class="org-item">
              <div class="org-info">
                <h3>{{ org.name }}</h3>
                <p>{{ org.industry }} • {{ org.country }}</p>
              </div>
              <button
                @click="handleJoin(org.id)"
                class="btn btn-primary btn-sm"
                :disabled="joiningId === org.id"
              >
                <span v-if="joiningId === org.id" class="spinner-small"></span>
                Join
              </button>
            </div>
          </div>

          <div v-else-if="searchQuery && !loading" class="empty-results">
            <p>No organizations found matching "{{ searchQuery }}"</p>
          </div>

          <div v-else class="initial-state">
            <Building class="large-icon" />
            <p>Search for an organization to join</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCoreStore } from '../../stores/core'
import { X, Search, Building } from 'lucide-vue-next'

const emit = defineEmits(['close', 'requested'])
const coreStore = useCoreStore()

const searchQuery = ref('')
const loading = ref(false)
const joiningId = ref(null)

onMounted(async () => {
  if (coreStore.allOrganizations.length === 0) {
    try {
      loading.value = true
      await coreStore.fetchOrganizations()
    } catch (error) {
      console.error('Failed to fetch organizations:', error)
    } finally {
      loading.value = false
    }
  }
})

const results = computed(() => {
  if (!searchQuery.value.trim()) {
    return coreStore.allOrganizations
  }

  const query = searchQuery.value.toLowerCase()
  return coreStore.allOrganizations.filter(
    (org) =>
      org.name.toLowerCase().includes(query) ||
      (org.industry && org.industry.toLowerCase().includes(query)) ||
      (org.country && org.country.toLowerCase().includes(query)),
  )
})

const handleJoin = async (orgId) => {
  try {
    joiningId.value = orgId
    await coreStore.joinOrganization(orgId)
    emit('requested')
    emit('close')
  } catch (error) {
    console.error('Join failed:', error)
  } finally {
    joiningId.value = null
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.close-btn {
  padding: 8px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.search-input-wrapper {
  position: relative;
  margin-top: 8px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #9ca3af;
}

.search-input {
  padding-left: 40px;
}

.org-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  margin-bottom: 12px;
  border: 1px solid #e5e7eb;
}

.org-info h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.org-info p {
  font-size: 13px;
  color: #6b7280;
}

.loading-state,
.empty-results,
.initial-state {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.large-icon {
  width: 48px;
  height: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
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
