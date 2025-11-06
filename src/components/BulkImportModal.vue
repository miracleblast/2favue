<template>
  <div v-if="show" class="modal-overlay" @click.self="close">
    <div class="modal-content xl">
      <div class="modal-header">
        <h3>Bulk Import Accounts</h3>
        <button class="close-btn" @click="close">
          <iconify-icon icon="mdi:close" />
        </button>
      </div>
      <div class="modal-body">
        <!-- Import Options -->
        <div class="import-options">
          <div 
            class="option-card" 
            :class="{ active: selectedFormat === 'json' }"
            @click="selectedFormat = 'json'"
          >
            <iconify-icon icon="mdi:code-json" />
            <h6>JSON Format</h6>
            <p>Import from Authy, Google Authenticator exports</p>
          </div>
          <div 
            class="option-card" 
            :class="{ active: selectedFormat === 'csv' }"
            @click="selectedFormat = 'csv'"
          >
            <iconify-icon icon="mdi:file-delimited" />
            <h6>CSV Format</h6>
            <p>Import from spreadsheets or custom exports</p>
          </div>
        </div>

        <!-- Instructions -->
        <div class="import-instructions">
          <h6>Format Instructions</h6>
          <div class="code-preview">
            <pre><code>{{ formatTemplate }}</code></pre>
          </div>
          <small class="help-text">
            Required fields: <strong>name, secret, platform</strong><br>
            Optional fields: issuer, type, group, username, cookies
          </small>
        </div>

        <!-- File Upload -->
        <div 
          class="file-upload-area" 
          :class="{ 'dragover': isDragging }"
          @drop="handleFileDrop"
          @dragover="handleDragOver"
          @dragleave="isDragging = false"
        >
          <div v-if="!selectedFile" class="upload-placeholder">
            <iconify-icon icon="mdi:cloud-upload" />
            <p>Drop your {{ selectedFormat.toUpperCase() }} file here or click to browse</p>
            <small>Maximum file size: 10MB</small>
            <input 
              type="file" 
              ref="fileInput"
              :accept="selectedFormat === 'json' ? '.json' : '.csv'"
              @change="handleFileSelect"
              style="display: none"
            >
            <button class="btn btn-outline-primary mt-2" @click="browseFiles">
              Browse Files
            </button>
          </div>
          <div v-else class="upload-preview">
            <div class="file-info">
              <iconify-icon :icon="getFileIcon(selectedFile.name)" />
              <div>
                <div class="file-name">{{ selectedFile.name }}</div>
                <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
              </div>
            </div>
            <button class="btn-icon btn-danger" @click="removeFile">
              <iconify-icon icon="mdi:close" />
            </button>
          </div>
        </div>

        <!-- Progress Bar -->
        <div v-if="importing" class="progress-section">
          <div class="progress-info">
            <span>Processing accounts...</span>
            <span>{{ processedAccounts }}/{{ totalAccounts }}</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
        </div>

        <!-- Import Summary -->
        <div v-if="importResult" class="import-summary">
          <div class="summary-item success">
            <iconify-icon icon="mdi:check-circle" />
            <div>
              <strong>{{ importResult.success.length }}</strong>
              <span>Successfully Imported</span>
            </div>
          </div>
          <div v-if="importResult.failed.length > 0" class="summary-item failed">
            <iconify-icon icon="mdi:alert-circle" />
            <div>
              <strong>{{ importResult.failed.length }}</strong>
              <span>Failed</span>
            </div>
          </div>
        </div>

        <!-- Failed Items -->
        <div v-if="failedItems.length > 0" class="failed-list">
          <h6>Failed Imports</h6>
          <div v-for="(item, index) in failedItems" :key="index" class="failed-item">
            <div class="failed-name">{{ item.account.name || 'Unknown Account' }}</div>
            <div class="failed-error">{{ item.error }}</div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="close" :disabled="importing">
          Cancel
        </button>
        <button 
          class="btn btn-primary" 
          :disabled="!selectedFile || importing"
          @click="processImport"
        >
          <iconify-icon v-if="importing" icon="mdi:loading" class="animate-spin" />
          <span>{{ importing ? 'Importing...' : 'Import Accounts' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

// @ts-ignore - Your existing JS engine
import { BulkImportManager } from '@/engines/BulkImportManager'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'import', accounts: any[]): void
}>()

const bulkImportManager = new BulkImportManager()

const selectedFormat = ref<'json' | 'csv'>('json')
const selectedFile = ref<File | null>(null)
const isDragging = ref(false)
const importing = ref(false)
const importResult = ref<any>(null)
const failedItems = ref<Array<{ account: any; error: string }>>([])
const processedAccounts = ref(0)
const totalAccounts = ref(0)
const fileInput = ref<HTMLInputElement>()

const formatTemplate = computed(() => {
  return bulkImportManager.getImportTemplate(selectedFormat.value)
})

const progressPercentage = computed(() => {
  if (totalAccounts.value === 0) return 0
  return (processedAccounts.value / totalAccounts.value) * 100
})

// Reset when modal closes
watch(() => props.show, (newVal) => {
  if (!newVal) {
    resetModal()
  }
})

const resetModal = () => {
  selectedFile.value = null
  importResult.value = null
  failedItems.value = []
  processedAccounts.value = 0
  totalAccounts.value = 0
  importing.value = false
}

const browseFiles = () => {
  fileInput.value?.click()
}

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files?.[0]) {
    selectedFile.value = target.files[0]
  }
}

const handleDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = true
}

const handleFileDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragging.value = false
  
  const files = event.dataTransfer?.files
  if (files?.[0]) {
    selectedFile.value = files[0]
  }
}

const removeFile = () => {
  selectedFile.value = null
  importResult.value = null
  failedItems.value = []
  processedAccounts.value = 0
  totalAccounts.value = 0
}

const getFileIcon = (filename: string) => {
  if (filename.endsWith('.json')) return 'mdi:code-json'
  if (filename.endsWith('.csv')) return 'mdi:file-delimited'
  return 'mdi:file'
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const processImport = async () => {
  if (!selectedFile.value) return
  
  importing.value = true
  importResult.value = null
  failedItems.value = []
  processedAccounts.value = 0
  totalAccounts.value = 0

  try {
    // Step 1: Process file using your engine
    const accounts = await bulkImportManager.processFile(selectedFile.value)
    totalAccounts.value = accounts.length

    // Step 2: Process in batches with progress using your engine
    const result = await bulkImportManager.processInBatches(
      accounts,
      (processed: number, total: number) => {
        processedAccounts.value = processed
        totalAccounts.value = total
      }
    )

    importResult.value = result
    failedItems.value = result.failed

    // Step 3: Emit successful accounts
    if (result.success.length > 0) {
      emit('import', result.success)
      
      if (result.failed.length > 0) {
        // Some accounts failed
        setTimeout(() => {
          alert(`Imported ${result.success.length} accounts successfully. ${result.failed.length} accounts failed.`)
        }, 500)
      } else {
        // All accounts succeeded
        setTimeout(() => {
          alert(`Successfully imported ${result.success.length} accounts!`)
          close()
        }, 500)
      }
    } else {
      // All accounts failed
      alert('No accounts were imported. Please check the file format and try again.')
    }

  } catch (error) {
    console.error('Import failed:', error)
    alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  } finally {
    importing.value = false
  }
}

const close = () => {
  if (!importing.value) {
    resetModal()
    emit('close')
  }
}
</script>

<style scoped>
/* Progress Bar Styles */
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

/* Import Options Grid */
.import-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.option-card {
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: var(--transition-fast);
  background: var(--bg-card);
}

.option-card:hover {
  border-color: var(--accent-primary);
  transform: translateY(-2px);
}

.option-card.active {
  border-color: var(--accent-primary);
  background: rgba(59, 130, 246, 0.1);
}

/* Instructions Section */
.import-instructions {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 1rem;
  border: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
}

.code-preview {
  background: rgba(0, 0, 0, 0.3);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin: 0.5rem 0;
  max-height: 200px;
  overflow-y: auto;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* File Upload Area */
.file-upload-area {
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-md);
  padding: 2rem;
  text-align: center;
  transition: var(--transition-fast);
  margin-bottom: 1.5rem;
  cursor: pointer;
}

.file-upload-area.dragover {
  border-color: var(--accent-primary);
  background: rgba(59, 130, 246, 0.05);
}

.upload-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 1rem;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.file-name {
  font-weight: 600;
  color: var(--text-primary);
}

.file-size {
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* Import Summary */
.import-summary {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--radius-md);
  background: var(--bg-card);
}

.summary-item.success {
  border-left: 4px solid var(--success);
}

.summary-item.failed {
  border-left: 4px solid var(--danger);
}

.summary-item strong {
  font-size: 1.5rem;
  display: block;
}

/* Failed Items List */
.failed-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-card);
}

.failed-list h6 {
  padding: 1rem;
  margin: 0;
  border-bottom: 1px solid var(--border-color);
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-primary);
}

.failed-item {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
}

.failed-item:last-child {
  border-bottom: none;
}

.failed-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.failed-error {
  color: var(--danger);
  font-size: 0.875rem;
}

/* Helper Classes */
.help-text {
  color: var(--text-muted);
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: block;
}

.mt-2 {
  margin-top: 0.5rem;
}

/* Modal Specific */
.modal-content.xl {
  max-width: 600px;
}

/* Button Variants */
.btn-outline-primary {
  background: transparent;
  border: 1px solid var(--accent-primary);
  color: var(--accent-primary);
  transition: var(--transition-fast);
}

.btn-outline-primary:hover {
  background: var(--accent-primary);
  color: white;
}

.btn-icon {
  background: transparent;
  border: none;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-fast);
}

.btn-danger {
  color: var(--danger);
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Animations */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .import-options {
    grid-template-columns: 1fr;
  }
  
  .import-summary {
    grid-template-columns: 1fr;
  }
  
  .file-upload-area {
    padding: 1.5rem;
  }
  
  .upload-preview {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .file-info {
    flex-direction: column;
    text-align: center;
  }
  
  .modal-content.xl {
    margin: 1rem;
    max-width: calc(100% - 2rem);
  }
}

@media (max-width: 480px) {
  .import-instructions {
    padding: 0.75rem;
  }
  
  .code-preview {
    padding: 0.75rem;
    font-size: 0.75rem;
  }
  
  .file-upload-area {
    padding: 1rem;
  }
  
  .summary-item {
    padding: 0.75rem;
  }
  
  .summary-item strong {
    font-size: 1.25rem;
  }
}

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
  .file-upload-area.dragover {
    background: rgba(59, 130, 246, 0.1);
  }
  
  .option-card.active {
    background: rgba(59, 130, 246, 0.15);
  }
  
  .code-preview {
    background: rgba(0, 0, 0, 0.5);
  }
}

/* Accessibility improvements */
.option-card:focus {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.file-upload-area:focus {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

/* Loading states */
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* Smooth transitions for all interactive elements */
.option-card,
.file-upload-area,
.btn,
.btn-icon {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Scrollbar styling for code preview and failed list */
.code-preview::-webkit-scrollbar,
.failed-list::-webkit-scrollbar {
  width: 6px;
}

.code-preview::-webkit-scrollbar-track,
.failed-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.code-preview::-webkit-scrollbar-thumb,
.failed-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.code-preview::-webkit-scrollbar-thumb:hover,
.failed-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>