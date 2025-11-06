import { defineStore } from 'pinia'
import { useLicense } from '@/composables/useLicense'

interface LicenseFeatures {
  accounts: number
  teamMembers: number 
  apiAccess: boolean
  advancedSecurity: boolean
  prioritySupport: boolean
}

interface LicenseData {
  key: string | null
  plan: string | null
  expiry: Date | null
  features: LicenseFeatures
  daysUntilExpiry: number
  status: string
}

export const useAuthStore = defineStore('auth', () => {
  const {
    isAuthenticated,
    licenseData,
    validateLicense,
    checkExistingLicense,
    logout,
    getAccountLimit,
    getLicenseStatus,
    getDaysUntilExpiry,
    hasFeature,
    getPlanName,
    getPlanPrice,
    getTeamLimit // ADD THIS MISSING METHOD
  } = useLicense()

  return {
    // State
    isAuthenticated,
    licenseData: licenseData as unknown as LicenseData | null,
    
    // Actions
    validateLicense,
    checkExistingLicense,
    logout,
    
    // Getters
    getAccountLimit,
    getTeamLimit, // ADD THIS
    getLicenseStatus,
    getDaysUntilExpiry,
    hasFeature,
    getPlanName,
    getPlanPrice
  }
})