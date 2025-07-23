<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Đăng nhập</h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <Form @submit="onSubmit" :validation-schema="schema" v-slot="{ errors, isSubmitting }">
        <div>
          <label for="username" class="block text-sm/6 font-medium text-gray-900"
            >Tên tài khoản</label
          >
          <div class="mt-2">
            <Field
              name="username"
              type="text"
              class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              :class="{ 'is-invalid': errors.username }"
            />
            <div class="invalid-feedback text-red-600 text-sm mt-1">{{ errors.username }}</div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label for="password" class="block text-sm/6 font-medium text-gray-900">Mật khẩu</label>
          </div>
          <div class="mt-2">
            <Field
              name="password"
              type="password"
              id="password"
              autocomplete="current-password"
              :class="{ 'is-invalid': errors.password }"
              class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            />
            <div class="invalid-feedback text-red-600 text-sm mt-1">{{ errors.password }}</div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            :disabled="isSubmitting"
          >
            <span v-show="isSubmitting" class="spinner-border spinner-border-sm mr-1"></span>
            Đăng nhập
          </button>
        </div>
      </Form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue' // Import defineComponent for proper structure
import { useAuthStore } from '@/stores/auth' // Ensure this path is correct
import { Field, Form } from 'vee-validate'
import * as Yup from 'yup'
import router from '@/router'

export default defineComponent({
  components: {
    Form,
    Field,
  },
  setup() {
    const authStore = useAuthStore()

    onMounted(() => {
      const isAuthenticated = localStorage.getItem('accessToken')

      if (isAuthenticated) {
        router.push('/')
      }
    })

    const schema = Yup.object().shape({
      username: Yup.string().required('Tên tài khoản là bắt buộc.'),
      password: Yup.string().required('Mật khẩu là bắt buộc.'),
    })

    async function onSubmit(values: { username?: string; password?: string }) {
      const { username, password } = values
      try {
        const res = await authStore.login(username, password)
        if (res) {
          router.push('/')
        }
      } catch (error) {
        console.error('Lỗi đăng nhập:', error)
        alert('Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.')
      }
    }
    return {
      schema,
      onSubmit,
    }
  },
})
</script>
