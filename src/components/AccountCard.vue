<template>
  <div class="account-card" :class="[account.type, account.platform]">
    <div class="account-header">
      <div class="platform-icon" :style="{ color: platformColor }">
        <iconify-icon :icon="platformIcon" />
      </div>
      
      <div class="account-info">
        <h3 class="account-name">{{ account.name }}</h3>
        <p class="account-username">{{ account.username || account.issuer }}</p>
        <div class="account-meta">
          <span class="account-type">{{ account.type }}</span>
          <span class="account-group">{{ account.group }}</span>
        </div>
      </div>
      
      <div class="account-actions">
        <button @click="$emit('copy-token')" class="btn-icon" title="Copy Token">
          <iconify-icon icon="mdi:content-copy" />
        </button>
        <button @click="$emit('remove')" class="btn-icon btn-danger" title="Remove Account">
          <iconify-icon icon="mdi:trash-can-outline" />
        </button>
      </div>
    </div>
    
    <div v-if="account.type === 'TOTP'" class="token-section">
      <div class="token-display">
        <span class="token-code">{{ currentToken }}</span>
        <span class="token-timer" :class="{ warning: timeLeft < 10 }">
          {{ timeLeft }}s
        </span>
      </div>
    </div>
    
    <div v-else class="cookie-section">
      <div class="cookie-status">
        <iconify-icon icon="mdi:cookie" />
        <span>Cookie Session</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getPlatformIcon, getPlatformColor } from '@/utils/platformIcons'

interface Account {
  id: string
  type: string
  platform: string
  name: string
  username?: string
  issuer?: string
  group?: string
  secret?: string
}

interface Props {
  account: Account
  currentToken?: string
  timeLeft?: number
}

const props = defineProps<Props>()
defineEmits<{
  'copy-token': [account: Account]
  'remove': [accountId: string]
}>()

const platformIcon = computed(() => getPlatformIcon(props.account.platform))
const platformColor = computed(() => getPlatformColor(props.account.platform))
</script>

<!-- Template and styles remain the same -->

<style scoped>
.account-card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  margin-bottom: 1rem;
}

.account-card:hover {
  border-color: var(--accent-primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.account-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.platform-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.account-info {
  flex: 1;
  min-width: 0;
}

.account-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-username {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.account-type, .account-group {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
}

.account-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.btn-icon {
  padding: 0.5rem;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}

.token-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.token-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.token-code {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--accent-primary);
  letter-spacing: 0.1em;
}

.token-timer {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.token-timer.warning {
  color: var(--danger);
  animation: pulse 1s infinite;
}

.cookie-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.cookie-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
