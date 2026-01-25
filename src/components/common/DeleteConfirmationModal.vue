<template>
  <div class="modal-overlay glass" @click.self="$emit('close')">
    <div class="modal-container animate-in">
      <div class="modal-header-premium">
        <div class="header-icon-shell danger">
          <Trash2 class="icon-lg" />
        </div>
        <div class="header-txt">
          <h2>{{ title || 'Confirm Removal' }}</h2>
          <p class="subtitle text-red-500 font-black uppercase tracking-tighter text-xs">
            High Stakes Operation
          </p>
        </div>
        <button @click="$emit('close')" class="minimal-close">
          <X class="icon-sm" />
        </button>
      </div>

      <div class="modal-body-premium">
        <p class="description">
          <slot name="description">
            Are you sure you want to permanently delete <strong>{{ itemName }}</strong
            >? This action is irreversible and will purge all associated telemetry.
          </slot>
        </p>

        <div v-if="requireConfirmation" class="safety-lock mt-8">
          <label class="lock-label"
            >Type <span class="confirm-pkg">"{{ confirmationString || itemName }}"</span> to
            proceed</label
          >
          <input
            v-model="userInput"
            type="text"
            class="lock-input"
            :placeholder="`Verify ${itemName}...`"
            autocomplete="off"
          />
        </div>
      </div>

      <div class="modal-footer-premium">
        <button @click="$emit('close')" class="btn-minimal">Abort Action</button>
        <button
          @click="$emit('confirm')"
          class="btn-danger-premium"
          :disabled="requireConfirmation && !isConfirmed"
        >
          {{ confirmText || 'Confirm Permanent Delete' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Trash2, X } from 'lucide-vue-next'

const props = defineProps({
  title: String,
  itemName: { type: String, required: true },
  confirmText: String,
  requireConfirmation: { type: Boolean, default: true },
  confirmationString: String,
})

defineEmits(['close', 'confirm'])

const userInput = ref('')
const isConfirmed = computed(() => {
  const target = props.confirmationString || props.itemName
  return userInput.value.trim() === target
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  padding: 24px;
}

.modal-container {
  background: white;
  border-radius: 28px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.modal-header-premium {
  padding: 32px 32px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon-shell {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-icon-shell.danger {
  background: #fee2e2;
  color: #ef4444;
}

.header-txt h2 {
  font-size: 22px;
  font-weight: 900;
  color: #1e293b;
  letter-spacing: -0.02em;
}

.minimal-close {
  margin-left: auto;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #f1f5f9;
  cursor: pointer;
  transition: 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.minimal-close:hover {
  background: #e2e8f0;
  transform: rotate(90deg);
}

.modal-body-premium {
  padding: 0 32px 32px;
}
.description {
  font-size: 15px;
  color: #64748b;
  line-height: 1.6;
}

.safety-lock {
  padding: 20px;
  background: #fffcfc;
  border: 1px solid #fee2e2;
  border-radius: 20px;
}
.lock-label {
  display: block;
  font-size: 11px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  margin-bottom: 12px;
  letter-spacing: 0.05em;
}
.confirm-pkg {
  color: #ef4444;
  text-transform: none;
}

.lock-input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: white;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}
.lock-input:focus {
  outline: none;
  border-color: #ef4444;
  box-shadow: 0 0 0 4px #fee2e2;
}

.modal-footer-premium {
  padding: 24px 32px;
  background: #f8fafc;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.btn-minimal {
  background: transparent;
  border: none;
  font-size: 14px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  padding: 8px 16px;
}

.btn-danger-premium {
  background: #ef4444;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}
.btn-danger-premium:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-2px);
}
.btn-danger-premium:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
  filter: grayscale(1);
}

.animate-in {
  animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.icon-lg {
  width: 28px;
  height: 28px;
}
.icon-sm {
  width: 16px;
  height: 16px;
}
</style>
