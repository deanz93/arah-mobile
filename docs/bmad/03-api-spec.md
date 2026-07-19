# arah-mobile — API Specification

This document describes every external API that `arah-mobile` consumes. The app is a client-only service; it produces no API.

---

## 1. Valhalla Routing API

**Base URL constant:** `VALHALLA_URL` (default: `https://routing.arah.my`)

The app talks to the arah-routing service, which is a Valhalla instance tuned for Malaysia OSM data with toll cost extensions. The proxy at `routing.arah.my` is a thin Fastify wrapper that adds toll cost calculation.

### GET `/route`

Called from `src/services/routingService.ts` → `getRoutes()`.

**Query parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `from_lat` | number | Yes | Origin latitude |
| `from_lng` | number | Yes | Origin longitude |
| `to_lat` | number | Yes | Destination latitude |
| `to_lng` | number | Yes | Destination longitude |
| `profile` | string | Yes | Always `auto` (driving) |
| `alternatives` | number | No | Number of route alternatives (default: 3) |
| `avoid_tolls` | boolean | No | Exclude toll roads |
| `avoid_highways` | boolean | No | Exclude highways |

**Response schema:**

```json
{
  "routes": [
    {
      "id": "string",
      "distance_meters": 12400,
      "duration_seconds": 1080,
      "toll_cost_myr": 3.50,
      "has_tolls": true,
      "summary": "Lebuhraya KESAS",
      "polyline": "encoded_polyline_string",
      "legs": [
        {
          "manoeuvres": [
            {
              "type": "depart",
              "instruction": "Terus ke Jalan Ampang",
              "instruction_en": "Head north on Jalan Ampang",
              "distance_meters": 450,
              "bearing_before": 0,
              "bearing_after": 15
            }
          ]
        }
      ]
    }
  ]
}
```

**Timeout:** 15 seconds (routes can take time for long-distance Malaysian drives)

**Error handling:** On timeout or 5xx, surface `Alert.alert('Ralat penghalaan', ...)` and log to Crashlytics.

---

## 2. Nominatim Geocoding API

**Base URL constant:** `NOMINATIM_URL` (default: `https://geocode.arah.my`)

Self-hosted Nominatim instance loaded with Malaysia OSM data. Always scoped to `countrycodes=my`.

### GET `/search`

Called from `src/services/geocodingService.ts` → `searchPlaces(query, limit)`.

**Query parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Free-text search query |
| `limit` | number | No | Max results (default: 5) |
| `countrycodes` | string | Yes | Always `my` |
| `format` | string | Yes | Always `json` |
| `addressdetails` | 1/0 | Yes | Always `1` to get structured address |

**Response schema:**

```json
[
  {
    "place_id": "12345",
    "display_name": "Menara Kuala Lumpur, Jalan Punchak, Bukit Nanas, KL",
    "lat": "3.1528",
    "lon": "101.7037",
    "type": "tower",
    "category": "tourism"
  }
]
```

Mapped in service to `SearchResult` type: `{ placeId, displayName, coordinates: { latitude, longitude }, type, category }`.

**Timeout:** 8 seconds.

### GET `/reverse`

Called from `src/services/geocodingService.ts` → `reverseGeocode(coords)`.

**Query parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `lat` | number | Yes | Latitude |
| `lon` | number | Yes | Longitude |
| `format` | string | Yes | Always `json` |

**Response schema:**

```json
{
  "display_name": "Masjid Negara, Jalan Perdana, Tasik Perdana, KL",
  "address": { "city": "Kuala Lumpur", "country_code": "my", ... }
}
```

Returns `response.data.display_name` as a plain string.

**Caching:** arah-api Redis cache TTL for geocoding results is 1 hour. The mobile app does not cache locally but TanStack Query `staleTime` should be set to `60 * 60 * 1000` for geocoding queries.

---

## 3. arah-api (Fastify Gateway)

**Base URL constant:** `API_URL` (default: `https://api.arah.my`)
**Version prefix:** `/v1`
**Authentication:** Firebase ID token in `Authorization: Bearer <token>` header. The Axios instance in `src/services/api.ts` injects this automatically via request interceptor, and retries once on `401`.

### GET `/v1/users/me`

Fetch the authenticated user's profile from Firestore (server-side) to populate `UserProfile` in `userStore`.

**Headers:** `Authorization: Bearer <firebase-id-token>`

**Response:**

```json
{
  "uid": "firebase-uid",
  "displayName": "Ahmad Zulkifli",
  "preferredLanguage": "ms",
  "routePreferences": {
    "avoidTolls": false,
    "avoidHighways": false
  },
  "savedPlaces": [
    { "id": "uuid", "label": "Rumah", "coordinates": { "latitude": 3.1390, "longitude": 101.6869 } }
  ],
  "reportCount": 12
}
```

### PUT `/v1/users/me/preferences`

Persist updated route preferences and language to Firestore.

**Request body:**

```json
{
  "preferredLanguage": "en",
  "routePreferences": { "avoidTolls": true, "avoidHighways": false }
}
```

### POST `/v1/users/me/places`

Add a saved place.

**Request body:**

```json
{ "label": "Pejabat", "coordinates": { "latitude": 3.1500, "longitude": 101.7000 } }
```

### DELETE `/v1/users/me/places/:placeId`

Remove a saved place.

### POST `/v1/reports/:reportId/vote`

Vote on a community report (proxies to Firestore `FieldValue.increment`).

**Request body:**

```json
{ "vote": "up" }   // or "down"
```

---

## 4. Firebase Firestore (direct SDK)

**SDK module:** `@react-native-firebase/firestore`

Firestore is accessed directly (not via arah-api) for community reports to leverage `onSnapshot` real-time subscriptions.

### Collection: `reports`

**Document schema:**

| Field | Type | Description |
|-------|------|-------------|
| `type` | string | `police \| accident \| flood \| pothole \| roadblock \| hazard` |
| `lat` | number | Latitude (indexed for range queries) |
| `lng` | number | Longitude (filtered client-side after `lat` range query) |
| `user_hash` | string | SHA-256 hash of uid — no PII stored on reports |
| `upvotes` | number | Community confirmations |
| `downvotes` | number | Community rejections |
| `active` | boolean | False when expired or moderated |
| `created_at` | Timestamp | Firestore Timestamp |
| `expires_at` | Timestamp | `created_at + REPORT_TTL_HOURS[type]` hours |

**Subscription query pattern (from `reportService.ts`):**

```typescript
firestore()
  .collection('reports')
  .where('active', '==', true)
  .where('lat', '>=', bbox.sw.latitude)
  .where('lat', '<=', bbox.ne.latitude)
  .onSnapshot(snapshot => {
    // Client-side filter lng (Firestore range query limitation: only one field)
    const reports = snapshot.docs
      .filter(doc => doc.data().lng >= bbox.sw.longitude && doc.data().lng <= bbox.ne.longitude)
      .map(doc => toReport(doc.id, doc.data()))
    onUpdate(reports)
  })
```

**Note on composite indexes:** Firestore requires a composite index on `(active, lat)`. This index must be created in the Firebase console or via `firestore.indexes.json` in `arah-functions`.

### Collection: `users`

Read by `arah-api` server-side only. The mobile app writes user profile via `arah-api PUT /v1/users/me/preferences`.

---

## 5. Firebase Auth (direct SDK)

**SDK module:** `@react-native-firebase/auth`

### Google Sign-In
```
@react-native-google-signin/google-signin
  → GoogleSignin.signIn()
    → auth.GoogleAuthProvider.credential(idToken)
      → auth().signInWithCredential(credential)
```
Implemented in `src/screens/OnboardingScreen.tsx`.

### Auth state listener
```typescript
// in App.tsx or userStore initializer
auth().onAuthStateChanged((firebaseUser) => {
  if (firebaseUser) {
    // fetch UserProfile from arah-api GET /v1/users/me
    // store in userStore
  } else {
    userStore.setUser(null)
  }
})
```

### Token refresh
The `api.ts` interceptor calls `auth().currentUser?.getIdToken()` on every request. Firebase SDK auto-refreshes tokens before expiry (1 hour). On `401`, `getIdToken(true)` forces a refresh.

---

## 6. WebSocket — realtime.arah.my

**Constant:** `SOCKET_URL` (default: `wss://realtime.arah.my`)
**Library:** `socket.io-client` ^4.8.0

**Status:** scaffold only — not yet implemented. See story MOB-012 (Live Traffic Events via WebSocket).

**Planned events:**

| Event | Direction | Payload |
|-------|-----------|---------|
| `report:new` | server → client | `Report` object |
| `report:expired` | server → client | `{ id: string }` |
| `traffic:incident` | server → client | `{ type, lat, lng, severity }` |
| `join:bbox` | client → server | `{ sw: Coordinates, ne: Coordinates }` |
| `leave:bbox` | client → server | `{}` |
