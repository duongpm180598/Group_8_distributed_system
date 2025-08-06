<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <h2 class="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">Đăng ký</h2>
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
              class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              :class="{ 'is-invalid': errors.username }"
            />
            <div class="invalid-feedback text-red-600 text-sm mt-1">{{ errors.username }}</div>
          </div>
        </div>

        <div>
          <label for="name" class="block text-sm/6 font-medium text-gray-900">Họ và tên</label>
          <div class="mt-2">
            <Field
              name="name"
              type="text"
              class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              :class="{ 'is-invalid': errors.name }"
            />
            <div class="invalid-feedback text-red-600 text-sm mt-1">{{ errors.name }}</div>
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
              class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            />
            <div class="invalid-feedback text-red-600 text-sm mt-1">{{ errors.password }}</div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label for="cfmPassword" class="block text-sm/6 font-medium text-gray-900"
              >Xác nhận mật khẩu</label
            >
          </div>
          <div class="mt-2">
            <Field
              name="cfmPassword"
              type="password"
              id="cfmPassword"
              autocomplete="current-password"
              :class="{ 'is-invalid': errors.cfmPassword }"
              class="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            />
            <div class="invalid-feedback text-red-600 text-sm mt-1">{{ errors.cfmPassword }}</div>
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label for="avatar" class="block text-sm/6 font-medium text-gray-900"
              >Ảnh đại diện</label
            >
          </div>
          <div class="mt-2">
            <Field
              name="avatar"
              type="file"
              id="avatar"
              autocomplete="current-password"
              @change="handleChangeFile($event)"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 mt-3 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            :disabled="isSubmitting"
          >
            <span v-show="isSubmitting" class="spinner-border spinner-border-sm mr-1"></span>
            Tạo tài khoản
          </button>
        </div>

        <p class="mt-5 text-center text-sm/6 text-[#111113]">
          Nếu đã có tài khoản?
          {{ ' ' }}
          <a :href="'/login'" class="font-semibold text-indigo-400 hover:text-indigo-300"
            >Đăng nhập</a
          >
        </p>
      </Form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue' // Import defineComponent for proper structure
import { useAuthStore } from '@/stores/auth' // Ensure this path is correct
import { Field, Form } from 'vee-validate'
import * as Yup from 'yup'
import router from '@/router'
import { uploadFile } from '@/services/image.service'

export default defineComponent({
  components: {
    Form,
    Field,
  },
  setup() {
    const authStore = useAuthStore()
    const avatarUrl = ref('')

    onMounted(() => {
      const isAuthenticated = localStorage.getItem('accessToken')

      if (isAuthenticated) {
        router.push('/')
      }
    })

    const schema = Yup.object().shape({
      name: Yup.string().required('Họ và tên là bắt buộc'),
      username: Yup.string().required('Tên tài khoản là bắt buộc.'),
      password: Yup.string().required('Mật khẩu là bắt buộc.'),
      cfmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Xác nhận mật khẩu không khớp.')
        .required('Xác nhận tài khoản là bắt buộc'),
      avatar: Yup.string(),
    })

    async function onSubmit(values: {
      username?: string
      password?: string
      name?: string
      cfmPassword?: string
      avatar?: string
    }) {
      const registerPayload = {
        ...values,
        avatar: avatarUrl.value,
      }
      try {
        const res = await authStore.register(registerPayload)
        if (res) {
          router.push('/login')
        }
      } catch (error) {
        console.error('Lỗi đăng ký:', error)
        alert('Đã xảy ra lỗi trong quá trình đăng ký. Vui lòng thử lại.')
      }
    }

    const handleChangeFile = async (event) => {
      const file = event.target.files[0]
      const avatar = await uploadFile(file)
      avatarUrl.value = avatar
    }

    return {
      schema,
      onSubmit,
      handleChangeFile,
    }
  },
})
</script>
