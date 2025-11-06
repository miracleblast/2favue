<template>
  <div class="app-wrapper">
    <!-- Header -->
    <AppHeader />
    
    <main class="app-container">
      <div class="dashboard-section">
        <!-- Header with Actions -->
        <div class="dashboard-header">
          <h1 class="section-title">
            <iconify-icon icon="mdi:key" />
            API Keys Management
          </h1>
          <button 
            class="btn btn-primary" 
            @click="openGenerateModal"
            :disabled="!hasApiAccess"
          >
            <iconify-icon icon="mdi:plus-circle" />
            <span>Generate New Key</span>
          </button>
        </div>

        <!-- API Access Warning -->
        <div v-if="!hasApiAccess" class="alert alert-warning">
          <iconify-icon icon="mdi:alert-circle" />
          <span>
            API access is not available on your current plan. 
            <a href="#" @click.prevent="showPricingModal" class="alert-link">Upgrade to Professional</a> to enable API features.
          </span>
        </div>

        <!-- API Keys List -->
        <div class="card">
          <div class="card-header">
            <span>Active API Keys</span>
            <span class="badge bg-primary">{{ apiKeys.length }}</span>
          </div>
          <div class="card-body">
            <!-- Empty State -->
            <div v-if="apiKeys.length === 0" class="empty-state">
              <iconify-icon icon="mdi:key" />
              <h3>No API Keys</h3>
              <p>Generate your first API key to integrate with other applications</p>
              <button 
                v-if="hasApiAccess" 
                class="btn btn-primary" 
                @click="openGenerateModal"
              >
                <iconify-icon icon="mdi:plus-circle" />
                Generate First API Key
              </button>
            </div>

            <!-- API Keys List -->
            <div v-else class="api-keys-list">
              <div 
                v-for="key in apiKeys" 
                :key="key.id" 
                class="api-key-item"
              >
                <div class="api-key-info">
                  <div class="api-key-name">
                    <strong>{{ key.name }}</strong>
                    <span class="api-key-value">{{ maskApiKey(key.key) }}</span>
                  </div>
                  <div class="api-key-meta">
                    <span>Created: {{ key.created }}</span>
                    <span>Last used: {{ key.lastUsed || 'Never' }}</span>
                    <span class="badge" :class="key.active ? 'bg-success' : 'bg-secondary'">
                      {{ key.active ? 'Active' : 'Inactive' }}
                    </span>
                  </div>
                </div>
                <div class="api-key-actions">
                  <button class="btn-icon" @click="copyApiKey(key.id)" title="Copy API Key">
                    <iconify-icon icon="mdi:content-copy" />
                  </button>
                  <button class="btn-icon" @click="regenerateApiKey(key.id)" title="Regenerate Key">
                    <iconify-icon icon="mdi:refresh" />
                  </button>
                  <button class="btn-icon btn-danger" @click="revokeApiKey(key.id)" title="Revoke Key">
                    <iconify-icon icon="mdi:trash-can" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- API Documentation & Stats -->
        <div v-if="hasApiAccess" class="grid-2-col">
          <div class="card">
            <div class="card-header">
              <iconify-icon icon="mdi:book" />
              <span>API Documentation</span>
            </div>
            <div class="card-body">
              <h6>Available Endpoints:</h6>
              <div class="code-snippet">
                <pre><code>// Generate TOTP token
POST /api/v1/tokens/generate
{
  "accountId": "account_123",
  "apiKey": "your_api_key_here"
}</code></pre>
              </div>
              <div class="mt-3">
                <a href="#" class="btn btn-outline-primary">
                  <iconify-icon icon="mdi:book" />
                  <span>View Full Documentation</span>
                </a>
              </div>
            </div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <iconify-icon icon="mdi:chart-line" />
              <span>Usage Statistics</span>
            </div>
            <div class="card-body">
              <div class="usage-stats">
                <div class="usage-stat">
                  <div class="stat-value">{{ totalApiCalls }}</div>
                  <div class="stat-label">Total API Calls</div>
                </div>
                <div class="usage-stat">
                  <div class="stat-value">24</div>
                  <div class="stat-label">Calls Today</div>
                </div>
                <div class="usage-stat">
                  <div class="stat-value">99.8%</div>
                  <div class="stat-label">Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Generate API Key Modal -->
    <div v-if="showGenerateModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Generate New API Key</h3>
          <button class="close-btn" @click="closeGenerateModal">
            <iconify-icon icon="mdi:close" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="generateApiKey">
            <div class="form-group">
              <label>Key Name</label>
              <input 
                v-model="newKeyData.name"
                type="text" 
                placeholder="e.g., Production Server, Mobile App" 
                required
                class="form-control"
              >
              <small class="help-text">Give your API key a descriptive name</small>
            </div>
            
            <div class="form-group">
              <label>Permissions</label>
              <div class="permissions-checkboxes">
                <label class="checkbox-label">
                  <input type="checkbox" v-model="newKeyData.permissions" value="read"> Read access
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="newKeyData.permissions" value="write"> Write access
                </label>
                <label class="checkbox-label">
                  <input type="checkbox" v-model="newKeyData.permissions" value="admin"> Admin access
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label>Expiration</label>
              <select v-model="newKeyData.expiration" class="form-control">
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
                <option value="never">Never</option>
              </select>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeGenerateModal">
                Cancel
              </button>
              <button type="submit" class="btn btn-primary" :disabled="generatingKey">
                <iconify-icon v-if="generatingKey" icon="mdi:loading" class="animate-spin" />
                <span>{{ generatingKey ? 'Generating...' : 'Generate Key' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- New API Key Modal -->
    <div v-if="showNewKeyModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>API Key Generated</h3>
          <button class="close-btn" @click="closeNewKeyModal">
            <iconify-icon icon="mdi:close" />
          </button>
        </div>
        <div class="modal-body">
          <div class="alert alert-warning">
            <iconify-icon icon="mdi:alert" />
            <span>Make sure to copy your API key now. You won't be able to see it again!</span>
          </div>
          
          <div class="api-key-display">
            <code class="api-key-value">{{ newApiKey }}</code>
            <button class="btn btn-primary" @click="copyNewApiKey">
              <iconify-icon icon="mdi:content-copy" />
              <span>Copy to Clipboard</span>
            </button>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn btn-primary" @click="closeNewKeyModal">
              I've Copied the Key
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useApiKeysStore } from '@/stores/apiKeys'
import AppHeader from '@/components/AppHeader.vue'

// Stores
const authStore = useAuthStore()
const apiKeysStore = useApiKeysStore()

// Reactive State
const showGenerateModal = ref(false)
const showNewKeyModal = ref(false)
const generatingKey = ref(false)

const newKeyData = ref({
  name: '',
  permissions: ['read'],
  expiration: '30'
})

const newApiKey = ref('')

// Computed Properties
const hasApiAccess = computed(() => authStore.hasFeature?.('apiAccess') || true)
const apiKeys = computed(() => apiKeysStore.apiKeys)
const totalApiCalls = computed(() => 
  apiKeys.value.reduce((acc, key) => acc + key.usageCount, 0)
)

// Methods
const openGenerateModal = () => {
  if (!hasApiAccess.value) {
    showPricingModal()
    return
  }
  showGenerateModal.value = true
}

const closeGenerateModal = () => {
  showGenerateModal.value = false
  resetNewKeyForm()
}

const closeNewKeyModal = () => {
  showNewKeyModal.value = false
  newApiKey.value = ''
}

const resetNewKeyForm = () => {
  newKeyData.value = {
    name: '',
    permissions: ['read'],
    expiration: '30'
  }
}

const generateApiKey = async () => {
  if (generatingKey.value) return
  
  generatingKey.value = true
  try {
    // Generate a mock API key (in real app, this would call your backend)
    const key = await apiKeysStore.generateApiKey(newKeyData.value)
    newApiKey.value = key.key
    showGenerateModal.value = false
    showNewKeyModal.value = true
  } catch (error) {
    console.error('Failed to generate API key:', error)
    alert('Failed to generate API key. Please try again.')
  } finally {
    generatingKey.value = false
  }
}

const copyApiKey = async (keyId: string) => {
  const key = apiKeys.value.find(k => k.id === keyId)
  if (key) {
    try {
      await navigator.clipboard.writeText(key.key)
      alert('API key copied to clipboard!')
    } catch (error) {
      console.error('Failed to copy API key:', error)
      alert('Failed to copy API key. Please try again.')
    }
  }
}

const copyNewApiKey = async () => {
  try {
    await navigator.clipboard.writeText(newApiKey.value)
    alert('API key copied to clipboard!')
  } catch (error) {
    console.error('Failed to copy API key:', error)
    alert('Failed to copy API key. Please try again.')
  }
}

const regenerateApiKey = async (keyId: string) => {
  if (confirm('Are you sure you want to regenerate this API key? The old key will be invalidated.')) {
    try {
      await apiKeysStore.regenerateApiKey(keyId)
      alert('API key regenerated successfully!')
    } catch (error) {
      console.error('Failed to regenerate API key:', error)
      alert('Failed to regenerate API key.')
    }
  }
}

const revokeApiKey = async (keyId: string) => {
  if (confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
    try {
      await apiKeysStore.revokeApiKey(keyId)
      alert('API key revoked successfully!')
    } catch (error) {
      console.error('Failed to revoke API key:', error)
      alert('Failed to revoke API key.')
    }
  }
}

const maskApiKey = (key: string) => {
  return key.substring(0, 8) + '•'.repeat(16) + key.substring(key.length - 8)
}

const showPricingModal = () => {
  alert('Pricing modal would open here')
}

// Lifecycle
onMounted(() => {
  apiKeysStore.loadApiKeys()
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

.btn-outline-primary {
  background: transparent;
  border: 1px solid var(--accent-primary);
  color: var(--accent-primary);
}

.btn-outline-primary:hover {
  background: var(--accent-primary);
  color: white;
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

/* API KEYS LIST */
.api-keys-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.api-key-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  transition: var(--transition-fast);
}

.api-key-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.api-key-info {
  flex: 1;
}

.api-key-name {
  margin-bottom: 0.75rem;
}

.api-key-name strong {
  color: var(--text-primary);
  margin-right: 1rem;
  font-size: 1.1rem;
}

.api-key-value {
  font-family: 'Monaco', 'Consolas', monospace;
  background: rgba(0, 0, 0, 0.3);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
}

.api-key-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-muted);
  flex-wrap: wrap;
}

.api-key-actions {
  display: flex;
  gap: 0.5rem;
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

.bg-success {
  background: var(--success) !important;
}

.bg-secondary {
  background: var(--text-muted) !important;
}

/* GRID LAYOUT */
.grid-2-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 2rem;
}

/* CODE SNIPPET */
.code-snippet {
  background: rgba(0, 0, 0, 0.3);
  border-radius: var(--radius-md);
  padding: 1rem;
  border: 1px solid var(--border-color);
  overflow-x: auto;
}

.code-snippet pre {
  margin: 0;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.code-snippet code {
  background: transparent;
  padding: 0;
}

/* USAGE STATS */
.usage-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  text-align: center;
}

.usage-stat {
  padding: 1rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
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

/* FORMS */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
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

.help-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-muted);
}

/* PERMISSIONS CHECKBOXES */
.permissions-checkboxes {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--text-primary);
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

/* API KEY DISPLAY */
.api-key-display {
  text-align: center;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  margin: 1.5rem 0;
}

.api-key-display .api-key-value {
  display: block;
  font-size: 1.1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.5);
  border-radius: var(--radius-md);
  margin-bottom: 1rem;
  word-break: break-all;
  color: var(--accent-primary);
  font-weight: 600;
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
  
  .api-key-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .api-key-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .api-key-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .usage-stats {
    grid-template-columns: 1fr;
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
  
  .section-title {
    font-size: 1.25rem;
  }
  
  .btn {
    padding: 0.625rem 1.25rem;
    font-size: 0.875rem;
  }
  
  .api-key-value {
    font-size: 0.75rem;
  }
}
/* BADGES - HIGH VISIBILITY */
.badge {
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white !important; /* Force white text */
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.badge-success {
  background: linear-gradient(135deg, var(--success) 0%, #0d9c6e 100%) !important;
  border: 1px solid rgba(16, 185, 129, 0.3);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.badge-danger {
  background: linear-gradient(135deg, var(--danger) 0%, #c53030 100%) !important;
  border: 1px solid rgba(239, 68, 68, 0.3);
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

.bg-primary {
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--primary-dark) 100%) !important;
  color: white !important;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

/* API KEY META - BETTER VISIBILITY */
.api-key-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.api-key-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* API KEY VALUE - BETTER VISIBILITY */
.api-key-value {
  font-family: 'Monaco', 'Consolas', monospace;
  background: rgba(0, 0, 0, 0.4);
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  color: var(--accent-primary) !important;
  letter-spacing: 0.5px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  font-weight: 600;
}
</style>