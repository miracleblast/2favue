import { ref, onMounted, onUnmounted } from 'vue'
// @ts-ignore
import { RealTOTPEngine } from '@/engines/RealTOTPEngine'

export function useTOTP() {
  const accounts = ref<any[]>([])
  const totpEngine = new RealTOTPEngine()

  const addAccount = async (
    accountId: string, 
    name: string, 
    secret: string, 
    issuer: string = 'Unknown', 
    type: string = 'TOTP', 
    group: string = 'default'
  ) => {
    const account = totpEngine.addAccount(accountId, name, secret, issuer, type, group)
    accounts.value = totpEngine.getAllAccounts()
    return account
  }

  const removeAccount = async (accountId: string) => {
    totpEngine.removeAccount(accountId)
    accounts.value = totpEngine.getAllAccounts()
  }

  const generateTOTP = (secret: string) => {
    return totpEngine.generateTOTP(secret)
  }

  const setupTokenUpdates = () => {
    // Token updates are handled by the RealTOTPEngine via events
  }

  // Load accounts on mount
  onMounted(() => {
    accounts.value = totpEngine.getAllAccounts()
  })

  return {
    accounts,
    addAccount,
    removeAccount,
    generateTOTP,
    setupTokenUpdates
  }
}