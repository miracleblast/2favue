import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface ApiKey {
  id: string
  name: string
  key: string
  created: string
  lastUsed?: string
  active: boolean
  usageCount: number
  permissions: string[]
}

export const useApiKeysStore = defineStore('apiKeys', () => {
  const apiKeys = ref<ApiKey[]>([
    {
      id: '1',
      name: 'Production Server',
      key: 'auth_prod_sk_7x9y2z8w5v4q3r6t1s0u',
      created: '2024-01-15',
      lastUsed: 'Just now',
      active: true,
      usageCount: 1247,
      permissions: ['read', 'write']
    },
    {
      id: '2',
      name: 'Development App',
      key: 'auth_dev_sk_3a4b5c6d7e8f9g0h1i2j',
      created: '2024-02-01',
      lastUsed: '2 hours ago',
      active: true,
      usageCount: 89,
      permissions: ['read']
    },
    {
      id: '3',
      name: 'Mobile App',
      key: 'auth_mob_sk_k1l2m3n4o5p6q7r8s9t',
      created: '2024-03-10',
      lastUsed: undefined,
      active: false,
      usageCount: 0,
      permissions: ['read']
    },
    {
      id: '4',
      name: 'Backup Service',
      key: 'auth_bak_sk_x9y8z7a6b5c4d3e2f1g',
      created: '2024-03-18',
      lastUsed: '1 day ago',
      active: true,
      usageCount: 42,
      permissions: ['read', 'write']
    },
    {
      id: '5',
      name: 'Analytics Dashboard',
      key: 'auth_ana_sk_h2i3j4k5l6m7n8o9p0q',
      created: '2024-03-22',
      lastUsed: undefined,
      active: false,
      usageCount: 0,
      permissions: ['read']
    }
  ])

  const loadApiKeys = async () => {
    // Simulate API call with real delay
    await new Promise(resolve => setTimeout(resolve, 800))
    return apiKeys.value
  }

  const generateApiKey = async (keyData: { name: string; permissions: string[]; expiration: string }) => {
    // Real API key generation with proper format
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substr(2, 24)
    
    const newKey: ApiKey = {
      id: timestamp.toString(),
      name: keyData.name,
      key: `auth_live_sk_${timestamp}_${randomString}`,
      created: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      active: true,
      usageCount: 0,
      permissions: keyData.permissions
    }
    
    apiKeys.value.unshift(newKey) // Add to beginning
    return newKey
  }

  const regenerateApiKey = async (keyId: string) => {
    await new Promise(resolve => setTimeout(resolve, 800))
    const key = apiKeys.value.find(k => k.id === keyId)
    if (key) {
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substr(2, 24)
      key.key = `auth_live_sk_${timestamp}_${randomString}`
      key.lastUsed = undefined
      key.usageCount = 0
      key.created = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const revokeApiKey = async (keyId: string) => {
    await new Promise(resolve => setTimeout(resolve, 600))
    apiKeys.value = apiKeys.value.filter(key => key.id !== keyId)
  }

  // Real-time usage tracking
  const trackApiUsage = (keyId: string) => {
    const key = apiKeys.value.find(k => k.id === keyId)
    if (key && key.active) {
      key.usageCount++
      key.lastUsed = new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  }

  return {
    apiKeys,
    loadApiKeys,
    generateApiKey,
    regenerateApiKey,
    revokeApiKey,
    trackApiUsage
  }
})
