<template>
  <div class="app-wrapper">
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
          <!-- Left Column - License & Profile -->
          <div class="settings-column">
            <!-- License Information - ENHANCED DESIGN -->
            <div class="card license-card premium-card">
              <div class="card-header">
                <iconify-icon icon="mdi:license" />
                <span>License Information</span>
                <span v-if="licenseStatus !== 'active'" class="badge badge-warning">
                  {{ licenseStatus }}
                </span>
              </div>
              <div class="card-body">
                <div class="license-details">
                  <!-- Premium Header -->
                  <div class="license-premium-header">
                    <div class="plan-badge" :class="licensePlanName.toLowerCase()">
                      {{ licensePlanName }}
                    </div>
                    <div class="currency-selector">
                      <label>Display Currency:</label>
                      <select v-model="selectedCurrency" @change="updateCurrency" class="currency-dropdown">
                        <option v-for="currency in currencies" :key="currency.code" :value="currency.code">
                          {{ currency.code }} - {{ currency.name }}
                        </option>
                      </select>
                    </div>
                  </div>
                  
                  <div class="license-header">
                    <div class="license-plan">
                      <h4>{{ licensePlanName }} Plan</h4>
                      <div class="price">
                        {{ formattedLicensePrice }}<span>/month</span>
                      </div>
                      <p class="plan-description">{{ getPlanDescription(licenseData?.plan) }}</p>
                    </div>
                    <div class="license-key-display">
                      <label>Your License Key:</label>
                      <div class="license-key-group">
                        <code class="license-key">{{ licenseKey }}</code>
                        <button 
                          class="btn-icon small copy-btn" 
                          @click="copyLicenseKey"
                          title="Copy license key"
                        >
                          <iconify-icon icon="mdi:content-copy" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Features Grid -->
                  <div class="license-features-grid">
                    <div 
                      v-for="feature in licenseFeatures" 
                      :key="feature.name"
                      class="feature-card"
                      :class="{ 'feature-premium': feature.enabled, 'feature-basic': !feature.enabled }"
                    >
                      <div class="feature-icon">
                        <iconify-icon :icon="feature.enabled ? 'mdi:check-circle' : 'mdi:close-circle'" />
                      </div>
                      <div class="feature-content">
                        <h6>{{ feature.name }}</h6>
                        <span class="feature-desc">{{ getFeatureDescription(feature.name) }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Status Dashboard -->
                  <div class="status-dashboard">
                    <div class="status-card" v-for="stat in statusCards" :key="stat.label">
                      <div class="stat-icon" :class="stat.status">
                        <iconify-icon :icon="stat.icon" />
                      </div>
                      <div class="stat-content">
                        <span class="stat-label">{{ stat.label }}</span>
                        <strong class="stat-value">{{ stat.value }}</strong>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Action Buttons -->
                  <div class="license-actions">
                    <button class="btn btn-primary full-width" @click="manageSubscription">
                      <iconify-icon icon="mdi:autorenew" />
                      <span>Manage Subscription</span>
                    </button>
                    <button class="btn btn-outline-primary full-width" @click="showLicenseModal = true">
                      <iconify-icon icon="mdi:information" />
                      <span>View License Details</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Profile Settings -->
            <div class="card">
              <div class="card-header">
                <iconify-icon icon="mdi:account-cog" />
                <span>Profile Settings</span>
              </div>
              <div class="card-body">
                <form @submit.prevent="saveProfileSettings" class="settings-form">
                  <div class="form-group">
                    <label>Admin Alias</label>
                    <input 
                      v-model="profileSettings.name"
                      type="text" 
                      class="form-control" 
                      placeholder="Enter your preferred alias"
                      required
                    >
                    <small class="help-text">This is the name that will be shown to your team members</small>
                  </div>
                  
                  <div class="form-group">
                    <label>Email Address</label>
                    <input 
                      v-model="profileSettings.email"
                      type="email" 
                      class="form-control" 
                      placeholder="your@email.com"
                      required
                    >
                  </div>
                  
                  <div class="form-group">
                    <label>Company/Agency</label>
                    <input 
                      v-model="profileSettings.company"
                      type="text" 
                      class="form-control" 
                      placeholder="Your company name"
                    >
                  </div>
                  
                  <div class="form-row">
                    <div class="form-group">
                      <label>Timezone</label>
                      <select v-model="profileSettings.timezone" class="form-control">
                        <option v-for="tz in timezones" :key="tz.value" :value="tz.value">
                          {{ tz.label }}
                        </option>
                      </select>
                    </div>
                    
                    <div class="form-group">
                      <label>Language</label>
                      <select v-model="profileSettings.language" class="form-control">
                        <option v-for="lang in languages" :key="lang.value" :value="lang.value">
                          {{ lang.label }}
                        </option>
                      </select>
                    </div>
                  </div>
                  
                  <button type="submit" class="btn btn-primary">
                    <iconify-icon icon="mdi:check" />
                    <span>Save Profile</span>
                  </button>
                </form>
              </div>
            </div>
          </div>

          <!-- Right Column - Security & Notifications -->
          <div class="settings-column">
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
                      <h6>Session Timeout</h6>
                      <p>Automatically log out after period of inactivity</p>
                    </div>
                    <div class="setting-action">
                      <select v-model="securitySettings.sessionTimeout" class="form-control">
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="240">4 hours</option>
                        <option value="0">Never</option>
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
                      <h6>Auto-Lock App</h6>
                      <p>Require password when app resumes from background</p>
                    </div>
                    <div class="setting-action">
                      <label class="toggle-switch">
                        <input 
                          type="checkbox" 
                          v-model="securitySettings.autoLock"
                        >
                        <span class="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                  
                  <div class="setting-item">
                    <div class="setting-info">
                      <h6>Clipboard Auto-Clear</h6>
                      <p>Automatically clear copied tokens after 30 seconds</p>
                    </div>
                    <div class="setting-action">
                      <label class="toggle-switch">
                        <input 
                          type="checkbox" 
                          v-model="securitySettings.clipboardAutoClear"
                        >
                        <span class="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div class="security-actions">
                  <button class="btn btn-outline-primary full-width" @click="showSecurityLogs">
                    <iconify-icon icon="mdi:shield-search" />
                    <span>View Security Logs</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Notification Settings -->
            <div class="card">
              <div class="card-header">
                <iconify-icon icon="mdi:bell" />
                <span>Notifications</span>
              </div>
              <div class="card-body">
                <div class="notification-settings">
                  <div class="setting-item">
                    <div class="setting-info">
                      <h6>Push Notifications</h6>
                      <p>Receive notifications for token updates</p>
                    </div>
                    <div class="setting-action">
                      <label class="toggle-switch">
                        <input 
                          type="checkbox" 
                          v-model="notificationSettings.pushNotifications"
                        >
                        <span class="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                  
                  <div class="setting-item">
                    <div class="setting-info">
                      <h6>Low Token Time</h6>
                      <p>Notify when tokens are about to expire</p>
                    </div>
                    <div class="setting-action">
                      <label class="toggle-switch">
                        <input 
                          type="checkbox" 
                          v-model="notificationSettings.lowTokenTime"
                        >
                        <span class="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                  
                  <div class="setting-item">
                    <div class="setting-info">
                      <h6>Team Activity</h6>
                      <p>Get notified of team member activities</p>
                    </div>
                    <div class="setting-action">
                      <label class="toggle-switch">
                        <input 
                          type="checkbox" 
                          v-model="notificationSettings.teamActivity"
                        >
                        <span class="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                  
                  <div class="setting-item">
                    <div class="setting-info">
                      <h6>License Alerts</h6>
                      <p>Receive license expiration reminders</p>
                    </div>
                    <div class="setting-action">
                      <label class="toggle-switch">
                        <input 
                          type="checkbox" 
                          v-model="notificationSettings.licenseAlerts"
                        >
                        <span class="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
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
                    <p>Download all your accounts and settings as backup</p>
                    <button class="btn btn-outline-warning" @click="exportAllData">
                      <iconify-icon icon="mdi:download" />
                      <span>Export Data</span>
                    </button>
                  </div>
                  
                  <div class="danger-item">
                    <h6>Clear All Data</h6>
                    <p>Remove all accounts and reset to initial state</p>
                    <button class="btn btn-outline-danger" @click="clearAllData">
                      <iconify-icon icon="mdi:eraser" />
                      <span>Clear Data</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- LICENSE DETAILS MODAL -->
    <div v-if="showLicenseModal" class="modal-overlay" @click="showLicenseModal = false">
      <div class="modal-content license-modal" @click.stop>
        <div class="modal-header">
          <h3>License Details</h3>
          <button class="modal-close" @click="showLicenseModal = false">
            <iconify-icon icon="mdi:close" />
          </button>
        </div>
        
        <div class="modal-body">
          <!-- Plan Comparison -->
          <div class="plan-comparison">
            <h4>Available Plans</h4>
            <div class="plans-grid">
              <div 
                v-for="plan in availablePlans" 
                :key="plan.id"
                class="plan-card"
                :class="{ 
                  'current-plan': plan.id === licenseData?.plan,
                  'plan-free': plan.id === 'free',
                  'plan-starter': plan.id === 'starter', 
                  'plan-professional': plan.id === 'professional',
                  'plan-enterprise': plan.id === 'enterprise'
                }"
              >
                <div class="plan-header">
                  <h5>{{ plan.name }}</h5>
                  <div class="plan-price">
                    {{ formatPrice(plan.price, selectedCurrency) }}<span>/month</span>
                  </div>
                  <p class="plan-desc">{{ plan.description }}</p>
                </div>
                
                <div class="plan-features">
                  <div 
                    v-for="feature in plan.features" 
                    :key="feature"
                    class="plan-feature"
                  >
                    <iconify-icon icon="mdi:check" />
                    <span>{{ feature }}</span>
                  </div>
                </div>
                
                <div class="plan-badge" v-if="plan.id === licenseData?.plan">
                  Current Plan
                </div>
              </div>
            </div>
          </div>

          <!-- Current License Details -->
          <div class="current-license-details">
            <h4>Your License Information</h4>
            <div class="details-grid">
              <div class="detail-item">
                <label>License Key:</label>
                <code class="license-key-modal">{{ licenseKey }}</code>
              </div>
              <div class="detail-item">
                <label>Plan:</label>
                <span>{{ licensePlanName }}</span>
              </div>
              <div class="detail-item">
                <label>Status:</label>
                <span :class="licenseStatusClass">{{ formattedLicenseStatus }}</span>
              </div>
              <div class="detail-item">
                <label>Expires in:</label>
                <span>{{ daysUntilExpiry }} days</span>
              </div>
              <div class="detail-item">
                <label>Your Role:</label>
                <span>{{ userRole }}</span>
              </div>
              <div class="detail-item">
                <label>Account Limit:</label>
                <span>{{ licenseManager.getAccountLimit() }} accounts</span>
              </div>
              <div class="detail-item">
                <label>Team Limit:</label>
                <span>{{ licenseManager.getTeamLimit() }} members</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-outline-primary" @click="showLicenseModal = false">
            Close
          </button>
          <button class="btn btn-primary" @click="manageSubscription">
            Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
// @ts-ignore
import { LicenseManager } from '@/engines/LicenseManager'
// @ts-ignore
import { CurrencyService } from '@/engines/CurrencyService'
// @ts-ignore
import { NotificationService } from '@/engines/NotificationService'
import AppHeader from '@/components/AppHeader.vue'

// Stores
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

// Engines
const licenseManager = new LicenseManager()
const currencyService = new CurrencyService()
const notificationService = new NotificationService()

// Modal State
const showLicenseModal = ref(false)

// Currency State
const selectedCurrency = ref('USD')

// Reactive State
const profileSettings = ref({ ...settingsStore.accountSettings })
const securitySettings = ref({
  sessionTimeout: '60',
  loginNotifications: true,
  autoLock: true,
  clipboardAutoClear: true
})

const notificationSettings = ref({
  pushNotifications: true,
  lowTokenTime: true,
  teamActivity: false,
  licenseAlerts: true
})

// Available options
const timezones = ref([
  { value: 'UTC-12', label: 'UTC-12 (International Date Line West)' },
  { value: 'UTC-8', label: 'UTC-8 (Pacific Time)' },
  { value: 'UTC-5', label: 'UTC-5 (Eastern Time)' },
  { value: 'UTC+0', label: 'UTC+0 (GMT)' },
  { value: 'UTC+1', label: 'UTC+1 (Central European Time)' },
  { value: 'UTC+3', label: 'UTC+3 (Moscow Time)' },
  { value: 'UTC+5:30', label: 'UTC+5:30 (India Standard Time)' },
  { value: 'UTC+8', label: 'UTC+8 (China Standard Time)' },
  { value: 'UTC+9', label: 'UTC+9 (Japan Standard Time)' },
  { value: 'UTC+10', label: 'UTC+10 (Australian Eastern Time)' }
])

const languages = ref([
  { value: 'en', label: 'English' },
  { value: 'sw', label: 'Swahili' },
  { value: 'ru', label: 'Russian' },
  { value: 'ar', label: 'Arabic' },
  { value: 'zh', label: 'Chinese' },
  { value: 'pt-BR', label: 'Brazilian Portuguese' },
  { value: 'ko', label: 'Korean' },
  { value: 'hi', label: 'Hindi' },
  { value: 'th', label: 'Thai' },
  { value: 'es', label: 'Español' }
])

const currencies = ref(currencyService.getSupportedCurrencies())

// Computed Properties
const licenseData = computed(() => licenseManager.getLicenseData())
const licenseKey = computed(() => licenseData.value?.key || 'No License')
const licensePlanName = computed(() => licenseManager.getPlanName(licenseData.value?.plan) || 'Free')
const licensePriceUSD = computed(() => licenseManager.getPlanPrice(licenseData.value?.plan) || 0)
const licenseStatus = computed(() => licenseManager.getLicenseStatus())
const daysUntilExpiry = computed(() => licenseManager.getDaysUntilExpiry())
const userRole = computed(() => licenseData.value?.isAdmin ? 'Administrator' : 'User')

// Real currency conversion with selected currency
const formattedLicensePrice = computed(() => {
  const price = licensePriceUSD.value
  return currencyService.formatPrice(price, selectedCurrency.value)
})

const licenseStatusClass = computed(() => ({
  'text-success': licenseStatus.value === 'active',
  'text-warning': licenseStatus.value === 'warning' || licenseStatus.value === 'expiring',
  'text-danger': licenseStatus.value === 'expired'
}))

const formattedLicenseStatus = computed(() => {
  const status = licenseStatus.value
  return status.charAt(0).toUpperCase() + status.slice(1)
})

const licenseFeatures = computed(() => [
  { name: `${licenseManager.getAccountLimit()} Accounts`, enabled: true },
  { name: `${licenseManager.getTeamLimit()} Team Members`, enabled: true },
  { name: 'API Access', enabled: licenseData.value?.features?.apiAccess || false },
  { name: 'Priority Support', enabled: licenseData.value?.features?.prioritySupport || false },
  { name: 'Advanced Security', enabled: licenseData.value?.features?.advancedSecurity || false },
  { name: 'License Generation', enabled: licenseData.value?.features?.canGenerateLicenses || false }
])

// Status Cards for Dashboard
const statusCards = computed(() => [
  {
    label: 'Status',
    value: formattedLicenseStatus.value,
    icon: 'mdi:shield-check',
    status: licenseStatus.value
  },
  {
    label: 'Expires in',
    value: `${daysUntilExpiry.value} days`,
    icon: 'mdi:calendar-clock',
    status: daysUntilExpiry.value > 30 ? 'active' : daysUntilExpiry.value > 7 ? 'warning' : 'danger'
  },
  {
    label: 'Your Role',
    value: userRole.value,
    icon: 'mdi:account-group',
    status: 'active'
  },
  {
    label: 'Billing',
    value: 'Monthly',
    icon: 'mdi:currency-usd',
    status: 'active'
  }
])

// Available Plans for Modal
const availablePlans = computed(() => [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Ideal for personal accounts',
    features: [
      '10 Accounts',
      '1 Team Member',
      'Basic Security',
      'Community Support'
    ]
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 9.99,
    description: 'Perfect for freelancers',
    features: [
      '50 Accounts',
      '3 Team Members',
      'License Generation',
      'Email Support'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 25.99,
    description: 'Ideal for agencies',
    features: [
      '1000 Accounts',
      '50 Team Members',
      'API Access',
      'Advanced Security',
      'License Generation'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49.99,
    description: 'For large teams',
    features: [
      '9999 Accounts',
      '100 Team Members',
      'Full API Access',
      'Advanced Security',
      'Priority Support',
      'License Generation'
    ]
  }
])

// Methods
const getPlanDescription = (plan: string) => {
  const plans: { [key: string]: string } = {
    free: 'Ideal for personal accounts',
    starter: 'Perfect for freelancers',
    professional: 'Ideal for agencies',
    enterprise: 'For large teams'
  }
  return plans[plan] || 'Professional authentication solution'
}

const getFeatureDescription = (featureName: string) => {
  const descriptions: { [key: string]: string } = {
    'Accounts': 'Maximum number of 2FA accounts',
    'Team Members': 'Users who can access this license',
    'API Access': 'Programmatic access to AuthFlow',
    'Priority Support': '24/7 dedicated support',
    'Advanced Security': 'Enhanced security features',
    'License Generation': 'Create sub-licenses for clients'
  }
  
  const baseName = featureName.replace(/^\d+\s/, '').replace(/s$/, '')
  return descriptions[baseName] || 'Premium feature'
}

const updateCurrency = async () => {
  // Save currency preference
  localStorage.setItem('authflow-preferred-currency', selectedCurrency.value)
  console.log('Currency updated to:', selectedCurrency.value)
}

const formatPrice = (price: number, currency: string) => {
  return currencyService.formatPrice(price, currency)
}

const saveProfileSettings = async () => {
  try {
    await settingsStore.updateAccountSettings(profileSettings.value)
    
    if (notificationSettings.value.pushNotifications) {
      await notificationService.requestPermission()
    }
    
    alert('Profile settings saved successfully!')
  } catch (error) {
    console.error('Failed to save settings:', error)
    alert('Failed to save settings. Please try again.')
  }
}

const saveSecuritySettings = async () => {
  try {
    localStorage.setItem('authflow-security-settings', JSON.stringify(securitySettings.value))
    alert('Security settings saved successfully!')
  } catch (error) {
    console.error('Failed to save security settings:', error)
    alert('Failed to save security settings. Please try again.')
  }
}

const saveNotificationSettings = async () => {
  try {
    localStorage.setItem('authflow-notification-settings', JSON.stringify(notificationSettings.value))
    
    if (notificationSettings.value.pushNotifications) {
      await notificationService.requestPermission()
    }
    
    alert('Notification settings saved successfully!')
  } catch (error) {
    console.error('Failed to save notification settings:', error)
    alert('Failed to save notification settings. Please try again.')
  }
}

const copyLicenseKey = async () => {
  try {
    await navigator.clipboard.writeText(licenseKey.value)
    alert('License key copied to clipboard!')
  } catch (error) {
    console.error('Failed to copy license key:', error)
  }
}

const manageSubscription = () => {
  window.open('https://harambe.o/pricing/authflowpro', '_blank')
}

const showSecurityLogs = () => {
  window.location.hash = '#/security-logs'
}

const exportAllData = () => {
  const data = {
    profileSettings: profileSettings.value,
    securitySettings: securitySettings.value,
    notificationSettings: notificationSettings.value,
    license: licenseData.value,
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

const clearAllData = () => {
  if (confirm('Are you sure you want to clear all data? This will remove all accounts and reset the app to its initial state. This action cannot be undone.')) {
    if (confirm('Type "CLEAR ALL" to confirm data deletion:')) {
      const licenseKey = localStorage.getItem('authflow-license')
      localStorage.clear()
      if (licenseKey) {
        localStorage.setItem('authflow-license', licenseKey)
      }
      alert('All data cleared successfully! The app will reload.')
      window.location.reload()
    }
  }
}

// Lifecycle
onMounted(async () => {
  // Initialize license manager
  licenseManager.checkLicenseStatus()
  
  // Load settings from store
  await settingsStore.loadSettings()
  
  // Initialize profile settings from store
  profileSettings.value = { ...settingsStore.accountSettings }
  
  // Load security and notification settings from localStorage
  const savedSecurity = localStorage.getItem('authflow-security-settings')
  const savedNotifications = localStorage.getItem('authflow-notification-settings')
  
  if (savedSecurity) {
    securitySettings.value = { ...securitySettings.value, ...JSON.parse(savedSecurity) }
  }
  if (savedNotifications) {
    notificationSettings.value = { ...notificationSettings.value, ...JSON.parse(savedNotifications) }
  }
  
  // Load saved currency preference
  const savedCurrency = localStorage.getItem('authflow-preferred-currency')
  if (savedCurrency) {
    selectedCurrency.value = savedCurrency
  }
  
  // Initialize currency service
  currencyService.loadFromStorage()
  currencies.value = currencyService.getSupportedCurrencies()
  
  // Initialize notification service
  await notificationService.init()
  
  // Request notification permission if enabled
  if (notificationSettings.value.pushNotifications) {
    await notificationService.requestPermission()
  }
})
</script>

<style scoped>
/* ENHANCED LICENSE CARD STYLES */
.license-card.premium-card {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
  border: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(59, 130, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.license-premium-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.plan-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.plan-badge.free {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  color: white;
}

.plan-badge.starter {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.plan-badge.professional {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
}

.plan-badge.enterprise {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.currency-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.currency-selector label {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 500;
}

.currency-dropdown {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-md);
  padding: 0.5rem;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.license-header {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.license-plan h4 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent-primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.price {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--accent-primary);
  margin-bottom: 0.5rem;
}

.price span {
  font-size: 1rem;
  color: var(--text-muted);
  font-weight: 500;
}

.plan-description {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0;
}

.license-key-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.license-key {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--accent-primary);
  flex: 1;
}

.copy-btn {
  background: rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.3);
  color: var(--accent-primary);
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
}

.copy-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  transform: scale(1.05);
}

/* FEATURES GRID */
.license-features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.feature-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
}

.feature-premium {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.feature-basic {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  opacity: 0.6;
}

.feature-icon {
  font-size: 1.5rem;
}

.feature-premium .feature-icon {
  color: var(--success);
}

.feature-basic .feature-icon {
  color: var(--danger);
}

.feature-content h6 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.feature-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
  display: block;
}

/* STATUS DASHBOARD */
.status-dashboard {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.status-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.stat-icon.active {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success);
}

.stat-icon.warning {
  background: rgba(245, 158, 11, 0.2);
  color: var(--warning);
}

.stat-icon.danger {
  background: rgba(239, 68, 68, 0.2);
  color: var(--danger);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

/* LICENSE MODAL STYLES */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.license-modal {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.modal-body {
  padding: 2rem;
}

.plan-comparison {
  margin-bottom: 2rem;
}

.plan-comparison h4 {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.plan-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  position: relative;
  transition: var(--transition-fast);
}

.plan-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.2);
}

.current-plan {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.plan-free {
  border-left: 4px solid #64748b;
}

.plan-starter {
  border-left: 4px solid #10b981;
}

.plan-professional {
  border-left: 4px solid #3b82f6;
}

.plan-enterprise {
  border-left: 4px solid #8b5cf6;
}

.plan-header h5 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.plan-price {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.plan-price span {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 500;
}

.plan-desc {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.plan-features {
  margin-bottom: 1rem;
}

.plan-feature {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.plan-feature iconify-icon {
  color: var(--success);
  font-size: 1rem;
}

.plan-badge {
  position: absolute;
  top: -10px;
  right: 1rem;
  background: var(--accent-primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
}

.current-license-details {
  margin-top: 2rem;
}

.current-license-details h4 {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
}

.detail-item label {
  font-weight: 600;
  color: var(--text-muted);
}

.license-key-modal {
  font-family: var(--font-mono);
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  color: var(--accent-primary);
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--border-color);
}

/* RESPONSIVE DESIGN */
@media (max-width: 1024px) {
  .license-header {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .license-features-grid {
    grid-template-columns: 1fr;
  }
  
  .status-dashboard {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .plans-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .license-premium-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .status-dashboard {
    grid-template-columns: 1fr;
  }
  
  .plans-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
  
  .modal-header {
    padding: 1.5rem;
  }
  
  .modal-footer {
    padding: 1.5rem;
    flex-direction: column;
  }
}

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