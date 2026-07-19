export interface Coordinates {
  latitude: number
  longitude: number
}

export interface BoundingBox {
  sw: Coordinates
  ne: Coordinates
}

export type Language = 'ms' | 'en'

export type ReportType =
  | 'police'
  | 'accident'
  | 'flood'
  | 'pothole'
  | 'roadblock'
  | 'hazard'

export interface Report {
  id: string
  type: ReportType
  coordinates: Coordinates
  upvotes: number
  downvotes: number
  createdAt: Date
  expiresAt: Date
}

export type ManoeuvreType =
  | 'turn_left'
  | 'turn_right'
  | 'turn_slight_left'
  | 'turn_slight_right'
  | 'turn_sharp_left'
  | 'turn_sharp_right'
  | 'straight'
  | 'roundabout'
  | 'u_turn'
  | 'destination'
  | 'depart'

export interface Manoeuvre {
  type: ManoeuvreType
  instruction: string
  instruction_en: string
  distanceMeters: number
  bearingBefore: number
  bearingAfter: number
}

export interface Route {
  id: string
  distanceMeters: number
  durationSeconds: number
  tollCostMyr: number
  hasTolls: boolean
  summary: string
  polyline: string
  manoeuvres: Manoeuvre[]
}

export interface SearchResult {
  placeId: string
  displayName: string
  coordinates: Coordinates
  type: string
  category: string
}

export interface SavedPlace {
  id: string
  label: string
  coordinates: Coordinates
}

export interface UserProfile {
  uid: string
  displayName: string
  preferredLanguage: Language
  routePreferences: {
    avoidTolls: boolean
    avoidHighways: boolean
  }
  savedPlaces: SavedPlace[]
  reportCount: number
}

export interface RoutePreferences {
  avoidTolls: boolean
  avoidHighways: boolean
}

export type NavigationState = 'idle' | 'previewing' | 'navigating' | 'arrived'
