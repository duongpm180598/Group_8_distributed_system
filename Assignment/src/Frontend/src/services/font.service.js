const API_KEY = 'AIzaSyAeJS8V09qun8c62S14iE86RAfJb32_sP4'
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
