<template>
  <div class="quick-actions">
    <button class="action-btn" @click="$emit('add-account')">
      <iconify-icon icon="mdi:plus-circle" />
      <span>Add Account</span>
    </button>
    
    <button class="action-btn" @click="$emit('bulk-import')">
      <iconify-icon icon="mdi:upload" />
      <span>Bulk Import</span>
    </button>
    
    <button class="action-btn" @click="$emit('export-data')">
      <iconify-icon icon="mdi:download" />
      <span>Export Data</span>
    </button>
    
    <button class="action-btn" @click="$emit('settings')">
      <iconify-icon icon="mdi:cog" />
      <span>Settings</span>
    </button>
  </div>
</template>

<script setup>
defineEmits(['add-account', 'bulk-import', 'export-data', 'settings'])
</script>

<style scoped>
.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  width: 100%;
}

.action-btn:hover {
  border-color: var(--accent-primary);
  background: rgba(59, 130, 246, 0.1);
  transform: translateY(-2px);
}

.action-btn iconify-icon {
  font-size: 1.5rem;
  color: var(--accent-primary);
}

.action-btn span {
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
}

@media (min-width: 768px) {
  .quick-actions {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
