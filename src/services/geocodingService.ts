import axios from 'axios'
import { NOMINATIM_URL } from '@/constants'
import type { SearchResult, Coordinates } from '@/types'

export async function searchPlaces(query: string, limit = 5): Promise<SearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    countrycodes: 'my',
    format: 'json',
    addressdetails: '1',
  })

  const response = await axios.get(`${NOMINATIM_URL}/search?${params}`, { timeout: 8000 })

  return response.data.map((item: Record<string, string>) => ({
    placeId: item.place_id,
    displayName: item.display_name,
    coordinates: { latitude: parseFloat(item.lat), longitude: parseFloat(item.lon) },
    type: item.type ?? '',
    category: item.category ?? '',
  }))
}

export async function reverseGeocode(coords: Coordinates): Promise<string> {
  const params = new URLSearchParams({
    lat: String(coords.latitude),
    lon: String(coords.longitude),
    format: 'json',
  })

  const response = await axios.get(`${NOMINATIM_URL}/reverse?${params}`, { timeout: 8000 })
  return response.data.display_name as string
}
