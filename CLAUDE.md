# arah-mobile — AI Agent Instructions

## What this service is

`arah-mobile` is the React Native 0.74 mobile application for Arah — Malaysia's sovereign, community-driven navigation platform. It delivers real-time GPS turn-by-turn navigation (via Valhalla routing), place search (via self-hosted Nominatim), live community road reports (via Firestore), and bilingual (Bahasa Malaysia / English) voice guidance. The app is the primary user-facing product in the Arah ecosystem.

## Repo structure

```
App.tsx                          — root component; mounts QueryClientProvider + AppNavigator
index.js                         — RN entry point
src/
  types/index.ts                 — all shared TypeScript types (Coordinates, Route, Report, ManoeuvreType, NavigationState, etc.)
  constants/index.ts             — API_URL, TILE_URL, SOCKET_URL, VALHALLA_URL, NOMINATIM_URL, MAP_CONFIG, REPORT_TTL_HOURS, REROUTE_THRESHOLD_METERS
  navigation/
    index.tsx                    — AppNavigator: Stack (Onboarding | Main+Search+RoutePreview+Navigation+Report)
    types.ts                     — RootStackParamList, MainTabParamList
  screens/
    MapScreen.tsx                — main map view; composes ArahMapView + SearchBar + ReportFab
    SearchScreen.tsx             — Nominatim search; returns SearchResult via route callback
    RoutePreviewScreen.tsx       — shows route alternatives; triggers navigation start
    NavigationScreen.tsx         — active navigation; ManoeuvreBar + NavBottomBar + TTS voice
    ReportScreen.tsx             — community report submission modal
    OnboardingScreen.tsx         — Firebase Google Sign-In entry
    SettingsScreen.tsx           — language, route prefs, saved places
  components/
    Map/ArahMapView.tsx          — MapLibre GL map with PMTiles style
    Map/UserMarker.tsx           — animated current location marker
    Map/ReportMarker.tsx         — community report pins on map
    Map/RouteLayer.tsx           — polyline route overlay
    Navigation/ManoeuvreBar.tsx  — top instruction banner during navigation
    Navigation/NavBottomBar.tsx  — ETA / distance / cancel during navigation
    Report/ReportFab.tsx         — floating action button to open report modal
    Search/SearchBar.tsx         — tap-to-navigate search input
  store/
    mapStore.ts                  — Zustand: cameraCenter, zoomLevel, userLocation, isFollowingUser
    routingStore.ts              — Zustand: routes, activeRoute, manoeuvre index, NavigationState, progress
    reportStore.ts               — Zustand: in-memory list of active community reports
    userStore.ts                 — Zustand: UserProfile, language, routePreferences
  services/
    api.ts                       — Axios instance with Firebase ID token interceptor (base: API_URL/v1)
    locationService.ts           — react-native-geolocation-service watchPosition wrapper
    routingService.ts            — getRoutes(from, to, options) → Route[] via VALHALLA_URL
    geocodingService.ts          — searchPlaces(q) + reverseGeocode(coords) via NOMINATIM_URL
    reportService.ts             — subscribeToReports(bbox) Firestore listener + submitReport + voteReport
  hooks/
    useLocation.ts               — GPS watcher; syncs userLocation + camera when isFollowingUser
  utils/
    geoUtils.ts                  — haversineDistance, bboxFromCenter, bearing
    formatters.ts                — formatDistance, formatDuration, formatTollCost, formatETA (BM/EN)
  __tests__/
    utils/formatters.test.ts
    utils/geoUtils.test.ts
android/                         — Android project (minSdk 24, targetSdk 34)
ios/                             — iOS project (Podfile)
```

## How to run

```bash
# Install JS dependencies
yarn install   # or: npm install

# Android
yarn android   # starts Metro + builds and launches on emulator/device

# iOS (macOS only)
cd ios && pod install && cd ..
yarn ios

# Metro only (if device already has the app)
yarn start

# Type-check
yarn typecheck

# Lint
yarn lint

# Unit tests
yarn test
yarn test:coverage
```

Environment: copy `.env.example` to `.env` and fill in values. For local dev, Android emulator URLs use `10.0.2.2` (host loopback).

## Coding conventions

- **TypeScript strict mode** — `noImplicitAny: true`; all types live in `src/types/index.ts`; never use `any` unless casting raw API data (cast immediately, document why)
- **Path alias** — use `@/` for all `src/` imports (e.g. `import { Route } from '@/types'`)
- **Zustand stores** — one concern per store file; export a single `use*Store` hook; derive state with selectors inside components, not in the store
- **TanStack Query** — use for all remote data fetching that needs caching/deduplication (routes, geocoding results); use Zustand for UI state (camera, navigation progress)
- **Firebase Firestore** — real-time listeners via `onSnapshot` in `reportService.ts`; always unsubscribe in `useEffect` cleanup
- **Bilingual** — all user-facing strings must support `Language = 'ms' | 'en'`; BM is default; pass `lang` from `userStore.user.preferredLanguage` to formatters
- **No inline styles** for complex layouts — use `StyleSheet.create`
- **Service layer** — screens never call axios/firestore directly; always go through `src/services/`
- **Error handling** — services throw; screens catch and show an `Alert` or error state; never swallow errors silently

## Next story

Read `docs/bmad/04-stories.md` and pick the first story with status `🔲 Todo`.

## Cross-repo dependencies

| Service | URL constant | Purpose |
|---------|-------------|---------|
| `arah-api` (Fastify) | `API_URL` = `api.arah.my` | Authenticated REST: user profile, report votes, toll data |
| `arah-routing` (Valhalla) | `VALHALLA_URL` = `routing.arah.my` | Turn-by-turn route calculation |
| `arah-geocoding` (Nominatim) | `NOMINATIM_URL` = `geocode.arah.my` | Place search and reverse geocoding |
| `arah-tile-server` (PMTiles) | `TILE_URL` = `tiles.arah.my` | MapLibre vector tiles + style.json |
| Firebase Firestore | (SDK) | Community reports real-time sync |
| Firebase Auth | (SDK) | Google Sign-In + Phone OTP |
| `realtime.arah.my` | `SOCKET_URL` | WebSocket for live traffic events (socket.io-client) |
