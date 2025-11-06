<template>
  <div class="app-wrapper">
    <!-- Header -->
    <AppHeader />
    
    <main class="app-container">
      <div class="dashboard-section">
        <!-- Header with Stats -->
        <div class="dashboard-header">
          <h1 class="section-title">
            <iconify-icon icon="mdi:account-group" />
            Team Management
          </h1>
          <div class="header-actions">
            <span class="account-count">{{ teamMembers.length }}/{{ teamLimit }} Users</span>
            <button 
              class="btn btn-primary" 
              @click="openInviteModal"
              :disabled="!canAddMore"
            >
              <iconify-icon icon="mdi:account-plus" />
              <span>Invite User</span>
            </button>
          </div>
        </div>

        <!-- Team Limit Warning -->
        <div v-if="!canAddMore" class="alert alert-warning">
          <iconify-icon icon="mdi:alert-circle" />
          <span>
            You've reached your team member limit ({{ teamLimit }}). 
            <a href="#" @click.prevent="showPricingModal" class="alert-link">Upgrade your plan</a> to add more team members.
          </span>
        </div>

        <!-- Team Members Table -->
        <div class="card">
          <div class="card-header">
            <span>Team Members</span>
            <span class="badge bg-primary">{{ teamMembers.length }}</span>
          </div>
          <div class="card-body">
            <!-- Empty State -->
            <div v-if="teamMembers.length === 0" class="empty-state">
              <iconify-icon icon="mdi:account-group-outline" />
              <h3>No Team Members</h3>
              <p>Invite your first team member to get started</p>
              <button class="btn btn-primary" @click="openInviteModal">
                <iconify-icon icon="mdi:account-plus" />
                Invite First User
              </button>
            </div>

            <!-- Team Table -->
            <div v-else class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in teamMembers" :key="user.id">
                    <td>
                      <div class="user-info">
                        <div class="user-avatar">{{ user.initials }}</div>
                        <div class="user-details">
                          <div class="user-name">{{ user.name }}</div>
                          <div class="user-email">{{ user.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="role-badge" :class="user.role">
                        {{ user.role }}
                      </span>
                    </td>
                    <td>
                      <span class="status-indicator" :class="user.status">
                        <span class="status-dot"></span>
                        {{ user.status === 'online' ? 'Online' : 'Offline' }}
                      </span>
                    </td>
                    <td class="last-active">{{ user.lastActive || 'Recently' }}</td>
                    <td>
                      <div class="action-buttons">
                        <button class="btn-icon" @click="editUser(user.id)" title="Edit">
                          <iconify-icon icon="mdi:pencil" />
                        </button>
                        <button 
                          v-if="user.role !== 'admin'" 
                          class="btn-icon btn-danger" 
                          @click="removeUser(user.id)"
                          title="Remove"
                        >
                          <iconify-icon icon="mdi:trash-can" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Permissions & Invite Section -->
        <div class="grid-2-col">
          <div class="card">
            <div class="card-header">
              <iconify-icon icon="mdi:shield-account" />
              <span>Role Permissions</span>
            </div>
            <div class="card-body">
              <div class="permissions-list">
                <div class="permission-item">
                  <h6>
                    <iconify-icon icon="mdi:shield-crown" />
                    Administrator
                  </h6>
                  <ul>
                    <li>Full system access</li>
                    <li>Manage team members</li>
                    <li>View all security logs</li>
                    <li>Manage API keys</li>
                  </ul>
                </div>
                <div class="permission-item">
                  <h6>
                    <iconify-icon icon="mdi:shield-star" />
                    Manager
                  </h6>
                  <ul>
                    <li>Add/remove accounts</li>
                    <li>Generate 2FA codes</li>
                    <li>View limited logs</li>
                    <li>No team management</li>
                  </ul>
                </div>
                <div class="permission-item">
                  <h6>
                    <iconify-icon icon="mdi:shield-account-outline" />
                    User
                  </h6>
                  <ul>
                    <li>Generate 2FA codes</li>
                    <li>View own activity</li>
                    <li>No administrative access</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <iconify-icon icon="mdi:account-plus-outline" />
              <span>Invite New User</span>
            </div>
            <div class="card-body">
              <form @submit.prevent="sendInvitation" class="invite-form">
                <div class="form-group">
                  <label>Email Address</label>
                  <input 
                    v-model="inviteData.email"
                    type="email" 
                    class="form-control" 
                    placeholder="colleague@agency.com" 
                    required
                  >
                </div>
                <div class="form-group">
                  <label>Role</label>
                  <select v-model="inviteData.role" class="form-control">
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <button type="submit" class="btn btn-primary full-width" :disabled="sendingInvite">
                  <iconify-icon v-if="sendingInvite" icon="mdi:loading" class="animate-spin" />
                  <iconify-icon v-else icon="mdi:send" />
                  <span>{{ sendingInvite ? 'Sending...' : 'Send Invitation' }}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Invite User Modal -->
    <div v-if="showInviteModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Invite Team Member</h3>
          <button class="close-btn" @click="closeInviteModal">
            <iconify-icon icon="mdi:close" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="sendInvitation">
            <div class="form-group">
              <label>Email Address</label>
              <input 
                v-model="inviteData.email"
                type="email" 
                placeholder="colleague@agency.com" 
                required
                class="form-control"
              >
            </div>
            
            <div class="form-group">
              <label>Role</label>
              <select v-model="inviteData.role" class="form-control" required>
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Custom Message (Optional)</label>
              <textarea 
                v-model="inviteData.message"
                class="form-control" 
                placeholder="Optional message for the invitation..."
                rows="3"
              ></textarea>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeInviteModal">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="sendingInvite">
                <iconify-icon v-if="sendingInvite" icon="mdi:loading" class="animate-spin" />
                <span>{{ sendingInvite ? 'Sending...' : 'Send Invitation' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useTeamStore } from '@/stores/team'
import AppHeader from '@/components/AppHeader.vue'

// Stores
const authStore = useAuthStore()
const teamStore = useTeamStore()

// Reactive State
const showInviteModal = ref(false)
const sendingInvite = ref(false)

const inviteData = ref({
  email: '',
  role: 'user',
  message: ''
})

// Computed Properties
const teamLimit = computed(() => authStore.getTeamLimit?.() || 5)
const canAddMore = computed(() => teamStore.teamMembers.length < teamLimit.value)
const teamMembers = computed(() => teamStore.teamMembers)

// Methods
const openInviteModal = () => {
  if (!canAddMore.value) {
    showPricingModal()
    return
  }
  showInviteModal.value = true
}

const closeInviteModal = () => {
  showInviteModal.value = false
  resetInviteForm()
}

const resetInviteForm = () => {
  inviteData.value = {
    email: '',
    role: 'user',
    message: ''
  }
}

const sendInvitation = async () => {
  if (sendingInvite.value) return
  
  sendingInvite.value = true
  try {
    await teamStore.inviteUser(inviteData.value)
    alert('Invitation sent successfully!')
    closeInviteModal()
  } catch (error) {
    console.error('Failed to send invitation:', error)
    alert('Failed to send invitation. Please try again.')
  } finally {
    sendingInvite.value = false
  }
}

const editUser = (userId: string) => {
  console.log('Edit user:', userId)
  alert('Edit user functionality would open here')
}

const removeUser = async (userId: string) => {
  if (confirm('Are you sure you want to remove this team member?')) {
    try {
      await teamStore.removeUser(userId)
      alert('Team member removed successfully')
    } catch (error) {
      console.error('Failed to remove user:', error)
      alert('Failed to remove team member')
    }
  }
}

const showPricingModal = () => {
  alert('Pricing modal would open here')
}

// Lifecycle
onMounted(() => {
  teamStore.loadTeamMembers()
})
</script>

<style scoped>
/* MAIN LAYOUT */
.app-wrapper {
  min-height: 100vh;
  background: var(--bg-primary);
}

.app-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.dashboard-section {
  margin-bottom: 3rem;
}

/* HEADER */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.account-count {
  color: var(--text-secondary);
  font-weight: 500;
}

/* BUTTONS */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-primary {
  background: var(--accent-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.btn-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  transition: var(--transition-fast);
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.btn-danger:hover {
  background: var(--danger);
  color: white;
}

.full-width {
  width: 100%;
}

/* CARDS */
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-xl);
  backdrop-filter: blur(20px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.03);
}

.card-header span {
  font-weight: 600;
  color: var(--text-primary);
}

.card-body {
  padding: 1.5rem;
}

/* ALERTS */
.alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: var(--radius-md);
  margin-bottom: 1.5rem;
  border: 1px solid transparent;
}

.alert-warning {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
  color: var(--warning);
}

.alert-link {
  color: inherit;
  text-decoration: underline;
  font-weight: 600;
}

.alert-link:hover {
  opacity: 0.8;
}

/* TABLE */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  color: var(--text-primary);
}

.data-table th {
  background: rgba(255, 255, 255, 0.05);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-color);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.data-table tbody tr {
  transition: var(--transition-fast);
}

.data-table tbody tr:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* USER INFO */
.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.125rem;
}

.user-email {
  font-size: 0.875rem;
  color: var(--text-muted);
}

/* BADGES */
.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.bg-primary {
  background: var(--accent-primary) !important;
}

.role-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
}

.role-badge.admin {
  background: rgba(59, 130, 246, 0.2);
  color: var(--accent-primary);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.role-badge.manager {
  background: rgba(16, 185, 129, 0.2);
  color: var(--success);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.role-badge.user {
  background: rgba(100, 116, 139, 0.2);
  color: var(--text-muted);
  border: 1px solid rgba(100, 116, 139, 0.3);
}

/* STATUS INDICATOR */
.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-indicator.online .status-dot {
  background: var(--success);
}

.status-indicator.offline .status-dot {
  background: var(--text-muted);
}

.status-indicator.online {
  color: var(--success);
}

.status-indicator.offline {
  color: var(--text-muted);
}

.last-active {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

/* ACTION BUTTONS */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

/* GRID LAYOUT */
.grid-2-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 2rem;
}

/* PERMISSIONS */
.permissions-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.permission-item h6 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  color: var(--text-primary);
  font-size: 1rem;
}

.permission-item ul {
  list-style: none;
  padding: 0;
  margin: 0;
  color: var(--text-secondary);
}

.permission-item li {
  padding: 0.25rem 0;
  font-size: 0.875rem;
  position: relative;
  padding-left: 1rem;
}

.permission-item li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--accent-primary);
}

/* FORMS */
.invite-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  transition: var(--transition-fast);
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: rgba(255, 255, 255, 0.12);
}

.form-control::placeholder {
  color: var(--text-muted);
}

/* EMPTY STATE */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
}

.empty-state iconify-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.empty-state h3 {
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--bg-card);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-md);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.modal-body {
  padding: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

/* ANIMATIONS */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* RESPONSIVE */
@media (max-width: 1024px) {
  .grid-2-col {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .app-container {
    padding: 1rem;
  }
  
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .data-table {
    font-size: 0.875rem;
  }
  
  .data-table th,
  .data-table td {
    padding: 0.75rem 0.5rem;
  }
  
  .user-info {
    gap: 0.5rem;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 0.75rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .btn-icon {
    width: 28px;
    height: 28px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .card-header,
  .card-body {
    padding: 1rem;
  }
  
  .data-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
  
  .section-title {
    font-size: 1.25rem;
  }
  
  .btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
  }
}
</style>