import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/records',
      name: 'records',
      component: () => import('../views/RecordView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/StaffLoginView.vue')
    }
  ]
})

export default router
