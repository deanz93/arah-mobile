import type { Coordinates, BoundingBox } from '@/types'

const EARTH_RADIUS_M = 6_371_000

export function haversineDistance(a: Coordinates, b: Coordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(b.latitude - a.latitude)
  const dLng = toRad(b.longitude - a.longitude)
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const chord =
    sinLat * sinLat +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * sinLng * sinLng
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(chord))
}

export function bboxFromCenter(center: Coordinates, radiusMeters: number): BoundingBox {
  const latDelta = (radiusMeters / EARTH_RADIUS_M) * (180 / Math.PI)
  const lngDelta =
    latDelta / Math.cos((center.latitude * Math.PI) / 180)
  return {
    sw: { latitude: center.latitude - latDelta, longitude: center.longitude - lngDelta },
    ne: { latitude: center.latitude + latDelta, longitude: center.longitude + lngDelta },
  }
}

export function bearing(from: Coordinates, to: Coordinates): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const toDeg = (rad: number) => (rad * 180) / Math.PI
  const dLng = toRad(to.longitude - from.longitude)
  const y = Math.sin(dLng) * Math.cos(toRad(to.latitude))
  const x =
    Math.cos(toRad(from.latitude)) * Math.sin(toRad(to.latitude)) -
    Math.sin(toRad(from.latitude)) * Math.cos(toRad(to.latitude)) * Math.cos(dLng)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}
