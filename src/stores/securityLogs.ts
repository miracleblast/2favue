import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface SecurityLog {
  id: string
  time: string
  date: string
  user: string
  userInitials: string
  action: string
  details: string
  ip: string
  platform: string
  status: 'Success' | 'Failed'
}

export const useSecurityLogsStore = defineStore('securityLogs', () => {
  const securityLogs = ref<SecurityLog[]>([
    {
      id: '1',
      time: '14:23:45',
      date: '2024-03-22',
      user: 'John Doe',
      userInitials: 'JD',
      action: 'User Login',
      details: 'Successful authentication',
      ip: '192.168.1.45',
      platform: 'Web Browser',
      status: 'Success'
    },
    {
      id: '2',
      time: '14:15:12',
      date: '2024-03-22',
      user: 'Sarah Wilson',
      userInitials: 'SW',
      action: 'API Key Generated',
      details: 'New production API key created',
      ip: '203.0.113.89',
      platform: 'API',
      status: 'Success'
    },
    {
      id: '3',
      time: '13:58:33',
      date: '2024-03-22',
      user: 'Mike Chen',
      userInitials: 'MC',
      action: 'Failed Login Attempt',
      details: 'Invalid password entered',
      ip: '198.51.100.22',
      platform: 'Mobile App',
      status: 'Failed'
    },
    {
      id: '4',
      time: '13:42:17',
      date: '2024-03-22',
      user: 'John Doe',
      userInitials: 'JD',
      action: 'Account Added',
      details: 'Google account configured for 2FA',
      ip: '192.168.1.45',
      platform: 'Web Browser',
      status: 'Success'
    },
    {
      id: '5',
      time: '13:25:09',
      date: '2024-03-22',
      user: 'Admin System',
      userInitials: 'AS',
      action: 'Security Scan',
      details: 'Routine security audit completed',
      ip: '10.0.1.1',
      platform: 'System',
      status: 'Success'
    },
    {
      id: '6',
      time: '12:58:44',
      date: '2024-03-22',
      user: 'Sarah Wilson',
      userInitials: 'SW',
      action: 'Password Changed',
      details: 'User password updated successfully',
      ip: '203.0.113.89',
      platform: 'Web Browser',
      status: 'Success'
    },
    {
      id: '7',
      time: '12:35:21',
      date: '2024-03-22',
      user: 'Unknown',
      userInitials: '??',
      action: 'Brute Force Attempt',
      details: 'Multiple failed login attempts blocked',
      ip: '185.143.223.107',
      platform: 'Web Browser',
      status: 'Failed'
    },
    {
      id: '8',
      time: '11:59:18',
      date: '2024-03-22',
      user: 'Mike Chen',
      userInitials: 'MC',
      action: 'TOTP Token Generated',
      details: '2FA code generated for GitHub account',
      ip: '198.51.100.22',
      platform: 'Mobile App',
      status: 'Success'
    },
    {
      id: '9',
      time: '11:42:05',
      date: '2024-03-22',
      user: 'John Doe',
      userInitials: 'JD',
      action: 'Session Expired',
      details: 'User session timed out due to inactivity',
      ip: '192.168.1.45',
      platform: 'Web Browser',
      status: 'Success'
    },
    {
      id: '10',
      time: '11:18:37',
      date: '2024-03-22',
      user: 'Sarah Wilson',
      userInitials: 'SW',
      action: 'API Call',
      details: 'TOTP token generated via API',
      ip: '203.0.113.89',
      platform: 'API',
      status: 'Success'
    },
    {
      id: '11',
      time: '10:55:12',
      date: '2024-03-22',
      user: 'Mike Chen',
      userInitials: 'MC',
      action: 'Device Registered',
      details: 'New mobile device authorized',
      ip: '198.51.100.22',
      platform: 'Mobile App',
      status: 'Success'
    },
    {
      id: '12',
      time: '10:23:49',
      date: '2024-03-22',
      user: 'Admin System',
      userInitials: 'AS',
      action: 'Backup Created',
      details: 'Automatic system backup completed',
      ip: '10.0.1.1',
      platform: 'System',
      status: 'Success'
    }
  ])

  const loadSecurityLogs = async () => {
    // Simulate API call with real delay
    await new Promise(resolve => setTimeout(resolve, 800))
    return securityLogs.value
  }

  const clearLogs = async () => {
    await new Promise(resolve => setTimeout(resolve, 500))
    securityLogs.value = []
  }

  const addSecurityLog = (log: Omit<SecurityLog, 'id'>) => {
    const newLog: SecurityLog = {
      ...log,
      id: Date.now().toString()
    }
    securityLogs.value.unshift(newLog)
  }

  return {
    securityLogs,
    loadSecurityLogs,
    clearLogs,
    addSecurityLog
  }
})
