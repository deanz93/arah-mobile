# arah-mobile — Architecture

## Component diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                         React Native App                             │
│                                                                      │
│  ┌────────────────┐   ┌─────────────────────────────────────────┐   │
│  │  AppNavigator  │   │              Zustand Stores              │   │
│  │  (Stack + Tab) │   │  mapStore  routingStore  reportStore     │   │
│  └───────┬────────┘   │  userStore                               │   │
│          │            └─────────────────────────────────────────┘   │
│  ┌───────▼────────────────────────────────────────────────────────┐  │
│  │                         Screens                                │  │
│  │  OnboardingScreen  MapScreen  SearchScreen  RoutePreviewScreen │  │
│  │  NavigationScreen  ReportScreen  SettingsScreen                │  │
│  └───────┬────────────────────────────────────────────────────────┘  │
│          │ renders                                                    │
│  ┌───────▼────────────────────────────────────────────────────────┐  │
│  │                        Components                              │  │
│  │  ArahMapView  UserMarker  ReportMarker  RouteLayer             │  │
│  │  ManoeuvreBar  NavBottomBar  SearchBar  ReportFab              │  │
│  └───────┬────────────────────────────────────────────────────────┘  │
│          │ calls                                                      │
│  ┌───────▼────────────────────────────────────────────────────────┐  │
│  │                        Services                                │  │
│  │  api.ts (Axios+Firebase token)   locationService (GPS)         │  │
│  │  routingService (Valhalla)       geocodingService (Nominatim)  │  │
│  │  reportService (Firestore)                                     │  │
│  └───────┬────────────────────────────────────────────────────────┘  │
└──────────┼───────────────────────────────────────────────────────────┘
           │ HTTP / WebSocket / Firebase SDK
    ┌──────┼────────────────────────────────────────────────┐
    │      │         External Services                       │
    │  api.arah.my (Fastify)    routing.arah.my (Valhalla)  │
    │  geocode.arah.my (Nominatim)  tiles.arah.my (PMTiles) │
    │  Firebase Firestore            realtime.arah.my (WS)   │
    └───────────────────────────────────────────────────────┘
```

## Navigation tree

```
NavigationContainer
└── Stack.Navigator
    ├── Onboarding          (shown when userStore.user === null)
    └── Main (BottomTabs)   (shown when authenticated)
        ├── Tab: Map        → MapScreen
        ├── Tab: Settings   → SettingsScreen
        └── Modals / Stack screens (no tab bar)
            ├── Search      → SearchScreen
            ├── RoutePreview → RoutePreviewScreen
            ├── Navigation  → NavigationScreen
            └── Report      → ReportScreen (modal presentation)
```

## Data flow

### GPS and map camera
```
react-native-geolocation-service
  → locationService.watchPosition()
    → useLocation() hook
      → mapStore.setUserLocation()
      → mapStore.setCameraCenter()  (only when isFollowingUser = true)
        → ArahMapView camera prop
```

### Route request
```
User taps destination in SearchScreen
  → SearchResult returned via route callback param
    → RoutePreviewScreen receives (destination, routes:[])
      → useQuery calls routingService.getRoutes(userLocation, destination)
        → GET routing.arah.my/route?...
          → Route[] stored in routingStore
            → RoutePreviewScreen renders alternatives
              → User selects route → routingStore.setActiveRoute()
                → NavigationScreen mounted
```

### Community reports real-time flow
```
MapScreen mounts
  → useEffect subscribes to reportService.subscribeToReports(bbox)
    → Firestore onSnapshot on collection('reports').where('active','==',true)
                                                   .where('lat','>=' / '<=')
      → reportStore.setReports()
        → ReportMarker rendered on ArahMapView
Camera moves
  → bboxFromCenter(newCenter, 5000m) → new subscription
```

### Navigation progress
```
useLocation updates userLocation
  → NavigationScreen useEffect
    → haversineDistance(userLocation, nextWaypoint) → distToTurn
      → VOICE_PROMPT_DISTANCES [200, 100, 50]m → Tts.speak()
      → distToTurn < 10m → routingStore.advanceManoeuvre()
      → distToTurn > REROUTE_THRESHOLD_METERS (50m off route)
          → routingService.getRoutes() → new route → reroute
```

## Key design decisions

### Zustand over Redux
Zustand was chosen for its minimal boilerplate and direct mutability model. The four stores map cleanly to distinct domains with no cross-store selectors required at launch. If cross-store derived state becomes necessary, add a `useStore` selector at the component level.

### TanStack Query for network, Zustand for UI
TanStack Query (`@tanstack/react-query` v5) handles route searches and geocoding — both benefit from deduplication and stale-while-revalidate. Zustand handles navigation state, map camera, and reports list because these are real-time imperative updates, not request-response caches.

### Firestore for reports instead of arah-api
Reports are written and read directly via the Firestore SDK to minimise latency and benefit from native real-time subscriptions. The `arah-api` backend can read Firestore server-side for analytics and moderation. This avoids a polling layer.

### react-native-mmkv for persistence
MMKV replaces AsyncStorage for user preferences (language, route preferences, saved places) due to its synchronous API and ~10x read throughput advantage. The `userStore` will add MMKV-backed `persist` middleware in story MOB-009.

### Voice guidance language
`react-native-tts` uses `ms-MY` locale for Bahasa Malaysia instructions. All `Manoeuvre.instruction` strings are stored bilingual (`.instruction` = BM, `.instruction_en` = EN). The active language in `userStore` determines which field TTS reads.

## State management approach

```
mapStore      — camera state (center, zoom, userLocation, isFollowingUser)
              — updated at GPS interval (~1Hz during navigation)

routingStore  — navigation lifecycle (idle → previewing → navigating → arrived)
              — routes array, active route, manoeuvre index, ETA, distance remaining

reportStore   — snapshot of Firestore active reports within current bbox
              — rebuilt on each onSnapshot callback (~30s TTL cache in arah-api layer)

userStore     — Firebase Auth user, UserProfile from Firestore users collection
              — preferences (language, avoidTolls, avoidHighways, savedPlaces)
              — persisted to MMKV (to be implemented in MOB-009)
```
