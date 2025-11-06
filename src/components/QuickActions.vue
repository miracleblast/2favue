<!-- Update: src/components/QuickActions.vue -->
<template>
  <div class="quick-actions">
    <button class="action-btn" @click="$emit('add-account')">
      <iconify-icon icon="mdi:plus-circle" />
      <span>Add Account</span>
    </button>
    
    <button class="action-btn" @click="$emit('bulk-import')">
      <iconify-icon icon="mdi:import" />
      <span>Bulk Import</span>
    </button>
    
    <button class="action-btn" @click="$emit('export-data')">
      <iconify-icon icon="mdi:export" />
      <span>Export Data</span>
    </button>
    
    <button class="action-btn" @click="$emit('settings')">
      <iconify-icon icon="mdi:cog" />
      <span>Settings</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  'add-account': []
  'bulk-import': []
  'export-data': []
  'settings': []
}>()
</script>

<style scoped>
.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-primary);
  transition: var(--transition-fast);
  text-align: center;
  cursor: pointer;
}

.action-btn:hover {
  background: rgba(99, 196, 241, 0.15);
  border-color: rgba(99, 196, 241, 0.4);
  transform: translateY(-2px);
}

.action-btn iconify-icon {
  font-size: 1.5rem;
  color: var(--accent-primary);
}
</style>