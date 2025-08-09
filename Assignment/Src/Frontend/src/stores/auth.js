import { defineStore } from 'pinia'

import { login, register } from '@/services/auth.service'
import router from '@/router'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: JSON.parse(localStorage.getItem('accessToken')),
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
    async register(payload) {
      try {
        const res = await register(payload)
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
