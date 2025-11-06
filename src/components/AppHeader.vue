<template>
  <header class="app-header">
    <div class="app-container">
      <div class="header-content">
        <!-- Logo -->
        <router-link to="/dashboard" class="logo">
          <iconify-icon icon="mdi:shield-account" />
          <span>AuthFlow Pro</span>
        </router-link>
        
        <!-- Navigation -->
        <nav class="nav-menu">
          <router-link to="/dashboard" class="nav-link">
            <iconify-icon icon="mdi:view-dashboard" />
            <span>Dashboard</span>
          </router-link>
          <router-link to="/accounts" class="nav-link">
            <iconify-icon icon="mdi:account-multiple" />
            <span>Accounts</span>
          </router-link>
          <router-link to="/users" class="nav-link">
            <iconify-icon icon="mdi:account-group" />
            <span>Users</span>
          </router-link>
          <router-link to="/api-keys" class="nav-link">
            <iconify-icon icon="mdi:key" />
            <span>API Keys</span>
          </router-link>
          <router-link to="/security-logs" class="nav-link">
            <iconify-icon icon="mdi:shield-account" />
            <span>Security Logs</span>
          </router-link>
        </nav>
        
        <!-- User Menu -->
        <div class="user-menu">
          <div class="dropdown">
            <button class="user-avatar" @click="toggleDropdown">
              <span>{{ userInitials }}</span>
            </button>
            <div v-if="dropdownOpen" class="dropdown-menu">
              <div class="dropdown-item-text">
                <small>Plan: {{ userPlan }}</small>
              </div>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item" @click="goToSettings">
                <iconify-icon icon="mdi:cog" />
                <span>Settings</span>
              </button>
              <button class="dropdown-item text-warning" @click="showPricingModal">
                <iconify-icon icon="mdi:arrow-up" />
                <span>Upgrade Plan</span>
              </button>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item text-danger" @click="logout">
                <iconify-icon icon="mdi:logout" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const dropdownOpen = ref(false)

const userInitials = computed(() => 'JD') // Replace with actual user data
const userPlan = computed(() => authStore.licenseData?.plan || 'Professional')

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const goToSettings = () => {
  dropdownOpen.value = false
  router.push('/settings')
}

const showPricingModal = () => {
  dropdownOpen.value = false
  alert('Pricing modal would open here')
}

const logout = () => {
  dropdownOpen.value = false
  authStore.logout()
  router.push('/')
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.user-menu')) {
    dropdownOpen.value = false
  }
}

// Add event listener
import { onMounted, onUnmounted } from 'vue'
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.app-header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.app-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  text-decoration: none;
  white-space: nowrap;
}

.logo iconify-icon {
  font-size: 1.5rem;
  color: var(--accent-primary);
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex: 1;
  justify-content: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-secondary);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  font-weight: 500;
  white-space: nowrap;
}

.nav-link:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.nav-link.router-link-active {
  color: var(--accent-primary);
  background: rgba(59, 130, 246, 0.1);
}

.user-menu {
  position: relative;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent-primary), var(--primary-dark));
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 0.5rem;
  min-width: 200px;
  box-shadow: var(--shadow-xl);
  margin-top: 0.5rem;
  z-index: 1000;
}

.dropdown-item-text {
  padding: 0.5rem 1rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.5rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: var(--text-primary);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.dropdown-item.text-warning {
  color: var(--warning);
}

.dropdown-item.text-danger {
  color: var(--danger);
}

.dropdown-item.text-danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Responsive */
@media (max-width: 1024px) {
  .nav-menu {
    gap: 1rem;
  }
  
  .nav-link span {
    display: none;
  }
}

@media (max-width: 768px) {
  .header-content {
    gap: 1rem;
  }
  
  .nav-menu {
    gap: 0.5rem;
  }
  
  .nav-link {
    padding: 0.5rem;
  }
  
  .logo span {
    display: none;
  }
}
</style>
