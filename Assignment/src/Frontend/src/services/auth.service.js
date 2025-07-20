import axiosInstance from './api'

const AUTH_API_SUFFIX = 'auth/'

export const login = async (username, password) => {
  try {
    const response = await axiosInstance.post(`/sign-in`, {
      username,
      password,
    })

    if (response.data.accessToken) {
      localStorage.setItem('user', JSON.stringify(response.data))
    }
    return response.data
  } catch (error) {
    console.log(error)
    console.error('Login error:', error.response ? error.response.data : error.message)
    throw error
  }
}

export const logout = () => {
  localStorage.removeItem('user')
  // Nếu có thể, bạn cũng có thể gọi API logout ở đây để invalidate token trên server
  // try {
  //   await axiosInstance.post(AUTH_API_SUFFIX + 'signout');
  // } catch (error) {
  //   console.error("Logout API error:", error);
  // }
}

export const getCurrentUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}
