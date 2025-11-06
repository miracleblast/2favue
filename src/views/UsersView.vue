<template>
  <div class="app-wrapper">
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
            <span class="account-count">{{ usedLicenses }}/{{ teamLimit }} Licenses</span>
            <button 
              class="btn btn-primary" 
              @click="openGenerateLicenseModal"
              :disabled="!canAddMore || !isAdmin"
            >
              <iconify-icon icon="mdi:key-plus" />
              <span>Generate License</span>
            </button>
          </div>
        </div>

        <!-- Admin Only Notice -->
        <div v-if="!isAdmin" class="alert alert-info">
          <iconify-icon icon="mdi:information" />
          <span>
            License generation is available for administrators only. 
            Contact your team administrator for new licenses.
          </span>
        </div>

        <!-- Team Limit Warning -->
        <div v-if="!canAddMore && isAdmin" class="alert alert-warning">
          <iconify-icon icon="mdi:alert-circle" />
          <span>
            You've reached your license limit ({{ teamLimit }}). 
            <a href="#" @click.prevent="showPricingModal" class="alert-link">Upgrade your plan</a> to generate more licenses.
          </span>
        </div>

        <!-- Generated Licenses Table -->
        <div class="card">
          <div class="card-header">
            <span>Generated Licenses</span>
            <span class="badge bg-primary">{{ generatedLicenses.length }}</span>
          </div>
          <div class="card-body">
            <!-- Empty State -->
            <div v-if="generatedLicenses.length === 0" class="empty-state">
              <iconify-icon icon="mdi:key-outline" />
              <h3>No Licenses Generated</h3>
              <p v-if="isAdmin">Generate your first team license to invite members</p>
              <p v-else>No licenses have been generated for your team</p>
              <button 
                v-if="isAdmin" 
                class="btn btn-primary" 
                @click="openGenerateLicenseModal"
              >
                <iconify-icon icon="mdi:key-plus" />
                Generate First License
              </button>
            </div>

            <!-- Licenses Table -->
            <div v-else class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>License Key</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Generated</th>
                    <th v-if="isAdmin">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="license in generatedLicenses" :key="license.key">
                    <td>
                      <div class="license-info">
                        <code class="license-key">{{ license.key }}</code>
                        <button 
                          class="btn-icon small" 
                          @click="copyToClipboard(license.key)"
                          title="Copy license key"
                        >
                          <iconify-icon icon="mdi:content-copy" />
                        </button>
                      </div>
                    </td>
                    <td class="user-email">{{ license.userEmail }}</td>
                    <td>
                      <span class="role-badge" :class="license.role">
                        {{ license.role }}
                      </span>
                    </td>
                    <td>
                      <span class="status-indicator" :class="license.used ? 'used' : 'active'">
                        <span class="status-dot"></span>
                        {{ license.used ? 'Used' : 'Active' }}
                      </span>
                    </td>
                    <td class="generated-date">
                      {{ formatDate(license.created) }}
                    </td>
                    <td v-if="isAdmin">
                      <div class="action-buttons">
                        <button 
                          v-if="!license.used"
                          class="btn-icon" 
                          @click="resendInvitation(license)"
                          title="Resend invitation"
                        >
                          <iconify-icon icon="mdi:email-send" />
                        </button>
                        <button 
                          v-if="!license.used"
                          class="btn-icon btn-danger" 
                          @click="revokeLicense(license.key)"
                          title="Revoke license"
                        >
                          <iconify-icon icon="mdi:key-remove" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Team Management Section -->
        <div class="grid-2-col">
          <!-- License Usage Stats -->
          <div class="card">
            <div class="card-header">
              <iconify-icon icon="mdi:chart-box" />
              <span>License Usage</span>
            </div>
            <div class="card-body">
              <div class="usage-stats-grid">
                <div class="stat-card">
                  <div class="stat-value">{{ usedLicenses }}</div>
                  <div class="stat-label">Licenses Used</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">{{ availableLicenses }}</div>
                  <div class="stat-label">Available</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">{{ teamLimit }}</div>
                  <div class="stat-label">Total</div>
                </div>
              </div>
              
              <div class="progress-section">
                <div class="progress-info">
                  <span>License Usage</span>
                  <span>{{ Math.round((usedLicenses / teamLimit) * 100) }}%</span>
                </div>
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: (usedLicenses / teamLimit) * 100 + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Quick Actions -->
          <div class="card">
            <div class="card-header">
              <iconify-icon icon="mdi:rocket-launch" />
              <span>Quick Actions</span>
            </div>
            <div class="card-body">
              <div class="quick-actions-grid">
                <button 
                  class="action-card" 
                  @click="openGenerateLicenseModal"
                  :disabled="!canAddMore || !isAdmin"
                >
                  <iconify-icon icon="mdi:key-plus" />
                  <span>Generate License</span>
                  <small>Invite new team member</small>
                </button>
                
                <button class="action-card" @click="exportLicenses">
                  <iconify-icon icon="mdi:download" />
                  <span>Export Licenses</span>
                  <small>CSV format</small>
                </button>
                
                <button class="action-card" @click="showPricingModal">
                  <iconify-icon icon="mdi:chart-line" />
                  <span>Upgrade Plan</span>
                  <small>Get more licenses</small>
                </button>
                
                <button class="action-card" @click="goToSettings">
                  <iconify-icon icon="mdi:cog" />
                  <span>Settings</span>
                  <small>Configure team</small>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Permissions Section -->
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
                  <li>Generate team licenses</li>
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
      </div>
    </main>

    <!-- Generate License Modal -->
    <GenerateLicenseModal 
      :show="showGenerateLicenseModal"
      @close="closeGenerateLicenseModal"
      @license-generated="handleLicenseGenerated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
// @ts-ignore
import { LicenseManager } from '@/engines/LicenseManager'
// @ts-ignore
import { EmailService } from '@/engines/EmailService'
import AppHeader from '@/components/AppHeader.vue'
import GenerateLicenseModal from '@/components/GenerateLicenseModal.vue'

const router = useRouter()
const authStore = useAuthStore()

// Engines
const licenseManager = new LicenseManager()
const emailService = new EmailService()

// Reactive State
const showGenerateLicenseModal = ref(false)
const generatedLicenses = ref<any[]>([])

// Computed Properties
const licenseInfo = computed(() => licenseManager.getLicenseData())
const isAdmin = computed(() => licenseInfo.value.isAdmin)
const teamLimit = computed(() => licenseInfo.value.features.teamMembers)
const usedLicenses = computed(() => generatedLicenses.value.length)
const availableLicenses = computed(() => teamLimit.value - usedLicenses.value)
const canAddMore = computed(() => usedLicenses.value < teamLimit.value && isAdmin.value)

// Methods
const openGenerateLicenseModal = () => {
  if (!canAddMore.value) {
    showPricingModal()
    return
  }
  showGenerateLicenseModal.value = true
}

const closeGenerateLicenseModal = () => {
  showGenerateLicenseModal.value = false
}

const handleLicenseGenerated = (license: any) => {
  // Refresh the licenses list
  loadGeneratedLicenses()
}

const loadGeneratedLicenses = () => {
  generatedLicenses.value = licenseInfo.value.generatedLicenses || []
}

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  } catch (error) {
    console.error('Failed to copy:', error)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString()
}

const resendInvitation = async (license: any) => {
  try {
    await emailService.sendInvitation({
      email: license.userEmail,
      licenseKey: license.key,
      role: license.role,
      customMessage: 'Your license has been resent by the administrator.'
    })
    alert(`Invitation resent to ${license.userEmail}`)
  } catch (error) {
    console.error('Failed to resend invitation:', error)
    alert('Failed to resend invitation')
  }
}

const revokeLicense = async (licenseKey: string) => {
  if (confirm('Are you sure you want to revoke this license? This cannot be undone.')) {
    // In a real app, you'd call licenseManager.revokeLicense(licenseKey)
    alert('License revocation would be implemented here')
    // For now, just reload the list
    loadGeneratedLicenses()
  }
}

const exportLicenses = () => {
  const csvData = generatedLicenses.value.map(license => ({
    'License Key': license.key,
    'Email': license.userEmail,
    'Role': license.role,
    'Status': license.used ? 'Used' : 'Active',
    'Generated': license.created,
    'Expires': license.expiry
  }))
  
  // Convert to CSV
  const headers = Object.keys(csvData[0] || {})
  const csv = [
    headers.join(','),
    ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
  ].join('\n')
  
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'authflow-licenses.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const showPricingModal = () => {
  alert('Pricing Plans:\n\n• Free: $0 (1 user)\n• Starter: $9.99 (3 users)\n• Professional: $25.99 (50 users)\n• Enterprise: $49.99 (100 users)')
}

const goToSettings = () => {
  router.push('/settings')
}

// Lifecycle
onMounted(() => {
  licenseManager.checkLicenseStatus()
  loadGeneratedLicenses()
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

.btn-icon.small {
  width: 24px;
  height: 24px;
  padding: 0.25rem;
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

.alert-info {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: var(--accent-primary);
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

/* LICENSE INFO */
.license-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.license-key {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.75rem;
  color: var(--accent-primary);
  font-weight: 600;
}

.user-email {
  color: var(--text-primary);
  font-weight: 500;
}

.generated-date {
  color: var(--text-secondary);
  font-size: 0.875rem;
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
  color: white;
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

.status-indicator.active .status-dot {
  background: var(--success);
}

.status-indicator.active {
  color: var(--success);
}

.status-indicator.used .status-dot {
  background: var(--text-muted);
}

.status-indicator.used {
  color: var(--text-muted);
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

/* USAGE STATS */
.usage-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  transition: var(--transition-fast);
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* PROGRESS BAR */
.progress-section {
  margin: 1.5rem 0;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-primary), var(--primary-light));
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* QUICK ACTIONS */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition-fast);
  text-align: center;
}

.action-card:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

.action-card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.action-card iconify-icon {
  font-size: 1.5rem;
  color: var(--accent-primary);
}

.action-card span {
  font-weight: 600;
  font-size: 0.9rem;
}

.action-card small {
  color: var(--text-muted);
  font-size: 0.75rem;
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

/* ANIMATIONS */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* RESPONSIVE DESIGN */
@media (max-width: 1024px) {
  .grid-2-col {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .usage-stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
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
  
  .usage-stats-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .license-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
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
  
  .stat-card {
    padding: 0.75rem;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
}

/* DARK MODE ENHANCEMENTS */
@media (prefers-color-scheme: dark) {
  .card {
    background: rgba(15, 23, 42, 0.8);
  }
  
  .stat-card {
    background: rgba(255, 255, 255, 0.03);
  }
  
  .action-card {
    background: rgba(255, 255, 255, 0.03);
  }
}

/* ACCESSIBILITY */
.btn:focus,
.action-card:focus {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* SCROLLBAR STYLING */
.table-container::-webkit-scrollbar {
  height: 6px;
}

.table-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.table-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.table-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>