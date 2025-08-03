<script setup>
import { RouterView } from 'vue-router'
import Header from './components/Header.vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
if (authStore.user) {
  router.push('/')
}
</script>

<template>
  <Header />
  <RouterView />
</template>
