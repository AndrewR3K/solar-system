import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/system',
      children: [{ path: 'sol', name: 'sol', component: () => import('../views/SolSystem.vue') }],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'ErrorView',
      component: () => import('../views/ErrorView.vue'),
    },
  ],
})

export default router
