import { ref, computed } from 'vue'
import { LicenseManager } from '@/engines/LicenseManager'

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

export const useLicense = () => {
  const licenseManager = new LicenseManager()
  const isAuthenticated = ref(false)
  const licenseData = ref<LicenseData | null>(null)

  const validateLicense = async (key: string): Promise<boolean> => {
    const isValid = await licenseManager.validateLicense(key)
    
    if (isValid) {
      isAuthenticated.value = true
      licenseData.value = licenseManager.getLicenseData() as LicenseData
      return true
    }
    return false
  }

  const checkExistingLicense = (): boolean => {
    const hasLicense = licenseManager.checkLicenseStatus()
    if (hasLicense) {
      isAuthenticated.value = true
      licenseData.value = licenseManager.getLicenseData() as LicenseData
    }
    return hasLicense
  }

  const logout = (): void => {
    isAuthenticated.value = false
    licenseData.value = null
    licenseManager.invalidateLicense()
  }

  const getAccountLimit = (): number => {
    return licenseManager.getAccountLimit()
  }

  const getLicenseStatus = (): string => {
    return licenseManager.getLicenseStatus()
  }

  const getDaysUntilExpiry = (): number => {
    return licenseManager.getDaysUntilExpiry()
  }

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    licenseData: computed(() => licenseData.value),
    validateLicense,
    checkExistingLicense,
    logout,
    getAccountLimit,
    getLicenseStatus,
    getDaysUntilExpiry,
    hasFeature: licenseManager.hasFeature.bind(licenseManager),
    getPlanName: licenseManager.getPlanName.bind(licenseManager),
    getPlanPrice: licenseManager.getPlanPrice.bind(licenseManager)
  }
}
