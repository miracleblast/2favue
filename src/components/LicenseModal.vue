<template>
  <div v-if="show" class="modal-overlay" @click="$emit('update:show', false)">
    <div class="modal-content license-modal" @click.stop>
      <div class="modal-header">
        <h3>License Details</h3>
        <button class="modal-close" @click="$emit('update:show', false)">
          <iconify-icon icon="mdi:close" />
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Plan Comparison -->
        <div class="plan-comparison">
          <h4>Available Plans</h4>
          <div class="plans-grid">
            <div 
              v-for="plan in availablePlans" 
              :key="plan.id"
              class="plan-card"
              :class="{ 
                'current-plan': plan.id === currentLicense?.plan,
                'plan-free': plan.id === 'free',
                'plan-starter': plan.id === 'starter', 
                'plan-professional': plan.id === 'professional',
                'plan-enterprise': plan.id === 'enterprise'
              }"
            >
              <div class="plan-header">
                <h5>{{ plan.name }}</h5>
                <div class="plan-price">
                  {{ formatPrice(plan.price, selectedCurrency) }}<span>/month</span>
                </div>
                <p class="plan-desc">{{ plan.description }}</p>
              </div>
              
              <div class="plan-features">
                <div 
                  v-for="feature in plan.features" 
                  :key="feature"
                  class="plan-feature"
                >
                  <iconify-icon icon="mdi:check" />
                  <span>{{ feature }}</span>
                </div>
              </div>
              
              <div class="plan-badge" v-if="plan.id === currentLicense?.plan">
                Current Plan
              </div>
            </div>
          </div>
        </div>

        <!-- Current License Details -->
        <div class="current-license-details">
          <h4>Your License Information</h4>
          <div class="details-grid">
            <div class="detail-item">
              <label>License Key:</label>
              <code class="license-key-modal">{{ licenseKey }}</code>
            </div>
            <div class="detail-item">
              <label>Plan:</label>
              <span>{{ licensePlanName }}</span>
            </div>
            <div class="detail-item">
              <label>Status:</label>
              <span :class="licenseStatusClass">{{ formattedLicenseStatus }}</span>
            </div>
            <div class="detail-item">
              <label>Expires in:</label>
              <span>{{ daysUntilExpiry }} days</span>
            </div>
            <div class="detail-item">
              <label>Your Role:</label>
              <span>{{ userRole }}</span>
            </div>
            <div class="detail-item">
              <label>Account Limit:</label>
              <span>{{ accountLimit }} accounts</span>
            </div>
            <div class="detail-item">
              <label>Team Limit:</label>
              <span>{{ teamLimit }} members</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-outline-primary" @click="$emit('update:show', false)">
          Close
        </button>
        <button class="btn btn-primary" @click="manageSubscription">
          Upgrade Plan
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
// @ts-ignore
import { CurrencyService } from '@/engines/CurrencyService'

interface Props {
  show: boolean
}

interface Emits {
  (e: 'update:show', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const currencyService = new CurrencyService()
const selectedCurrency = ref('USD')

// Get license data from auth store
const currentLicense = computed(() => authStore.licenseData)
const licenseKey = computed(() => currentLicense.value?.key || 'No License')
const licensePlanName = computed(() => authStore.getPlanName?.(currentLicense.value?.plan) || 'Free')
const licenseStatus = computed(() => authStore.getLicenseStatus?.() || 'active')
const daysUntilExpiry = computed(() => authStore.getDaysUntilExpiry?.() || 30)
const userRole = computed(() => currentLicense.value?.isAdmin ? 'Administrator' : 'User')
const accountLimit = computed(() => authStore.getAccountLimit?.() || 10)
const teamLimit = computed(() => authStore.getTeamLimit?.() || 5)

const licenseStatusClass = computed(() => ({
  'text-success': licenseStatus.value === 'active',
  'text-warning': licenseStatus.value === 'warning' || licenseStatus.value === 'expiring',
  'text-danger': licenseStatus.value === 'expired'
}))

const formattedLicenseStatus = computed(() => {
  const status = licenseStatus.value
  return status.charAt(0).toUpperCase() + status.slice(1)
})

// Available Plans
const availablePlans = computed(() => [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    description: 'Ideal for personal accounts',
    features: [
      '10 Accounts',
      '1 Team Member',
      'Basic Security',
      'Community Support'
    ]
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 9.99,
    description: 'Perfect for freelancers',
    features: [
      '50 Accounts',
      '3 Team Members',
      'License Generation',
      'Email Support'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 25.99,
    description: 'Ideal for agencies',
    features: [
      '1000 Accounts',
      '50 Team Members',
      'API Access',
      'Advanced Security',
      'License Generation'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49.99,
    description: 'For large teams',
    features: [
      '9999 Accounts',
      '100 Team Members',
      'Full API Access',
      'Advanced Security',
      'Priority Support',
      'License Generation'
    ]
  }
])

const formatPrice = (price: number, currency: string) => {
  return currencyService.formatPrice(price, currency)
}

const manageSubscription = () => {
  window.open('https://harambe.o/pricing/authflowpro', '_blank')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.license-modal {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-sm);
  transition: var(--transition-fast);
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.modal-body {
  padding: 2rem;
}

.plan-comparison {
  margin-bottom: 2rem;
}

.plan-comparison h4 {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.plan-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  position: relative;
  transition: var(--transition-fast);
}

.plan-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.2);
}

.current-plan {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.plan-free {
  border-left: 4px solid #64748b;
}

.plan-starter {
  border-left: 4px solid #10b981;
}

.plan-professional {
  border-left: 4px solid #3b82f6;
}

.plan-enterprise {
  border-left: 4px solid #8b5cf6;
}

.plan-header h5 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.plan-price {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.plan-price span {
  font-size: 0.875rem;
  color: var(--text-muted);
  font-weight: 500;
}

.plan-desc {
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

.plan-features {
  margin-bottom: 1rem;
}

.plan-feature {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
}

.plan-feature iconify-icon {
  color: var(--success);
  font-size: 1rem;
}

.plan-badge {
  position: absolute;
  top: -10px;
  right: 1rem;
  background: var(--accent-primary);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
}

.current-license-details {
  margin-top: 2rem;
}

.current-license-details h4 {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-md);
}

.detail-item label {
  font-weight: 600;
  color: var(--text-muted);
}

.license-key-modal {
  font-family: var(--font-mono);
  background: rgba(0, 0, 0, 0.3);
  padding: 0.5rem 0.75rem;
  border-radius: var(--radius-sm);
  color: var(--accent-primary);
  font-size: 0.875rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--border-color);
}

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

.btn-outline-primary {
  background: transparent;
  border: 1px solid var(--accent-primary);
  color: var(--accent-primary);
}

.btn-outline-primary:hover {
  background: var(--accent-primary);
  color: white;
}

.text-success {
  color: var(--success) !important;
}

.text-warning {
  color: var(--warning) !important;
}

.text-danger {
  color: var(--danger) !important;
}

/* Responsive */
@media (max-width: 1024px) {
  .plans-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .modal-body {
    padding: 1.5rem;
  }
  
  .modal-header {
    padding: 1.5rem;
  }
  
  .modal-footer {
    padding: 1.5rem;
    flex-direction: column;
  }
  
  .plans-grid {
    grid-template-columns: 1fr;
  }
}
</style>