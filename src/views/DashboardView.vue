<template>
  <div class="app-wrapper">
    <!-- Header -->
    <AppHeader />
    
    <!-- Main Content -->
    <main class="app-container">
      <!-- License Status Banner -->
      <div v-if="licenseStatus === 'expiring'" class="alert alert-warning mb-4">
        <div class="alert-content">
          <iconify-icon icon="mdi:alert-circle" />
          <span>Your license expires in {{ daysUntilExpiry }} days</span>
          <button class="btn btn-sm btn-warning" @click="showPricingModal">
            Renew Now
          </button>
        </div>
      </div>

      <div v-if="licenseStatus === 'warning'" class="alert alert-info mb-4">
        <div class="alert-content">
          <iconify-icon icon="mdi:information" />
          <span>Your license expires in {{ daysUntilExpiry }} days</span>
          <button class="btn btn-sm btn-primary" @click="showPricingModal">
            Renew Early
          </button>
        </div>
      </div>

      <!-- Dashboard Header -->
      <div class="dashboard-section">
        <div class="dashboard-header">
          <h1 class="section-title">
            <iconify-icon icon="mdi:speedometer" />
            Dashboard
          </h1>
          <div class="license-badge">
            {{ planName }} Plan • 
            {{ accounts.length }}/{{ accountLimit }} Accounts •
            {{ daysUntilExpiry }} days remaining
          </div>
        </div>
        
        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ accounts.length }}</div>
            <div class="stat-label">Connected Accounts</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ platformCount }}</div>
            <div class="stat-label">Platforms</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ teamMembers.length }}</div>
            <div class="stat-label">Team Members</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ securityLogs.length }}</div>
            <div class="stat-label">Security Events</div>
          </div>
        </div>
      </div>
      
      <!-- Main Content Grid -->
      <div class="dashboard-section">
        <div class="dashboard-grid">
          <!-- Recent Accounts -->
          <div class="dashboard-column main-column">
            <h2 class="section-title">
              <iconify-icon icon="mdi:account-multiple" />
              Recent Accounts
            </h2>
            
            <div class="card">
              <div class="card-header">
                <span>Active Accounts</span>
                <span class="badge bg-primary">{{ accounts.length }}</span>
              </div>
              <div class="card-body">
                <div v-if="accounts.length === 0" class="empty-state">
                  <iconify-icon icon="mdi:account-multiple-outline" />
                  <p>No accounts added yet</p>
                  <router-link to="/accounts" class="btn btn-primary">
                    Add Your First Account
                  </router-link>
                </div>
                <div v-else>
                  <div class="accounts-list">
                    <AccountCard 
                      v-for="account in recentAccounts" 
                      :key="account.id"
                      :account="account"
                    />
                  </div>
                  <div class="text-center mt-3">
                    <router-link to="/accounts" class="btn btn-outline-primary">
                      View All Accounts
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Sidebar -->
          <div class="dashboard-column sidebar-column">
            <!-- Quick Actions -->
            <h2 class="section-title">
              <iconify-icon icon="mdi:lightning-bolt" />
              Quick Actions
            </h2>
            
            <div class="card">
              <div class="card-body">
                <QuickActions 
  @add-account="addAccount"
  @bulk-import="bulkImport"
  @export-data="exportData"
  @settings="goToSettings"
/>
              </div>
            </div>
            
            <!-- License Information -->
            <div class="card mt-4">
              <div class="card-header">
                <span>License Information</span>
              </div>
              <div class="card-body">
                <div class="license-info">
                  <div class="license-item">
                    <span class="license-label">Plan:</span>
                    <span class="license-value">{{ planName }}</span>
                  </div>
                  <div class="license-item">
                    <span class="license-label">Price:</span>
                    <span class="license-value">${{ planPrice }}/month</span>
                  </div>
                  <div class="license-item">
                    <span class="license-label">Expires:</span>
                    <span class="license-value" :class="{ 'text-warning': licenseStatus !== 'active' }">
                      {{ daysUntilExpiry }} days
                    </span>
                  </div>
                  <div class="license-item">
                    <span class="license-label">Status:</span>
                    <span class="license-value">
                      <span class="badge" :class="statusBadgeClass">
                        {{ formattedStatus }}
                      </span>
                    </span>
                  </div>
                </div>
                <button class="btn btn-primary w-100 mt-3" @click="showPricingModal">
                  <iconify-icon icon="mdi:autorenew" />
                  Manage Subscription
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Bottom Sections -->
      <div class="dashboard-section">
        <div class="dashboard-grid">
          <!-- Team Members -->
          <div class="dashboard-column">
            <h2 class="section-title">
              <iconify-icon icon="mdi:account-group" />
              Team Members
            </h2>
            <div class="card">
              <div class="card-header">
                <span>Active Team</span>
                <span class="badge bg-primary">{{ teamMembers.length }}/{{ teamLimit }}</span>
              </div>
              <div class="card-body">
                <div v-if="teamMembers.length === 0" class="empty-state">
                  <iconify-icon icon="mdi:account-group-outline" />
                  <p>No team members yet</p>
                  <button class="btn btn-primary" @click="inviteUser">
                    Invite Team Members
                  </button>
                </div>
                <div v-else>
                  <div class="user-list">
                    <div v-for="user in recentTeamMembers" :key="user.id" class="user-item">
                      <div class="user-avatar-sm">
                        {{ user.initials }}
                      </div>
                      <div class="user-details">
                        <div class="user-name">{{ user.name }}</div>
                        <div class="user-role">{{ user.role }}</div>
                      </div>
                      <div class="user-status" :class="user.status"></div>
                    </div>
                  </div>
                  <div class="text-center mt-3">
                    <button class="btn btn-outline-primary" @click="manageTeam">
                      Manage Team
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Recent Activity -->
          <div class="dashboard-column">
            <h2 class="section-title">
              <iconify-icon icon="mdi:clock-outline" />
              Recent Activity
            </h2>
            <div class="card">
              <div class="card-header">
                <span>Security Events</span>
              </div>
              <div class="card-body">
                <div class="security-events">
                  <div v-for="log in recentSecurityLogs" :key="log.id" class="security-event">
                    <div class="event-icon">
                      <iconify-icon :icon="log.icon" />
                    </div>
                    <div class="event-details">
                      <div class="event-action">{{ log.action }}</div>
                      <div class="event-meta">{{ log.user }} • {{ log.time }}</div>
                    </div>
                    <div class="event-status" :class="log.status.toLowerCase()">
                      <iconify-icon :icon="log.status === 'Success' ? 'mdi:check' : 'mdi:close'" />
                    </div>
                  </div>
                </div>
                <div class="text-center mt-3">
                  <button class="btn btn-outline-primary" @click="viewAllLogs">
                    View All Logs
                  </button>
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
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import QuickActions from '@/components/QuickActions.vue'
import AccountCard from '@/components/AccountCard.vue'

const authStore = useAuthStore()
const router = useRouter()

// Mock data - replace with real data from your stores
const accounts = ref([])
const teamMembers = ref([])
const securityLogs = ref([])

// Computed properties
const recentAccounts = computed(() => accounts.value.slice(0, 5))
const recentTeamMembers = computed(() => teamMembers.value.slice(0, 4))
const recentSecurityLogs = computed(() => securityLogs.value.slice(0, 5))
const platformCount = computed(() => new Set(accounts.value.map((a: any) => a.platform)).size)

// License info from auth store
const accountLimit = computed(() => authStore.getAccountLimit?.() || 10)
const teamLimit = computed(() => authStore.getTeamLimit?.() || 5)
const daysUntilExpiry = computed(() => authStore.getDaysUntilExpiry?.() || 30)
const licenseStatus = computed(() => authStore.getLicenseStatus?.() || 'active')
const planName = computed(() => authStore.getPlanName?.(authStore.licenseData?.plan) || 'Professional')
const planPrice = computed(() => authStore.getPlanPrice?.(authStore.licenseData?.plan) || 15.99)

const formattedStatus = computed(() => 
  licenseStatus.value.charAt(0).toUpperCase() + licenseStatus.value.slice(1)
)

const statusBadgeClass = computed(() => {
  switch (licenseStatus.value) {
    case 'active': return 'bg-success'
    case 'warning': return 'bg-warning'
    case 'expiring': return 'bg-danger'
    default: return 'bg-secondary'
  }
})

// Methods
const showPricingModal = () => {
  alert('Pricing modal would open here')
}

const inviteUser = () => {
  router.push('/users')
}

const manageTeam = () => {
  router.push('/users')
}

const viewAllLogs = () => {
  router.push('/security-logs')
}

const logout = () => {
  authStore.logout()
  router.push('/')
}

// Load data on mount
onMounted(() => {
  // Load mock data - replace with actual API calls
  accounts.value = [
    { id: 1, name: 'Google Account', platform: 'google', type: 'TOTP', lastUsed: new Date() },
    { id: 2, name: 'GitHub', platform: 'github', type: 'TOTP', lastUsed: new Date() },
    { id: 3, name: 'Twitter', platform: 'twitter', type: 'TOTP', lastUsed: new Date() }
  ]
  
  teamMembers.value = [
    { id: 1, name: 'John Doe', role: 'Admin', initials: 'JD', status: 'online' },
    { id: 2, name: 'Jane Smith', role: 'User', initials: 'JS', status: 'offline' }
  ]
  
  securityLogs.value = [
    { id: 1, action: 'Account added', user: 'John Doe', time: '2 hours ago', status: 'Success', icon: 'mdi:account-plus' },
    { id: 2, action: 'Login attempt', user: 'Jane Smith', time: '5 hours ago', status: 'Success', icon: 'mdi:login' },
    { id: 3, action: 'Token generated', user: 'System', time: '1 day ago', status: 'Success', icon: 'mdi:key' }
  ]
})
</script>

<style scoped>
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
  margin-bottom: 1rem;
}

.license-badge {
  background: rgba(59, 130, 246, 0.1);
  color: var(--accent-primary);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  text-align: center;
  transition: var(--transition-normal);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--accent-primary);
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.dashboard-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Cards */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.card-header {
  background: rgba(255, 255, 255, 0.03);
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: var(--text-primary);
}

.card-body {
  padding: 1.5rem;
}

/* Alerts */
.alert {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: var(--radius-md);
  padding: 1rem 1.5rem;
  color: var(--warning);
}

.alert.alert-info {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: var(--accent-primary);
}

.alert-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

/* Empty States */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
}

.empty-state iconify-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

/* User List */
.user-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
}

.user-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.user-avatar-sm {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary), var(--primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  font-size: 0.875rem;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
}

.user-role {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.user-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.user-status.online {
  background: var(--success);
}

.user-status.offline {
  background: var(--text-muted);
}

/* Security Events */
.security-events {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.security-event {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  transition: var(--transition-fast);
}

.security-event:hover {
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
}

.event-icon {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  background: rgba(59, 130, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
}

.event-details {
  flex: 1;
}

.event-action {
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.event-meta {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.event-status {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
}

.event-status.success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.event-status.failed {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}

/* License Info */
.license-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.license-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.license-item:last-child {
  border-bottom: none;
}

.license-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.license-value {
  color: var(--text-primary);
  font-weight: 600;
}

/* Badges */
.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.bg-primary {
  background: var(--accent-primary) !important;
}

.bg-success {
  background: var(--success) !important;
}

.bg-warning {
  background: var(--warning) !important;
}

.bg-danger {
  background: var(--danger) !important;
}

/* Buttons */
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

.btn-primary {
  background: var(--accent-primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
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

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn-warning {
  background: var(--warning);
  color: white;
}

.w-100 {
  width: 100%;
}

.text-center {
  text-align: center;
}

.mt-3 {
  margin-top: 1rem;
}

.mt-4 {
  margin-top: 1.5rem;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.ml-4 {
  margin-left: 1.5rem;
}

.text-warning {
  color: var(--warning) !important;
}

/* Responsive */
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .app-container {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .alert-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>