declare module '@/engines/BulkImportManager' {
  export class BulkImportManager {
    processFile(file: File): Promise<any[]>
    getImportTemplate(format: 'json' | 'csv'): string
    processInBatches(
      accounts: any[], 
      progressCallback?: (processed: number, total: number) => void
    ): Promise<{ success: any[]; failed: Array<{ account: any; error: string }> }>
  }
}

declare module '@/engines/FilterManager' {
  export class FilterManager {
    applyFilters(accounts: any[], filters: any): any[]
    getAvailableGroups(accounts: any[]): string[]
    getAvailablePlatforms(accounts: any[]): string[]
  }
}

declare module '@/engines/RealTOTPEngine' {
  export class RealTOTPEngine {
    addAccount(accountId: string, name: string, secret: string, issuer?: string, type?: string, group?: string): any
    removeAccount(accountId: string): void
    generateTOTP(secret: string): string
    getAllAccounts(): any[]
  }
}

declare module '@/engines/LicenseManager' {
  export class LicenseManager {
    validateLicense(key: string): Promise<boolean>
    checkLicenseStatus(): boolean
    getLicenseData(): any
    generateSubLicense(plan: string, parentLicense: string, userEmail: string, role?: string): any
    getGeneratedLicenses(parentLicense: string): any[]
    isAdmin(): boolean
    getAccountLimit(): number
    getTeamLimit(): number
    getPlanName(plan: string): string
    getPlanPrice(plan: string): number
    getDaysUntilExpiry(): number
    getLicenseStatus(): string
  }
}

declare module '@/engines/EmailService' {
  export class EmailService {
    sendInvitation(invitationData: any): Promise<any>
    configureEmail(provider: string, apiKey: string, config?: any): void
  }
}
declare module '@/stores/securityLogs' {
  export function useSecurityLogsStore(): {
    securityLogs: any[]
    loadSecurityLogs(): void
    addLog(log: any): void
    clearLogs(): void
  }
}

declare module '@/stores/settings' {
  interface LicenseInfo {
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

  interface AccountSettings {
    name: string
    email: string
    company: string
    timezone: string
  }

  export function useSettingsStore(): {
    license: LicenseInfo
    accountSettings: AccountSettings
    loadSettings(): Promise<any>
    updateAccountSettings(settings: AccountSettings): Promise<AccountSettings>
    updateLicense(newLicense: Partial<LicenseInfo>): Promise<LicenseInfo>
    checkLicenseStatus(): Promise<string>
  }
}
declare module '@/stores/auth' {
  export function useAuthStore(): {
    isAuthenticated: boolean
    licenseData: any
    validateLicense(key: string): Promise<boolean>
    logout(): void
    getAccountLimit(): number
    getTeamLimit(): number
    getDaysUntilExpiry(): number
    getLicenseStatus(): string
    getPlanName(plan: string): string
    getPlanPrice(plan: string): number
    checkExistingLicense(): boolean // Add this line
  }
}