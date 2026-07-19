import { create } from 'zustand'
import type { Route, Manoeuvre, NavigationState, Coordinates } from '@/types'

interface RoutingState {
  routes: Route[]
  activeRoute: Route | null
  currentManoeuvre: Manoeuvre | null
  currentManoeuvreIndex: number
  navigationState: NavigationState
  destination: { displayName: string; coordinates: Coordinates } | null
  etaSeconds: number
  distanceRemainingMeters: number
  setRoutes: (routes: Route[]) => void
  setActiveRoute: (route: Route) => void
  setDestination: (dest: { displayName: string; coordinates: Coordinates } | null) => void
  setNavigationState: (state: NavigationState) => void
  advanceManoeuvre: () => void
  updateProgress: (etaSeconds: number, distanceMeters: number) => void
  clearNavigation: () => void
}

export const useRoutingStore = create<RoutingState>((set) => ({
  routes: [],
  activeRoute: null,
  currentManoeuvre: null,
  currentManoeuvreIndex: 0,
  navigationState: 'idle',
  destination: null,
  etaSeconds: 0,
  distanceRemainingMeters: 0,
  setRoutes: (routes) => set({ routes }),
  setActiveRoute: (route) =>
    set({
      activeRoute: route,
      currentManoeuvre: route.manoeuvres[0] ?? null,
      currentManoeuvreIndex: 0,
    }),
  setDestination: (destination) => set({ destination }),
  setNavigationState: (navigationState) => set({ navigationState }),
  advanceManoeuvre: () =>
    set((state) => {
      const next = state.currentManoeuvreIndex + 1
      return {
        currentManoeuvreIndex: next,
        currentManoeuvre: state.activeRoute?.manoeuvres[next] ?? null,
      }
    }),
  updateProgress: (etaSeconds, distanceRemainingMeters) =>
    set({ etaSeconds, distanceRemainingMeters }),
  clearNavigation: () =>
    set({
      activeRoute: null,
      routes: [],
      currentManoeuvre: null,
      currentManoeuvreIndex: 0,
      navigationState: 'idle',
      destination: null,
      etaSeconds: 0,
      distanceRemainingMeters: 0,
    }),
}))
