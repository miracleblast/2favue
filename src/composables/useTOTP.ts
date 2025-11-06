import { ref, computed, onUnmounted } from 'vue'
import { RealTOTPEngine } from '@/engines/RealTOTPEngine'

interface Account {
  id: string
  name: string
  secret: string
  issuer: string
  type: string
  group: string
  currentToken?: string
  timeLeft?: number
  tokenValid?: boolean
}

export const useTOTP = () => {
  const totpEngine = new RealTOTPEngine()
  const accounts = ref<Account[]>([])
  const visibleAccounts = ref(new Set<string>())

  const generateTOTP = (secret: string, window: number = 0): string => {
    return totpEngine.generateTOTP(secret, window)
  }

  const addAccount = (accountData: Omit<Account, 'id'> & { id?: string }): Account => {
    const account = totpEngine.addAccount(
      accountData.id || `acc_${Date.now()}`,
      accountData.name, 
      accountData.secret,
      accountData.issuer,
      accountData.type,
      accountData.group
    ) as Account
    accounts.value.push(account)
    return account
  }

  const removeAccount = (accountId: string): void => {
    totpEngine.removeAccount(accountId)
    accounts.value = accounts.value.filter(acc => acc.id !== accountId)
  }

  const getAllAccounts = (): Account[] => {
    return totpEngine.getAllAccounts() as Account[]
  }

  const validateToken = (secret: string, token: string, window: number = 1): boolean => {
    return totpEngine.validateToken(secret, token, window)
  }

  // Real-time token updates
  const setupTokenUpdates = (): void => {
    const handleTokenUpdate = (event: CustomEvent) => {
      const { accountId, token, timeLeft, valid } = event.detail
      // Update Vue reactive system
      const accountIndex = accounts.value.findIndex(acc => acc.id === accountId)
      if (accountIndex !== -1) {
        accounts.value[accountIndex].currentToken = token
        accounts.value[accountIndex].timeLeft = timeLeft
        accounts.value[accountIndex].tokenValid = valid
      }
    }

    window.addEventListener('realTokenUpdate', handleTokenUpdate as EventListener)
    
    onUnmounted(() => {
      window.removeEventListener('realTokenUpdate', handleTokenUpdate as EventListener)
    })
  }

  return {
    accounts: computed(() => accounts.value),
    generateTOTP,
    addAccount,
    removeAccount,
    getAllAccounts,
    validateToken,
    setupTokenUpdates
  }
}
