# arah-mobile — Sprint Stories

Stories are ordered by dependency and value. Work top-to-bottom within each epic. Prefix: `MOB-`.

---

## Epic 1: Map & Location

### MOB-001: Display live user location on map
**Epic:** Map & Location
**Status:** 🔲 Todo
**Feature:** NAV-001
**Priority:** MVP

**As a** driver **I want** to see my current GPS position on the map **so that** I know where I am before starting navigation.

**Acceptance criteria:**
- [ ] `useLocation` hook is called in `MapScreen` and GPS permission is requested on first launch
- [ ] A `UserMarker` (pulsing blue dot) appears at the user's GPS coordinates
- [ ] The map camera follows the user on first load (`isFollowingUser = true`)
- [ ] Tapping anywhere on the map sets `isFollowingUser = false` (pan-to-user button appears)
- [ ] A "recenter" FAB snaps the camera back to user location and restores `isFollowingUser = true`
- [ ] GPS errors (permission denied, location unavailable) show a BM-language snackbar

**Technical notes:** `useLocation.ts` calls `locationService.watchPosition` and updates `mapStore`; `ArahMapView.tsx` → MapLibre `Camera` component takes `centerCoordinate` from `mapStore.cameraCenter`; use `react-native-permissions` `PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION`
**Estimate:** S

---

### MOB-002: Render community reports on map
**Epic:** Map & Location
**Status:** 🔲 Todo
**Feature:** NAV-001
**Priority:** MVP

**As a** driver **I want** to see community reports (police, accidents, floods) as pins on the map **so that** I can avoid hazards.

**Acceptance criteria:**
- [ ] `subscribeToReports(bbox)` is called when the map camera settles (debounced 500ms after drag end)
- [ ] Reports within the current viewport bounding box are rendered as `ReportMarker` components
- [ ] Each report type uses its corresponding `REPORT_ICONS` emoji as the marker label
- [ ] Tapping a report marker shows a bottom sheet with: type label (BM), upvote/downvote counts, time remaining
- [ ] Firestore subscription is unsubscribed on component unmount
- [ ] Markers older than `expires_at` are not shown (filtered in `reportService.subscribeToReports`)

**Technical notes:** `bboxFromCenter(cameraCenter, 5000)` gives the subscription bbox; `ReportMarker.tsx` → MapLibre `PointAnnotation`; Firestore composite index required: `(active ASC, lat ASC)`
**Estimate:** M

---

### MOB-003: Implement MapLibre vector tile rendering
**Epic:** Map & Location
**Status:** 🔲 Todo
**Feature:** NAV-001
**Priority:** MVP

**As a** driver **I want** the map to render Malaysia OSM data with road labels in Bahasa Malaysia **so that** the map looks familiar and is readable in my language.

**Acceptance criteria:**
- [ ] `ArahMapView` loads `MAP_CONFIG.STYLE_URL` (`tiles.arah.my/style.json`) as the MapLibre style
- [ ] Map renders roads, buildings, waterways, and POI labels
- [ ] Default center is KL (3.139, 101.6869), zoom 13
- [ ] Map is bounded to `MAP_CONFIG.MALAYSIA_BOUNDS` (sw: 1.0/99.5, ne: 7.5/119.5) — cannot pan outside Malaysia
- [ ] Min zoom 5 (national overview), max zoom 18 (street level)
- [ ] Map renders correctly in offline mode using tile cache

**Technical notes:** `ArahMapView.tsx` → `MapLibreGL.MapView` + `MapLibreGL.Camera` + `MapLibreGL.UserLocation`; style JSON at `tiles.arah.my/style.json` must reference the PMTiles source
**Estimate:** M

---

### MOB-015: Camera auto-follows user position during active navigation
**Epic:** Map & Location
**Status:** 🔲 Todo
**Feature:** NAV-001
**Priority:** MVP

**As a** driver **I want** the map camera to automatically follow my position during navigation **so that** the road ahead stays centred on screen without manual interaction.

**Acceptance criteria:**
- [ ] During active navigation, `mapStore.cameraFollowMode = 'navigation'` keeps camera centred on user with 15-degree tilt
- [ ] Manual pan gesture sets `cameraFollowMode = 'free'` and shows re-centre button
- [ ] Camera follow resumes automatically after 10 seconds of inactivity in `'free'` mode
- [ ] Follow mode persists through screen-off / screen-on cycle via `expo-keep-awake`
- [ ] Camera bearing matches user heading (not always north-up) during navigation

**Technical notes:** `src/stores/mapStore.ts` `cameraFollowMode: 'free' | 'navigation' | 'overview'`; MapLibre `Camera` `followUserLocation` prop; heading from `locationService` `watchPosition` `heading` field
**Estimate:** M

---

### MOB-016: Re-centre button snaps camera back to user location
**Epic:** Map & Location
**Status:** 🔲 Todo
**Feature:** NAV-001
**Priority:** MVP

**As a** driver **I want** a re-centre button to appear when I pan the map **so that** I can instantly snap the camera back to my location.

**Acceptance criteria:**
- [ ] `RecenterButton` (`src/components/map/RecenterButton.tsx`) appears bottom-right when `cameraFollowMode = 'free'`
- [ ] Tapping animates the camera to user's current coordinates with 300ms ease-in-out
- [ ] Button fades out within 200ms after camera re-centres
- [ ] Button is accessible with minimum 44×44 pt touch target
- [ ] During active navigation, re-centre also restores 15-degree tilt and heading-up orientation

**Technical notes:** `RecenterButton.tsx` reads `mapStore.cameraFollowMode`; dispatches `mapStore.setCameraFollowMode('navigation')`; MapLibre `Camera.flyTo()` with `animationDuration: 300`
**Estimate:** S

---

### MOB-017: North-up vs heading-up map orientation toggle
**Epic:** Map & Location
**Status:** 🔲 Todo
**Feature:** NAV-001
**Priority:** MVP

**As a** driver **I want** to toggle between north-up and heading-up map orientation **so that** the map always shows the direction I'm travelling at the top.

**Acceptance criteria:**
- [ ] Toggle button in map toolbar switches between `'north'` and `'heading'` modes
- [ ] `'heading'` mode rotates map so device heading is always up; compass widget rotates inversely
- [ ] `'north'` mode always keeps north at top; compass shows current bearing
- [ ] Preference is persisted in Zustand `mapStore` and survives app restart via MMKV
- [ ] Mode change is animated (bearing transition over 300ms)

**Technical notes:** `mapStore.orientationMode: 'north' | 'heading'`; MapLibre `Camera` `heading` prop; heading from `expo-location` `LocationOptions.accuracy = Accuracy.BestForNavigation`
**Estimate:** S

---

### MOB-018: Pinch-to-zoom and zoom +/- controls
**Epic:** Map & Location
**Status:** 🔲 Todo
**Feature:** NAV-001
**Priority:** MVP

**As a** driver **I want** pinch-to-zoom gestures and on-screen zoom buttons **so that** I can adjust the map zoom level comfortably while driving or while stopped.

**Acceptance criteria:**
- [ ] Pinch gesture natively zooms MapLibre map (no extra code needed — verify it works)
- [ ] `ZoomControls` (`src/components/map/ZoomControls.tsx`) shows + and − buttons fixed to right edge
- [ ] + button calls `camera.zoomTo(currentZoom + 1, 200)` animated
- [ ] − button calls `camera.zoomTo(currentZoom - 1, 200)` animated
- [ ] + button is disabled at zoom 18; − button disabled at zoom 5
- [ ] Buttons are hidden during active navigation to reduce clutter

**Technical notes:** `src/components/map/ZoomControls.tsx`; `MapLibreGL.Camera` ref `.setCamera({ zoomLevel: n, animationDuration: 200 })`; read current zoom from `MapLibreGL.MapView` `onRegionDidChange` event
**Estimate:** S

---

### MOB-019: Compass widget shows bearing and resets to north on tap
**Epic:** Map & Location
**Status:** 🔲 Todo
**Feature:** NAV-001
**Priority:** MVP

**As a** driver **I want** a compass widget on the map **so that** I always know my bearing and can quickly reset to north-up orientation.

**Acceptance criteria:**
- [ ] `CompassWidget` (`src/components/map/CompassWidget.tsx`) is always visible top-right of map
- [ ] Compass needle rotates to reflect current map bearing in real time
- [ ] Tapping compass resets map bearing to 0° (north-up) with animated transition
- [ ] Compass fades to 30% opacity when bearing is 0° (north-up) to signal it is already aligned
- [ ] In heading-up mode, compass rotates to show true bearing relative to north

**Technical notes:** `src/components/map/CompassWidget.tsx`; bearing from `mapStore.currentBearing` updated by MapLibre `onRegionDidChange`; `Animated.Value` for rotation transform; `MapLibreGL.Camera.setCamera({ heading: 0, animationDuration: 300 })`
**Estimate:** S

---

### MOB-020: Scale bar displaying current map scale
**Epic:** Map & Location
**Status:** 🔲 Todo
**Feature:** NAV-001
**Priority:** v1

**As a** driver **I want** a scale bar on the map **so that** I can understand real-world distances at the current zoom level.

**Acceptance criteria:**
- [ ] `ScaleBar` (`src/components/map/ScaleBar.tsx`) appears bottom-left with a horizontal bar and label
- [ ] Scale rounds to a clean value: 50m, 100m, 200m, 500m, 1km, 2km, 5km, 10km, 20km, 50km
- [ ] Scale recalculates on every `onRegionDidChange` event
- [ ] Label switches between km and m based on `userPreferencesStore.distanceUnit`
- [ ] Scale bar width is 80–120 px (adjusts to fit clean number)

**Technical notes:** `src/components/map/ScaleBar.tsx`; scale = `(map width px / map width metres) × clean distance metres`; map width metres from MapLibre bounds at current zoom; `userPreferencesStore` from `src/stores/userPreferencesStore.ts`
**Estimate:** S

---

### MOB-021: Auto-switch night/dark map style at civil twilight
**Epic:** Map & Location
**Status:** 🔲 Todo
**Feature:** NAV-001
**Priority:** v1

**As a** driver **I want** the map to automatically switch to a dark style after sunset **so that** the bright map doesn't blind me at night.

**Acceptance criteria:**
- [ ] At civil twilight (sun 6° below horizon), `ArahMapView` switches style to `MAP_CONFIG.DARK_STYLE_URL`
- [ ] At civil dawn, style switches back to `MAP_CONFIG.LIGHT_STYLE_URL`
- [ ] `SunCalc.getTimes(new Date(), lat, lng).dusk` and `.dawn` are used for the thresholds
- [ ] Manual override toggle in settings (`mapStore.themeOverride: 'auto' | 'light' | 'dark'`) takes precedence
- [ ] Style transition is seamless — MapLibre fades between styles without blank flash

**Technical notes:** `src/utils/sunCalc.ts` wraps `suncalc` npm package; background timer checks every 5 minutes; `mapStore.effectiveMapTheme` computed from `themeOverride` and sun position; `MapLibreGL.MapView` `styleURL` prop is reactive
**Estimate:** M

---

### MOB-022: GPS accuracy circle around user location blue dot
**Epic:** Map & Location
**Status:** 🔲 Todo
**Feature:** NAV-001
**Priority:** v1

**As a** driver **I want** to see a translucent circle showing GPS accuracy around my location dot **so that** I know how precise my position fix is.

**Acceptance criteria:**
- [ ] Translucent blue circle renders around user dot with radius = `location.coords.accuracy` metres
- [ ] Circle is only shown when `accuracy > 20` m (hidden when GPS fix is good)
- [ ] Circle colour matches user dot: `rgba(33, 150, 243, 0.15)` fill, `rgba(33, 150, 243, 0.5)` stroke
- [ ] `AccuracyCircleLayer` (`src/components/map/AccuracyCircleLayer.tsx`) uses MapLibre `CircleLayer`
- [ ] Circle radius is converted from metres to pixels using MapLibre zoom-level formula

**Technical notes:** `src/components/map/AccuracyCircleLayer.tsx`; MapLibre `ShapeSource` with GeoJSON Point; `CircleLayer` `circleRadius` = `accuracy / metersPerPixel(zoom, lat)` in a MapLibre expression
**Estimate:** S

---

### MOB-023: Traffic congestion colour overlay layer
**Epic:** Map & Location
**Status:** 🔲 Todo
**Feature:** NAV-001
**Priority:** v1

**As a** driver **I want** to see real-time traffic congestion overlaid on the map **so that** I can spot slow-moving traffic before I encounter it.

**Acceptance criteria:**
- [ ] Traffic toggle button in `LayerToggle.tsx` shows/hides the traffic layer
- [ ] Traffic data fetched from `GET /v1/traffic` as GeoJSON LineString features with `congestion` property
- [ ] `congestion` values: `free`=green, `slow`=amber, `heavy`=red rendered as polyline overlay
- [ ] Traffic layer refreshes every 90 seconds while visible
- [ ] Toggle state persists in `mapStore.showTrafficLayer`; defaults to `true` for MVP
- [ ] API is stubbed (v2 feature); stub returns empty FeatureCollection for now

**Technical notes:** `src/components/map/LayerToggle.tsx`; MapLibre `ShapeSource` source id `'traffic'`; `LineLayer` with `lineColor` expression `['match', ['get', 'congestion'], 'free', '#4CAF50', 'slow', '#FF9800', 'heavy', '#F44336', '#999']`; poll with `setInterval` when layer is visible
**Estimate:** M

---

### MOB-024: Community report icon clustering at low zoom levels
**Epic:** Map & Location
**Status:** 🔲 Todo
**Feature:** NAV-001
**Priority:** v1

**As a** driver **I want** clustered report icons at low zoom levels **so that** the map is not cluttered when zoomed out over an area with many reports.

**Acceptance criteria:**
- [ ] At zoom < 12: reports within 50px cluster into a single circle showing count
- [ ] At zoom ≥ 12: individual report icons render per `REPORT_ICONS` type
- [ ] Cluster circle colour: 2–5 reports = blue, 6–15 = amber, 16+ = red
- [ ] Tapping a cluster zooms in to reveal individual reports
- [ ] Transition between clustered and individual is animated

**Technical notes:** MapLibre `ShapeSource` `cluster={true}` `clusterRadius={50}` `clusterMaxZoom={11}`; `CircleLayer` for clusters; `SymbolLayer` for individual icons; `ClusterLayer.tsx` at `src/components/map/ClusterLayer.tsx`
**Estimate:** M

---

### MOB-025: Satellite/hybrid tile layer toggle
**Epic:** Map & Location
**Status:** 🔲 Todo
**Feature:** NAV-001
**Priority:** v1

**As a** driver **I want** to toggle to satellite or hybrid view **so that** I can get real-world context for unfamiliar areas.

**Acceptance criteria:**
- [ ] `LayerToggle.tsx` has three modes: Standard / Satellite / Hybrid
- [ ] Satellite mode loads `MAP_CONFIG.SATELLITE_STYLE_URL` (PMTiles satellite imagery)
- [ ] Hybrid mode = satellite imagery + road/label overlay from vector tiles
- [ ] Active mode is shown with a highlighted border on the toggle button
- [ ] Mode persists in `mapStore.tileLayerMode` across sessions via MMKV

**Technical notes:** `src/components/map/LayerToggle.tsx`; `mapStore.tileLayerMode: 'standard' | 'satellite' | 'hybrid'`; MapLibre `styleURL` changes reactively; hybrid implemented by composing satellite raster source with vector symbol layers
**Estimate:** M

---

## Epic 2: Routing & Navigation

### MOB-004: Search for a destination
**Epic:** Routing & Navigation
**Status:** 🔲 Todo
**Feature:** NAV-002
**Priority:** MVP

**As a** driver **I want** to search for a destination by name **so that** I can navigate to a specific place without knowing its exact coordinates.

**Acceptance criteria:**
- [ ] `SearchScreen` renders a text input that calls `geocodingService.searchPlaces(query)` with 300ms debounce
- [ ] Results list shows `displayName` with category as subtitle
- [ ] Tapping a result navigates to `RoutePreviewScreen` with `destination = SearchResult`
- [ ] Empty state shows "Tiada hasil dijumpai" for zero results
- [ ] Loading state shows a skeleton or activity indicator
- [ ] Recent searches are saved to MMKV and shown when search input is empty

**Technical notes:** `SearchScreen.tsx` receives `onSelect: (result: SearchResult) => void` via navigation params; use TanStack Query `useQuery` with `enabled: query.length > 2`; MMKV key `'recent_searches'`, value: JSON array of last 5 `SearchResult` objects
**Estimate:** M

---

### MOB-005: Show route alternatives and toll cost
**Epic:** Routing & Navigation
**Status:** 🔲 Todo
**Feature:** NAV-002
**Priority:** MVP

**As a** driver **I want** to see multiple route options with distance, duration, and toll cost **so that** I can choose the best route for my journey.

**Acceptance criteria:**
- [ ] `RoutePreviewScreen` calls `routingService.getRoutes(userLocation, destination, preferences)` on mount
- [ ] Up to 3 route cards are shown, each displaying: `formatDistance`, `formatDuration`, `formatTollCost`
- [ ] The first (fastest) route is selected by default; tapping another highlights it
- [ ] Selected route is drawn on the map using `RouteLayer` with a distinct colour
- [ ] "Mulakan navigasi" button transitions `navigationState` to `navigating` and navigates to `NavigationScreen`
- [ ] Route preferences (avoidTolls, avoidHighways) from `userStore` are passed to the route request

**Technical notes:** `routingService.getRoutes()` already implemented; `RouteLayer.tsx` → MapLibre `ShapeSource` + `LineLayer`; `formatDistance` / `formatDuration` / `formatTollCost` in `src/utils/formatters.ts`
**Estimate:** M

---

### MOB-006: Turn-by-turn navigation with voice guidance in Bahasa Malaysia
**Epic:** Routing & Navigation
**Status:** 🔲 Todo
**Feature:** NAV-002
**Priority:** MVP

**As a** driver **I want** spoken turn-by-turn instructions in Bahasa Malaysia **so that** I can drive without looking at my phone.

**Acceptance criteria:**
- [ ] `NavigationScreen` is mounted with the active route from `routingStore`
- [ ] `ManoeuvreBar` at the top shows the current manoeuvre arrow icon and instruction text
- [ ] `NavBottomBar` at the bottom shows remaining distance, ETA, and a cancel button
- [ ] TTS speaks the instruction in BM at 200m, 100m, and 50m before the turn
- [ ] On arrival (manoeuvre type `destination`): TTS says "Anda telah sampai ke destinasi"
- [ ] Cancel button stops TTS, clears `routingStore`, and returns to `MapScreen`

**Technical notes:** `NavigationScreen.tsx` partially implemented; `Tts.setDefaultLanguage('ms-MY')` in `useEffect`; `VOICE_PROMPT_DISTANCES = [200, 100, 50]` from `src/constants/index.ts`; `expo-speech` or `react-native-tts` bridge
**Estimate:** L

---

### MOB-007: Automatic rerouting when off course
**Epic:** Routing & Navigation
**Status:** 🔲 Todo
**Feature:** NAV-002
**Priority:** MVP

**As a** driver **I want** the app to automatically recalculate my route if I miss a turn **so that** I don't have to manually restart navigation.

**Acceptance criteria:**
- [ ] During active navigation, `haversineDistance(userLocation, nearestRoutePoint)` is computed on each GPS update
- [ ] If distance exceeds `REROUTE_THRESHOLD_METERS` (50m), a new route request is made silently
- [ ] While rerouting, `ManoeuvreBar` shows "Mengira semula laluan..." text
- [ ] On successful reroute: `routingStore.setActiveRoute(newRoute)` and TTS says "Laluan dikira semula"
- [ ] On reroute failure: show error banner; let user manually cancel or retry
- [ ] Reroute request honours the same `avoidTolls` / `avoidHighways` preferences

**Technical notes:** Nearest route point: iterate `activeRoute.manoeuvres` coordinates; debounce reroute trigger to not fire more than once per 5 seconds; `routingService.getRoutes` accepts same signature as initial request
**Estimate:** M

---

### MOB-026: Route profile selector bottom sheet
**Epic:** Routing & Navigation
**Status:** 🔲 Todo
**Feature:** NAV-002
**Priority:** MVP

**As a** driver **I want** to select a routing profile (fastest, toll-free, shortest) before starting navigation **so that** routes are calculated according to my preference.

**Acceptance criteria:**
- [ ] Bottom sheet appears on the route preview screen with three profile options
- [ ] Options: "Terpantas" (fastest), "Tanpa Tol" (toll-free), "Terpendek" (shortest distance)
- [ ] Selecting a profile immediately recalculates routes and updates the map
- [ ] Selected profile is persisted in `userPreferencesStore.routeProfile`
- [ ] Profile choice is passed as `costing_options` to Valhalla API

**Technical notes:** `src/components/routing/RouteProfileSheet.tsx`; `userPreferencesStore.routeProfile: 'fastest' | 'toll_free' | 'shortest'`; `routingService.getRoutes` passes profile to `GET /v1/route?costing=auto&costing_options=...`
**Estimate:** S

---

### MOB-027: Toll cost badge on route alternatives
**Epic:** Routing & Navigation
**Status:** 🔲 Todo
**Feature:** NAV-002
**Priority:** MVP

**As a** driver **I want** to see the toll cost in RM displayed on each route alternative **so that** I can factor in toll expenses when choosing a route.

**Acceptance criteria:**
- [ ] `TollBadge` component renders toll amount in RM format (e.g. "RM 4.50") on each route card
- [ ] Data sourced from API response field `toll_cost_myr` per route
- [ ] If `toll_cost_myr = 0`, badge shows "Tiada Tol" in green
- [ ] Badge is visually distinct (pill shape, grey background with RM icon)
- [ ] Toll-free routes are ranked first when user has `avoid_tolls = true`

**Technical notes:** `src/components/routing/TollBadge.tsx`; `routingService.getRoutes` response: `Route.toll_cost_myr: number`; `formatTollCost(amount: number): string` in `src/utils/formatters.ts`
**Estimate:** S

---

### MOB-028: Lane guidance banner at complex junctions
**Epic:** Routing & Navigation
**Status:** 🔲 Todo
**Feature:** NAV-002
**Priority:** v1

**As a** driver **I want** to see a lane diagram at complex junctions **so that** I know which lane to be in before the turn.

**Acceptance criteria:**
- [ ] `LaneGuidanceBanner` appears below `ManoeuvreBar` when Valhalla provides `sign.toward_locations` data
- [ ] Diagram shows available lanes as rectangles; highlighted lanes are the correct ones
- [ ] Lane arrows (straight, left, right, uturn) rendered as SVG icons inside lane rectangles
- [ ] Banner appears 300m before junction and disappears after passing it
- [ ] Banner is dismissed if user deviates or reroutes

**Technical notes:** `src/components/navigation/LaneGuidanceBanner.tsx`; Valhalla `maneuver.lanes[]` provides `valid: boolean` and `indications: string[]`; SVG lane arrow assets in `src/assets/lane-arrows/`
**Estimate:** M

---

### MOB-029: Speed limit display in navigation HUD
**Epic:** Routing & Navigation
**Status:** 🔲 Todo
**Feature:** NAV-002
**Priority:** v1

**As a** driver **I want** to see the current road's speed limit in my navigation HUD **so that** I know whether I am within the legal limit.

**Acceptance criteria:**
- [ ] Speed limit badge renders in bottom-left of `NavigationHUD.tsx` showing current road limit (e.g. "90")
- [ ] Data sourced from Valhalla manoeuvre `speed_limit` field (km/h)
- [ ] Badge shows "—" when no speed limit data is available
- [ ] Badge turns red when current GPS speed exceeds limit + 10 km/h
- [ ] Speed limit updates as user crosses into a new road segment

**Technical notes:** `src/components/navigation/SpeedLimitBadge.tsx`; `routingStore.currentSegmentSpeedLimit` updated by matching GPS position to nearest manoeuvre; GPS speed from `locationService` `watchPosition` `speed` field (m/s × 3.6 = km/h)
**Estimate:** S

---

### MOB-030: Speed warning alert when exceeding speed limit
**Epic:** Routing & Navigation
**Status:** 🔲 Todo
**Feature:** NAV-002
**Priority:** v1

**As a** driver **I want** an audio and visual alert when I exceed the speed limit **so that** I am reminded to slow down before being caught by a speed camera.

**Acceptance criteria:**
- [ ] When `gpsSpeed > speedLimit + 10` km/h, the HUD border flashes red
- [ ] Alert sound plays once (short beep via `expo-av`) on first trigger; does not repeat until speed drops and rises again
- [ ] `SpeedLimitBadge` background turns red and pulses when speeding
- [ ] Warning is silenced if speed warning is disabled in settings
- [ ] Speed warning persists as long as user is exceeding limit; resets when speed drops below threshold

**Technical notes:** `src/components/navigation/SpeedLimitBadge.tsx`; alert sound asset `src/assets/sounds/speed-warning.mp3`; `expo-av` `Audio.Sound.createAsync`; state machine: `idle → triggered → reset` using `useRef`
**Estimate:** S

---

### MOB-031: Waypoints — add up to 5 stops along route
**Epic:** Routing & Navigation
**Status:** 🔲 Todo
**Feature:** NAV-002
**Priority:** v1

**As a** driver **I want** to add up to 5 waypoints along my route **so that** I can plan a multi-stop journey in one navigation session.

**Acceptance criteria:**
- [ ] Long-press on map opens context menu with "Tambah Henti" (Add Stop) option
- [ ] Waypoints list drawer shows current stops in order with drag handles for reordering
- [ ] Up to 5 waypoints are supported; "Tambah Henti" is disabled when limit is reached
- [ ] Route recalculates through all waypoints in order on each add/reorder/remove
- [ ] Each waypoint shows address label (reverse geocoded) and estimated stop time

**Technical notes:** `src/stores/routingStore.ts` `waypoints: Waypoint[]`; drag-to-reorder via `react-native-draggable-flatlist`; route request passes all waypoints to `GET /v1/route?locations=[origin,...waypoints,destination]`; reverse geocode each waypoint address with `GET /v1/geocode/reverse`
**Estimate:** L

---

### MOB-032: ETA share via WhatsApp deep link
**Epic:** Routing & Navigation
**Status:** 🔲 Todo
**Feature:** NAV-002
**Priority:** v1

**As a** driver **I want** to share my ETA with someone via WhatsApp **so that** they know when I will arrive without needing a separate message.

**Acceptance criteria:**
- [ ] Share button in navigation HUD opens a share action sheet
- [ ] "WhatsApp" option composes deep link: `https://wa.me/?text=Saya+akan+tiba+di+[destination]+pada+[ETA]`
- [ ] "Salin Pautan" option copies the same text to clipboard
- [ ] ETA time is formatted in 12-hour format with AM/PM: e.g. "3:45 PM"
- [ ] Destination name is URL-encoded; long names are truncated to 50 characters

**Technical notes:** `src/components/navigation/ETAShareButton.tsx`; `Linking.openURL(whatsappUrl)`; `Clipboard.setStringAsync(text)` from `expo-clipboard`; `formatETATime(etaSeconds: number): string` in `src/utils/formatters.ts`
**Estimate:** S

---

### MOB-033: Keep screen awake during active navigation
**Epic:** Routing & Navigation
**Status:** 🔲 Todo
**Feature:** NAV-002
**Priority:** MVP

**As a** driver **I want** the screen to stay on while navigating **so that** I don't have to unlock the phone to see directions.

**Acceptance criteria:**
- [ ] `expo-keep-awake` `activateKeepAwakeAsync()` is called when navigation starts
- [ ] `deactivateKeepAwakeAsync()` is called when navigation is cancelled or arrival reached
- [ ] Keep-awake is deactivated if user minimises the app (AppState 'background')
- [ ] Keep-awake resumes when app returns to foreground during active navigation
- [ ] No battery impact warning needed — this is expected navigation app behaviour

**Technical notes:** `src/hooks/useKeepAwake.ts`; `AppState.addEventListener('change', handler)` to track foreground/background; called from `NavigationScreen.tsx` `useEffect`; `expo-keep-awake` v14+
**Estimate:** S

---

## Epic 3: Community Reports

### MOB-008: Submit a community road report
**Epic:** Community Reports
**Status:** 🔲 Todo
**Feature:** RPT-001
**Priority:** MVP

**As a** driver **I want** to report a hazard (police trap, accident, flood, etc.) with one tap **so that** other Arah users are warned.

**Acceptance criteria:**
- [ ] `ReportFab` is visible on `MapScreen`; tapping opens `ReportScreen` modal with `coordinates = userLocation`
- [ ] `ReportScreen` shows a grid of report type buttons using `REPORT_ICONS` emojis
- [ ] Selecting a type and tapping "Hantar" calls `reportService.submitReport(type, coordinates, userHash)`
- [ ] `userHash` is SHA-256 of `auth().currentUser.uid`
- [ ] On success: dismiss modal and show "Laporan dihantar" toast; `reportStore.addReport(newReport)`
- [ ] On failure: show BM-language error alert; do not dismiss modal

**Technical notes:** `reportService.submitReport` already implemented; `@noble/hashes` or native crypto for SHA-256; `userHash` must NOT be the raw uid
**Estimate:** M

---

### MOB-010: Upvote / downvote community reports
**Epic:** Community Reports
**Status:** 🔲 Todo
**Feature:** RPT-001
**Priority:** MVP

**As a** driver **I want** to confirm or reject a report I see on the map **so that** the community can validate report accuracy.

**Acceptance criteria:**
- [ ] Report bottom sheet has upvote (thumbs up) and downvote (thumbs down) buttons
- [ ] Tapping upvote calls `reportService.voteReport(id, 'up')` and increments local count optimistically
- [ ] Tapping downvote calls `reportService.voteReport(id, 'down')` and increments local count optimistically
- [ ] A user can only vote once per report per session (tracked in-memory)
- [ ] If downvotes exceed upvotes by 5, the report is dimmed on the map

**Technical notes:** `reportService.voteReport` already implemented; track voted-report IDs in `Set<string>` in `reportStore`; optimistic update via `reportStore.updateReport(id, { upvotes: current + 1 })`
**Estimate:** S

---

### MOB-034: Report type — Police speed trap
**Epic:** Community Reports
**Status:** 🔲 Todo
**Feature:** RPT-001
**Priority:** MVP

**As a** driver **I want** to report a police speed trap **so that** other drivers know to slow down and drive safely.

**Acceptance criteria:**
- [ ] "Perangkap Kelajuan Polis" tile appears in the report type grid with 👮 icon
- [ ] Submits `POST /v1/reports` with `type: 'police'`
- [ ] Server sets `expires_at = now + 7200s` (2 hours)
- [ ] Report displays on map as 👮 icon for 2 hours
- [ ] Approaching alert triggers within 500m during active navigation

**Technical notes:** `REPORT_TYPES.police = { label: 'Perangkap Kelajuan Polis', icon: '👮', ttl: 7200 }` in `src/constants/reportTypes.ts`; `POST /v1/reports` body: `{ type, lat, lng, user_hash }`
**Estimate:** S

---

### MOB-035: Report type — Accident with severity selector
**Epic:** Community Reports
**Status:** 🔲 Todo
**Feature:** RPT-001
**Priority:** MVP

**As a** driver **I want** to report an accident and indicate its severity **so that** other drivers can judge how much to slow down or avoid the area.

**Acceptance criteria:**
- [ ] "Kemalangan" tile opens a severity sub-selector: "Ringan" / "Teruk"
- [ ] Submits `POST /v1/reports` with `type: 'accident'` and `severity: 'minor' | 'major'`
- [ ] Server sets `expires_at = now + 3600s` (1 hour)
- [ ] Icon differs: minor = 🚗 yellow, major = 🚨 red
- [ ] Severity is shown in the report detail bottom sheet

**Technical notes:** `REPORT_TYPES.accident = { label: 'Kemalangan', ttl: 3600 }`; severity stored in `metadata: { severity: string }` field on Firestore document; report bottom sheet reads `report.metadata.severity`
**Estimate:** S

---

### MOB-036: Report type — Flooded road with immediate broadcast
**Epic:** Community Reports
**Status:** 🔲 Todo
**Feature:** RPT-001
**Priority:** MVP

**As a** driver **I want** to report a flooded road **so that** the platform immediately alerts other users in the area.

**Acceptance criteria:**
- [ ] "Jalan Banjir" tile submits `type: 'flood'` with `expires_at = now + 21600s` (6 hours)
- [ ] API triggers immediate FCM broadcast to devices within 10km radius
- [ ] Flood report icon on map is 🌊 and is larger than other report icons
- [ ] Full-screen flood alert is shown to nearby users in-app
- [ ] Alert includes a "Cari Laluan Selamat" button that triggers flood evacuation routing

**Technical notes:** `REPORT_TYPES.flood = { label: 'Jalan Banjir', icon: '🌊', ttl: 21600, broadcast: true }`; API handler in `arah-functions` sends FCM multicast on `broadcast: true` reports; `reportStore` adds `isCritical: true` flag for larger map icon
**Estimate:** M

---

### MOB-037: Report type — Pothole
**Epic:** Community Reports
**Status:** 🔲 Todo
**Feature:** RPT-001
**Priority:** v1

**As a** driver **I want** to report a pothole **so that** other drivers can slow down and the information is available to road authorities.

**Acceptance criteria:**
- [ ] "Lubang Jalan" tile submits `type: 'pothole'` with `expires_at = now + 604800s` (7 days)
- [ ] Map icon: 🕳️
- [ ] Long TTL reflects that potholes are slow to be repaired
- [ ] Report shows upvote count (each upvote = additional confirmation)
- [ ] After 10 upvotes, report is automatically elevated to "Tergesah" (verified) status

**Technical notes:** `REPORT_TYPES.pothole = { label: 'Lubang Jalan', icon: '🕳️', ttl: 604800 }`; "Tergesah" status set by Cloud Function when `upvotes >= 10`
**Estimate:** S

---

### MOB-038: Report type — Roadblock / police checkpoint
**Epic:** Community Reports
**Status:** 🔲 Todo
**Feature:** RPT-001
**Priority:** MVP

**As a** driver **I want** to report a police roadblock **so that** other drivers are prepared and allow extra travel time.

**Acceptance criteria:**
- [ ] "Sekatan Jalan Raya" tile submits `type: 'roadblock'` with `expires_at = now + 86400s` (24 hours)
- [ ] Map icon: 🚧
- [ ] Approaching alert within 1km during active navigation (longer alert distance than other types)
- [ ] Alert audio: "Dalam 1 kilometer, ada sekatan polis"
- [ ] Roadblocks are displayed with bold outline to distinguish from other road types

**Technical notes:** `REPORT_TYPES.roadblock = { label: 'Sekatan Jalan Raya', icon: '🚧', ttl: 86400, alertDistanceMeters: 1000 }`; `ALERT_DISTANCES` map in `src/constants/reportTypes.ts`
**Estimate:** S

---

### MOB-039: Report type — Road hazard
**Epic:** Community Reports
**Status:** 🔲 Todo
**Feature:** RPT-001
**Priority:** v1

**As a** driver **I want** to report debris, fallen trees, or animals on the road **so that** other drivers can slow down or avoid the hazard.

**Acceptance criteria:**
- [ ] "Bahaya Jalan" tile opens a sub-selector: "Serpihan/Debris", "Pokok Tumbang", "Haiwan"
- [ ] Submits `type: 'hazard'` with `metadata.hazard_type` field; `expires_at = now + 14400s` (4 hours)
- [ ] Map icon: ⚠️
- [ ] Hazard sub-type label is shown in report detail sheet
- [ ] Approaching alert within 300m during navigation

**Technical notes:** `REPORT_TYPES.hazard = { label: 'Bahaya Jalan', icon: '⚠️', ttl: 14400, subtypes: ['debris', 'fallen_tree', 'animal'] }`
**Estimate:** S

---

### MOB-040: Report type — Road construction
**Epic:** Community Reports
**Status:** 🔲 Todo
**Feature:** RPT-001
**Priority:** v1

**As a** driver **I want** to report road construction **so that** other drivers expect delays and can choose an alternative route.

**Acceptance criteria:**
- [ ] "Kerja Jalan Raya" tile submits `type: 'construction'` with `expires_at = now + 259200s` (3 days)
- [ ] Map icon: 🏗️
- [ ] Route calculation avoids construction-affected segments when alternative available
- [ ] Report detail shows estimated road affected length (entered by reporter, optional)
- [ ] Approaching alert: "Dalam 500 meter, ada kerja jalan raya"

**Technical notes:** `REPORT_TYPES.construction = { label: 'Kerja Jalan Raya', icon: '🏗️', ttl: 259200 }`; optional metadata field `road_length_m`
**Estimate:** S

---

### MOB-041: Report type — Broken traffic light
**Epic:** Community Reports
**Status:** 🔲 Todo
**Feature:** RPT-001
**Priority:** v1

**As a** driver **I want** to report a broken traffic light **so that** other drivers approach the intersection with caution.

**Acceptance criteria:**
- [ ] "Lampu Isyarat Rosak" tile submits `type: 'broken_light'` with `expires_at = now + 172800s` (48 hours)
- [ ] Map icon: 🚦 (crossed out)
- [ ] Approaching alert: "Lampu isyarat rosak di hadapan — berhati-hati"
- [ ] Report detail shows time since reported
- [ ] Auto-expires after 48 hours (typical repair time)

**Technical notes:** `REPORT_TYPES.broken_light = { label: 'Lampu Isyarat Rosak', icon: '🚦', ttl: 172800 }`
**Estimate:** S

---

### MOB-042: Report type — Wrong-way driver emergency
**Epic:** Community Reports
**Status:** 🔲 Todo
**Feature:** RPT-001
**Priority:** MVP

**As a** driver **I want** to report a wrong-way driver **so that** the platform immediately alerts all nearby users to avoid a head-on collision.

**Acceptance criteria:**
- [ ] "Pemandu Lawan Arah" submits `type: 'wrong_way'` with `expires_at = now + 1800s` (30 min)
- [ ] API triggers immediate FCM broadcast to all devices within 20km
- [ ] In-app full-screen red alert shown to receiving users: "BAHAYA: Pemandu Lawan Arah Di Hadapan"
- [ ] Alert includes audio siren and cannot be dismissed without tapping "Faham"
- [ ] Report icon: 🚨 displayed prominently; auto-removes after 30 minutes

**Technical notes:** `REPORT_TYPES.wrong_way = { label: 'Pemandu Lawan Arah', icon: '🚨', ttl: 1800, broadcast: true, broadcastRadiusKm: 20, priority: 'emergency' }`; FCM notification priority `high`; alert screen `src/screens/EmergencyAlertScreen.tsx`
**Estimate:** M

---

### MOB-043: Report type — Event road closure
**Epic:** Community Reports
**Status:** 🔲 Todo
**Feature:** RPT-001
**Priority:** v1

**As a** driver **I want** to report an event-related road closure (marathon, parade, VIP motorcade) **so that** other drivers plan alternative routes.

**Acceptance criteria:**
- [ ] "Penutupan Jalan — Acara" tile submits `type: 'event_closure'` with `expires_at = now + 86400s`
- [ ] Map icon: 🎪
- [ ] Reporter can optionally enter event name (free text, max 50 chars)
- [ ] Route calculation avoids the affected road when an alternative exists
- [ ] Report expires in 24 hours regardless of actual event end time

**Technical notes:** `REPORT_TYPES.event_closure = { label: 'Penutupan Jalan — Acara', icon: '🎪', ttl: 86400 }`; optional metadata `event_name: string`
**Estimate:** S

---

### MOB-044: In-navigation approach alert for reports on route
**Epic:** Community Reports
**Status:** 🔲 Todo
**Feature:** RPT-001
**Priority:** MVP

**As a** driver **I want** to be alerted when approaching a reported hazard on my route **so that** I have time to slow down or prepare.

**Acceptance criteria:**
- [ ] During active navigation, `reportStore.reportsOnRoute` is computed every 5s from active route polyline
- [ ] When `distanceToReport < alertDistance` (type-specific, default 500m), show approach banner
- [ ] Banner shows report type icon, label, and distance: "🚧 Sekatan — 300m ke hadapan"
- [ ] Audio alert plays once per report (not repeated until past the report)
- [ ] Banner auto-dismisses when user passes the report location

**Technical notes:** `src/hooks/useReportApproachAlert.ts`; point-to-polyline distance algorithm; `alertDistance` from `REPORT_TYPES[type].alertDistanceMeters`; audio via `expo-av`; banner component `src/components/navigation/ReportApproachBanner.tsx`
**Estimate:** M

---

### MOB-045: Photo attachment when submitting report
**Epic:** Community Reports
**Status:** 🔲 Todo
**Feature:** RPT-001
**Priority:** v1

**As a** driver (when stationary) **I want** to attach a photo to my road report **so that** other users and moderators can see proof of the hazard.

**Acceptance criteria:**
- [ ] Camera button appears in `ReportScreen` for non-moving submissions (speed < 5 km/h)
- [ ] `expo-image-picker` launches camera or gallery; image compressed to < 2MB
- [ ] Photo thumbnail previews in `ReportScreen` before submission
- [ ] On submit, `POST /v1/reports/:id/photo` (multipart/form-data) uploads the image
- [ ] Report detail sheet shows photo thumbnail if attached
- [ ] Photo upload failure does not block report submission — handled gracefully

**Technical notes:** `expo-image-picker` `launchCameraAsync` + `ImageManipulator.manipulateAsync` to compress; `FormData` multipart upload; `POST /v1/reports/:id/photo` API route; speed check from `locationService.lastLocation.speed`
**Estimate:** M

---

### MOB-046: Flag report as spam or inappropriate
**Epic:** Community Reports
**Status:** 🔲 Todo
**Feature:** RPT-001
**Priority:** v1

**As a** driver **I want** to flag a report as spam **so that** fake or malicious reports are reviewed and removed by moderators.

**Acceptance criteria:**
- [ ] 3-dot menu on report detail sheet has "Laporkan sebagai Spam" option
- [ ] Tapping calls `POST /v1/reports/:id/flag` with `reason: 'spam'`
- [ ] Confirmation toast: "Laporan telah dilaporkan. Terima kasih."
- [ ] User can only flag a report once (tracked server-side by `user_hash`)
- [ ] Report with 3+ flags moves to moderation queue in admin web panel

**Technical notes:** `reportService.flagReport(id: string): Promise<void>` → `POST /v1/reports/:id/flag`; `{ reason: 'spam', user_hash }` body; server increments `flag_count` in Firestore; Cloud Function auto-deactivates at `flag_count >= 3`
**Estimate:** S

---

### MOB-047: My reports history in profile screen
**Epic:** Community Reports
**Status:** 🔲 Todo
**Feature:** RPT-001
**Priority:** v1

**As a** driver **I want** to see a history of reports I have submitted **so that** I can track my contributions and check if my reports are still active.

**Acceptance criteria:**
- [ ] "Laporan Saya" tab in profile screen shows personal report history
- [ ] List shows: type icon, location name (reverse geocoded), relative time, vote counts, status (active/expired)
- [ ] Fetches `GET /v1/reports/mine` (backend filters by `user_hash`)
- [ ] Pull-to-refresh reloads the list
- [ ] Tapping a report navigates to map view centred on the report location

**Technical notes:** `src/screens/Profile/MyReportsTab.tsx`; `GET /v1/reports/mine` authenticated endpoint; reverse geocode each report location lazily on render; `reportService.getMyReports(): Promise<Report[]>`
**Estimate:** M

---

## Epic 4: Real-Time WebSocket

### MOB-048: Connect to Socket.io reports namespace on app foreground
**Epic:** Real-Time WebSocket
**Status:** 🔲 Todo
**Feature:** WS-001
**Priority:** v1

**As a** driver **I want** real-time map updates **so that** new reports appear on my map immediately without manual refresh.

**Acceptance criteria:**
- [ ] `socketService.connect()` is called when app enters foreground (`AppState = 'active'`)
- [ ] Connects to Socket.io `/reports` namespace at `WS_URL` from env config
- [ ] Connection carries Firebase ID token in auth handshake: `{ auth: { token: idToken } }`
- [ ] `socketService.disconnect()` called when app has been in background for > 5 minutes
- [ ] Connection status indicator in debug overlay (dev builds only)

**Technical notes:** `src/services/socketService.ts`; `io(WS_URL + '/reports', { auth: { token } })`; `AppState.addEventListener` to track transitions; background timer in `src/hooks/useAppForeground.ts`; `socket-io.client` v4+
**Estimate:** M

---

### MOB-049: Join geohash rooms for localised report updates
**Epic:** Real-Time WebSocket
**Status:** 🔲 Todo
**Feature:** WS-001
**Priority:** v1

**As a** driver **I want** the app to only receive reports from the area I'm currently viewing **so that** the connection is efficient and relevant.

**Acceptance criteria:**
- [ ] On connection and on map viewport change, emit `join` event with 5-char geohash of viewport centre
- [ ] Also join the 8 adjacent geohash cells (3×3 grid around centre)
- [ ] When viewport centre changes geohash, emit `leave` for old cells and `join` for new cells
- [ ] Geohash calculation uses `ngeohash` library
- [ ] Viewport change debounced 1000ms to avoid excessive room switches

**Technical notes:** `src/services/socketService.ts` `joinGeohashRooms(lat, lng)`; `ngeohash.encode(lat, lng, 5)` + `ngeohash.neighbors(hash)` for adjacent cells; debounce in `src/hooks/useMapViewport.ts`
**Estimate:** S

---

### MOB-050: Receive report:new event and add pin immediately
**Epic:** Real-Time WebSocket
**Status:** 🔲 Todo
**Feature:** WS-001
**Priority:** v1

**As a** driver **I want** new community reports to appear on the map in real time **so that** I see hazards the moment they are reported.

**Acceptance criteria:**
- [ ] `socket.on('report:new', handler)` listener adds report to `reportStore` immediately
- [ ] New report pin animates onto the map (scale-in from 0 over 300ms)
- [ ] If the new report is on the active route and within 500m ahead, approach alert is triggered immediately
- [ ] Duplicate reports (same `id`) are deduplicated by `reportStore.addReport`
- [ ] Event handler is removed on component unmount / socket disconnect

**Technical notes:** `src/services/socketService.ts` `onReportNew(callback)`; `reportStore.addReport` checks `existingIds.has(report.id)` before adding; animation via MapLibre `PointAnnotation` `Animated.Value`
**Estimate:** S

---

### MOB-051: Receive report:removed event and remove pin
**Epic:** Real-Time WebSocket
**Status:** 🔲 Todo
**Feature:** WS-001
**Priority:** v1

**As a** driver **I want** removed reports to disappear from the map in real time **so that** I'm not misled by stale hazard pins.

**Acceptance criteria:**
- [ ] `socket.on('report:removed', handler)` removes report from `reportStore` immediately
- [ ] Removed report pin disappears from map within 100ms of event received
- [ ] If an approach alert is currently showing for the removed report, it is dismissed
- [ ] Report removal is also triggered locally when `expires_at` is reached (client-side timer)
- [ ] `reportStore.removeReport(id)` is idempotent — no error if report already absent

**Technical notes:** `src/services/socketService.ts` `onReportRemoved(callback)`; `reportStore.removeReport(id: string)`; client-side expiry timer set in `reportStore.addReport` using `setTimeout` to `removeReport` at `expires_at`
**Estimate:** S

---

### MOB-052: WebSocket reconnection with exponential backoff
**Epic:** Real-Time WebSocket
**Status:** 🔲 Todo
**Feature:** WS-001
**Priority:** v1

**As a** driver **I want** the app to automatically reconnect to the WebSocket after network interruption **so that** real-time updates resume without manual intervention.

**Acceptance criteria:**
- [ ] On disconnect, reconnection is attempted after 1s, 2s, 4s, 8s, max 30s (exponential backoff)
- [ ] "Menyambung semula..." toast appears after first failed reconnection attempt
- [ ] Toast disappears and "Disambung semula" success toast shows on reconnection
- [ ] After reconnection, geohash rooms are re-joined automatically
- [ ] After reconnection, `GET /v1/reports?bbox=...` is called once to sync any missed reports during disconnect

**Technical notes:** Socket.io client built-in `reconnection: true`, `reconnectionDelayMax: 30000`, `reconnectionDelay: 1000`, `reconnectionAttempts: Infinity`; listen to `'reconnect'` event to re-join rooms and sync; toast via `react-native-toast-message`
**Estimate:** M

---

## Epic 5: Malaysia-Specific Features

### MOB-053: Flash flood zone detection while navigating
**Epic:** Malaysia-Specific Features
**Status:** 🔲 Todo
**Feature:** MY-001
**Priority:** MVP

**As a** Malaysian driver **I want** to be warned when navigating into a known flash flood zone **so that** I can avoid it before my car gets trapped.

**Acceptance criteria:**
- [ ] While navigating, poll `GET /v1/flood-zones/check?lat=&lng=` every 60 seconds
- [ ] If response `in_flood_zone: true`, show full-screen overlay alert
- [ ] Overlay alert: "Amaran Banjir Kilat — Anda mungkin memasuki kawasan banjir"
- [ ] Overlay has button "Cari Laluan Selamat" (triggers flood evacuation routing)
- [ ] Overlay has button "Teruskan Perjalanan" to dismiss
- [ ] Polling stops if user dismisses with "Teruskan" and resumes if position changes significantly (> 500m)

**Technical notes:** `src/hooks/useFloodZoneCheck.ts`; `setInterval(60000)` during `navigationState = 'navigating'`; flood zone check API: `GET /v1/flood-zones/check?lat={lat}&lng={lng}`; full-screen overlay `src/screens/FloodAlertScreen.tsx`
**Estimate:** M

---

### MOB-054: Flood evacuation routing avoiding flood zones
**Epic:** Malaysia-Specific Features
**Status:** 🔲 Todo
**Feature:** MY-001
**Priority:** MVP

**As a** Malaysian driver in a flood situation **I want** the app to route me to safety avoiding flooded areas **so that** I can evacuate quickly without guessing safe roads.

**Acceptance criteria:**
- [ ] "Cari Laluan Selamat" recalculates route using Valhalla `avoid_areas` polygon parameter
- [ ] Flood zone polygons from `GET /v1/flood-zones` are passed as `avoid_areas` to routing request
- [ ] New route is drawn in a distinct "evacuation" style (green polyline, dashed)
- [ ] Navigation switches to the new evacuation route automatically
- [ ] ETA and distance update to reflect new route

**Technical notes:** `routingService.getEvacuationRoute(userLocation, safeDestination, floodZonePolygons)`; Valhalla `avoid_areas: [{ type: "Polygon", coordinates: [...] }]`; `routingStore.setActiveRoute(evacuationRoute)`; distinct `RouteLayer` style for evacuation routes
**Estimate:** M

---

### MOB-055: Waktu solat overlay for current location
**Epic:** Malaysia-Specific Features
**Status:** 🔲 Todo
**Feature:** MY-002
**Priority:** v1

**As a** Muslim driver **I want** to see today's prayer times for my current location **so that** I can plan driving breaks around solat times.

**Acceptance criteria:**
- [ ] Collapsible card on map screen shows today's 6 prayer times: Subuh, Syuruk, Zohor, Asar, Maghrib, Isyak
- [ ] Data fetched from `GET /v1/prayer-times?lat=&lng=` using current GPS coordinates
- [ ] Prayer times are state-zone-specific (e.g. different for Selangor vs Kelantan)
- [ ] Next prayer time is highlighted; countdown timer shows time remaining
- [ ] Card collapses to a single-line summary when not expanded: "Zohor: 1:14 PM (dalam 42 min)"

**Technical notes:** `src/components/PrayerTimesCard.tsx`; `GET /v1/prayer-times?lat={lat}&lng={lng}` returns `{ zone: string, times: { subuh, syuruk, zohor, asar, maghrib, isyak } }`; cache response for 24 hours; countdown via `setInterval(1000)`
**Estimate:** M

---

### MOB-056: Nearest masjid/surau search along route
**Epic:** Malaysia-Specific Features
**Status:** 🔲 Todo
**Feature:** MY-002
**Priority:** v1

**As a** Muslim driver **I want** to find the nearest mosque or surau along my route **so that** I can stop for prayer without a major detour.

**Acceptance criteria:**
- [ ] "Cari Masjid/Surau" button in navigation HUD or search screen
- [ ] `GET /v1/geocode/search?along_route=true&category=mosque` returns masjid/surau within 2km of route
- [ ] Results show name, distance off-route, and estimated detour time
- [ ] Tapping a result adds it as a waypoint
- [ ] Nominatim filter: `amenity=place_of_worship` + `religion=muslim`

**Technical notes:** `src/features/poi/MasjidSearch.tsx`; `GET /v1/geocode/search?near={lat},{lng}&category=mosque&along_route=true`; result type `POIResult { name, lat, lng, detourMinutes }`
**Estimate:** M

---

### MOB-057: PLUS R&R locator along intercity route
**Epic:** Malaysia-Specific Features
**Status:** 🔲 Todo
**Feature:** MY-002
**Priority:** v1

**As a** driver on a highway trip **I want** to see PLUS R&R rest stops along my route **so that** I know where to stop for food, fuel, and rest.

**Acceptance criteria:**
- [ ] "Cari R&R" button in navigation HUD shows when route uses a highway
- [ ] Search returns R&R stops with OSM tags `amenity=fuel` + `highway=rest_area` within 5km of route
- [ ] Each R&R shows name (e.g. "R&R Sg. Buloh"), direction (northbound/southbound), distance ahead
- [ ] Tapping R&R adds it as next waypoint
- [ ] R&R icons are distinct on the map when search is active

**Technical notes:** `src/features/poi/RnRSearch.tsx`; `GET /v1/geocode/search?category=rest_stop&along_route=true&within_km=5`; filter OSM `name` containing "R&R"; display in scrollable bottom sheet list
**Estimate:** M

---

### MOB-058: Zon Selamat school zone speed alert
**Epic:** Malaysia-Specific Features
**Status:** 🔲 Todo
**Feature:** MY-003
**Priority:** v1

**As a** driver **I want** to be alerted when entering a school zone during school hours **so that** I remember to slow down to 30 km/h as required by Malaysian traffic law.

**Acceptance criteria:**
- [ ] When entering a school zone geofence, audio alert: "Anda memasuki Zon Selamat — had laju 30 km/j"
- [ ] Alert is only triggered during school hours: 7:00–8:00 AM and 1:00–2:00 PM, Monday–Friday, during school terms
- [ ] 30 km/h speed limit badge appears in HUD, overriding the road's regular speed limit
- [ ] Alert silences automatically when user exits the geofence
- [ ] School zone polygons loaded from `GET /v1/school-zones` (cached 24 hours)

**Technical notes:** `src/hooks/useSchoolZoneAlert.ts`; `turf/boolean-point-in-polygon` for geofence check; school term dates in `src/constants/schoolTerms.ts` (Malaysia MOE calendar); `GET /v1/school-zones` returns GeoJSON FeatureCollection
**Estimate:** M

---

### MOB-059: Balik Kampung festive traffic warning
**Epic:** Malaysia-Specific Features
**Status:** 🔲 Todo
**Feature:** MY-003
**Priority:** v1

**As a** Malaysian driver during Raya, CNY, or Deepavali **I want** to see traffic delay warnings for festive exodus routes **so that** I can leave at a better time or prepare for a longer journey.

**Acceptance criteria:**
- [ ] When destination is outside home state during festive dates, banner shows: "Jangkaan trafik: +40 minit (Musim Perayaan)"
- [ ] Festive dates: Hari Raya Aidilfitri (2 days before, 3 days after), CNY (eve + 2 days), Deepavali (eve + 1 day)
- [ ] Delay estimate from `routeResponse.festive_delay_minutes` (API field)
- [ ] Banner links to "Peta Trafik" view showing congestion overlay
- [ ] Home state determined from `userProfile.homeState` or first saved-place state

**Technical notes:** `src/utils/festiveDates.ts` precomputed dates for 2025–2027; banner `src/components/FestiveTrafficBanner.tsx`; `routingStore.activeRoute.festive_delay_minutes` from API response
**Estimate:** M

---

### MOB-060: Emergency hotline quick-dial in navigation HUD
**Epic:** Malaysia-Specific Features
**Status:** 🔲 Todo
**Feature:** MY-004
**Priority:** MVP

**As a** driver in an emergency **I want** a quick-dial button in the navigation HUD **so that** I can call emergency services without fumbling through my contacts.

**Acceptance criteria:**
- [ ] SOS button is fixed in the top-right corner of the navigation HUD
- [ ] Tapping opens an action sheet with: "999 — Polis/Ambulans", "994 — Bomba", "1800-88-0000 — PLUS Hotline"
- [ ] Tapping a number immediately opens the phone dialler with the number pre-filled
- [ ] Button is reachable with one thumb and has minimum 44×44 pt touch target
- [ ] Button is visible in both day and night map themes

**Technical notes:** `src/components/navigation/SOSButton.tsx`; `Linking.openURL('tel:999')`; action sheet via `@react-native/action-sheet-ios` on iOS or `react-native-action-sheet`
**Estimate:** S

---

### MOB-061: Malaysian postcode search
**Epic:** Malaysia-Specific Features
**Status:** 🔲 Todo
**Feature:** MY-005
**Priority:** v1

**As a** Malaysian user **I want** to search by postcode **so that** I can quickly find areas I know by postcode rather than full address.

**Acceptance criteria:**
- [ ] Typing a 5-digit number in search bar triggers `GET /v1/geocode/postcode/:postcode`
- [ ] Result shows the area name and state: e.g. "50450 — Kuala Lumpur, Wilayah Persekutuan"
- [ ] Tapping result centres map on postcode centroid
- [ ] All Malaysian postcodes from 01000 to 98850 are supported
- [ ] Invalid postcodes show "Poskod tidak dijumpai" message

**Technical notes:** `geocodingService.searchPostcode(postcode: string)` → `GET /v1/geocode/postcode/:postcode`; postcode detection: `query.match(/^\d{5}$/)` in `SearchScreen`; API backed by Malaysia postcode dataset
**Estimate:** S

---

### MOB-062: Malaysian address format display in search results
**Epic:** Malaysia-Specific Features
**Status:** 🔲 Todo
**Feature:** MY-005
**Priority:** v1

**As a** Malaysian user **I want** search results to show addresses in the Malaysian format **so that** they look familiar and are easy to read.

**Acceptance criteria:**
- [ ] Address results render in format: `No. 12, Jalan Ampang, Taman Ampang Indah, 68000 Ampang, Selangor`
- [ ] `formatMalaysianAddress(nominatimResult)` utility function maps Nominatim fields to Malaysian order
- [ ] "Jalan", "Lorong", "Lebuh", "Persiaran", "Jalan Besar" are correctly capitalised
- [ ] State abbreviations are expanded: "KL" → "Kuala Lumpur", "SBH" → "Sabah", "SWK" → "Sarawak"
- [ ] Postcode always appears before city name in the formatted string

**Technical notes:** `src/utils/formatMalaysianAddress.ts`; Nominatim fields: `road, suburb, city, postcode, state`; state expansion map `STATE_NAMES` in `src/constants/states.ts`
**Estimate:** S

---

### MOB-063: East Malaysia (Sabah & Sarawak) routing and tile validation
**Epic:** Malaysia-Specific Features
**Status:** 🔲 Todo
**Feature:** MY-005
**Priority:** v1

**As a** driver in Sabah or Sarawak **I want** the map and routing to work correctly for East Malaysia **so that** Arah is fully usable outside the peninsula.

**Acceptance criteria:**
- [ ] Map tiles render correctly for Sabah (lat 4.0–7.4, lng 115.0–119.5)
- [ ] Map tiles render correctly for Sarawak (lat 0.8–5.3, lng 109.5–115.0)
- [ ] Route calculation works between East Malaysian cities (e.g. Kota Kinabalu to Sandakan)
- [ ] Search returns results for East Malaysian addresses and landmarks
- [ ] Malaysia bounds `MAP_CONFIG.MALAYSIA_BOUNDS` includes East Malaysia extents

**Technical notes:** Test coordinates: KK (5.9804, 116.0735), Sandakan (5.8390, 118.1179), Kuching (1.5497, 110.3592); `MAP_CONFIG.MALAYSIA_BOUNDS = { sw: [0.8, 99.5], ne: [7.5, 119.5] }`; PMTiles must include East Malaysia tiles
**Estimate:** M

---

### MOB-064: Petrol price display for nearest stations
**Epic:** Malaysia-Specific Features
**Status:** 🔲 Todo
**Feature:** MY-005
**Priority:** v1

**As a** Malaysian driver **I want** to see current petrol prices at nearby stations **so that** I know the RON95 / RON97 / diesel price before stopping.

**Acceptance criteria:**
- [ ] "Stesen Minyak Berdekatan" in POI search shows stations with price labels
- [ ] Prices fetched from `GET /v1/petrol-prices?lat=&lng=` (radius 5km)
- [ ] Prices displayed: RON95 (green badge), RON97 (blue badge), Diesel (yellow badge)
- [ ] Prices reflect the current weekly BHPetrol/Petronas government-controlled price
- [ ] Data cached for 24 hours (Malaysian government updates prices weekly)

**Technical notes:** `src/features/poi/PetrolStationSearch.tsx`; `GET /v1/petrol-prices?lat={lat}&lng={lng}` returns `{ stations: [{ name, lat, lng, prices: { ron95, ron97, diesel } }] }`; price data sourced from Malaysian government API
**Estimate:** M

---

### MOB-065: Johor–Singapore checkpoint community wait time
**Epic:** Malaysia-Specific Features
**Status:** 🔲 Todo
**Feature:** MY-005
**Priority:** v2

**As a** driver crossing to/from Singapore **I want** to see community-reported wait times at the Woodlands and Tuas checkpoints **so that** I choose the less congested crossing.

**Acceptance criteria:**
- [ ] When navigating near JB (lat ~1.47, lng ~103.7), "Masa Tunggu CIQ" card appears
- [ ] Shows Woodlands and Tuas wait times from Firestore `checkpoints` collection
- [ ] Wait times sourced from community reports + official API where available
- [ ] Updates every 5 minutes; last-updated timestamp shown
- [ ] "Terlalu lama" badge shown in red when wait > 60 min

**Technical notes:** `src/components/CheckpointCard.tsx`; Firestore listener on `checkpoints/{woodlands,tuas}` documents; trigger: user within 30km of Johor Bahru; wait time in minutes from `checkpoint.wait_minutes`
**Estimate:** M

---

### MOB-066: Jawi script map label toggle
**Epic:** Malaysia-Specific Features
**Status:** 🔲 Todo
**Feature:** MY-005
**Priority:** v2

**As a** Malaysian user who reads Jawi **I want** to see road and place names in Jawi script on the map **so that** the map reflects the traditional Malay writing system.

**Acceptance criteria:**
- [ ] "Tulisan Jawi" toggle in settings switches map labels to `name:ms-Arab` OSM tag where available
- [ ] Fallback to `name:ms` (Rumi) when Jawi name is not in OSM
- [ ] Toggle applies to all text layers in the MapLibre style JSON
- [ ] Preference persisted in `mapStore.labelLanguage: 'ms' | 'ms-Arab' | 'en'`
- [ ] Road shields and POI icons remain unchanged; only label text changes

**Technical notes:** MapLibre style `text-field` expression: `['coalesce', ['get', 'name:ms-Arab'], ['get', 'name:ms'], ['get', 'name']]`; toggle updates `mapStore.labelLanguage` and triggers style JSON regeneration; font stack must include Arabic/Jawi fonts in style JSON
**Estimate:** L

---

## Epic 6: Search & Discovery

### MOB-067: Address search with Malaysian format support
**Epic:** Search & Discovery
**Status:** 🔲 Todo
**Feature:** SRC-001
**Priority:** MVP

**As a** driver **I want** to search for a full Malaysian address **so that** I can navigate to a specific unit number and street.

**Acceptance criteria:**
- [ ] Search accepts full Malaysian address strings (e.g. "No. 10, Jalan Bukit Bintang, KL")
- [ ] Nominatim query uses `countrycodes=my` to restrict results to Malaysia
- [ ] Results are ranked by relevance and distance from current location
- [ ] Address result cards show full formatted address in Malaysian format
- [ ] Search debounced at 300ms; minimum 3 characters before search fires

**Technical notes:** `geocodingService.searchAddress(query)` → `GET /v1/geocode/search?q={query}&countrycodes=my`; `formatMalaysianAddress` applied to each result; `src/screens/SearchScreen.tsx`
**Estimate:** S

---

### MOB-068: Recent searches stored locally
**Epic:** Search & Discovery
**Status:** 🔲 Todo
**Feature:** SRC-001
**Priority:** MVP

**As a** returning user **I want** my recent search queries to appear when I open the search bar **so that** I can quickly navigate to frequently visited places.

**Acceptance criteria:**
- [ ] Last 20 search queries stored in AsyncStorage under `@arah/recent_searches`
- [ ] Recent searches appear in a list below the search bar when input is empty
- [ ] Each recent search shows icon (pin), query text, and a remove button
- [ ] Tapping a recent search populates the search bar and fires the search
- [ ] "Kosongkan Carian Terkini" button clears all recent searches

**Technical notes:** `src/hooks/useRecentSearches.ts`; `AsyncStorage.setItem('@arah/recent_searches', JSON.stringify(searches.slice(0, 20)))`; new searches are prepended; duplicates are moved to top
**Estimate:** S

---

### MOB-069: Home and Work saved place shortcuts
**Epic:** Search & Discovery
**Status:** 🔲 Todo
**Feature:** SRC-001
**Priority:** MVP

**As a** commuter **I want** Home and Work shortcut chips below the search bar **so that** I can start navigating home or to work with one tap.

**Acceptance criteria:**
- [ ] "Rumah" and "Tempat Kerja" chips appear below search bar when input is empty
- [ ] Tapping a chip immediately fetches route from current location to saved place
- [ ] Chips are greyed out with a "+" icon if home/work is not yet saved
- [ ] Tapping unset chip opens "Tetapkan Lokasi Rumah/Kerja" flow
- [ ] Saved places synced from `GET /v1/profile/saved-places?type=home|work`

**Technical notes:** `src/components/search/SavedPlaceChips.tsx`; `savedPlacesStore.home` and `savedPlacesStore.work` from Zustand; API `GET /v1/profile/saved-places` on auth; one-tap navigate calls `routingService.getRoutes(userLocation, place.coordinates)`
**Estimate:** S

---

### MOB-070: Custom saved places with star button
**Epic:** Search & Discovery
**Status:** 🔲 Todo
**Feature:** SRC-001
**Priority:** v1

**As a** driver **I want** to save any location with a custom name **so that** I can quickly navigate to frequently visited places beyond just home and work.

**Acceptance criteria:**
- [ ] Star button on search result card or long-press on map → "Simpan Tempat" bottom sheet
- [ ] User enters custom name (max 30 chars) and selects an emoji icon
- [ ] Saved via `POST /v1/profile/saved-places { name, lat, lng, icon }`
- [ ] Saved places appear in a "Tersimpan" section below recent searches
- [ ] Delete saved place via swipe-left on the saved places list item

**Technical notes:** `src/screens/SavePlaceSheet.tsx`; `savedPlacesStore.places: SavedPlace[]`; `POST /v1/profile/saved-places`; `DELETE /v1/profile/saved-places/:id` for deletion; emoji picker `src/components/EmojiPicker.tsx`
**Estimate:** M

---

### MOB-071: Search along route for fuel, food, rest stops
**Epic:** Search & Discovery
**Status:** 🔲 Todo
**Feature:** SRC-001
**Priority:** v1

**As a** driver on a long trip **I want** to search for petrol stations, food, or rest stops along my route **so that** I can plan stops without going far off course.

**Acceptance criteria:**
- [ ] "Cari di Laluan" button appears in navigation HUD
- [ ] Category grid: ⛽ Petrol, 🍔 Makanan, 🏨 Hotel, 🏥 Hospital, 🚻 R&R
- [ ] `GET /v1/geocode/search?along_route=true&category={cat}` returns POIs within 2km of route
- [ ] Results show name, detour distance, and detour time estimate
- [ ] Tapping a result inserts it as the next waypoint

**Technical notes:** `src/features/poi/SearchAlongRoute.tsx`; `along_route=true` requires active route polyline encoded in request; category map: `{ petrol: 'fuel', food: 'restaurant|food_court', hotel: 'hotel', hospital: 'hospital', rest_stop: 'rest_area' }`
**Estimate:** M

---

### MOB-072: Where am I — reverse geocode current location
**Epic:** Search & Discovery
**Status:** 🔲 Todo
**Feature:** SRC-001
**Priority:** v1

**As a** driver in an unfamiliar area **I want** to tap on my current location dot and see my full address **so that** I can tell someone where I am or share my location.

**Acceptance criteria:**
- [ ] Tapping the user location blue dot shows a card with the reverse geocoded address
- [ ] `GET /v1/geocode/reverse?lat=&lng=` returns formatted Malaysian address
- [ ] Card shows address, copy-to-clipboard button, and WhatsApp share button
- [ ] Share text: "Saya berada di: {address} — {googleMapsLink}"
- [ ] Card dismisses on map tap; loads within 1 second on 4G

**Technical notes:** `src/components/WhereAmICard.tsx`; `geocodingService.reverseGeocode(lat, lng)` → `GET /v1/geocode/reverse`; Google Maps link: `https://maps.google.com/?q={lat},{lng}`; `Clipboard.setStringAsync` from `expo-clipboard`
**Estimate:** S

---

### MOB-073: Nearby POI browser by category
**Epic:** Search & Discovery
**Status:** 🔲 Todo
**Feature:** SRC-001
**Priority:** v1

**As a** driver **I want** to browse nearby points of interest by category **so that** I can find food, hospitals, or hotels without typing a search query.

**Acceptance criteria:**
- [ ] Category grid (Food, Petrol, Hospital, Hotel, Mall, Masjid) below recent searches
- [ ] Tapping category calls `GET /v1/geocode/search?near={lat},{lng}&category={cat}&radius=5000`
- [ ] Results displayed as a bottom sheet list with distance and walking/driving time
- [ ] Each result has a "Navigasi" button to start navigation immediately
- [ ] Results pins appear on the map while the sheet is open

**Technical notes:** `src/features/poi/NearbyPOI.tsx`; category-to-OSM-tag map in `src/constants/poiCategories.ts`; `GET /v1/geocode/search?near=lat,lng&category=food&radius=5000`; result pins as temporary `PointAnnotation` layer
**Estimate:** M

---

### MOB-074: Deep link handling for arah:// URI scheme
**Epic:** Search & Discovery
**Status:** 🔲 Todo
**Feature:** SRC-001
**Priority:** v1

**As a** developer or power user **I want** to open Arah directly to a navigation target via a deep link **so that** external apps and QR codes can trigger navigation seamlessly.

**Acceptance criteria:**
- [ ] `arah://navigate?lat=3.1390&lng=101.6869` opens the app and starts route preview to the coordinates
- [ ] `arah://search?q=KLCC` opens the app with KLCC pre-searched
- [ ] `arah://place?id=nominatim:123` navigates to a specific Nominatim place ID
- [ ] Invalid deep links show a "Pautan tidak sah" error and land on the home map screen
- [ ] Deep link handler registered in `src/navigation/deepLinkHandler.ts` and wired to React Navigation

**Technical notes:** `src/navigation/deepLinkHandler.ts`; `Linking.addEventListener('url', handler)` and `Linking.getInitialURL()` for cold start; React Navigation `linking` config in `App.tsx`; Android `intent-filter` in `AndroidManifest.xml`; iOS URL scheme in `Info.plist`
**Estimate:** M

---

## Epic 7: Auth & User Profile

### MOB-009: Persist user preferences with MMKV
**Epic:** Auth & User Profile
**Status:** 🔲 Todo
**Feature:** AUTH-001
**Priority:** MVP

**As a** returning user **I want** my language and route preferences saved between sessions **so that** I don't have to reconfigure the app every time.

**Acceptance criteria:**
- [ ] `userStore` uses `zustand/middleware`'s `persist` with a custom MMKV storage adapter
- [ ] Persisted keys: `preferredLanguage`, `avoidTolls`, `avoidHighways`, `savedPlaces`
- [ ] On app restart, preferences are loaded synchronously (MMKV is synchronous)
- [ ] Preferences are also synced to `arah-api PUT /v1/users/me/preferences` when changed
- [ ] Clearing app data or sign-out resets MMKV preferences to defaults

**Technical notes:** MMKV zustand storage adapter using `create(persist(stateCreator, { name: 'user-store', storage: mmkvStorage }))`; `createJSONStorage` from `zustand/middleware` for object serialisation
**Estimate:** S

---

### MOB-011: Phone OTP authentication
**Epic:** Auth & User Profile
**Status:** 🔲 Todo
**Feature:** AUTH-001
**Priority:** MVP

**As a** Malaysian user without a Google account **I want** to sign in using my phone number and OTP **so that** I can access Arah without a Google account.

**Acceptance criteria:**
- [ ] `OnboardingScreen` shows a "Daftar dengan nombor telefon" option below Google Sign-In
- [ ] Phone number input with Malaysian flag prefix (+60)
- [ ] On submit, Firebase Phone Auth sends OTP SMS; user enters 6-digit code
- [ ] On valid OTP, `auth().signInWithCredential(phoneCredential)` is called
- [ ] Error messages in BM: "Nombor tidak sah", "OTP tamat tempoh", etc.

**Technical notes:** `@react-native-firebase/auth` Phone Auth; Android: configure SHA-1/SHA-256 in Firebase console; test phone: +60123456789 (Firebase test credentials)
**Estimate:** M

---

### MOB-012: Route preference settings
**Epic:** Auth & User Profile
**Status:** 🔲 Todo
**Feature:** AUTH-001
**Priority:** MVP

**As a** driver **I want** to set my preferences to avoid tolls or highways **so that** all route calculations respect my budget and driving style.

**Acceptance criteria:**
- [ ] `SettingsScreen` "Tetapan Laluan" section with toggles: "Elak tol" and "Elak lebuh raya"
- [ ] Toggling updates `userStore.updatePreferences(prefs)`
- [ ] Updated preferences persisted to MMKV and synced to `arah-api`
- [ ] Language switcher BM / EN changes `userStore.setLanguage(lang)`
- [ ] Saved places list shown with ability to add/remove

**Technical notes:** `SettingsScreen.tsx` scaffold — implement UI; `Switch` from `react-native`; `PATCH /v1/profile { preferences: { avoid_tolls, avoid_highways } }`
**Estimate:** S

---

### MOB-075: Google Sign-In with Firebase Auth
**Epic:** Auth & User Profile
**Status:** 🔲 Todo
**Feature:** AUTH-001
**Priority:** MVP

**As a** new user **I want** to sign in with my Google account **so that** I can access personalized features without creating a new password.

**Acceptance criteria:**
- [ ] "Log Masuk dengan Google" button on onboarding screen
- [ ] `signInWithCredential(GoogleAuthProvider.credential(idToken))` called after Google sign-in flow
- [ ] Firebase Auth user stored in `authStore.user`
- [ ] Profile data (displayName, photoURL) synced to Firestore `users/{uid}` on first sign-in
- [ ] Token refresh handled automatically by `@react-native-firebase/auth`

**Technical notes:** `@react-native-google-signin/google-signin`; `GoogleSignin.configure({ webClientId: GOOGLE_CLIENT_ID })`; `src/stores/authStore.ts` `user: FirebaseAuthTypes.User | null`; `src/services/authService.ts` `signInWithGoogle()`
**Estimate:** M

---

### MOB-076: Anonymous navigation without sign-in
**Epic:** Auth & User Profile
**Status:** 🔲 Todo
**Feature:** AUTH-001
**Priority:** MVP

**As a** privacy-conscious user **I want** to use navigation without creating an account **so that** my trips are not linked to my identity.

**Acceptance criteria:**
- [ ] "Teruskan tanpa Akaun" button on onboarding screen calls `signInAnonymously()`
- [ ] Anonymous users can use all navigation and map features
- [ ] Anonymous users cannot submit reports (prompted to sign up when trying)
- [ ] "Cipta Akaun" prompt shown in profile screen for anonymous users
- [ ] `linkWithCredential` converts anonymous account to permanent account preserving data

**Technical notes:** `firebase.auth().signInAnonymously()`; `authStore.isAnonymous = user.isAnonymous`; `src/screens/Onboarding/OnboardingScreen.tsx`; anonymous user check before `reportService.submitReport`
**Estimate:** S

---

### MOB-077: User profile screen
**Epic:** Auth & User Profile
**Status:** 🔲 Todo
**Feature:** AUTH-001
**Priority:** MVP

**As a** signed-in user **I want** a profile screen showing my information and stats **so that** I can see my account details and contributions to the community.

**Acceptance criteria:**
- [ ] `ProfileScreen` (`src/screens/Profile/ProfileScreen.tsx`) shows: avatar, display name, join date, report count
- [ ] Report count fetched from `GET /v1/profile`
- [ ] Badge grid shows earned achievement badges (first_report, 10_reports, etc.)
- [ ] "My Reports" tab shows personal report history (MOB-047)
- [ ] "Tetapan" button navigates to `SettingsScreen`

**Technical notes:** `src/screens/Profile/ProfileScreen.tsx`; `GET /v1/profile` returns `{ displayName, photoURL, reportCount, badges: string[] }`; avatar from Firebase `user.photoURL`; `FlatList` for badge grid
**Estimate:** M

---

### MOB-078: Language setting BM/EN with i18n
**Epic:** Auth & User Profile
**Status:** 🔲 Todo
**Feature:** AUTH-001
**Priority:** MVP

**As a** user **I want** to switch the app language between Bahasa Malaysia and English **so that** I can use the app in my preferred language.

**Acceptance criteria:**
- [ ] Language selector in settings: BM / EN radio buttons
- [ ] All UI strings update immediately on language change without app restart
- [ ] Language preference persisted in Firestore `users/{uid}.language` and MMKV
- [ ] `i18n.changeLanguage(lang)` from `react-i18next` applies immediately
- [ ] TTS voice guidance language also switches (MOB-006 enhancement)

**Technical notes:** `src/i18n/index.ts`; `react-i18next`; `i18n.changeLanguage('ms' | 'en')`; translation files `src/i18n/ms.json` and `src/i18n/en.json`; `PATCH /v1/profile { language }` on change
**Estimate:** M

---

### MOB-079: Route preferences synced to API
**Epic:** Auth & User Profile
**Status:** 🔲 Todo
**Feature:** AUTH-001
**Priority:** v1

**As a** user on multiple devices **I want** my route preferences to sync to my account **so that** they apply on any device I sign in to.

**Acceptance criteria:**
- [ ] Avoid tolls, avoid highways preferences sent to `PATCH /v1/profile { preferences }` on change
- [ ] Preferences loaded from `GET /v1/profile` on sign-in and merged with local MMKV values
- [ ] API preferences take precedence over local values on conflict
- [ ] Sync is debounced (500ms) to avoid excessive API calls during toggle
- [ ] Preferences accessible across Android and iOS devices with the same account

**Technical notes:** `src/stores/userPreferencesStore.ts`; `profileService.updatePreferences(prefs)` → `PATCH /v1/profile`; loaded in `authStore` `onAuthStateChanged` callback
**Estimate:** S

---

### MOB-080: Vehicle type selector affects routing profile
**Epic:** Auth & User Profile
**Status:** 🔲 Todo
**Feature:** AUTH-001
**Priority:** v1

**As a** motorcyclist or van driver **I want** to set my vehicle type **so that** routes are optimised for my vehicle's restrictions.

**Acceptance criteria:**
- [ ] Vehicle type selector in settings: Car / Motorcycle / Van / Truck
- [ ] Selection persisted in `userPreferencesStore.vehicleType`
- [ ] Vehicle type maps to Valhalla costing profile: car=`auto`, motorcycle=`motorcycle`, van=`auto` + size restrictions
- [ ] Route calculations use the selected vehicle costing profile
- [ ] `PATCH /v1/profile { vehicleType }` syncs to API

**Technical notes:** `src/components/VehicleTypeSelector.tsx`; `VEHICLE_PROFILES: { car: 'auto', motorcycle: 'motorcycle', van: 'auto', truck: 'truck' }`; Valhalla `costing` parameter in `GET /v1/route?costing={profile}`
**Estimate:** S

---

### MOB-081: Notification preferences management
**Epic:** Auth & User Profile
**Status:** 🔲 Todo
**Feature:** AUTH-001
**Priority:** v1

**As a** user **I want** to control which types of notifications I receive **so that** I only get alerts that are relevant to me.

**Acceptance criteria:**
- [ ] Notification settings screen shows toggles for: Flood Alerts, Nearby Reports, Achievement Badges, App Updates
- [ ] Each toggle updates Firestore `users/{uid}.notifications.{type}: boolean`
- [ ] FCM topic subscriptions updated based on toggles: `firebase.messaging().subscribeToTopic('flood_alerts')`
- [ ] Flood alerts are always enabled and cannot be turned off (safety-critical)
- [ ] Notification permission request shown if system permission not yet granted

**Technical notes:** `src/screens/Settings/NotificationSettings.tsx`; `@react-native-firebase/messaging` `subscribeToTopic`/`unsubscribeFromTopic`; Firestore `users/{uid}.notifications` updated via `PATCH /v1/profile { notifications }`
**Estimate:** M

---

### MOB-082: Achievement badges display
**Epic:** Auth & User Profile
**Status:** 🔲 Todo
**Feature:** AUTH-001
**Priority:** v2

**As a** frequent reporter **I want** to see achievement badges on my profile **so that** I feel recognised for my contributions to the Arah community.

**Acceptance criteria:**
- [ ] Badge grid in profile screen shows earned and locked badges
- [ ] Badges: `first_report` (submit 1 report), `reporter_10` (10 reports), `reporter_50` (50 reports), `reporter_100` (100 reports)
- [ ] Earned badges display in full colour; locked badges greyed out with lock icon
- [ ] Tapping a badge shows badge name, description, and earn date
- [ ] New badge earned triggers in-app confetti animation and push notification

**Technical notes:** `GET /v1/profile` returns `badges: [{ id, earnedAt }]`; badge metadata in `src/constants/badges.ts`; `src/components/BadgeGrid.tsx`; confetti via `react-native-confetti-cannon`
**Estimate:** M

---

### MOB-083: Account deletion
**Epic:** Auth & User Profile
**Status:** 🔲 Todo
**Feature:** AUTH-001
**Priority:** v1

**As a** user **I want** to permanently delete my account **so that** my data is removed from Arah in compliance with privacy regulations.

**Acceptance criteria:**
- [ ] "Padam Akaun" option in settings under "Privasi"
- [ ] Confirmation dialog: "Akaun anda dan semua data akan dipadam secara kekal. Ini tidak boleh dibatalkan."
- [ ] Calls `DELETE /v1/profile` which deletes Firestore user document and Firebase Auth user
- [ ] After deletion, app resets to onboarding screen and MMKV is cleared
- [ ] Email confirmation sent to user's registered email address

**Technical notes:** `src/screens/Settings/DeleteAccount.tsx`; `profileService.deleteAccount()` → `DELETE /v1/profile`; Cloud Function deletes Firebase Auth user; `auth().signOut()` then `MMKV.clearAll()` locally
**Estimate:** M

---

## Epic 8: Offline & Performance

### MOB-013: Offline map tile caching strategy
**Epic:** Offline & Performance
**Status:** 🔲 Todo
**Feature:** OFL-001
**Priority:** MVP

**As a** driver in an area with poor connectivity **I want** the map to remain usable with cached tiles **so that** I can still navigate even with intermittent data.

**Acceptance criteria:**
- [ ] MapLibre tile cache configured for at least 512MB on device
- [ ] On `NetInfo` offline detection, banner "Mod luar talian — peta mungkin tidak dikemas kini" appears
- [ ] Routing and geocoding show a clear offline error rather than timing out
- [ ] When connectivity is restored, banner disappears and refresh is triggered

**Technical notes:** MapLibre offline packs: `MapLibreGL.offlineManager.createPack()` for predefined bbox; `@react-native-community/netinfo`; store offline state in `mapStore`
**Estimate:** M

---

### MOB-014: Firebase Crashlytics integration
**Epic:** Offline & Performance
**Status:** 🔲 Todo
**Feature:** OFL-001
**Priority:** MVP

**As a** developer **I want** crashes and non-fatal errors reported to Firebase Crashlytics **so that** I can diagnose production issues without user reports.

**Acceptance criteria:**
- [ ] `@react-native-firebase/crashlytics` initialised and reports uncaught JS errors
- [ ] All `catch` blocks in services call `crashlytics().recordError(err)`
- [ ] User UID (hashed) set as Crashlytics attribute
- [ ] Route calculation failures and Firestore errors logged as non-fatal events

**Technical notes:** `crashlytics().setCrashlyticsCollectionEnabled(!__DEV__)` in `App.tsx`; test: `crashlytics().crash()` in `__DEV__` mode
**Estimate:** S

---

### MOB-084: Download map region for offline use
**Epic:** Offline & Performance
**Status:** 🔲 Todo
**Feature:** OFL-001
**Priority:** v1

**As a** driver planning a long trip **I want** to download map tiles for a region in advance **so that** I can navigate without mobile data.

**Acceptance criteria:**
- [ ] "Muat Turun Peta" screen (`src/screens/OfflineMaps/DownloadMapsScreen.tsx`) with three region options
- [ ] Options: Semenanjung Malaysia (~1.2 GB), Sabah (~400 MB), Sarawak (~600 MB)
- [ ] Tapping a region shows size estimate and "Muat Turun" button
- [ ] Download is started via MapLibre `offlineManager.createPack()` with the region's bounding box
- [ ] Wi-Fi warning shown if on mobile data: "Disyorkan muat turun menggunakan Wi-Fi"

**Technical notes:** `src/screens/OfflineMaps/DownloadMapsScreen.tsx`; `MapLibreGL.offlineManager.createPack({ name, styleURL, bounds, minZoom: 5, maxZoom: 15 })`; region bounds from `src/constants/regionBounds.ts`
**Estimate:** M

---

### MOB-085: Download progress bar with pause and resume
**Epic:** Offline & Performance
**Status:** 🔲 Todo
**Feature:** OFL-001
**Priority:** v1

**As a** user downloading map tiles **I want** to see download progress and be able to pause/resume **so that** I can manage downloads around my data and battery usage.

**Acceptance criteria:**
- [ ] Progress bar shows percentage, estimated size downloaded, download speed (MB/s), and ETA
- [ ] "Jeda" (Pause) button pauses the download; "Sambung" (Resume) resumes it
- [ ] Download continues in the background if app is minimised
- [ ] Push notification shown when download completes
- [ ] Failed downloads show error with retry option

**Technical notes:** `MapLibreGL.offlineManager.subscribe(packName, progressHandler, errorHandler)`; `progressHandler` receives `{ percentage, completedTileCount, totalTileCount }`; background download via background fetch task
**Estimate:** M

---

### MOB-086: Offline storage manager
**Epic:** Offline & Performance
**Status:** 🔲 Todo
**Feature:** OFL-001
**Priority:** v1

**As a** user **I want** to manage downloaded map regions **so that** I can free up storage when I no longer need them.

**Acceptance criteria:**
- [ ] Offline maps list shows all downloaded regions with: name, download date, file size
- [ ] Total storage used shown at top with available storage bar
- [ ] Delete button per region with confirmation: "Padam peta {region}?"
- [ ] Delete calls `MapLibreGL.offlineManager.deletePack(name)`
- [ ] After deletion, storage bar updates to reflect freed space

**Technical notes:** `src/screens/OfflineMaps/StorageManagerScreen.tsx`; `MapLibreGL.offlineManager.getPacks()` to list; `expo-file-system` `getFreeDiskStorageAsync()` for available storage; storage bar uses `Animated.View` width
**Estimate:** M

---

### MOB-087: Delta tile update — download only changed chunks
**Epic:** Offline & Performance
**Status:** 🔲 Todo
**Feature:** OFL-001
**Priority:** v2

**As a** user with previously downloaded tiles **I want** the app to only download changed tile chunks when updating **so that** updates are fast and use minimal data.

**Acceptance criteria:**
- [ ] On "Kemas Kini" tap, app fetches tile manifest version from `GET /v1/tiles/manifest`
- [ ] Compares local manifest version with remote; if same, shows "Sudah terkini"
- [ ] Downloads only tiles with newer `last_modified` than locally cached version using HTTP range requests
- [ ] Progress shown during delta download; size shown as "Hanya X MB perlu dikemas kini"
- [ ] After update, local manifest version is saved

**Technical notes:** `src/services/tileUpdateService.ts`; `GET /v1/tiles/manifest` returns `{ version: string, tileManifest: [{ tileId, lastModified }] }`; HTTP `Range` header for partial PMTiles download; local manifest in MMKV
**Estimate:** L

---

### MOB-088: Cold launch optimisation — target < 3s to interactive
**Epic:** Offline & Performance
**Status:** 🔲 Todo
**Feature:** PERF-001
**Priority:** v1

**As a** driver **I want** the app to be ready to use in under 3 seconds from tap **so that** I can start navigating quickly in urgent situations.

**Acceptance criteria:**
- [ ] Time-to-interactive measured on Pixel 4a (mid-range Android) using `performance.now()` marks
- [ ] JS bundle loaded in < 1.5s (Hermes enabled, bundle split)
- [ ] Map tiles start rendering within 2s of launch
- [ ] Total time from tap to first interactive frame < 3s on mid-range Android
- [ ] Hermes engine enabled in `android/app/build.gradle` `enableHermes = true`

**Technical notes:** `src/utils/performanceMarks.ts`; `performance.mark('app_interactive')` when `MapScreen` renders; Hermes: `project.ext.react = [ hermesEnabled: true ]`; bundle size audit with `react-native-bundle-visualizer`; lazy-load non-critical screens
**Estimate:** L

---

### MOB-089: Route polyline decode performance benchmark
**Epic:** Offline & Performance
**Status:** 🔲 Todo
**Feature:** PERF-001
**Priority:** v1

**As a** developer **I want** route polyline decoding to complete in < 100ms **so that** long routes render without UI jank.

**Acceptance criteria:**
- [ ] Benchmark test decodes a 500km route (Johor to Perlis) polyline and asserts < 100ms
- [ ] If JS decode > 100ms, native module implementation is used instead
- [ ] Decoded GeoJSON coordinates are memoised with `useMemo` tied to route ID
- [ ] Decoding runs off the main thread via a `Promise` wrapped in `InteractionManager.runAfterInteractions`
- [ ] Performance result logged to Crashlytics custom key `polyline_decode_ms`

**Technical notes:** `src/utils/polylineDecode.ts`; `@mapbox/polyline` decode; benchmark: `Date.now()` before/after decode; native module fallback: JSI module `ArahPolyline.decode(encoded: string): number[][]`; `InteractionManager.runAfterInteractions` from `react-native`
**Estimate:** M

---

### MOB-090: Tile cache strategy tuning
**Epic:** Offline & Performance
**Status:** 🔲 Todo
**Feature:** PERF-001
**Priority:** v1

**As a** developer **I want** optimised MapLibre tile caching **so that** repeat navigation sessions load the same map area instantly from cache.

**Acceptance criteria:**
- [ ] `tileCacheMaxAge` set to 86400 (24 hours) in MapLibre config
- [ ] `localIdeographFontFamily` disabled (reduces memory usage)
- [ ] Cache hit rate logged: `onTileLoaded` / (`onTileLoaded` + `onTileFailed`) > 70% on second app open
- [ ] `MapLibreGL.setConnected(false)` tested to confirm offline tile serving from cache
- [ ] `maxCacheSize` set to 1GB in MapLibre `ResourceOptions`

**Technical notes:** `MapLibreGL.setTelemetryEnabled(false)`; `MapLibreGL.ResourceOptions.setMaximumCacheSize(1024 * 1024 * 1024)` (1 GB); tile cache stats via `MapLibreGL.MapView.onDidFinishLoadingMap`; `localIdeographFontFamily: null` in `MapView` props
**Estimate:** M

---

### MOB-091: Background GPS battery optimisation
**Epic:** Offline & Performance
**Status:** 🔲 Todo
**Feature:** PERF-001
**Priority:** v1

**As a** driver on a long trip **I want** the app to use GPS efficiently **so that** my phone battery lasts for the full journey.

**Acceptance criteria:**
- [ ] `expo-location` accuracy set to `Accuracy.Balanced` (not `BestForNavigation`) when not actively navigating
- [ ] GPS paused automatically when device is stationary for > 30 seconds (using accelerometer stillness detection)
- [ ] GPS resumes when motion detected again (accelerometer threshold > 0.5 m/s²)
- [ ] Battery delta per hour of navigation logged as Crashlytics custom key `battery_delta_pct_per_hour`
- [ ] During active navigation, accuracy switches to `Accuracy.BestForNavigation`

**Technical notes:** `src/hooks/useAdaptiveGPS.ts`; `expo-location` `startLocationUpdatesAsync` with accuracy parameter; `expo-sensors` `Accelerometer.addListener` for stillness detection; battery level via `expo-battery` `getBatteryLevelAsync`
**Estimate:** M

---

## Epic 9: Safety & Emergency

### MOB-092: SOS button with emergency dial options
**Epic:** Safety & Emergency
**Status:** 🔲 Todo
**Feature:** SFY-001
**Priority:** MVP

**As a** driver in an emergency **I want** a prominent SOS button **so that** I can call emergency services in one tap while driving.

**Acceptance criteria:**
- [ ] SOS button fixed in bottom-right corner of navigation HUD; red colour, 56×56 pt
- [ ] Tapping opens action sheet: "999 — Polis/Ambulans", "994 — Bomba", "1800-88-0000 — PLUS"
- [ ] Tapping a number calls `Linking.openURL('tel:999')` immediately
- [ ] SOS button is also accessible from the map screen (not only during navigation)
- [ ] Accessible in all themes (not hidden by UI overlays)

**Technical notes:** `src/components/SOSButton.tsx`; `Linking.openURL('tel:999')`; action sheet: `ActionSheetIOS.showActionSheetWithOptions` on iOS; `@expo/react-native-action-sheet` cross-platform
**Estimate:** S

---

### MOB-093: Nearest emergency services search
**Epic:** Safety & Emergency
**Status:** 🔲 Todo
**Feature:** SFY-001
**Priority:** v1

**As a** driver in an emergency **I want** to find the nearest hospital, police station, or fire station **so that** I can get help as quickly as possible.

**Acceptance criteria:**
- [ ] "Perkhidmatan Kecemasan Berdekatan" in the SOS action sheet or POI search
- [ ] `GET /v1/geocode/search?near={lat},{lng}&category=hospital|police|fire_station&radius=10000`
- [ ] Results show name, distance, estimated driving time, and a "Navigasi" button
- [ ] Top 3 nearest results per category are shown
- [ ] Emergency POIs are pinned on the map when results are shown

**Technical notes:** `src/features/emergency/EmergencyServicesSearch.tsx`; `GET /v1/geocode/search?category=hospital,police_station,fire_station&near={lat},{lng}&radius=10000`; sorted by `distance_km` ascending
**Estimate:** M

---

### MOB-094: Crash detection using accelerometer
**Epic:** Safety & Emergency
**Status:** 🔲 Todo
**Feature:** SFY-001
**Priority:** v2

**As a** driver **I want** the app to detect if I've been in a crash **so that** it can alert emergency contacts or services if I'm incapacitated.

**Acceptance criteria:**
- [ ] `expo-sensors` accelerometer monitors for sudden deceleration > 4G (39.2 m/s²) while navigating
- [ ] On trigger, 5-second countdown dialog: "Adakah anda baik-baik saja?" with "Ya, Saya Baik" dismiss button
- [ ] If countdown expires without response, offer "Hubungi 999" and "Hantar SMS Kecemasan" buttons
- [ ] Crash detection only active during active navigation (`navigationState = 'navigating'`)
- [ ] False positives minimised: require acceleration > 4G for > 100ms (not single spike)

**Technical notes:** `src/hooks/useCrashDetection.ts`; `Accelerometer.addListener({ x, y, z })` → magnitude = `Math.sqrt(x²+y²+z²)`; threshold: `magnitude > 4 * 9.81`; debounce 100ms; countdown via `useCountdown` hook; `expo-sensors` v13+
**Estimate:** L

---

### MOB-095: Emergency contact SMS on crash confirmation
**Epic:** Safety & Emergency
**Status:** 🔲 Todo
**Feature:** SFY-001
**Priority:** v2

**As a** driver **I want** the app to automatically compose an SMS to my emergency contact with my GPS coordinates if a crash is confirmed **so that** my family can locate me.

**Acceptance criteria:**
- [ ] User can set emergency contact number in settings (Malaysian number, +60 format)
- [ ] On crash confirmed (MOB-094 countdown expired): auto-compose SMS `sms:{number}?body=`
- [ ] SMS body: "KECEMASAN: Saya mungkin mengalami kemalangan. Lokasi saya: https://maps.google.com/?q={lat},{lng}"
- [ ] SMS is composed in the phone's default SMS app (not sent automatically — user confirms)
- [ ] Emergency contact number stored encrypted in Firestore `users/{uid}.emergencyContact`

**Technical notes:** `src/screens/Settings/EmergencyContactScreen.tsx`; `Linking.openURL(`sms:${number}?body=${encodeURIComponent(message)}`)``; coordinates from `locationService.lastLocation`; number validated with `libphonenumber-js` `isPossiblePhoneNumber(number, 'MY')`
**Estimate:** M

---

### MOB-096: Fatigue warning after extended navigation
**Epic:** Safety & Emergency
**Status:** 🔲 Todo
**Feature:** SFY-001
**Priority:** v1

**As a** driver on a long trip **I want** to be reminded to take a rest break after 2 hours of driving **so that** I don't fall asleep at the wheel.

**Acceptance criteria:**
- [ ] After 2 hours of continuous active navigation, display "Rehat Sebentar" modal
- [ ] Modal message: "Anda telah memandu selama 2 jam. Disyorkan berehat sebentar."
- [ ] "Cari R&R / Stesen Minyak" button triggers POI search for nearby rest stops
- [ ] "Teruskan" dismisses modal for 1 hour before re-triggering
- [ ] Timer resets if navigation is paused or stopped for > 15 minutes

**Technical notes:** `src/hooks/useFatigueWarning.ts`; `navigationStartTime` stored when navigation begins; `setInterval(60000)` checks elapsed time; `elapsedMinutes >= 120` triggers modal; reset timer after 60-min snooze; `NavigationStore.navigationStartTime: Date | null`
**Estimate:** M

---

## Epic 10: Accessibility & Settings

### MOB-097: Full Bahasa Malaysia localisation
**Epic:** Accessibility & Settings
**Status:** 🔲 Todo
**Feature:** A11Y-001
**Priority:** MVP

**As a** Malaysian user **I want** all app text to be in Bahasa Malaysia **so that** the app feels native and is accessible to users who prefer BM.

**Acceptance criteria:**
- [ ] All UI strings across all screens translated to BM in `src/i18n/ms.json`
- [ ] Zero hardcoded English strings remaining in JSX (verified by lint rule or manual audit)
- [ ] BM translations reviewed by a native BM speaker for naturalness
- [ ] Error messages, toast notifications, and alerts all in BM by default
- [ ] Number formatting: thousands separator uses period (1.000), decimal uses comma (3,14)

**Technical notes:** `src/i18n/ms.json` full translation file; `react-i18next` `useTranslation` hook in all components; custom ESLint rule to detect hardcoded strings; `Intl.NumberFormat('ms-MY')` for number formatting
**Estimate:** L

---

### MOB-098: Full English localisation as fallback
**Epic:** Accessibility & Settings
**Status:** 🔲 Todo
**Feature:** A11Y-001
**Priority:** MVP

**As a** non-BM-speaking user (expat, tourist) **I want** to use the app in English **so that** navigation instructions and UI are understandable.

**Acceptance criteria:**
- [ ] `src/i18n/en.json` contains English translations for all keys in `ms.json`
- [ ] English is the fallback language when a translation key is missing from BM file
- [ ] Language can be set to EN from the settings screen (MOB-078)
- [ ] TTS voice guidance switches to English instructions when EN is selected
- [ ] No BM-only strings remain in the EN locale — complete parity with BM

**Technical notes:** `src/i18n/en.json`; `i18next` `fallbackLng: 'en'`; TTS: `Tts.setDefaultLanguage('en-US')` when language = EN; verify parity with automated key diff test
**Estimate:** M

---

### MOB-099: System font size accessibility
**Epic:** Accessibility & Settings
**Status:** 🔲 Todo
**Feature:** A11Y-001
**Priority:** v1

**As a** user with low vision **I want** text to scale with the system font size setting **so that** I can read the app comfortably.

**Acceptance criteria:**
- [ ] All font sizes in the app use `sp` (scale-independent pixels), not fixed `dp`
- [ ] No text overflow or clipping when system font size is set to 150%
- [ ] Navigation HUD and manoeuvre banner text remains readable at 150% scale
- [ ] `allowFontScaling={true}` on all `<Text>` components (default, but verified)
- [ ] Automated accessibility test using Detox or manual verification at 150% scale

**Technical notes:** Audit all `StyleSheet` entries with `fontSize` — replace `dp` values with `PixelRatio.getFontScale()` or use `sp` via `src/utils/scaling.ts` `sp(size)` helper; `Text` `allowFontScaling` is true by default in React Native
**Estimate:** M

---

### MOB-100: High-contrast map theme for accessibility
**Epic:** Accessibility & Settings
**Status:** 🔲 Todo
**Feature:** A11Y-001
**Priority:** v2

**As a** user with low vision **I want** a high-contrast map theme **so that** roads and text are clearly visible without straining my eyes.

**Acceptance criteria:**
- [ ] "Kontras Tinggi" toggle in accessibility settings loads `styles/arah-high-contrast.json` MapLibre style
- [ ] High-contrast style has: white roads on dark background, larger text labels, higher stroke width
- [ ] Road hierarchy clearly differentiated by colour (highway=yellow, trunk=orange, primary=white, secondary=grey)
- [ ] Toggling applies immediately without app restart
- [ ] High-contrast preference persisted in `mapStore.highContrastMode`

**Technical notes:** `styles/arah-high-contrast.json`; MapLibre style spec: `text-halo-width: 3`, `text-size` increased 20%, road colours higher contrast; `mapStore.highContrastMode: boolean` switching `styleURL` to `MAP_CONFIG.HIGH_CONTRAST_STYLE_URL`
**Estimate:** L

---

### MOB-101: Voice guidance volume control
**Epic:** Accessibility & Settings
**Status:** 🔲 Todo
**Feature:** A11Y-001
**Priority:** v1

**As a** driver **I want** an independent volume slider for navigation voice guidance **so that** I can set it louder than my music without adjusting the system volume.

**Acceptance criteria:**
- [ ] Voice guidance volume slider in settings (0–100%)
- [ ] Volume setting passed to `expo-speech` as `volume` parameter (0.0–1.0)
- [ ] Slider preview: tapping speaker icon plays a sample instruction at current volume
- [ ] Volume persisted in `userPreferencesStore.voiceVolume`
- [ ] Mute toggle button next to slider for quick silence

**Technical notes:** `src/screens/Settings/VoiceSettings.tsx`; `Speech.speak(text, { volume: voiceVolume, language: 'ms-MY' })`; slider `@react-native-community/slider`; mute: `voiceVolume = 0` or `Speech.stop()`
**Estimate:** S

---

### MOB-102: Distance units toggle km/miles
**Epic:** Accessibility & Settings
**Status:** 🔲 Todo
**Feature:** A11Y-001
**Priority:** v1

**As a** user who prefers miles **I want** to switch distance display from kilometres to miles **so that** distances shown in navigation match my mental model.

**Acceptance criteria:**
- [ ] Distance unit toggle in settings: "km" / "batu (miles)" radio buttons
- [ ] All HUD distances, route preview distances, and POI distances convert to miles when selected
- [ ] Voice guidance uses "batu" unit in BM, "miles" in EN when miles selected
- [ ] Scale bar (MOB-020) switches to miles
- [ ] Preference persisted in `userPreferencesStore.distanceUnit: 'km' | 'miles'`

**Technical notes:** `src/utils/formatters.ts` `formatDistance(metres, unit)`: if miles → `metres / 1609.344`; `userPreferencesStore.distanceUnit`; TTS template: BM `"Dalam {n} batu, belok kanan"`, EN `"In {n} miles, turn right"`
**Estimate:** S

---

### MOB-103: Light/dark/auto theme preference
**Epic:** Accessibility & Settings
**Status:** 🔲 Todo
**Feature:** A11Y-001
**Priority:** v1

**As a** user **I want** to choose between light, dark, or auto (follow system) app theme **so that** the app matches my device's appearance setting.

**Acceptance criteria:**
- [ ] Theme selector in settings: "Cerah" / "Gelap" / "Auto (ikut sistem)"
- [ ] "Auto" uses `useColorScheme()` from React Native to follow system dark mode
- [ ] MapLibre style switches between light and dark style URLs to match app theme
- [ ] All UI components use theme-aware colours from `src/theme/colors.ts`
- [ ] Theme change applies immediately without app restart

**Technical notes:** `src/stores/themeStore.ts` `theme: 'light' | 'dark' | 'auto'`; `src/theme/colors.ts` light and dark palettes; `ThemeProvider` wrapping `App.tsx`; MapLibre style URL switches: `theme === 'dark' ? MAP_CONFIG.DARK_STYLE_URL : MAP_CONFIG.LIGHT_STYLE_URL`
**Estimate:** M

---

### MOB-104: Navigation HUD layout compact/normal toggle
**Epic:** Accessibility & Settings
**Status:** 🔲 Todo
**Feature:** A11Y-001
**Priority:** v2

**As a** driver who wants more map visibility **I want** a compact navigation HUD mode **so that** I see more of the road and less UI chrome.

**Acceptance criteria:**
- [ ] HUD layout setting: "Normal" (full HUD) vs "Kompak" (single-row, smaller font)
- [ ] Compact mode: reduces HUD height by 40%, uses 14sp font (down from 18sp)
- [ ] Compact mode still shows: manoeuvre arrow, distance to manoeuvre, ETA
- [ ] Normal mode shows: manoeuvre arrow, street name, distance, ETA, speed limit badge, lane guidance
- [ ] Toggle applies immediately; preference saved in `userPreferencesStore.hudLayout`

**Technical notes:** `src/components/navigation/NavigationHUD.tsx`; `hudLayout: 'normal' | 'compact'` from `userPreferencesStore`; conditional rendering of secondary HUD elements; `Animated.Value` for height transition
**Estimate:** M

---

### MOB-105: Privacy settings — location history and data export
**Epic:** Accessibility & Settings
**Status:** 🔲 Todo
**Feature:** A11Y-001
**Priority:** v1

**As a** privacy-conscious user **I want** control over my location history and the ability to export my data **so that** I can manage my privacy in compliance with PDPA Malaysia.

**Acceptance criteria:**
- [ ] "Sejarah Lokasi" toggle disables server-side location logging when turned off
- [ ] "Mod Tanpa Nama" toggle strips `user_hash` from report submissions
- [ ] "Eksport Data Saya" button calls `GET /v1/profile/export` and downloads a JSON file
- [ ] Export file includes: profile data, saved places, report history (no raw location tracks)
- [ ] All privacy settings shown under "Privasi & Data" section in `SettingsScreen`

**Technical notes:** `src/screens/Settings/PrivacySettings.tsx`; `PATCH /v1/profile { privacySettings: { locationHistory, anonymousMode } }`; `GET /v1/profile/export` returns JSON; `expo-file-system` `downloadAsync` to save export file; `Sharing.shareAsync` to share the export
**Estimate:** M

---

---

## Epic 9: Tetapan Islam (Islamic Settings)

Stories cover the full Islamic feature set: prayer times, doa naik kenderaan, musafir calculator, nearest masjid, Qibla compass, prayer approaching alert, azan voice-pause, Halal POI filter, and Jumaat reminder. All prayer data sourced from `api.waktusolat.app/v2` (Malaysia) or `api.aladhan.com` (worldwide). Zone is auto-detected from GPS via `/zones/{lat}/{long}`.

---

### MOB-106: Islamic Settings screen — enable/disable toggle

**Epic:** Tetapan Islam
**Status:** 🔲 Todo
**Priority:** MVP

**As a** Muslim user **I want** to enable Islamic features in one place **so that** all Islamic overlays and alerts are visible when I need them and hidden when I don't.

**Acceptance criteria:**
- [ ] "Tetapan Islam" section appears in `SettingsScreen` below Pilihan Laluan, with a single **Aktifkan Ciri Islam** toggle
- [ ] Toggling ON navigates or expands to the full `IslamicSettingsScreen`
- [ ] Toggling OFF hides all Islamic overlays (prayer banner, Qibla, Musafir badge, doa modal)
- [ ] Preference persisted in `islamicStore` (survived app restart via AsyncStorage)
- [ ] Default state: disabled

**Technical notes:** `src/screens/IslamicSettingsScreen.tsx`; `islamicStore.settings.enabled`; `navigation.navigate('IslamicSettings')`; add `IslamicSettings: undefined` to `RootStackParamList`
**Estimate:** S

---

### MOB-107: Auto-detect user's prayer time zone from GPS

**Epic:** Tetapan Islam
**Status:** 🔲 Todo
**Priority:** MVP

**As a** Malaysian user **I want** my prayer time zone to be detected from my GPS location automatically **so that** I don't have to select a zone manually.

**Acceptance criteria:**
- [ ] On first enable of Islamic mode, app calls `GET https://api.waktusolat.app/v2/zones/{lat}/{long}` with user's current GPS
- [ ] Detected zone code + full label (`negeri — lokasi`) is displayed in settings: e.g. "WLY01 — W.P. Kuala Lumpur & Putrajaya"
- [ ] User can manually browse/override via `GET /zones` (list all) or `GET /zones/{state}` (filter by state)
- [ ] Re-detection button available; re-runs the coordinate lookup
- [ ] If GPS unavailable, prompt user to select zone from full list
- [ ] Non-Malaysia: zone field hidden; worldwide AlAdhan (`api.aladhan.com`) used automatically based on live GPS

**Technical notes:** `waktuSolatService.fetchZoneByCoords(lat, lng)` → `GET /v2/zones/{lat}/{long}`; `fetchZonesByState(state)` → `GET /v2/zones/{state}`; `fetchAllZones()` → `GET /v2/zones`; store detected zone in `islamicStore.settings.zone`
**Estimate:** S

---

### MOB-108: Prayer times banner on map screen

**Epic:** Tetapan Islam
**Status:** 🔲 Todo
**Priority:** MVP

**As a** Muslim driver **I want** to see today's prayer times at a glance on the map screen **so that** I can plan my drive around solat.

**Acceptance criteria:**
- [ ] Compact horizontal banner renders below the search bar when Islamic mode is enabled
- [ ] Shows all 6 waktu: Subuh, Syuruk, Zohor, Asar, Maghrib, Isyak with their times
- [ ] Current waktu is highlighted (teal accent); next waktu shows countdown "17 min"
- [ ] Displays Hijri date (e.g. "14 Muharram 1447") alongside Gregorian date
- [ ] Prayer times refresh automatically at midnight
- [ ] Loading skeleton shown while fetching; error state shows "Gagal mendapat waktu solat — Ketuk untuk cuba semula"
- [ ] Tapping banner opens a full-screen prayer time detail sheet

**Technical notes:** `src/components/Islamic/PrayerTimeBanner.tsx`; data from `islamicStore.prayerTimes`; `usePrayerTimes()` hook fetches on mount; `setInterval(checkNextPrayer, 60_000)` updates highlight every minute
**Estimate:** M

---

### MOB-109: Doa naik kenderaan modal on navigation start

**Epic:** Tetapan Islam
**Status:** 🔲 Todo
**Priority:** MVP

**As a** Muslim driver **I want** the travel doa to appear when I start navigation **so that** I can easily recite it before departing.

**Acceptance criteria:**
- [ ] When user taps "Mula Navigasi" in `RoutePreviewScreen`, a bottom-sheet modal appears before navigation begins
- [ ] Modal shows: Arabic text (right-aligned), romanised rumi, Malay translation, source (Az-Zukhruf 43:13–14)
- [ ] **Audio recitation plays automatically** on modal open using `react-native-sound` (`assets/audio/doa_kenderaan.mp3` bundled in app)
- [ ] Audio play/pause button in modal header; auto-stops when modal is dismissed
- [ ] "Mula Perjalanan" button on modal dismisses it, stops audio, and starts navigation
- [ ] Modal only shown when `islamicStore.settings.showDoaOnNavStart === true`
- [ ] Swipe-down or back button also dismisses and stops audio
- [ ] No network call required — audio and text are static assets

**Technical notes:** `src/components/Islamic/DoaKenderaanModal.tsx`; `react-native-sound` for audio; audio asset at `assets/audio/doa_kenderaan.mp3`; triggered from `RoutePreviewScreen.tsx` before `navigation.navigate('Navigation', ...)`; Arabic text: سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا…
**Estimate:** S

---

### MOB-110: Musafir (traveller) status badge on route preview

**Epic:** Tetapan Islam
**Status:** 🔲 Todo
**Priority:** High

**As a** Muslim driver **I want** to know if my journey qualifies as musafir (≥88.7 km Shafi'i school) **so that** I know I may shorten (qasar) and combine (jamak) my prayers.

**Acceptance criteria:**
- [ ] A "🧳 Musafir" badge appears on `RoutePreviewScreen` when route distance ≥ 88.7 km
- [ ] Badge tapped opens an info sheet: "Jarak: 142 km · Anda layak qasar & jamak solat"
- [ ] Info sheet explains: what musafir means, which prayers can be shortened, disclaimer "rujuk ulama tempatan"
- [ ] Badge is green for musafir, absent for non-musafir trips
- [ ] Badge only shown when `islamicStore.settings.showMusafirBadge === true`
- [ ] Distance taken from selected route's `distanceMeters` field

**Technical notes:** `src/components/Islamic/MusafirBadge.tsx`; `useMusafir(origin, destination)` hook in `RoutePreviewScreen`; threshold `MUSAFIR_THRESHOLD_KM = 88.7`; Haversine distance from `geoUtils.haversineDistance`
**Estimate:** S

---

### MOB-111: Nearest Masjid/Surau card

**Epic:** Tetapan Islam
**Status:** 🔲 Todo
**Priority:** High

**As a** Muslim driver **I want** to quickly find the nearest masjid or surau **so that** I can plan a prayer stop during my journey.

**Acceptance criteria:**
- [ ] "Masjid/Surau Terdekat" button in Islamic Settings and also as a FAB on the map when Islamic mode is on
- [ ] Calls `GET /v1/islamic/nearest-masjid?lat={lat}&lng={lng}&radius=5000` and shows top 3 results
- [ ] Each result card shows: name, distance, type (Masjid/Surau/Musolla), "Tuju" button
- [ ] Tapping "Tuju" sets the masjid as the navigation destination (adds as a waypoint if navigation is active)
- [ ] Empty state: "Tiada masjid/surau dalam radius 5 km"
- [ ] Error state with retry button

**Technical notes:** `src/components/Islamic/NearestMasjidCard.tsx`; API calls `GET /v1/islamic/nearest-masjid`; backend queries Nominatim with `amenity=place_of_worship&religion=muslim`; radius configurable up to 10km
**Estimate:** M

---

### MOB-112: Qibla compass direction overlay

**Epic:** Tetapan Islam
**Status:** 🔲 Todo
**Priority:** High

**As a** Muslim user **I want** a Qibla direction indicator **so that** I can face the correct direction for prayer wherever I am.

**Acceptance criteria:**
- [ ] Qibla compass accessible from Islamic Settings and via a 🧭 FAB on map when Islamic mode is enabled
- [ ] Shows a compass rose with a teal arrow pointing toward Mecca
- [ ] Displays degrees from north (e.g. "292° dari utara") and distance to Mecca (e.g. "7,432 km")
- [ ] Uses device magnetometer (`react-native-sensors`) for live compass heading; arrow rotates in real time
- [ ] If magnetometer unavailable, show static bearing with note "Kompas tidak tersedia"
- [ ] Direction recalculated when GPS location changes significantly (>500m)

**Technical notes:** `src/components/Islamic/QiblaOverlay.tsx`; `calculateQiblaDirection(lat, lng)` in `waktuSolatService.ts` (great-circle bearing to Mecca 21.3891°N, 39.8579°E); `react-native-sensors` for magnetometer; distance via Haversine
**Estimate:** M

---

### MOB-113: Prayer time approaching alert during navigation

**Epic:** Tetapan Islam
**Status:** 🔲 Todo
**Priority:** High

**As a** Muslim driver **I want** to be notified when a prayer time is approaching during navigation **so that** I can find a surau before it's too late.

**Acceptance criteria:**
- [ ] When `prayerAlertMinutes` before any prayer (default 15 min), a non-blocking alert card slides in over the navigation HUD
- [ ] Alert shows: prayer name, time remaining, "Surau terdekat: Al-Hidayah — 800m on route" with "Singgah" button
- [ ] "Singgah" adds the nearest surau as a waypoint and reroutes
- [ ] "Abaikan" dismisses the alert for the current prayer
- [ ] Alert fires once per prayer — not repeated if dismissed
- [ ] Alert only shown when `islamicStore.settings.prayerAlertMinutes > 0`

**Technical notes:** `src/components/Islamic/PrayerAlertModal.tsx`; `useEffect` in `NavigationScreen` watching `getMinutesUntilPrayer(nextPrayer)`; nearest masjid fetched from `GET /v1/islamic/nearest-masjid` on alert trigger
**Estimate:** M

---

### MOB-114: Azan — lower navigation voice during prayer time

**Epic:** Tetapan Islam
**Status:** 🔲 Todo
**Priority:** Medium

**As a** Muslim driver **I want** the navigation voice to be lowered automatically when azan begins **so that** the azan is not drowned out while I'm driving.

**Acceptance criteria:**
- [ ] At the exact azan time, **full azan audio plays** via `react-native-sound` (`assets/audio/azan.mp3` bundled in app)
- [ ] Navigation TTS voice is paused (`Tts.stop()`) while azan plays; resumes automatically when azan audio ends (~3–4 min)
- [ ] A "🕌 Waktu Asar" overlay banner appears on the navigation HUD for the duration of the azan
- [ ] After azan ends (or user taps skip), TTS resumes and navigation continues normally
- [ ] Only active when `islamicStore.settings.azanPauseNav === true`
- [ ] Does not apply to Syuruk (sunrise) — only the 5 prayer waktu (Subuh, Zohor, Asar, Maghrib, Isyak)
- [ ] Azan fires once per waktu — not repeated if skipped

**Technical notes:** `NavigationScreen.tsx`; `useEffect` watching prayer timestamps vs `Date.now()`; `react-native-sound` for azan audio; audio asset `assets/audio/azan.mp3`; `sound.play()` → on complete: resume TTS; Syuruk excluded
**Estimate:** S

---

### MOB-115: Halal POI filter for food search

**Epic:** Tetapan Islam
**Status:** 🔲 Todo
**Priority:** Medium

**As a** Muslim driver **I want** to filter food and restaurant search results to Halal only **so that** I don't accidentally navigate to a non-Halal restaurant.

**Acceptance criteria:**
- [ ] A "Halal Sahaja" toggle appears in the search filter sheet when Islamic mode is enabled
- [ ] Default state follows `islamicStore.settings.showHalalFilterDefault` (default: off)
- [ ] When enabled, Nominatim search appends `&tag:diet:halal=yes` to POI queries
- [ ] Filter chip "🟢 Halal" shown in search bar when active
- [ ] Non-halal results are hidden from results list; "Tiada tempat makan halal dalam kawasan ini" shown if empty

**Technical notes:** `src/screens/SearchScreen.tsx`; filter appended in `geocodingService.searchPOI`; Nominatim tag filter `diet:halal=yes`
**Estimate:** S

---

### MOB-116: Jumaat prayer reminder

**Epic:** Tetapan Islam
**Status:** 🔲 Todo
**Priority:** Medium

**As a** Muslim male driver **I want** a Jumaat (Friday) prayer reminder **so that** I remember to go to the masjid in time.

**Acceptance criteria:**
- [ ] Every Friday, a push notification fires `jumaat.reminderMinutes` before Zohor time (default: 30 min)
- [ ] Notification body: "Jumaat — Zohor dalam 30 minit. Masjid terdekat: Masjid Al-Hidayah (1.2 km)"
- [ ] Tapping notification opens map with route to nearest masjid
- [ ] Only fires when `islamicStore.settings.jumaat.enabled === true`
- [ ] Configurable reminder lead-time: 15, 30, 45, or 60 minutes before Zohor

**Technical notes:** `firebase-messaging` scheduled notification or `@notifee/react-native` with trigger notification set each Thursday night after midnight prayer times are fetched; Friday check: `new Date().getDay() === 5`
**Estimate:** M

