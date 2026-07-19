import React from 'react'
import MapLibreGL from '@maplibre/maplibre-react-native'
import type { Route } from '@/types'

interface Props {
  route: Route
}

function decodePolyline(encoded: string): [number, number][] {
  const coordinates: [number, number][] = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let shift = 0
    let result = 0
    let byte: number
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)
    lat += result & 1 ? ~(result >> 1) : result >> 1

    shift = 0
    result = 0
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)
    lng += result & 1 ? ~(result >> 1) : result >> 1

    coordinates.push([lng / 1e5, lat / 1e5])
  }

  return coordinates
}

export default function RouteLayer({ route }: Props) {
  const coordinates = decodePolyline(route.polyline)

  const geoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates },
  }

  return (
    <MapLibreGL.ShapeSource id="route-source" shape={geoJSON}>
      <MapLibreGL.LineLayer
        id="route-line"
        style={{ lineColor: '#1565c0', lineWidth: 5, lineCap: 'round', lineJoin: 'round' }}
      />
    </MapLibreGL.ShapeSource>
  )
}
