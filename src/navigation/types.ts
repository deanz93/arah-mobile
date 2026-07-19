import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import type { Coordinates, Route } from '@/types'

export type RootStackParamList = {
  Onboarding: undefined
  Main: undefined
  Search: { onSelect?: (result: { displayName: string; coordinates: Coordinates }) => void }
  RoutePreview: { destination: { displayName: string; coordinates: Coordinates }; routes: Route[] }
  Navigation: { route: Route; destination: string }
  Report: { coordinates?: Coordinates }
}

export type MainTabParamList = {
  Map: undefined
  Settings: undefined
}

export type RootStackNavProp = NativeStackNavigationProp<RootStackParamList>
export type MainTabNavProp = BottomTabNavigationProp<MainTabParamList>
