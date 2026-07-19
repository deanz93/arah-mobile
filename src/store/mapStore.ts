import { create } from 'zustand'
import type { Coordinates } from '@/types'
import { MAP_CONFIG } from '@/constants'

interface MapState {
  cameraCenter: Coordinates
  zoomLevel: number
  userLocation: Coordinates | null
  isFollowingUser: boolean
  setCameraCenter: (coords: Coordinates) => void
  setZoomLevel: (zoom: number) => void
  setUserLocation: (coords: Coordinates) => void
  setFollowingUser: (following: boolean) => void
}

export const useMapStore = create<MapState>((set) => ({
  cameraCenter: MAP_CONFIG.DEFAULT_CENTER,
  zoomLevel: MAP_CONFIG.DEFAULT_ZOOM,
  userLocation: null,
  isFollowingUser: true,
  setCameraCenter: (cameraCenter) => set({ cameraCenter }),
  setZoomLevel: (zoomLevel) => set({ zoomLevel }),
  setUserLocation: (userLocation) => set({ userLocation }),
  setFollowingUser: (isFollowingUser) => set({ isFollowingUser }),
}))
