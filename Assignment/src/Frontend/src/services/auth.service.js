import axiosInstance from './api'

const AUTH_API_SUFFIX = 'auth'

export const login = async (username, password) => {
  try {
    const response = await axiosInstance.post(`/${AUTH_API_SUFFIX}/sign-in`, {
      username,
      password,
    })

    if (response.data) {
      const { access_token, username, avatar = '' } = response.data
      localStorage.setItem('username', JSON.stringify(username))
      localStorage.setItem('avatar', JSON.stringify(avatar))
      localStorage.setItem('accessToken', JSON.stringify(access_token))
    }
    return response.data
  } catch (error) {
    console.log(error)
    console.error('Login error:', error.response ? error.response.data : error.message)
    throw error
  }
}

export const register = async (payload) => {
  try {
    const response = await axiosInstance.post(`/${AUTH_API_SUFFIX}/sign-up`, payload)
    return response.data
  } catch (error) {
    console.log(error)
    console.error('Register error:', error.response ? error.response.data : error.message)
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
