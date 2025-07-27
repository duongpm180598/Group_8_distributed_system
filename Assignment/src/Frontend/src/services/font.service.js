const API_KEY = ''
const apiUrl = `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}&sort=popularity`

export async function getGoogleFonts() {
  try {
    const response = await fetch(apiUrl)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    if (data.items && Array.isArray(data.items)) {
      return data.items.slice(0, 50)
    } else {
      return []
    }
  } catch (error) {
    console.error('Error fetching Google Fonts:', error)
    return []
  }
}
