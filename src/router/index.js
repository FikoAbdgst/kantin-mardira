import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'
import PosView from '@/views/PosView.vue'
import AdminView from '@/views/AdminView.vue'
import ManagerView from '@/views/ManagerView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/pos',
      name: 'pos',
      component: PosView,
      meta: { requiresAuth: true, allowedRoles: ['cashier', 'admin'] },
    },
    {
      path: '/manager',
      name: 'manager',
      component: ManagerView,
      meta: { requiresAuth: true, allowedRoles: ['manager', 'admin'] },
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
      meta: { requiresAuth: true, allowedRoles: ['admin'] },
    }
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const userRole = authStore.user?.role

  if (to.meta.requiresAuth && !authStore.token) {
    return next({ name: 'login' })
  }

  if (to.name === 'login' && authStore.token) {
    if (userRole === 'manager') return next({ name: 'manager' })
    if (userRole === 'admin') return next({ name: 'admin' })
    return next({ name: 'pos' })
  }

  if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(userRole)) {
    alert('Akses Ditolak: Anda tidak memiliki wewenang untuk halaman ini.')
    if (userRole === 'manager') return next({ name: 'manager' })
    if (userRole === 'admin') return next({ name: 'admin' })
    return next({ name: 'pos' })
  }

  next()
})

export default router
