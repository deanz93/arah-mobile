import { useEffect, useRef } from 'react'
import { watchPosition, clearWatch, requestLocationPermission } from '@/services/locationService'
import { useMapStore } from '@/store/mapStore'
import type { Coordinates } from '@/types'

export function useLocation() {
  const { setUserLocation, isFollowingUser, setCameraCenter } = useMapStore()
  const watchId = useRef<number | null>(null)

  useEffect(() => {
    let active = true

    requestLocationPermission().then((granted) => {
      if (!granted || !active) return

      watchId.current = watchPosition(
        (coords: Coordinates) => {
          setUserLocation(coords)
          if (isFollowingUser) {
            setCameraCenter(coords)
          }
        },
        (err) => {
          console.warn('[useLocation] GPS error', err.code)
        },
      )
    })

    return () => {
      active = false
      if (watchId.current !== null) {
        clearWatch(watchId.current)
      }
    }
  }, [isFollowingUser, setUserLocation, setCameraCenter])
}
