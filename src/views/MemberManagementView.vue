<template>
  <div>
    <NavBar />
    <div class="members-page">
      <div class="container">
        <div class="members-header">
          <router-link to="/organization/settings" class="back-link"
            >← Back to Settings</router-link
          >
          <div class="header-main">
            <div>
              <h1>Member Management</h1>
              <p class="text-muted">Manage users and roles within your organization</p>
            </div>
          </div>
        </div>

        <div class="card filters-card mb-4">
          <div class="filters-grid">
            <div class="filter-group">
              <label class="filter-label">Search</label>
              <div class="search-wrapper">
                <Search class="search-icon" />
                <input
                  v-model="filters.search"
                  @input="debouncedFetch"
                  type="text"
                  placeholder="Search by name or email..."
                  class="filter-input"
                />
              </div>
            </div>
            <div class="filter-group">
              <label class="filter-label">Role</label>
              <select v-model="filters.role" @change="fetchUsers" class="filter-input">
                <option value="">All Roles</option>
                <option value="admin">Administrator</option>
                <option value="analyst">Risk Analyst</option>
                <option value="manager">Manager</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div class="filter-group">
              <label class="filter-label">Status</label>
              <select v-model="filters.is_active" @change="fetchUsers" class="filter-input">
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card">
          <div v-if="loading && users.length === 0" class="loading-state">
            <div class="spinner"></div>
            <p>Fetching members...</p>
          </div>

          <div v-else-if="users.length === 0" class="empty-state">
            <Users class="empty-icon" />
            <h3>No Members Found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>

          <div v-else class="members-table-wrapper">
            <table class="members-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id">
                  <td>
                    <div class="user-cell">
                      <div class="user-avatar">
                        {{ user.first_name?.[0] || user.email?.[0] }}
                      </div>
                      <div>
                        <div class="user-name">{{ user.first_name }} {{ user.last_name }}</div>
                        <div class="user-email">{{ user.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="role-badge" :class="user.role">
                      {{ formatRole(user.role) }}
                    </span>
                  </td>
                  <td>
                    <span class="status-badge" :class="{ active: user.is_active }">
                      {{ user.is_active ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>
                    <button @click="openEditModal(user)" class="btn btn-secondary btn-sm">
                      Edit Role
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Role Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Edit Member Role</h2>
          <button @click="showModal = false" class="close-btn"><X /></button>
        </div>
        <div class="modal-body" v-if="selectedUser">
          <p>
            Update role for
            <strong>{{ selectedUser.first_name }} {{ selectedUser.last_name }}</strong>
          </p>
          <div class="form-group mt-4">
            <label class="form-label">Select Role</label>
            <select v-model="editRole" class="form-input">
              <option value="admin">Administrator</option>
              <option value="analyst">Risk Analyst</option>
              <option value="manager">Manager</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div class="modal-actions mt-4">
            <button @click="showModal = false" class="btn btn-secondary">Cancel</button>
            <button @click="handleUpdateRole" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Updating...' : 'Save Changes' }}
            </button>
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
import { Users, Search, X } from 'lucide-vue-next'
import debounce from 'lodash.debounce'

const coreStore = useCoreStore()
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const selectedUser = ref(null)
const editRole = ref('')

const filters = ref({
  search: '',
  role: '',
  is_active: '',
})

const users = computed(() => coreStore.users)

const fetchUsers = async () => {
  try {
    loading.value = true
    const params = {}
    if (filters.value.search) params.search = filters.value.search
    if (filters.value.role) params.role = filters.value.role
    if (filters.value.is_active) params.is_active = filters.value.is_active

    await coreStore.fetchUsers(params)
  } catch (error) {
    console.error('Failed to fetch users:', error)
  } finally {
    loading.value = false
  }
}

const debouncedFetch = debounce(fetchUsers, 300)

const formatRole = (role) => {
  if (!role) return 'N/A'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

const openEditModal = (user) => {
  selectedUser.value = user
  editRole.value = user.role
  showModal.value = true
}

const handleUpdateRole = async () => {
  try {
    saving.value = true
    await coreStore.updateUserProfile(selectedUser.value.id, {
      role: editRole.value,
    })
    showModal.value = false
    await fetchUsers()
  } catch (error) {
    console.error('Update failed:', error)
  } finally {
    saving.value = false
  }
}

onMounted(fetchUsers)
</script>

<style scoped>
.members-page {
  min-height: calc(100vh - 72px);
  padding: 40px 0;
  background: #f5f7fa;
}

.members-header {
  margin-bottom: 32px;
}

.back-link {
  display: block;
  margin-bottom: 16px;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.members-header h1 {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.filters-card {
  padding: 24px;
}

.filters-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 20px;
}

.filter-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
  text-transform: uppercase;
}

.search-wrapper {
  position: relative;
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

.filter-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 15px;
}

.search-wrapper .filter-input {
  padding-left: 40px;
}

.members-table-wrapper {
  overflow-x: auto;
}

.members-table {
  width: 100%;
  border-collapse: collapse;
}

.members-table th {
  text-align: left;
  padding: 16px 24px;
  background: #f9fafb;
  color: #4b5563;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid #e5e7eb;
}

.members-table td {
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: #e0e7ff;
  color: #4338ca;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  text-transform: uppercase;
}

.user-name {
  font-weight: 600;
  color: #1f2937;
}

.user-email {
  font-size: 13px;
  color: #6b7280;
}

.role-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.role-badge.admin {
  background: #fee2e2;
  color: #991b1b;
}
.role-badge.manager {
  background: #fef3c7;
  color: #92400e;
}
.role-badge.analyst {
  background: #dbeafe;
  color: #1e40af;
}
.role-badge.viewer {
  background: #f3f4f6;
  color: #374151;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.status-badge::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9ca3af;
}

.status-badge.active::before {
  background: #10b981;
}

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
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 450px;
  padding: 32px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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
</style>
