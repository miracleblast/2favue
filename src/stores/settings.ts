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
}

export const useSettingsStore = defineStore('settings', () => {
  const license = ref<LicenseInfo>({
    plan: 'Professional',
    price: 29,
    status: 'active',
    daysUntilExpiry: 45,
    accountLimit: 50,
    teamLimit: 10,
    features: {
      apiAccess: true,
      prioritySupport: true,
      advancedSecurity: true,
      customBranding: false
    }
  })

  const accountSettings = ref<AccountSettings>({
    name: 'John Doe',
    email: 'john@agency.com',
    company: 'Digital Marketing Agency',
    timezone: 'UTC-5'
  })

  const loadSettings = async () => {
    // Simulate API call with real delay
    await new Promise(resolve => setTimeout(resolve, 600))
    return {
      license: license.value,
      accountSettings: accountSettings.value
    }
  }

  const updateAccountSettings = async (newSettings: AccountSettings) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    accountSettings.value = newSettings
    return accountSettings.value
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
    loadSettings,
    updateAccountSettings,
    updateLicense,
    checkLicenseStatus
  }
})
