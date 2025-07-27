import axiosInstance from './api'

const DESIGN_API_SUFFIX = 'design'

export const createDesign = async (payload) => {
  try {
    const response = await axiosInstance.post(`/${DESIGN_API_SUFFIX}/create`, payload)
  } catch (error) {
    console.log(error)
    console.error('Create design error:', error.response ? error.response.data : error.message)
    throw error
  }
}
