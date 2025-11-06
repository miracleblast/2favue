import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Use explicit RouteRecordRaw type for routes array
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'license',
    component: () => import('@/views/LicenseView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/accounts',
    name: 'accounts',
    component: () => import('@/views/AccountsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'users', 
    component: () => import('@/views/UsersView.vue'),
    meta: { requiresAuth: true }
  },
  {
  path: '/api-keys',
  name: 'api-keys',
  component: () => import('@/views/ApiKeysView.vue'),
  meta: { requiresAuth: true }
},
{
  path: '/security-logs',
  name: 'security-logs',
  component: () => import('@/views/SecurityLogsView.vue'),
  meta: { requiresAuth: true }
},
{
  path: '/settings',
  name: 'settings',
  component: () => import('@/views/SettingsView.vue'),
  meta: { requiresAuth: true }
},
  // Fix catch-all route with proper typing
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth) {
    if (authStore.isAuthenticated || authStore.checkExistingLicense()) {
      next()
    } else {
      next('/')
    }
  } else {
    if (to.name === 'license' && (authStore.isAuthenticated || authStore.checkExistingLicense())) {
      next('/dashboard')
    } else {
      next()
    }
  }
})

// ADD THIS EXPORT - THIS WAS MISSING!
export default router