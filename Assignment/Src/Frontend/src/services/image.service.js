import axios from 'axios'

const cloud_name = 'dcy7abcj4'
const upload_preset = 'kanva_clone'

export async function uploadFile(file) {
  if (!file) {
    return
  }
  const url = `https://api.cloudinary.com/v1_1/${cloud_name}/upload`

  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', upload_preset)

  try {
    const response = await axios.post(url, fd)

    const secureUrl = response.data.secure_url
    return secureUrl
  } catch (error) {
    console.error('Lỗi khi tải file:', error)
    if (error.response) {
      console.error('Lỗi:', error.message)
    }
    throw error
  }
}
