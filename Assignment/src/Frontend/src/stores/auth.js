import { defineStore } from 'pinia'

import { login } from '@/services/auth.service'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')),
    returnUrl: null,
  }),
  actions: {
    async login(username, password) {
      try {
        const res = await login(username, password)
        this.user = res
        return res
      } catch (error) {}
    },
    logout() {
      this.user = null
      localStorage.removeItem('username')
      localStorage.removeItem('accessToken')
      router.push('/login')
    },
  },
  getters: {
    getUser: (state) => state.user,
  },
})
