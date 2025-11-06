import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface TeamMember {
  id: string
  name: string
  email: string
  initials: string
  role: 'admin' | 'manager' | 'user'
  status: 'online' | 'offline'
  lastActive?: string
  joinedAt: string
}

export const useTeamStore = defineStore('team', () => {
  const teamMembers = ref<TeamMember[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@agency.com',
      initials: 'JD',
      role: 'admin',
      status: 'online',
      lastActive: '2 minutes ago',
      joinedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      email: 'sarah@agency.com',
      initials: 'SW',
      role: 'manager',
      status: 'offline',
      lastActive: '1 hour ago',
      joinedAt: '2024-01-20'
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike@agency.com',
      initials: 'MC',
      role: 'user',
      status: 'online',
      lastActive: '5 minutes ago',
      joinedAt: '2024-02-01'
    }
  ])

  const loadTeamMembers = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    return teamMembers.value
  }

  const inviteUser = async (inviteData: { email: string; role: string; message?: string }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteData.email.split('@')[0],
      email: inviteData.email,
      initials: inviteData.email.substring(0, 2).toUpperCase(),
      role: inviteData.role as 'admin' | 'manager' | 'user',
      status: 'offline',
      joinedAt: new Date().toISOString().split('T')[0]
    }
    
    teamMembers.value.push(newMember)
    return newMember
  }

  const removeUser = async (userId: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    teamMembers.value = teamMembers.value.filter(member => member.id !== userId)
  }

  const updateUserRole = async (userId: string, newRole: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    const member = teamMembers.value.find(m => m.id === userId)
    if (member) {
      member.role = newRole as 'admin' | 'manager' | 'user'
    }
  }

  return {
    teamMembers,
    loadTeamMembers,
    inviteUser,
    removeUser,
    updateUserRole
  }
})
