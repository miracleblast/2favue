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