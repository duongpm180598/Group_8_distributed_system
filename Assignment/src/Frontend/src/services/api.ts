import axios from 'axios'

const API_BASE_URL = 'localhost:3000'

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Bạn có thể thêm các headers mặc định khác ở đây, ví dụ:
    // 'Accept': 'application/json',
  },
  timeout: 30000,
})

axiosInstance.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('accessToken'))
    if (user && user.accessToken) {
      config.headers.Authorization = `Bearer ${user.accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
)

export default axiosInstance
