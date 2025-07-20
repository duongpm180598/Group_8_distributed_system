import { defineStore } from 'pinia'

import { login } from '@/services/auth.service'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')),
    returnUrl: null,
  }),
  actions: {
    async login(username, password) {
      try {
        const user = await login(username, password)
        this.user = user
        console.log(user)
        localStorage.setItem('user', JSON.stringify(user))
        router.push(this.returnUrl || '/')
      } catch (error) {}
    },
    logout() {
      this.user = null
      localStorage.removeItem('user')
      router.push('/login')
    },
  },
  getters: {
    getUser: (state) => state.user,
  },
})
