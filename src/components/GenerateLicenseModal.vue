<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Generate Team License</h3>
        <button class="close-btn" @click="close">
          <iconify-icon icon="mdi:close" />
        </button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="generateLicense">
          <div class="form-group">
            <label>Team Member Email</label>
            <input 
              v-model="licenseData.email"
              type="email" 
              placeholder="teammate@agency.com" 
              required
              class="form-control"
            >
          </div>
          
          <div class="form-group">
            <label>Role</label>
            <select v-model="licenseData.role" class="form-control" required>
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Administrator</option>
            </select>
            <small class="help-text">
              Administrators can generate licenses and manage team members
            </small>
          </div>

          <div class="form-group">
            <label>Custom Invitation Message (Optional)</label>
            <textarea 
              v-model="licenseData.customMessage"
              class="form-control" 
              placeholder="Welcome to our team! Here's your license key..."
              rows="3"
            ></textarea>
          </div>

          <!-- License Preview -->
          <div v-if="generatedLicense" class="license-preview">
            <h6>Generated License</h6>
            <div class="license-key-display">
              <code class="license-key">{{ generatedLicense.key }}</code>
              <button 
                type="button" 
                class="btn-icon" 
                @click="copyLicenseKey"
                title="Copy license key"
              >
                <iconify-icon icon="mdi:content-copy" />
              </button>
            </div>
            <div class="license-details">
              <div class="detail-item">
                <span class="label">Plan:</span>
                <span class="value">{{ generatedLicense.plan }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Role:</span>
                <span class="value">{{ generatedLicense.role }}</span>
              </div>
              <div class="detail-item">
                <span class="label">Expires:</span>
                <span class="value">{{ generatedLicense.expiry }}</span>
              </div>
            </div>
          </div>

          <!-- Usage Stats -->
          <div class="usage-stats">
            <div class="stat-item">
              <span class="stat-label">Licenses Used</span>
              <span class="stat-value">{{ usedLicenses }}/{{ totalLicenses }}</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: (usedLicenses / totalLicenses) * 100 + '%' }"
              ></div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="close">
              Cancel
            </button>
            <button 
              type="submit" 
              class="btn btn-primary" 
              :disabled="generating || !canGenerateMore"
            >
              <iconify-icon v-if="generating" icon="mdi:loading" class="animate-spin" />
              <iconify-icon v-else icon="mdi:key-plus" />
              <span>
                {{ generating ? 'Generating...' : 
                   !canGenerateMore ? 'No Available Licenses' : 'Generate License' }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
// @ts-ignore
import { LicenseManager } from '@/engines/LicenseManager'
// @ts-ignore
import { EmailService } from '@/engines/EmailService'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'license-generated', license: any): void
}>()

const licenseManager = new LicenseManager()
const emailService = new EmailService()

const licenseData = ref({
  email: '',
  role: 'user',
  customMessage: ''
})

const generating = ref(false)
const generatedLicense = ref<any>(null)

// Computed properties
const licenseInfo = computed(() => licenseManager.getLicenseData())
const totalLicenses = computed(() => licenseInfo.value.features.teamMembers)
const usedLicenses = computed(() => licenseInfo.value.generatedLicenses?.length || 0)
const canGenerateMore = computed(() => usedLicenses.value < totalLicenses.value)

// Methods
const generateLicense = async () => {
  if (generating.value || !canGenerateMore.value) return
  
  generating.value = true
  try {
    // Generate the license
    const license = licenseManager.generateSubLicense(
      licenseInfo.value.plan,
      licenseInfo.value.key,
      licenseData.value.email,
      licenseData.value.role
    )
    
    generatedLicense.value = license
    
    // Send invitation email
    await emailService.sendInvitation({
      email: licenseData.value.email,
      licenseKey: license.key,
      role: licenseData.value.role,
      customMessage: licenseData.value.customMessage,
      adminName: 'Team Administrator' // You can get this from user profile
    })
    
    // Emit event
    emit('license-generated', license)
    
    // Show success message
    alert(`License generated and invitation sent to ${licenseData.value.email}!`)
    
    // Reset form after success
    resetForm()
    
  } catch (error) {
    console.error('License generation failed:', error)
    alert(`Failed to generate license: ${error.message}`)
  } finally {
    generating.value = false
  }
}

const copyLicenseKey = async () => {
  if (generatedLicense.value?.key) {
    try {
      await navigator.clipboard.writeText(generatedLicense.value.key)
      alert('License key copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy license key:', error)
    }
  }
}

const resetForm = () => {
  licenseData.value = {
    email: '',
    role: 'user',
    customMessage: ''
  }
  generatedLicense.value = null
}

const close = () => {
  resetForm()
  emit('close')
}

// Reset when modal closes
watch(() => props.show, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})
</script>

<style scoped>
.license-preview {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  margin: 1.5rem 0;
}

.license-preview h6 {
  color: var(--accent-primary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.license-key-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.license-key {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 600;
  color: var(--accent-primary);
  flex: 1;
  font-size: 0.9rem;
}

.license-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item .label {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 600;
}

.detail-item .value {
  font-size: 0.875rem;
  color: var(--text-primary);
  font-weight: 500;
  text-transform: capitalize;
}

.usage-stats {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin: 1.5rem 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.stat-value {
  font-weight: 600;
  color: var(--text-primary);
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

.help-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .license-details {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .license-key-display {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>