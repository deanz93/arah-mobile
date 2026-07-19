import Geolocation from 'react-native-geolocation-service'
import { Platform, PermissionsAndroid } from 'react-native'
import type { Coordinates } from '@/types'

export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    )
    return granted === PermissionsAndroid.RESULTS.GRANTED
  }
  const status = await Geolocation.requestAuthorization('whenInUse')
  return status === 'granted'
}

export function getCurrentPosition(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (pos) =>
        resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 },
    )
  })
}

export function watchPosition(
  onUpdate: (coords: Coordinates, heading: number) => void,
  onError: (err: Geolocation.GeoError) => void,
): number {
  return Geolocation.watchPosition(
    (pos) => {
      onUpdate(
        { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
        pos.coords.heading ?? 0,
      )
    },
    onError,
    { enableHighAccuracy: true, distanceFilter: 5, interval: 1000, fastestInterval: 500 },
  )
}

export function clearWatch(watchId: number): void {
  Geolocation.clearWatch(watchId)
}
