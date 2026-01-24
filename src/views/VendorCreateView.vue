<template>
  <div>
    <NavBar />
    <div class="create-vendor-page">
      <div class="container">
        <div class="page-header">
          <div>
            <router-link to="/vendors" class="back-link">
              <ArrowLeft class="icon" />
              Back to Vendors
            </router-link>
            <h1>Add New Vendor</h1>
            <p class="text-muted">Create a new vendor profile and assess their risk level</p>
          </div>
        </div>

        <div class="create-vendor-content">
          <VendorModal :is-edit="false" @close="handleCancel" @save="handleVendorCreated" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import NavBar from '../components/common/NavBar.vue'
import VendorModal from '../components/vendors/VendorModal.vue'
import { ArrowLeft } from 'lucide-vue-next'

const router = useRouter()

const handleCancel = () => {
  router.push('/vendors')
}

const handleVendorCreated = () => {
  router.push('/vendors')
}
</script>

<style scoped>
.create-vendor-page {
  min-height: calc(100vh - 72px);
  padding: 40px 0;
  background: #f5f7fa;
}

.page-header {
  margin-bottom: 32px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  margin-bottom: 16px;
  transition: color 0.3s ease;
}

.back-link:hover {
  color: #2563eb;
}

.icon {
  width: 20px;
  height: 20px;
}

.page-header h1 {
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 8px;
}

.create-vendor-content {
  max-width: 900px;
  margin: 0 auto;
}

/* Override modal styles for inline display */
.create-vendor-content :deep(.modal-overlay) {
  position: static;
  background: transparent;
  padding: 0;
}

.create-vendor-content :deep(.modal-container) {
  max-width: 100%;
  max-height: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
