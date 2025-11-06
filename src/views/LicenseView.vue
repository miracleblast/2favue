<template>
  <div class="auth-container">
    <!-- Particle Background -->
    
    <!-- Mobile-App Style Card -->
    <div class="auth-card">
      <div class="auth-header">
        <iconify-icon icon="mdi:shield-account" class="auth-icon" />
        <h1 class="auth-title">AuthFlow Pro</h1>
        <p class="auth-subtitle">Activate Your License</p>
      </div>

      <!-- License Form -->
      <form @submit.prevent="activateLicense" class="auth-form">
        <div class="form-group">
          <label class="form-label">License Key</label>
          <input 
            v-model="licenseKey" 
            type="text" 
            class="form-control"
            placeholder="AUTHFLOW-DEMO-1234"
            required
            :disabled="loading"
          >
        </div>

        <button 
          type="submit" 
          :disabled="loading"
          class="btn btn-primary"
        >
          <iconify-icon v-if="!loading" icon="mdi:key" />
          <iconify-icon v-if="loading" icon="mdi:loading" class="animate-spin" />
          <span>{{ loading ? 'Activating...' : 'Activate License' }}</span>
        </button>
      </form>

      <!-- Demo Keys Section -->
      <div class="license-demo">
        <h6 class="demo-title">
          <iconify-icon icon="mdi:rocket-launch" />
          Demo License Keys
        </h6>
        <p class="demo-description">Try these demo keys to test the app:</p>
        <div class="demo-keys">
          <div class="demo-key-group" @click="licenseKey = 'AUTHFLOW-DEMO-1234'">
            <code class="demo-key">AUTHFLOW-DEMO-1234</code>
            <span class="demo-plan">Professional Plan</span>
          </div>
          <div class="demo-key-group" @click="licenseKey = 'AUTHFLOW-TEST-5678'">
            <code class="demo-key">AUTHFLOW-TEST-5678</code>
            <span class="demo-plan">Starter Plan</span>
          </div>
        </div>
        <div class="demo-actions">
          <a href="#" class="auth-link" @click.prevent="showPricing">Need a license? View Pricing</a>
        </div>
      </div>

      <!-- Privacy Notice -->
      <div class="privacy-notice">
        <iconify-icon icon="mdi:shield-check" />
        <span>Privacy First: No data collection. Everything stays on your device.</span>
      </div>
    </div>

    <!-- Global Footer -->
    <footer class="global-auth-footer">
      <div class="footer-content">
        <div class="footer-links">
          <a href="#" @click.prevent="showTerms">Terms of Service</a>
          <a href="#" @click.prevent="showPrivacy">Privacy Policy</a>
          <a href="mailto:support@harambee.com">Support</a>
        </div>
        <div class="footer-copyright">
          &copy; 2025 AuthFlow Pro. All rights reserved by Harambee
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import ParticlesBackground from '@/components/ParticlesBackground.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const licenseKey = ref('AUTHFLOW-DEMO-1234') // Pre-fill with demo key
const loading = ref(false)

const activateLicense = async () => {
  if (!licenseKey.value.trim()) {
    alert('Please enter a license key')
    return
  }
  
  loading.value = true
  console.log('🔑 Attempting to validate license:', licenseKey.value)
  
  try {
    // Use the auth store to validate license
    const success = await authStore.validateLicense(licenseKey.value.trim())
    console.log('✅ License validation result:', success)
    
    if (success) {
      console.log('🎉 License activated! Redirecting to dashboard...')
      // Check if user is authenticated
      console.log('🔐 Auth store state:', {
        isAuthenticated: authStore.isAuthenticated,
        licenseData: authStore.licenseData
      })
      router.push('/dashboard')
    } else {
      console.log('❌ License validation failed')
      alert('❌ Invalid license key. Please use AUTHFLOW-DEMO-1234 or AUTHFLOW-TEST-5678')
    }
  } catch (error) {
    console.error('💥 License activation error:', error)
    alert('An error occurred during license activation. Please try again.')
  } finally {
    loading.value = false
  }
}

const showPricing = () => {
  alert('Pricing Plans:\n\n• Starter: $9.99/month\n• Professional: $15.99/month\n• Enterprise: $49.99/month')
}

const showTerms = () => {
  alert('Terms of Service - This is a demo application.\n\nAll rights reserved by Harambee.')
}

const showPrivacy = () => {
  alert('Privacy Policy - Your data stays on your device. No tracking.\n\nWe believe in privacy-first development.')
}
</script>

<style scoped>
/* FIXED: Container for perfect centering */
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  padding-bottom: 100px; /* Space for footer */
  position: relative;
}

/* Mobile-App Style Card */
.auth-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 2.5rem;
  width: 100%;
  max-width: 400px; /* Fixed width like mobile app */
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
  animation: slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  margin: 0 auto; /* Center the card */
  z-index: 2; /* Ensure card is above particles */
}

.auth-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6);
  background-size: 200% 100%;
  animation: gradientShift 3s ease infinite;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-icon {
  font-size: 3.5rem;
  color: #3b82f6;
  margin-bottom: 1rem;
  display: block;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.auth-subtitle {
  color: #94a3b8;
  font-size: 1rem;
  font-weight: 400;
}

/* Form Styles */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #e2e8f0;
  font-size: 0.9rem;
}

.form-control {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 1rem;
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.form-control:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: rgba(255, 255, 255, 0.12);
}

.form-control::placeholder {
  color: #64748b;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
  color: white;
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(59, 130, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Demo Keys Section */
.license-demo {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1.5rem;
  margin: 2rem 0;
  border-left: 4px solid #3b82f6;
}

.demo-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #3b82f6;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}

.demo-description {
  color: #94a3b8;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.demo-keys {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.demo-key-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.demo-key-group:hover {
  background: rgba(0, 0, 0, 0.4);
  border-color: #3b82f6;
}

.demo-key {
  color: #3b82f6;
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 600;
  font-size: 0.85rem;
}

.demo-plan {
  color: #64748b;
  font-size: 0.8rem;
}

.demo-actions {
  text-align: center;
}

.auth-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.auth-link:hover {
  color: #60a5fa;
}

/* Privacy Notice */
.privacy-notice {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 12px;
  color: #4ade80;
  font-size: 0.8rem;
  text-align: center;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

/* Animations */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* FIXED: Footer positioning */
.global-auth-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 0;
  z-index: 1000;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.footer-links a {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.8rem;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #3b82f6;
}

.footer-copyright {
  color: #64748b;
  font-size: 0.7rem;
}

/* Responsive */
@media (max-width: 768px) {
  .auth-container {
    padding: 1rem;
    padding-bottom: 80px;
  }
  
  .auth-card {
    padding: 2rem;
    max-width: 100%;
  }
  
  .footer-links {
    gap: 1rem;
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 1.5rem;
  }
  
  .auth-title {
    font-size: 1.75rem;
  }
}
</style>