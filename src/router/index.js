import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import SignInView from '@/views/SignInView.vue'
import CreateAccountView from '@/views/CreateAccountView.vue'
import DashboardView from '@/views/DashboardView.vue'
import ShipmentsView from '@/views/ShipmentsView.vue'
import ShipmentDetailView from '@/views/ShipmentDetailView.vue'
import NewShipmentView from '@/views/NewShipmentView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: SignInView },
    { path: '/register', name: 'register', component: CreateAccountView },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/shipments',
      name: 'shipments',
      component: ShipmentsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/shipments/new',
      name: 'new-shipment',
      component: NewShipmentView,
      meta: { requiresAuth: true, roles: ['OPERATOR', 'ADMIN'] },
    },
    {
      path: '/shipments/:id(\\d+)',
      name: 'shipment-detail',
      component: ShipmentDetailView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login' }
  }
  if (to.meta.roles && !to.meta.roles.includes(auth.role)) {
    return { name: 'dashboard' }
  }
})

export default router
