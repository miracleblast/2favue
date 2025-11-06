<template>
  <div class="app-wrapper">
    <!-- Header -->
    <AppHeader />
    
    <main class="app-container">
      <div class="dashboard-section">
        <!-- Header -->
        <div class="dashboard-header">
          <h1 class="section-title">
            <iconify-icon icon="mdi:cog" />
            Settings
          </h1>
        </div>

        <!-- Main Content Grid -->
        <div class="grid-2-col">
          <!-- Left Column - Account & Security Settings -->
          <div class="settings-column">
            <!-- Account Settings -->
            <div class="card">
              <div class="card-header">
                <iconify-icon icon="mdi:account-cog" />
                <span>Account Settings</span>
              </div>
              <div class="card-body">
                <form @submit.prevent="saveAccountSettings" class="settings-form">
                  <div class="form-row">
                    <div class="form-group">
                      <label>Full Name</label>
                      <input 
                        v-model="accountSettings.name"
                        type="text" 
                        class="form-control" 
                        required
                      >
                    </div>
                    <div class="form-group">
                      <label>Email Address</label>
                      <input 
                        v-model="accountSettings.email"
                        type="email" 
                        class="form-control" 
                        required
                      >
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Company/Agency</label>
                    <input 
                      v-model="accountSettings.company"
                      type="text" 
                      class="form-control" 
                      required
                    >
                  </div>
                  <div class="form-group">
                    <label>Timezone</label>
                    <select v-model="accountSettings.timezone" class="form-control">
                      <option value="UTC-8">UTC-8 (Pacific Time)</option>
                      <option value="UTC-5">UTC-5 (Eastern Time)</option>
                      <option value="UTC+0">UTC+0 (GMT)</option>
                      <option value="UTC+1">UTC+1 (Central European Time)</option>
                    </select>
                  </div>
                  <button type="submit" class="btn btn-primary">
                    <iconify-icon icon="mdi:check" />
                    <span>Save Changes</span>
                  </button>
                </form>
              </div>
            </div>

            <!-- Security Settings -->
            <div class="card">
              <div class="card-header">
                <iconify-icon icon="mdi:shield-account" />
                <span>Security Settings</span>
              </div>
              <div class="card-body">
                <div class="security-settings">
                  <div class="setting-item">
                    <div class="setting-info">
                      <h6>Two-Factor Authentication</h6>
                      <p>Add an extra layer of security to your account</p>
                    </div>
                    <div class="setting-action">
                      <button class="btn btn-outline-primary" @click="enable2FA">
                        <iconify-icon icon="mdi:shield-lock" />
                        <span>Enable 2FA</span>
                      </button>
                    </div>
                  </div>
                  <div class="setting-item">
                    <div class="setting-info">
                      <h6>Session Timeout</h6>
                      <p>Automatically log out after period of inactivity</p>
                    </div>
                    <div class="setting-action">
                      <select v-model="securitySettings.sessionTimeout" class="form-control">
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="240">4 hours</option>
                      </select>
                    </div>
                  </div>
                  <div class="setting-item">
                    <div class="setting-info">
                      <h6>Login Notifications</h6>
                      <p>Get notified of new login attempts</p>
                    </div>
                    <div class="setting-action">
                      <label class="toggle-switch">
                        <input 
                          type="checkbox" 
                          v-model="securitySettings.loginNotifications"
                        >
                        <span class="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                  <div class="setting-item">
                    <div class="setting-info">
                      <h6>IP Whitelisting</h6>
                      <p>Restrict access to specific IP addresses</p>
                    </div>
                    <div class="setting-action">
                      <label class="toggle-switch">
                        <input 
                          type="checkbox" 
                          v-model="securitySettings.ipWhitelisting"
                        >
                        <span class="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column - License & Danger Zone -->
          <div class="settings-column">
            <!-- License Information -->
            <div class="card">
              <div class="card-header">
                <iconify-icon icon="mdi:license" />
                <span>License Information</span>
                <span v-if="licenseStatus !== 'active'" class="badge badge-warning">
                  {{ licenseStatus }}
                </span>
              </div>
              <div class="card-body">
                <div class="license-details">
                  <div class="license-plan">
                    <h4>{{ licensePlan }}</h4>
                    <div class="price">
                      ${{ licensePrice }}<span>/month</span>
                    </div>
                  </div>
                  <div class="license-features">
                    <div 
                      v-for="feature in licenseFeatures" 
                      :key="feature.name"
                      class="feature-item"
                      :class="{ 'feature-disabled': !feature.enabled }"
                    >
                      <iconify-icon :icon="feature.enabled ? 'mdi:check' : 'mdi:close'" />
                      <span>{{ feature.name }}</span>
                    </div>
                  </div>
                  <div class="license-status">
                    <div class="status-item">
                      <span>Status:</span>
                      <strong :class="licenseStatus === 'active' ? 'text-success' : 'text-warning'">
                        {{ licenseStatus.charAt(0).toUpperCase() + licenseStatus.slice(1) }}
                      </strong>
                    </div>
                    <div class="status-item">
                      <span>Expires in:</span>
                      <strong>{{ daysUntilExpiry }} days</strong>
                    </div>
                    <div class="status-item">
                      <span>Billing Cycle:</span>
                      <strong>Monthly</strong>
                    </div>
                  </div>
                  <button class="btn btn-primary full-width" @click="manageSubscription">
                    <iconify-icon icon="mdi:autorenew" />
                    <span>Manage Subscription</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Danger Zone -->
            <div class="card danger-zone-card">
              <div class="card-header">
                <iconify-icon icon="mdi:alert-circle" />
                <span>Danger Zone</span>
              </div>
              <div class="card-body">
                <div class="danger-zone">
                  <div class="danger-item">
                    <h6>Export All Data</h6>
                    <p>Download all your accounts and settings</p>
                    <button class="btn btn-outline-warning" @click="exportAllData">
                      <iconify-icon icon="mdi:download" />
                      <span>Export Data</span>
                    </button>
                  </div>
                  <div class="danger-item">
                    <h6>Delete Account</h6>
                    <p>Permanently delete your account and all data</p>
                    <button class="btn btn-outline-danger" @click="deleteAccount">
                      <iconify-icon icon="mdi:trash-can" />
                      <span>Delete Account</span>
                    </button>
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
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import AppHeader from '@/components/AppHeader.vue'

// Stores
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

// Reactive State
const accountSettings = ref({
  name: 'John Doe',
  email: 'john@agency.com',
  company: 'Digital Marketing Agency',
  timezone: 'UTC-5'
})

const securitySettings = ref({
  sessionTimeout: '60',
  loginNotifications: true,
  ipWhitelisting: false
})

// Computed Properties
const licensePlan = computed(() => settingsStore.license.plan)
const licensePrice = computed(() => settingsStore.license.price)
const licenseStatus = computed(() => settingsStore.license.status)
const daysUntilExpiry = computed(() => settingsStore.license.daysUntilExpiry)

const licenseFeatures = computed(() => [
  { name: `${settingsStore.license.accountLimit} Accounts`, enabled: true },
  { name: `${settingsStore.license.teamLimit} Team Members`, enabled: true },
  { name: 'API Access', enabled: settingsStore.license.features.apiAccess },
  { name: 'Priority Support', enabled: settingsStore.license.features.prioritySupport },
  { name: 'Advanced Security', enabled: settingsStore.license.features.advancedSecurity },
  { name: 'Custom Branding', enabled: settingsStore.license.features.customBranding }
])

// Methods
const saveAccountSettings = async () => {
  try {
    await settingsStore.updateAccountSettings(accountSettings.value)
    alert('Account settings saved successfully!')
  } catch (error) {
    console.error('Failed to save settings:', error)
    alert('Failed to save settings. Please try again.')
  }
}

const enable2FA = () => {
  alert('2FA setup would open here')
}

const manageSubscription = () => {
  alert('Subscription management modal would open here')
}

const exportAllData = () => {
  const data = {
    accountSettings: accountSettings.value,
    securitySettings: securitySettings.value,
    license: settingsStore.license,
    exportedAt: new Date().toISOString()
  }
  
  const dataStr = JSON.stringify(data, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `authflow-backup-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  alert('All data exported successfully!')
}

const deleteAccount = () => {
  if (confirm('Are you absolutely sure? This will permanently delete your account and all data. This action cannot be undone.')) {
    if (confirm('Type "DELETE" to confirm account deletion:')) {
      alert('Account deletion process would start here')
    }
  }
}

// Lifecycle
onMounted(() => {
  settingsStore.loadSettings()
})
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

/* GRID LAYOUT */
.grid-2-col {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.settings-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* CARDS */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  backdrop-filter: blur(20px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

.danger-zone-card {
  border-color: rgba(239, 68, 68, 0.3) !important;
}

.danger-zone-card .card-header {
  color: var(--danger);
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

.badge-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
  border: 1px solid rgba(245, 158, 11, 0.3);
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);
}

/* FORMS */
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  transition: var(--transition-fast);
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.12);
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

.btn-primary {
  background: var(--accent-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
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

.btn-outline-warning {
  background: transparent;
  border: 1px solid var(--warning);
  color: var(--warning);
}

.btn-outline-warning:hover {
  background: var(--warning);
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

.full-width {
  width: 100%;
}

/* SECURITY SETTINGS */
.security-settings {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-info h6 {
  margin-bottom: 0.25rem;
  color: var(--text-primary);
  font-size: 1rem;
}

.setting-info p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.setting-action {
  margin-left: 1rem;
  min-width: 140px;
}

/* TOGGLE SWITCH */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.2);
  transition: .4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--accent-primary);
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

/* LICENSE DETAILS */
.license-details {
  text-align: center;
}

.license-plan h4 {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-size: 1.25rem;
}

.price {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-primary);
  margin-bottom: 1.5rem;
}

.price span {
  font-size: 1rem;
  color: var(--text-muted);
  font-weight: 500;
}

.license-features {
  margin: 1.5rem 0;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.feature-disabled {
  color: var(--text-muted);
}

.feature-disabled iconify-icon {
  color: var(--danger);
}

.license-status {
  margin: 1.5rem 0;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.875rem;
}

.status-item span {
  color: var(--text-secondary);
}

.status-item strong {
  color: var(--text-primary);
}

.text-success {
  color: var(--success) !important;
}

.text-warning {
  color: var(--warning) !important;
}

/* DANGER ZONE */
.danger-zone {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.danger-item {
  padding: 1rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  background: rgba(239, 68, 68, 0.05);
}

.danger-item h6 {
  color: var(--danger);
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.danger-item p {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .grid-2-col {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .app-container {
    padding: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .setting-action {
    margin-left: 0;
    width: 100%;
  }
  
  .security-settings .btn {
    width: 100%;
    justify-content: center;
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
  
  .price {
    font-size: 1.5rem;
  }
  
  .license-status {
    padding: 0.75rem;
  }
  
  .status-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>