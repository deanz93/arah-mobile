# arah-mobile — Sprint Stories

Stories are ordered by dependency and value. Work top-to-bottom within each epic. Prefix: `MOB-`.

---

## Epic: Map & Location

### MOB-001: Display live user location on map
**Epic:** Map & Location
**Status:** 🔲 Todo

**As a** driver **I want** to see my current GPS position on the map **so that** I know where I am before starting navigation.

**Acceptance criteria:**
- [ ] `useLocation` hook is called in `MapScreen` and GPS permission is requested on first launch
- [ ] A `UserMarker` (pulsing blue dot) appears at the user's GPS coordinates
- [ ] The map camera follows the user on first load (`isFollowingUser = true`)
- [ ] Tapping anywhere on the map sets `isFollowingUser = false` (pan-to-user button appears)
- [ ] A "recenter" FAB snaps the camera back to user location and restores `isFollowingUser = true`
- [ ] GPS errors (permission denied, location unavailable) show a BM-language snackbar

**Technical notes:**
- `useLocation.ts` already calls `locationService.watchPosition` and updates `mapStore`
- Add `isFollowingUser` toggle to `mapStore.ts` (already exists — wire up pan gesture)
- `ArahMapView.tsx` → MapLibre `Camera` component takes `centerCoordinate` from `mapStore.cameraCenter`
- Use `react-native-permissions` `PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION`

**Estimate:** S

---

### MOB-002: Render community reports on map
**Epic:** Map & Location
**Status:** 🔲 Todo

**As a** driver **I want** to see community reports (police, accidents, floods) as pins on the map **so that** I can avoid hazards.

**Acceptance criteria:**
- [ ] `subscribeToReports(bbox)` is called when the map camera settles (debounced 500ms after drag end)
- [ ] Reports within the current viewport bounding box are rendered as `ReportMarker` components
- [ ] Each report type uses its corresponding `REPORT_ICONS` emoji as the marker label
- [ ] Tapping a report marker shows a bottom sheet with: type label (BM), upvote/downvote counts, time remaining
- [ ] Firestore subscription is unsubscribed on component unmount
- [ ] Markers older than `expires_at` are not shown (filtered in `reportService.subscribeToReports`)

**Technical notes:**
- `bboxFromCenter(cameraCenter, 5000)` gives the subscription bbox (5km radius)
- `ReportMarker.tsx` currently renders a placeholder — implement using MapLibre `PointAnnotation`
- Subscribe in `MapScreen` `useEffect`; store result in `reportStore.setReports()`
- Bottom sheet: use `react-native-reanimated` bottom sheet or a simple `Modal`
- Firestore composite index required: `(active ASC, lat ASC)` — document in `arah-functions` firestore.indexes.json

**Estimate:** M

---

### MOB-003: Implement MapLibre vector tile rendering
**Epic:** Map & Location
**Status:** 🔲 Todo

**As a** driver **I want** the map to render Malaysia OSM data with road labels in Bahasa Malaysia **so that** the map looks familiar and is readable in my language.

**Acceptance criteria:**
- [ ] `ArahMapView` loads `MAP_CONFIG.STYLE_URL` (`tiles.arah.my/style.json`) as the MapLibre style
- [ ] Map renders roads, buildings, waterways, and POI labels
- [ ] Default center is KL (3.139, 101.6869), zoom 13
- [ ] Map is bounded to `MAP_CONFIG.MALAYSIA_BOUNDS` (sw: 1.0/99.5, ne: 7.5/119.5) — cannot pan outside Malaysia
- [ ] Min zoom 5 (national overview), max zoom 18 (street level)
- [ ] Map renders correctly in offline mode using tile cache

**Technical notes:**
- `ArahMapView.tsx` → `MapLibreGL.MapView` + `MapLibreGL.Camera` + `MapLibreGL.UserLocation`
- Style JSON at `tiles.arah.my/style.json` must reference the PMTiles source
- MapLibre for React Native uses `mapbox://` → swap for `mbtiles://` or HTTP source
- Tile cache: MapLibre caches tiles natively; no extra implementation needed
- Test with Android emulator using KL coordinates (3.1390, 101.6869)

**Estimate:** M

---

## Epic: Routing & Navigation

### MOB-004: Search for a destination
**Epic:** Routing & Navigation
**Status:** 🔲 Todo

**As a** driver **I want** to search for a destination by name **so that** I can navigate to a specific place without knowing its exact coordinates.

**Acceptance criteria:**
- [ ] `SearchScreen` renders a text input that calls `geocodingService.searchPlaces(query)` with 300ms debounce
- [ ] Results list shows `displayName` with category as subtitle
- [ ] Tapping a result navigates to `RoutePreviewScreen` with `destination = SearchResult`
- [ ] Empty state shows "Tiada hasil dijumpai" for zero results
- [ ] Loading state shows a skeleton or activity indicator
- [ ] Recent searches are saved to MMKV and shown when search input is empty

**Technical notes:**
- `SearchScreen.tsx` receives `onSelect: (result: SearchResult) => void` via navigation params
- Use TanStack Query `useQuery` with `enabled: query.length > 2`, `staleTime: 60 * 60 * 1000`
- `SearchBar.tsx` is currently a tap target — full text input goes in `SearchScreen`
- MMKV key: `'recent_searches'`, value: JSON array of last 5 `SearchResult` objects

**Estimate:** M

---

### MOB-005: Show route alternatives and toll cost
**Epic:** Routing & Navigation
**Status:** 🔲 Todo

**As a** driver **I want** to see multiple route options with distance, duration, and toll cost **so that** I can choose the best route for my journey.

**Acceptance criteria:**
- [ ] `RoutePreviewScreen` calls `routingService.getRoutes(userLocation, destination, preferences)` on mount
- [ ] Up to 3 route cards are shown, each displaying: `formatDistance`, `formatDuration`, `formatTollCost`
- [ ] The first (fastest) route is selected by default; tapping another highlights it
- [ ] Selected route is drawn on the map using `RouteLayer` with a distinct colour
- [ ] "Mulakan navigasi" button transitions `navigationState` to `navigating` and navigates to `NavigationScreen`
- [ ] Route preferences (avoidTolls, avoidHighways) from `userStore` are passed to the route request
- [ ] Error state shown if route calculation fails (no route found between points)

**Technical notes:**
- `routingService.getRoutes()` already implemented — wire up in `RoutePreviewScreen`
- `RouteLayer.tsx` → MapLibre `ShapeSource` + `LineLayer` with encoded polyline decoded to GeoJSON
- Decode polyline: use `@mapbox/polyline` or implement manually (5-decimal precision)
- `routingStore.setRoutes(routes)` and `routingStore.setActiveRoute(selectedRoute)`
- `formatDistance` / `formatDuration` / `formatTollCost` are in `src/utils/formatters.ts`

**Estimate:** M

---

### MOB-006: Turn-by-turn navigation with voice guidance
**Epic:** Routing & Navigation
**Status:** 🔲 Todo

**As a** driver **I want** spoken turn-by-turn instructions in Bahasa Malaysia **so that** I can drive without looking at my phone.

**Acceptance criteria:**
- [ ] `NavigationScreen` is mounted with the active route from `routingStore`
- [ ] `ManoeuvreBar` at the top shows the current manoeuvre arrow icon and instruction text
- [ ] `NavBottomBar` at the bottom shows remaining distance, ETA, and a cancel button
- [ ] TTS speaks the instruction in BM at 200m, 100m, and 50m before the turn
- [ ] At 50m: speaks the full instruction; at 100m: "Dalam 100 meter, [instruction]"; at 200m same
- [ ] On arrival (manoeuvre type `destination`): TTS says "Anda telah sampai ke destinasi" and transitions to `arrived` state
- [ ] Cancel button stops TTS, clears `routingStore`, and returns to `MapScreen`

**Technical notes:**
- `NavigationScreen.tsx` partially implemented — complete the manoeuvre advance logic
- `Tts.setDefaultLanguage('ms-MY')` in `useEffect` on mount
- `VOICE_PROMPT_DISTANCES = [200, 100, 50]` from `src/constants/index.ts`
- `REROUTE_THRESHOLD_METERS = 50` — if user deviates > 50m from route, trigger reroute
- Manoeuvre arrow icons: map `ManoeuvreType` to `react-native-vector-icons` MaterialIcons names
- `routingStore.updateProgress(etaSeconds, distanceRemainingMeters)` called from location updates

**Estimate:** L

---

### MOB-007: Automatic rerouting when off course
**Epic:** Routing & Navigation
**Status:** 🔲 Todo

**As a** driver **I want** the app to automatically recalculate my route if I miss a turn **so that** I don't have to manually restart navigation.

**Acceptance criteria:**
- [ ] During active navigation, `haversineDistance(userLocation, nearestRoutePoint)` is computed on each GPS update
- [ ] If distance exceeds `REROUTE_THRESHOLD_METERS` (50m), a new route request is made silently
- [ ] While rerouting, `ManoeuvreBar` shows "Mengira semula laluan..." text
- [ ] On successful reroute: `routingStore.setActiveRoute(newRoute)` and TTS says "Laluan dikira semula"
- [ ] On reroute failure: show error banner and let user manually cancel or retry
- [ ] Reroute request honours the same `avoidTolls` / `avoidHighways` preferences

**Technical notes:**
- Nearest route point: iterate `activeRoute.manoeuvres` coordinates or decode polyline to points
- Debounce reroute trigger: do not fire more than once per 5 seconds
- `routingService.getRoutes` accepts the same signature as the initial request

**Estimate:** M

---

## Epic: Community Reports

### MOB-008: Submit a community road report
**Epic:** Community Reports
**Status:** 🔲 Todo

**As a** driver **I want** to report a hazard (police trap, accident, flood, etc.) with one tap **so that** other Arah users are warned.

**Acceptance criteria:**
- [ ] `ReportFab` is visible on `MapScreen`; tapping opens `ReportScreen` modal with `coordinates = userLocation`
- [ ] `ReportScreen` shows a grid of 6 report type buttons using `REPORT_ICONS` emojis
- [ ] Selecting a type and tapping "Hantar" calls `reportService.submitReport(type, coordinates, userHash)`
- [ ] `userHash` is SHA-256 of `auth().currentUser.uid` — use `@noble/hashes` or native crypto
- [ ] On success: dismiss modal and show "Laporan dihantar" toast; `reportStore.addReport(newReport)`
- [ ] On failure: show BM-language error alert; do not dismiss modal
- [ ] Submitted reports appear on the map immediately (optimistic update via `reportStore.addReport`)

**Technical notes:**
- `reportService.submitReport` already implemented — wire up `ReportScreen`
- `REPORT_TTL_HOURS` controls `expires_at` server-side in the service
- `userHash` must NOT be the raw uid — hash it for privacy
- ReportScreen coords: use `userLocation` from `mapStore`; if null, show error "Lokasi tidak tersedia"

**Estimate:** M

---

### MOB-010: Upvote / downvote community reports
**Epic:** Community Reports
**Status:** 🔲 Todo

**As a** driver **I want** to confirm or reject a report I see on the map **so that** the community can validate report accuracy.

**Acceptance criteria:**
- [ ] The report bottom sheet (from MOB-002) has upvote (thumbs up) and downvote (thumbs down) buttons
- [ ] Tapping upvote calls `reportService.voteReport(id, 'up')` and increments local count optimistically
- [ ] Tapping downvote calls `reportService.voteReport(id, 'down')` and increments local count optimistically
- [ ] A user can only vote once per report per session (tracked in-memory; not persisted)
- [ ] If downvotes exceed upvotes by 5, the report is dimmed on the map (visual indicator of low credibility)

**Technical notes:**
- `reportService.voteReport` already implemented — wire up from the bottom sheet component
- Track voted-report IDs in a `Set<string>` in a local `useRef` or `reportStore`
- Optimistic update: `reportStore.updateReport(id, { upvotes: current + 1 })`

**Estimate:** S

---

## Epic: Auth & Profile

### MOB-009: Persist user preferences with MMKV
**Epic:** Auth & Profile
**Status:** 🔲 Todo

**As a** returning user **I want** my language and route preferences saved between sessions **so that** I don't have to reconfigure the app every time.

**Acceptance criteria:**
- [ ] `userStore` uses `zustand/middleware`'s `persist` with a custom MMKV storage adapter
- [ ] Persisted keys: `preferredLanguage`, `avoidTolls`, `avoidHighways`, `savedPlaces`
- [ ] On app restart, preferences are loaded synchronously (MMKV is synchronous)
- [ ] Preferences are also synced to `arah-api PUT /v1/users/me/preferences` when changed
- [ ] Clearing app data or sign-out resets MMKV preferences to defaults

**Technical notes:**
```typescript
// MMKV zustand storage adapter
import { MMKV } from 'react-native-mmkv'
const storage = new MMKV()
const mmkvStorage = {
  getItem: (name: string) => storage.getString(name) ?? null,
  setItem: (name: string, value: string) => storage.set(name, value),
  removeItem: (name: string) => storage.delete(name),
}
// Use with: create(persist(stateCreator, { name: 'user-store', storage: mmkvStorage }))
```
- Add `createJSONStorage` from `zustand/middleware` for object serialisation

**Estimate:** S

---

### MOB-011: Phone OTP authentication (fallback)
**Epic:** Auth & Profile
**Status:** 🔲 Todo

**As a** Malaysian user without a Google account **I want** to sign in using my phone number and OTP **so that** I can access Arah without a Google account.

**Acceptance criteria:**
- [ ] `OnboardingScreen` shows a "Daftar dengan nombor telefon" option below Google Sign-In
- [ ] Tapping opens a phone number input field with Malaysian flag prefix (+60)
- [ ] On submit, Firebase Phone Auth sends OTP SMS; user enters 6-digit code
- [ ] On valid OTP, `auth().signInWithCredential(phoneCredential)` is called
- [ ] Firebase reCAPTCHA flow handled via `FirebaseRecaptchaVerifierModal` or web fallback
- [ ] Error messages shown in BM: "Nombor tidak sah", "OTP tamat tempoh", etc.

**Technical notes:**
- `@react-native-firebase/auth` supports Phone Auth natively
- For Android: configure SHA-1 and SHA-256 certificate fingerprints in Firebase console
- For iOS: configure APNs and configure URL schemes
- Test phone number: +60123456789 (Firebase test credentials)

**Estimate:** M

---

## Epic: Settings & Preferences

### MOB-012: Route preference settings
**Epic:** Settings & Preferences
**Status:** 🔲 Todo

**As a** driver **I want** to set my preferences to avoid tolls or highways **so that** all route calculations respect my budget and driving style.

**Acceptance criteria:**
- [ ] `SettingsScreen` has a "Tetapan Laluan" section with two toggles: "Elak tol" and "Elak lebuh raya"
- [ ] Toggling updates `userStore.updatePreferences(prefs)`
- [ ] Updated preferences are persisted to MMKV (MOB-009) and synced to `arah-api`
- [ ] A language switcher (BM / EN) is present and changes `userStore.setLanguage(lang)`
- [ ] Saved places list is shown with ability to add/remove (calls `arah-api /v1/users/me/places`)

**Technical notes:**
- `SettingsScreen.tsx` is a scaffold — implement the UI
- Use `Switch` component from `react-native` for toggles
- Language change should trigger re-render of all formatted strings (pass `lang` as prop/context)

**Estimate:** S

---

## Epic: Performance & Offline

### MOB-013: Offline map tile caching strategy
**Epic:** Performance & Offline
**Status:** 🔲 Todo

**As a** driver in an area with poor connectivity **I want** the map to remain usable with cached tiles **so that** I can still navigate even with intermittent data.

**Acceptance criteria:**
- [ ] MapLibre tile cache is configured for at least 512MB on device
- [ ] On `NetInfo` offline detection, a banner "Mod luar talian — peta mungkin tidak dikemas kini" appears
- [ ] Routing and geocoding show a clear offline error ("Tiada sambungan internet") rather than timing out
- [ ] When connectivity is restored, the banner disappears and a refresh is triggered

**Technical notes:**
- MapLibre offline packs: use `MapLibreGL.offlineManager.createPack()` for a predefined bbox (e.g. KL metro area)
- `@react-native-community/netinfo`: `NetInfo.addEventListener` in `App.tsx`
- Store offline state in a React context or `mapStore`
- Do not attempt route fetch when offline — guard in `routingService.getRoutes`

**Estimate:** M

---

### MOB-014: Firebase Crashlytics integration
**Epic:** Performance & Offline
**Status:** 🔲 Todo

**As a** developer **I want** crashes and non-fatal errors to be reported to Firebase Crashlytics **so that** I can diagnose production issues without user reports.

**Acceptance criteria:**
- [ ] `@react-native-firebase/crashlytics` is initialised and reports uncaught JS errors
- [ ] All `catch` blocks in services call `crashlytics().recordError(err)`
- [ ] User UID (hashed) is set as a Crashlytics attribute: `crashlytics().setUserId(userHash)`
- [ ] Route calculation failures and Firestore errors are logged as non-fatal events
- [ ] Crash-free session rate is visible in Firebase console

**Technical notes:**
- Add `crashlytics().setCrashlyticsCollectionEnabled(!__DEV__)` in `App.tsx`
- Android: `google-services.json` must be in `android/app/`
- iOS: `GoogleService-Info.plist` must be in `ios/arah/`
- Test: `crashlytics().crash()` in `__DEV__` mode to verify the integration

**Estimate:** S
