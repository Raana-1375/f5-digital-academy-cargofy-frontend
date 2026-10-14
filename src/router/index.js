import { createRouter, createWebHistory } from 'vue-router'

import SignInView from '../views/SignInView.vue'
import CreateAccountView from '../views/CreateAccountView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: SignInView },
    { path: '/register', name: 'register', component: CreateAccountView },
  ],
})

export default router
