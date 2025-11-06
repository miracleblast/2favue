<template>
  <div class="app-wrapper">
    <!-- Header -->
    <AppHeader />
    
    <main class="app-container">
      <div class="dashboard-section">
        <!-- Header with Actions -->
        <div class="dashboard-header">
          <h1 class="section-title">
            <iconify-icon icon="mdi:shield-check" />
            Security Logs
          </h1>
          <div class="header-actions">
            <button class="btn btn-outline-primary" @click="exportLogs">
              <iconify-icon icon="mdi:download" />
              <span>Export Logs</span>
            </button>
            <button class="btn btn-outline-danger" @click="clearLogs">
              <iconify-icon icon="mdi:trash-can" />
              <span>Clear Logs</span>
            </button>
          </div>
        </div>

        <!-- Security Events Table -->
        <div class="card">
          <div class="card-header">
            <span>Security Events</span>
            <span class="badge bg-primary">{{ securityLogs.length }} events</span>
          </div>
          <div class="card-body">
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>User</th>
                    <th>Event</th>
                    <th>IP Address</th>
                    <th>Platform</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="log in securityLogs" :key="log.id">
                    <td>
                      <div class="event-time">{{ log.time }}</div>
                      <div class="event-date">{{ log.date }}</div>
                    </td>
                    <td>
                      <div class="user-info">
                        <div class="user-avatar-xs">{{ log.userInitials }}</div>
                        <span>{{ log.user }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="event-action">{{ log.action }}</div>
                      <div class="event-details">{{ log.details }}</div>
                    </td>
                    <td class="ip-address">{{ log.ip }}</td>
                    <td>
                      <span class="platform-badge">{{ log.platform }}</span>
                    </td>
                    <td>
                      <span class="badge" :class="log.status === 'Success' ? 'badge-success' : 'badge-danger'">
                        <iconify-icon :icon="log.status === 'Success' ? 'mdi:check' : 'mdi:close'" />
                        {{ log.status }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Security Summary & Timeline -->
        <div class="grid-2-col">
          <div class="card">
            <div class="card-header">
              <iconify-icon icon="mdi:chart-box" />
              <span>Security Summary</span>
            </div>
            <div class="card-body">
              <div class="security-summary">
                <div class="summary-item">
                  <div class="summary-value">{{ successfulEvents }}</div>
                  <div class="summary-label">Successful Events</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">{{ failedEvents }}</div>
                  <div class="summary-label">Failed Events</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">{{ activeUsers }}</div>
                  <div class="summary-label">Active Users</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">{{ uniqueIPs }}</div>
                  <div class="summary-label">Unique IPs</div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <iconify-icon icon="mdi:timeline" />
              <span>Recent Activity Timeline</span>
            </div>
            <div class="card-body">
              <div class="activity-timeline">
                <div 
                  v-for="log in recentActivity" 
                  :key="log.id" 
                  class="timeline-item" 
                  :class="log.status === 'Success' ? 'success' : 'failed'"
                >
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <div class="timeline-action">{{ log.action }}</div>
                    <div class="timeline-meta">{{ log.user }} • {{ log.time }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSecurityLogsStore } from '@/stores/securityLogs'
// @ts-ignore
import { NotificationService } from '@/engines/NotificationService'
import AppHeader from '@/components/AppHeader.vue'

// Store
const securityLogsStore = useSecurityLogsStore()

// Engine
const notificationService = new NotificationService()

// Reactive State
const securityLogs = computed(() => securityLogsStore.securityLogs)

// Computed Properties
const successfulEvents = computed(() => 
  securityLogs.value.filter(log => log.status === 'Success').length
)

const failedEvents = computed(() => 
  securityLogs.value.filter(log => log.status === 'Failed').length
)

const activeUsers = computed(() => 
  new Set(securityLogs.value.map(log => log.user)).size
)

const uniqueIPs = computed(() => 
  new Set(securityLogs.value.map(log => log.ip)).size
)

const recentActivity = computed(() => 
  securityLogs.value.slice(0, 6)
)

// Methods
const exportLogs = () => {
  const dataStr = JSON.stringify(securityLogs.value, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `security-logs-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  
  // Log this action
  logSecurityEvent('logs_exported', 'Security logs exported', 'Success')
  alert('Security logs exported successfully!')
}

const clearLogs = () => {
  if (confirm('Are you sure you want to clear all security logs? This action cannot be undone.')) {
    securityLogsStore.clearLogs()
    
    // Log this action
    logSecurityEvent('logs_cleared', 'Security logs cleared', 'Success')
    alert('Security logs cleared successfully!')
  }
}

const logSecurityEvent = (type: string, details: string, status: string) => {
  const event = {
    time: new Date().toLocaleTimeString(),
    date: new Date().toLocaleDateString(),
    user: 'You',
    userInitials: 'Y',
    action: getActionFromType(type),
    details,
    ip: getClientIP(),
    platform: getPlatformInfo(),
    status
  };
  
  securityLogsStore.addLog(event);
  
  // Send real notification
  if (notificationService.canNotify()) {
    notificationService.notifySecurityEvent({
      type,
      user: 'You',
      ip: event.ip,
      platform: event.platform,
      status
    });
  }
}

const getActionFromType = (type: string) => {
  const actions: Record<string, string> = {
    'logs_exported': 'Exported Security Logs',
    'logs_cleared': 'Cleared Security Logs',
    'login': 'User Login',
    'logout': 'User Logout',
    'token_generated': 'Token Generated',
    'account_added': 'Account Added',
    'account_removed': 'Account Removed'
  };
  return actions[type] || 'Security Event';
}

const getClientIP = () => {
  // In a real app, you'd get this from your backend
  // For demo, generate a random IP
  return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

const getPlatformInfo = () => {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Win')) return 'Windows';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  
  return 'Web Browser';
}

// Lifecycle
onMounted(() => {
  securityLogsStore.loadSecurityLogs();
  notificationService.init();
  
  // Log page view
  logSecurityEvent('page_view', 'Viewed security logs', 'Success');
});
</script>

<style scoped>
/* MAIN LAYOUT */
.app-wrapper {
  min-height: 100vh;
  background: var(--bg-primary);
}

.app-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.dashboard-section {
  margin-bottom: 3rem;
}

/* HEADER */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

/* BUTTONS */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-outline-primary {
  background: transparent;
  border: 1px solid var(--accent-primary);
  color: var(--accent-primary);
}

.btn-outline-primary:hover {
  background: var(--accent-primary);
  color: white;
}

.btn-outline-danger {
  background: transparent;
  border: 1px solid var(--danger);
  color: var(--danger);
}

.btn-outline-danger:hover {
  background: var(--danger);
  color: white;
}

/* CARDS */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-xl);
  backdrop-filter: blur(20px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.03);
}

.card-header span {
  font-weight: 600;
  color: var(--text-primary);
}

.card-body {
  padding: 1.5rem;
}

/* BADGES */
.badge {
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.badge-success {
  background: linear-gradient(135deg, #10b981 0%, #0d9c6e 100%) !important;
  border: 1px solid rgba(16, 185, 129, 0.3);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.badge-danger {
  background: linear-gradient(135deg, #ef4444 0%, #c53030 100%) !important;
  border: 1px solid rgba(239, 68, 68, 0.3);
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

.bg-primary {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--primary-dark) 100%) !important;
  color: white !important;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

/* TABLE */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  color: var(--text-primary);
}

.data-table th {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.data-table tbody tr {
  transition: var(--transition-fast);
}

.data-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* EVENT TIME */
.event-time {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.event-date {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.125rem;
}

/* USER INFO */
.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar-xs {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  font-size: 0.75rem;
  flex-shrink: 0;
}

/* EVENT ACTION */
.event-action {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.event-details {
  font-size: 0.875rem;
  color: var(--text-muted);
}

/* IP ADDRESS */
.ip-address {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* PLATFORM BADGE */
.platform-badge {
  background: rgba(59, 130, 246, 0.1);
  color: var(--accent-primary);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

/* GRID LAYOUT */
.grid-2-col {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1.5rem;
  margin-top: 2rem;
}

/* SECURITY SUMMARY */
.security-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.summary-item {
  text-align: center;
  padding: 1.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  transition: var(--transition-fast);
}

.summary-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.summary-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--accent-primary);
  margin-bottom: 0.5rem;
  line-height: 1;
}

.summary-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* ACTIVITY TIMELINE */
.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
}

.timeline-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.timeline-marker {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 0.5rem;
  flex-shrink: 0;
  position: relative;
}

.timeline-item.success .timeline-marker {
  background: var(--success);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.timeline-item.failed .timeline-marker {
  background: var(--danger);
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.timeline-content {
  flex: 1;
}

.timeline-action {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
}

.timeline-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .grid-2-col {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .security-summary {
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .app-container {
    padding: 1rem;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .security-summary {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .data-table {
    font-size: 0.875rem;
  }
  
  .data-table th,
  .data-table td {
    padding: 0.75rem 0.5rem;
  }
  
  .user-info {
    gap: 0.5rem;
  }
  
  .user-avatar-xs {
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .card-header,
  .card-body {
    padding: 1rem;
  }
  
  .section-title {
    font-size: 1.25rem;
  }
  
  .btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
  }
  
  .security-summary {
    grid-template-columns: 1fr;
  }
  
  .summary-item {
    padding: 1rem;
  }
  
  .summary-value {
    font-size: 2rem;
  }
  
  .data-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
}
</style>