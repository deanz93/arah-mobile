import axios from 'axios'
import { VALHALLA_URL } from '@/constants'
import type { Coordinates, Route, RoutePreferences } from '@/types'

interface RoutingOptions extends RoutePreferences {
  alternatives?: number
}

export async function getRoutes(
  from: Coordinates,
  to: Coordinates,
  options: RoutingOptions = { avoidTolls: false, avoidHighways: false, alternatives: 3 },
): Promise<Route[]> {
  const params = new URLSearchParams({
    from_lat: String(from.latitude),
    from_lng: String(from.longitude),
    to_lat: String(to.latitude),
    to_lng: String(to.longitude),
    profile: 'auto',
    alternatives: String(options.alternatives ?? 3),
    avoid_tolls: String(options.avoidTolls),
    avoid_highways: String(options.avoidHighways),
  })

  const response = await axios.get(`${VALHALLA_URL}/route?${params}`, { timeout: 15000 })

  return response.data.routes.map((r: Record<string, unknown>) => ({
    id: r.id as string,
    distanceMeters: r.distance_meters as number,
    durationSeconds: r.duration_seconds as number,
    tollCostMyr: r.toll_cost_myr as number,
    hasTolls: r.has_tolls as boolean,
    summary: r.summary as string,
    polyline: r.polyline as string,
    manoeuvres: ((r.legs as Record<string, unknown>[])[0]?.manoeuvres ?? []) as Route['manoeuvres'],
  }))
}
