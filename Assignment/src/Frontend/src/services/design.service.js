import axiosInstance from './api'

const DESIGN_API_SUFFIX = 'designs'

export const getDesigns = async () => {
  try {
    const response = await axiosInstance.get(`/${DESIGN_API_SUFFIX}`)
    return response.data
  } catch (error) {
    console.error('get design error:', error.response ? error.response.data : error.message)
    throw error
  }
}

export const getDesignById = async (id) => {
    try {
      const response = await axiosInstance.get(`/${DESIGN_API_SUFFIX}/${id}`)
      return response.data
    } catch (error) {
      console.error('get design error:', error.response ? error.response.data : error.message)
      throw error
    }
  }

export const createOrUpdateDesign = async (payload) => {
  try {
    const response = await axiosInstance.post(`/${DESIGN_API_SUFFIX}`, payload)
    return response.data
  } catch (error) {
    console.error('Create design error:', error.response ? error.response.data : error.message)
    throw error
  }
}
