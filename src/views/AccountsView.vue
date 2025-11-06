<template>
  <div class="app-wrapper">
    <AppHeader />
    
    <main class="app-container">
      <div class="dashboard-section">
        <!-- Header with Stats -->
        <div class="dashboard-header">
          <h1 class="section-title">
            <iconify-icon icon="mdi:account-badge" />
            Account Management
          </h1>
          <div class="header-actions">
            <span class="account-count">{{ accounts.length }}/{{ accountLimit }} Accounts</span>
            <button 
              class="btn btn-primary" 
              @click="openAddAccountModal"
              :disabled="!canAddMore"
            >
              <iconify-icon icon="mdi:plus-circle" />
              <span>Add Account</span>
            </button>
          </div>
        </div>

        <!-- Account Limit Warning -->
        <div v-if="!canAddMore" class="alert alert-warning">
          <iconify-icon icon="mdi:alert-circle" />
          <span>
            You've reached your account limit ({{ accountLimit }}). 
            <a href="#" @click.prevent="showPricingModal" class="alert-link">Upgrade your plan</a> to add more accounts.
          </span>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <button class="action-btn" @click="openAddAccountModal" :disabled="!canAddMore">
            <iconify-icon icon="mdi:plus-circle" />
            <span>Add Account</span>
          </button>
          <button class="action-btn" @click="openBulkImportModal" :disabled="!canAddMore">
            <iconify-icon icon="mdi:import" />
            <span>Bulk Import</span>
          </button>
          <button class="action-btn" @click="exportAllAccounts">
            <iconify-icon icon="mdi:export" />
            <span>Export Data</span>
          </button>
          <button class="action-btn" @click="goToSettings">
            <iconify-icon icon="mdi:cog" />
            <span>Settings</span>
          </button>
        </div>

        <!-- Filters & Search -->
        <div class="filters-section">
          <div class="search-box">
            <iconify-icon icon="mdi:magnify" />
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search accounts..." 
              class="search-input"
            />
          </div>
          
          <div class="filter-controls">
            <select v-model="selectedGroup" class="filter-select">
              <option value="all">All Groups</option>
              <option v-for="group in availableGroups" :key="group" :value="group">
                {{ group }}
              </option>
            </select>
            
            <select v-model="selectedPlatform" class="filter-select">
              <option value="all">All Platforms</option>
              <option v-for="platform in availablePlatforms" :key="platform" :value="platform">
                {{ platform }}
              </option>
            </select>
          </div>
        </div>

        <!-- Accounts Grid -->
        <div class="card">
          <div class="card-header">
            <span>All Connected Accounts</span>
            <span class="badge bg-primary">{{ filteredAccounts.length }}</span>
          </div>
          <div class="card-body">
            <!-- Empty State -->
            <div v-if="filteredAccounts.length === 0" class="empty-state">
              <iconify-icon icon="mdi:account-badge-outline" />
              <h3>No Accounts Found</h3>
              <p v-if="accounts.length === 0">Add your first 2FA account to get started</p>
              <p v-else>No accounts match your search criteria</p>
              <button class="btn btn-primary" @click="openAddAccountModal">
                <iconify-icon icon="mdi:plus-circle" />
                Add Your First Account
              </button>
            </div>

            <!-- Accounts Grid -->
            <div v-else class="accounts-grid">
              <div 
                v-for="account in filteredAccounts" 
                :key="account.id"
                class="account-card"
              >
                <div class="account-header">
                  <div class="account-icon">
                    <iconify-icon :icon="getPlatformIcon(account.platform)" />
                  </div>
                  <div class="account-info">
                    <h4 class="account-name">{{ account.name }}</h4>
                    <p class="account-username">{{ account.username || account.platform }}</p>
                  </div>
                  <div class="account-actions">
                    <button class="btn-icon" @click="copyToken(account.id)">
                      <iconify-icon icon="mdi:content-copy" />
                    </button>
                    <button class="btn-icon btn-danger" @click="removeAccount(account.id)">
                      <iconify-icon icon="mdi:trash-can" />
                    </button>
                  </div>
                </div>
                
                <div class="token-section">
                  <div class="token-display">
                    <span class="token">{{ getCurrentToken(account.id) }}</span>
                    <div class="token-timer">
                      <div class="timer-bar" :style="{ width: (getTimeLeft(account.id) / 30) * 100 + '%' }"></div>
                    </div>
                  </div>
                  <div class="token-meta">
                    <span class="token-time">{{ getTimeLeft(account.id) }}s</span>
                    <span class="account-group">{{ account.group }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Add Account Modal -->
    <div v-if="showAddModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add New Account</h3>
          <button class="close-btn" @click="closeAddModal">
            <iconify-icon icon="mdi:close" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="submitNewAccount">
            <div class="form-group">
              <label>Account Name</label>
              <input 
                v-model="newAccount.name"
                type="text" 
                placeholder="e.g., Google Account" 
                required
                class="form-control"
              />
            </div>
            
            <div class="form-group">
              <label>Username/Email</label>
              <input 
                v-model="newAccount.username"
                type="text" 
                placeholder="user@example.com" 
                class="form-control"
              />
            </div>
            
            <div class="form-group">
              <label>Platform</label>
              <select v-model="newAccount.platform" class="form-control" required>
                <option value="">Select Platform</option>
                <option value="google">Google</option>
                <option value="github">GitHub</option>
                <option value="microsoft">Microsoft</option>
                <option value="facebook">Facebook</option>
                <option value="twitter">Twitter</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>TOTP Secret Key</label>
              <input 
                v-model="newAccount.secret"
                type="text" 
                placeholder="JBSWY3DPEHPK3PXP" 
                required
                class="form-control"
              />
              <small class="help-text">Enter the Base32 secret from your 2FA app</small>
            </div>
            
            <div class="form-group">
              <label>Group</label>
              <input 
                v-model="newAccount.group"
                type="text" 
                placeholder="e.g., Work, Personal" 
                class="form-control"
              />
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeAddModal">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="addingAccount">
                <iconify-icon v-if="addingAccount" icon="mdi:loading" class="animate-spin" />
                <span>{{ addingAccount ? 'Adding...' : 'Add Account' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Bulk Import Modal -->
    <BulkImportModal 
      :show="showBulkImportModal"
      @close="closeBulkImportModal"
      @import="handleBulkImport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTOTP } from '@/composables/useTOTP'
// @ts-ignore
import { BulkImportManager } from '@/engines/BulkImportManager'
// @ts-ignore
import { FilterManager } from '@/engines/FilterManager'
import AppHeader from '@/components/AppHeader.vue'
import BulkImportModal from '@/components/BulkImportModal.vue'

const router = useRouter()
const authStore = useAuthStore()

// Backend Engines
const { 
  accounts, 
  addAccount: addTOTPAccount, 
  removeAccount: removeTOTPAccount,
  generateTOTP,
  setupTokenUpdates 
} = useTOTP()

const bulkImportManager = new BulkImportManager()
const filterManager = new FilterManager()

// Reactive State
const searchQuery = ref('')
const selectedGroup = ref('all')
const selectedPlatform = ref('all')
const showAddModal = ref(false)
const showBulkImportModal = ref(false)
const addingAccount = ref(false)

const newAccount = ref({
  name: '',
  username: '',
  platform: '',
  secret: '',
  group: 'default',
  type: 'TOTP'
})

// Token tracking for real-time updates
const accountTokens = ref<Record<string, { token: string; timeLeft: number }>>({})

// Computed Properties
const accountLimit = computed(() => authStore.getAccountLimit?.() || 10)
const canAddMore = computed(() => accounts.value.length < accountLimit.value)

const availableGroups = computed(() => {
  const groups = new Set(accounts.value.map(acc => acc.group).filter(Boolean))
  return Array.from(groups).sort()
})

const availablePlatforms = computed(() => {
  const platforms = new Set(accounts.value.map(acc => acc.platform).filter(Boolean))
  return Array.from(platforms).sort()
})

const filteredAccounts = computed(() => {
  return filterManager.applyFilters(accounts.value, {
    search: searchQuery.value,
    group: selectedGroup.value,
    platform: selectedPlatform.value,
    type: 'all'
  })
})

// Methods
const openAddAccountModal = () => {
  if (!canAddMore.value) {
    showPricingModal()
    return
  }
  showAddModal.value = true
}

const closeAddModal = () => {
  showAddModal.value = false
  resetNewAccountForm()
}

const resetNewAccountForm = () => {
  newAccount.value = {
    name: '',
    username: '',
    platform: '',
    secret: '',
    group: 'default',
    type: 'TOTP'
  }
}

const submitNewAccount = async () => {
  if (addingAccount.value) return
  
  addingAccount.value = true
  try {
    // Generate unique ID for the account
    const accountId = 'acc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    
    // Call backend TOTP engine
    await addTOTPAccount(
      accountId,
      newAccount.value.name,
      newAccount.value.secret,
      newAccount.value.platform,
      newAccount.value.type,
      newAccount.value.group
    )
    
    closeAddModal()
    alert('Account added successfully!')
  } catch (error) {
    console.error('Failed to add account:', error)
    alert('Failed to add account. Please check the secret key and try again.')
  } finally {
    addingAccount.value = false
  }
}

const removeAccount = async (accountId: string) => {
  if (confirm('Are you sure you want to remove this account?')) {
    await removeTOTPAccount(accountId)
    alert('Account removed successfully!')
  }
}

const copyToken = async (accountId: string) => {
  const account = accounts.value.find(acc => acc.id === accountId)
  if (account) {
    try {
      const token = generateTOTP(account.secret)
      await navigator.clipboard.writeText(token)
      alert('Token copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy token:', error)
      alert('Failed to copy token. Please try again.')
    }
  }
}

// Bulk Import Methods
const openBulkImportModal = () => {
  if (!canAddMore.value) {
    showPricingModal()
    return
  }
  showBulkImportModal.value = true
}

const closeBulkImportModal = () => {
  showBulkImportModal.value = false
}

const handleBulkImport = async (importedAccounts: any[]) => {
  try {
    let importedCount = 0
    
    for (const accountData of importedAccounts) {
      if (accounts.value.length >= accountLimit.value) {
        alert(`Reached account limit. Only ${importedCount} accounts were imported.`)
        break
      }
      
      // Generate unique ID for each imported account
      const accountId = 'imp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      
      await addTOTPAccount(
        accountId,
        accountData.name,
        accountData.secret,
        accountData.platform || 'custom',
        accountData.type || 'TOTP',
        accountData.group || 'default'
      )
      
      importedCount++
    }
    
    alert(`Successfully imported ${importedCount} accounts!`)
    
  } catch (error) {
    console.error('Bulk import failed:', error)
    alert('Some accounts failed to import. Please check the console for details.')
  } finally {
    closeBulkImportModal()
  }
}

const exportAllAccounts = () => {
  const exportData = accounts.value.map(acc => ({
    name: acc.name,
    platform: acc.platform,
    secret: acc.secret,
    username: acc.username,
    group: acc.group,
    type: acc.type
  }))
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'authflow-accounts-backup.json'
  a.click()
  URL.revokeObjectURL(url)
}

const showPricingModal = () => {
  alert('Pricing modal would open here')
}

const goToSettings = () => {
  router.push('/settings')
}

const getPlatformIcon = (platform: string) => {
  const icons: Record<string, string> = {
    google: 'mdi:google',
    github: 'mdi:github',
    microsoft: 'mdi:microsoft',
    facebook: 'mdi:facebook',
    twitter: 'mdi:twitter',
    custom: 'mdi:account'
  }
  return icons[platform] || 'mdi:account'
}

const getCurrentToken = (accountId: string) => {
  return accountTokens.value[accountId]?.token || '------'
}

const getTimeLeft = (accountId: string) => {
  return accountTokens.value[accountId]?.timeLeft || 30
}

// Real-time token updates
const handleTokenUpdate = (event: CustomEvent) => {
  const { accountId, token, timeLeft } = event.detail
  accountTokens.value[accountId] = { token, timeLeft }
}

// Lifecycle
onMounted(() => {
  setupTokenUpdates()
  window.addEventListener('realTokenUpdate', handleTokenUpdate as EventListener)
})

onUnmounted(() => {
  window.removeEventListener('realTokenUpdate', handleTokenUpdate as EventListener)
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
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.account-count {
  color: var(--text-secondary);
  font-weight: 500;
}

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

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

/* Quick Actions */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition-fast);
}

.action-btn:hover:not(:disabled) {
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.action-btn iconify-icon {
  font-size: 1.5rem;
  color: var(--accent-primary);
}

.alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  border: 1px solid transparent;
}

.alert-warning {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
  color: var(--warning);
}

.alert-link {
  color: inherit;
  text-decoration: underline;
  font-weight: 600;
}

.alert-link:hover {
  opacity: 0.8;
}

/* Filters Section */
.filters-section {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  flex: 1;
  min-width: 250px;
}

.search-input {
  background: transparent;
  border: none;
  color: var(--text-primary);
  width: 100%;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.filter-controls {
  display: flex;
  gap: 0.5rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  outline: none;
  min-width: 150px;
}

/* Card Styles */
.card {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.02);
}

.card-body {
  padding: 1.5rem;
}

/* Accounts Grid */
.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.account-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  transition: var(--transition-fast);
}

.account-card:hover {
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

.account-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.account-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-primary);
  border-radius: var(--radius-md);
  color: white;
}

.account-icon iconify-icon {
  font-size: 1.5rem;
}

.account-info {
  flex: 1;
}

.account-name {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.account-username {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.account-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: transparent;
  border: none;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}

/* Token Section */
.token-section {
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
}

.token-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.token {
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: var(--accent-primary);
}

.token-timer {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.timer-bar {
  height: 100%;
  background: var(--accent-primary);
  transition: width 1s linear;
}

.token-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
}

.empty-state iconify-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.empty-state h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
}

/* Badge */
.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--accent-primary);
  color: white;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-md);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  transition: var(--transition-fast);
}

.form-control:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.12);
}

.help-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

/* Animations */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .filters-section {
    flex-direction: column;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .accounts-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>