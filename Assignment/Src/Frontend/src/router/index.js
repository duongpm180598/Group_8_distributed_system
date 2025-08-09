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
      path: '/login',
      name: 'Đăng nhập',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'Đăng ký',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/design/:id',
      name: 'Design',
      component: () => import('../views/DesignView.vue'),
      props: true,
    },
  ],
})

router.beforeEach(async (to) => {
  const isAuthenticated = localStorage.getItem('accessToken')
  const publicPages = ['/login', '/register']
  const authRequired = !publicPages.includes(to.path)
  if (authRequired && !isAuthenticated) {
    return '/login'
  }
})

export default router
