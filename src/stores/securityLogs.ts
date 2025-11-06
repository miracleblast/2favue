import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSecurityLogsStore = defineStore('securityLogs', () => {
  const securityLogs = ref<any[]>([])

  const loadSecurityLogs = () => {
    // Load from localStorage or initialize with demo data
    const saved = localStorage.getItem('authflow-security-logs')
    if (saved) {
      securityLogs.value = JSON.parse(saved)
    } else {
      // Initialize with demo data
      securityLogs.value = [
        {
          id: '1',
          time: new Date().toLocaleTimeString(),
          date: new Date().toLocaleDateString(),
          user: 'System',
          userInitials: 'S',
          action: 'App Initialized',
          details: 'AuthFlow Pro application started',
          ip: '127.0.0.1',
          platform: 'Web',
          status: 'Success'
        }
      ]
      saveSecurityLogs()
    }
  }

  const saveSecurityLogs = () => {
    localStorage.setItem('authflow-security-logs', JSON.stringify(securityLogs.value))
  }

  const addLog = (log: any) => {
    securityLogs.value.unshift({
      id: Date.now().toString(),
      ...log
    })
    // Keep only last 1000 logs for performance
    if (securityLogs.value.length > 1000) {
      securityLogs.value = securityLogs.value.slice(0, 1000)
    }
    saveSecurityLogs()
  }

  const clearLogs = () => {
    securityLogs.value = []
    localStorage.removeItem('authflow-security-logs')
  }

  return {
    securityLogs,
    loadSecurityLogs,
    addLog,
    clearLogs
  }
})