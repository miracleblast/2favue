<template>
  <button 
    :class="[
      'btn-modern',
      variant,
      size,
      { 'loading': loading, 'disabled': disabled }
    ]" 
    :disabled="loading || disabled"
    @click="$emit('click')"
  >
    <IconifyIcon v-if="icon && !loading" :icon="icon" class="btn-icon" />
    <IconifyIcon v-if="loading" icon="mdi:loading" class="btn-icon animate-spin" />
    <span class="btn-text">
      <slot></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import IconifyIcon from '@iconify/vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  icon?: string
  loading?: boolean
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  loading: false,
  disabled: false
})

defineEmits<{
  click: []
}>()
</script>

<style scoped>
.btn-modern {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-lg);
  border: none;
  border-radius: var(--radius-md);
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
}

.btn-modern::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left var(--transition-normal);
}

.btn-modern:hover::before {
  left: 100%;
}

.btn-modern.primary {
  background: var(--accent-primary);
  color: white;
  box-shadow: var(--shadow-md);
}

.btn-modern.primary:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-modern.secondary {
  background: transparent;
  color: var(--accent-primary);
  border: 2px solid var(--accent-primary);
}

.btn-modern.secondary:hover:not(.disabled) {
  background: var(--accent-primary);
  color: white;
}

.btn-modern.ghost {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid transparent;
}

.btn-modern.ghost:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
}

.btn-modern.small {
  padding: var(--space-sm) var(--space-md);
  font-size: 0.875rem;
}

.btn-modern.large {
  padding: var(--space-lg) var(--space-xl);
  font-size: 1.1rem;
}

.btn-modern.loading {
  cursor: not-allowed;
  opacity: 0.7;
}

.btn-modern.disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
