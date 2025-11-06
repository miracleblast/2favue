import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface LicenseInfo {
  plan: string
  price: number
  status: 'active' | 'expiring' | 'expired'
  daysUntilExpiry: number
  accountLimit: number
  teamLimit: number
  features: {
    apiAccess: boolean
    prioritySupport: boolean
    advancedSecurity: boolean
    customBranding: boolean
  }
}

export interface AccountSettings {
  name: string
  email: string
  company: string
  timezone: string
  language: string
}

export interface SecuritySettings {
  sessionTimeout: string
  loginNotifications: boolean
  autoLock: boolean
  clipboardAutoClear: boolean
}

export interface NotificationSettings {
  pushNotifications: boolean
  lowTokenTime: boolean
  teamActivity: boolean
  licenseAlerts: boolean
}

export const useSettingsStore = defineStore('settings', () => {
  const license = ref<LicenseInfo>({
    plan: 'Professional',
    price: 25.99,
    status: 'active',
    daysUntilExpiry: 30,
    accountLimit: 1000,
    teamLimit: 50,
    features: {
      apiAccess: true,
      prioritySupport: true,
      advancedSecurity: true,
      customBranding: false
    }
  })

  const accountSettings = ref<AccountSettings>({
    name: 'Oscar Makeba',
    email: 'your@agency.com',
    company: 'Digital Marketing Agency',
    timezone: 'UTC-5',
    language: 'en'
  })

  const securitySettings = ref<SecuritySettings>({
    sessionTimeout: '60',
    loginNotifications: true,
    autoLock: true,
    clipboardAutoClear: true
  })

  const notificationSettings = ref<NotificationSettings>({
    pushNotifications: true,
    lowTokenTime: true,
    teamActivity: false,
    licenseAlerts: true
  })

  const loadSettings = async () => {
    // Simulate API call with real delay
    await new Promise(resolve => setTimeout(resolve, 600))
    
    // Load from localStorage for security and notifications
    const savedSecurity = localStorage.getItem('authflow-security-settings')
    const savedNotifications = localStorage.getItem('authflow-notification-settings')
    
    if (savedSecurity) {
      securitySettings.value = { ...securitySettings.value, ...JSON.parse(savedSecurity) }
    }
    if (savedNotifications) {
      notificationSettings.value = { ...notificationSettings.value, ...JSON.parse(savedNotifications) }
    }
    
    return {
      license: license.value,
      accountSettings: accountSettings.value,
      securitySettings: securitySettings.value,
      notificationSettings: notificationSettings.value
    }
  }

  const updateAccountSettings = async (newSettings: AccountSettings) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    accountSettings.value = newSettings
    return accountSettings.value
  }

  const updateSecuritySettings = async (newSettings: SecuritySettings) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    securitySettings.value = newSettings
    localStorage.setItem('authflow-security-settings', JSON.stringify(securitySettings.value))
    return securitySettings.value
  }

  const updateNotificationSettings = async (newSettings: NotificationSettings) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    notificationSettings.value = newSettings
    localStorage.setItem('authflow-notification-settings', JSON.stringify(notificationSettings.value))
    return notificationSettings.value
  }

  const updateLicense = async (newLicense: Partial<LicenseInfo>) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    license.value = { ...license.value, ...newLicense }
    return license.value
  }

  const checkLicenseStatus = async () => {
    // Simulate license check
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Real license status logic
    if (license.value.daysUntilExpiry <= 0) {
      license.value.status = 'expired'
    } else if (license.value.daysUntilExpiry <= 7) {
      license.value.status = 'expiring'
    } else {
      license.value.status = 'active'
    }
    
    return license.value.status
  }

  return {
    license,
    accountSettings,
    securitySettings,
    notificationSettings,
    loadSettings,
    updateAccountSettings,
    updateSecuritySettings,
    updateNotificationSettings,
    updateLicense,
    checkLicenseStatus
  }
})