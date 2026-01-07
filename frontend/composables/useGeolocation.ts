import { ref } from 'vue'

interface GeocodingResult {
  address: string
  latitude: number
  longitude: number
  formattedAddress?: string
}


export const useGeolocation = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)


  const geocodeAddress = async (address: string): Promise<GeocodingResult | null> => {
    if (!address || address.trim().length === 0) {
      error.value = 'Adresse vide'
      return null
    }

    loading.value = true
    error.value = null

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'User-Agent': 'ApplicationGestionJuridique/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Erreur lors du géocodage')
      }

      const data = await response.json()

      if (data && data.length > 0) {
        const result = data[0]
        return {
          address: address,
          latitude: parseFloat(result.lat),
          longitude: parseFloat(result.lon),
          formattedAddress: result.display_name
        }
      } else {
        error.value = 'Adresse non trouvée'
        return null
      }
    } catch (err) {
      console.error('Erreur de géocodage:', err)
      error.value = 'Erreur lors de la recherche de l\'adresse'
      return null
    } finally {
      loading.value = false
    }
  }


  const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
    loading.value = true
    error.value = null

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'ApplicationGestionJuridique/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Erreur lors du géocodage inversé')
      }

      const data = await response.json()
      return data.display_name || null
    } catch (err) {
      console.error('Erreur de géocodage inversé:', err)
      error.value = 'Erreur lors de la récupération de l\'adresse'
      return null
    } finally {
      loading.value = false
    }
  }


  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('La géolocalisation n\'est pas supportée'))
        return
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      })
    })
  }


  const searchAddresses = async (query: string, limit: number = 5): Promise<GeocodingResult[]> => {
    if (!query || query.trim().length < 3) {
      return []
    }

    loading.value = true
    error.value = null

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=${limit}`,
        {
          headers: {
            'User-Agent': 'ApplicationGestionJuridique/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche')
      }

      const data = await response.json()

      return data.map((item: any) => ({
        address: item.display_name,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        formattedAddress: item.display_name
      }))
    } catch (err) {
      console.error('Erreur de recherche:', err)
      error.value = 'Erreur lors de la recherche d\'adresses'
      return []
    } finally {
      loading.value = false
    }
  }


  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Rayon de la Terre en km
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const toRad = (degrees: number): number => {
    return degrees * (Math.PI / 180)
  }


  const getGoogleMapsDirectionsUrl = (origin: { lat: number, lng: number }, destination: { lat: number, lng: number }): string => {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&travelmode=driving`
  }


  const getGoogleMapsUrl = (lat: number, lng: number, label?: string): string => {
    if (label) {
      return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(label)}`
    }
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  }

  return {
    loading,
    error,
    geocodeAddress,
    reverseGeocode,
    getCurrentPosition,
    searchAddresses,
    calculateDistance,
    getGoogleMapsDirectionsUrl,
    getGoogleMapsUrl
  }
}

export default useGeolocation