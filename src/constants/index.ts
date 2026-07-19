import Config from 'react-native-config'

export const API_URL = Config.ARAH_API_URL ?? 'https://api.arah.my'
export const TILE_URL = Config.ARAH_TILE_URL ?? 'https://tiles.arah.my'
export const SOCKET_URL = Config.ARAH_SOCKET_URL ?? 'wss://realtime.arah.my'
export const VALHALLA_URL = Config.VALHALLA_URL ?? 'https://routing.arah.my'
export const NOMINATIM_URL = Config.NOMINATIM_URL ?? 'https://geocode.arah.my'

export const MAP_CONFIG = {
  TILE_URL: `${TILE_URL}/tiles/{z}/{x}/{y}.pbf`,
  STYLE_URL: `${TILE_URL}/style.json`,
  DEFAULT_CENTER: { latitude: 3.139, longitude: 101.6869 },
  DEFAULT_ZOOM: 13,
  MIN_ZOOM: 5,
  MAX_ZOOM: 18,
  MALAYSIA_BOUNDS: {
    sw: { latitude: 1.0, longitude: 99.5 },
    ne: { latitude: 7.5, longitude: 119.5 },
  },
}

export const REPORT_TTL_HOURS: Record<string, number> = {
  police: 2,
  accident: 1,
  flood: 6,
  roadblock: 24,
  pothole: 168,
  hazard: 4,
}

export const REPORT_ICONS: Record<string, string> = {
  police: '🚔',
  accident: '💥',
  flood: '🌊',
  pothole: '🕳️',
  roadblock: '🚧',
  hazard: '⚠️',
}

export const REROUTE_THRESHOLD_METERS = 50
export const VOICE_PROMPT_DISTANCES = [200, 100, 50]
