# arah-mobile — Technical Specification

## Runtime dependency table

| Package | Version | Purpose |
|---------|---------|---------|
| `react-native` | 0.74.5 | Cross-platform mobile framework |
| `react` | 18.3.1 | UI rendering |
| `@maplibre/maplibre-react-native` | ^10.0.0 | Native MapLibre GL map rendering on OSM PMTiles |
| `@react-navigation/native` | ^6.1.18 | Navigation container |
| `@react-navigation/native-stack` | ^6.11.0 | Stack navigator (screens) |
| `@react-navigation/bottom-tabs` | ^6.6.1 | Bottom tab navigator (Map / Settings) |
| `react-native-safe-area-context` | ^4.11.0 | SafeAreaView for notch/inset handling |
| `react-native-screens` | ^3.34.0 | Native screen optimization |
| `react-native-gesture-handler` | ^2.20.0 | Native touch handling for navigation |
| `react-native-reanimated` | ^3.15.0 | Smooth animations (route transitions, FAB) |
| `zustand` | ^4.5.5 | Lightweight client state management |
| `@tanstack/react-query` | ^5.56.0 | Server state: geocoding, route fetching |
| `axios` | ^1.7.7 | HTTP client with interceptor for Firebase tokens |
| `socket.io-client` | ^4.8.0 | WebSocket for real-time traffic events |
| `react-native-geolocation-service` | ^5.3.1 | GPS watchPosition with high-accuracy mode |
| `react-native-tts` | ^4.1.0 | Turn-by-turn voice guidance (ms-MY / en) |
| `react-native-permissions` | ^4.1.5 | Runtime permission requests (location, microphone) |
| `@react-native-async-storage/async-storage` | ^2.0.0 | Fallback storage (prefer MMKV) |
| `react-native-mmkv` | ^2.12.2 | Fast synchronous key-value storage for user prefs |
| `react-native-vector-icons` | ^10.2.0 | Icon set for manoeuvre arrows and UI |
| `@react-native-community/netinfo` | ^11.4.1 | Network connectivity detection |
| `react-native-config` | ^1.5.3 | `.env` file injection at build time |
| `@react-native-firebase/app` | ^20.5.0 | Firebase core module |
| `@react-native-firebase/auth` | ^20.5.0 | Google Sign-In + Phone OTP |
| `@react-native-firebase/firestore` | ^20.5.0 | Community reports real-time sync |
| `@react-native-firebase/analytics` | ^20.5.0 | Usage event tracking |
| `@react-native-firebase/crashlytics` | ^20.5.0 | Crash reporting |
| `date-fns` | ^3.6.0 | Date formatting for report TTL display |

## Dev dependency table

| Package | Version | Purpose |
|---------|---------|---------|
| `typescript` | ^5.5.4 | Type system |
| `@types/react` | ^18.3.0 | React type definitions |
| `eslint` | ^8.57.0 | Linting |
| `@typescript-eslint/eslint-plugin` | ^7.18.0 | TS-aware ESLint rules |
| `prettier` | ^3.3.3 | Code formatting |
| `jest` | ^29.7.0 | Unit test runner |
| `@testing-library/react-native` | ^12.7.0 | Component testing utilities |
| `babel-plugin-module-resolver` | ^5.0.2 | Path alias `@/` resolution in Jest |

## File naming conventions

- **Screens** — PascalCase, suffix `Screen`: `MapScreen.tsx`, `NavigationScreen.tsx`
- **Components** — PascalCase, no suffix: `ArahMapView.tsx`, `ManoeuvreBar.tsx`
- **Stores** — camelCase, suffix `Store`: `mapStore.ts`, `routingStore.ts`
- **Services** — camelCase, suffix `Service`: `routingService.ts`, `geocodingService.ts`
- **Hooks** — camelCase, prefix `use`: `useLocation.ts`
- **Utils** — camelCase: `geoUtils.ts`, `formatters.ts`
- **Types** — consolidated in `src/types/index.ts`; add to the barrel file, never create per-file type files
- **Tests** — mirror path under `src/__tests__/`: `src/__tests__/utils/geoUtils.test.ts`
- **Constants** — consolidated in `src/constants/index.ts`; group by domain with a blank line between groups

## TypeScript patterns

### Strict mode configuration (`tsconfig.json`)
```json
{
  "extends": "@react-native/typescript-config/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

### Path alias usage
```typescript
// Always use @/ for src imports — never relative paths
import { Route, Coordinates } from '@/types'
import { haversineDistance } from '@/utils/geoUtils'
import { useRoutingStore } from '@/store/routingStore'
```

### Casting raw API responses
Services receive untyped API JSON. Cast field-by-field with `as`, not with `as unknown as T`:
```typescript
// routingService.ts pattern
return response.data.routes.map((r: Record<string, unknown>) => ({
  id: r.id as string,
  distanceMeters: r.distance_meters as number,
  // ...
}))
```

### Zustand store pattern
```typescript
interface FooState {
  value: string
  setValue: (v: string) => void
}

export const useFooStore = create<FooState>((set) => ({
  value: '',
  setValue: (value) => set({ value }),
}))
```
Selectors should be written in components, not the store:
```typescript
// In component:
const value = useFooStore((s) => s.value)
```

### TanStack Query v5 usage
```typescript
const { data: routes, isLoading } = useQuery({
  queryKey: ['routes', from, to, options],
  queryFn: () => routingService.getRoutes(from, to, options),
  staleTime: 5 * 60 * 1000,  // 5 minutes — matches arah-api Redis TTL
  enabled: !!from && !!to,
})
```

## Environment variables (`react-native-config`)

| Variable | Dev default | Production |
|----------|-------------|-----------|
| `ARAH_API_URL` | `http://10.0.2.2:3001` | `https://api.arah.my` |
| `ARAH_TILE_URL` | `http://10.0.2.2:8080` | `https://tiles.arah.my` |
| `ARAH_SOCKET_URL` | `ws://10.0.2.2:3002` | `wss://realtime.arah.my` |
| `VALHALLA_URL` | `http://10.0.2.2:8002` | `https://routing.arah.my` |
| `NOMINATIM_URL` | `http://10.0.2.2:7070` | `https://geocode.arah.my` |

Note: `10.0.2.2` is the Android emulator loopback to the host machine. For iOS Simulator, use `localhost`. For a physical device, use the host LAN IP.

## Error handling approach

### Service layer — throw, never swallow
```typescript
// Services throw AxiosError or FirebaseError
export async function getRoutes(from, to, options): Promise<Route[]> {
  // If Valhalla is down, axios throws — do not catch here
  const response = await axios.get(...)
  return response.data.routes.map(...)
}
```

### Screen layer — catch and present
```typescript
// Screens catch and show user-facing feedback
try {
  const routes = await getRoutes(origin, dest, opts)
  routingStore.setRoutes(routes)
} catch (err) {
  Alert.alert('Ralat penghalaan', 'Tidak dapat mengira laluan. Cuba lagi.')
  // Also log to Crashlytics:
  crashlytics().recordError(err as Error)
}
```

### API interceptor — auto-retry on 401
The `api.ts` Axios instance refreshes the Firebase ID token on `401` and retries once automatically (see `src/services/api.ts`).

### Network awareness
Use `@react-native-community/netinfo` to detect offline state. When offline, suppress network errors and show an offline banner instead.

## Testing approach

- **Unit tests** — Jest + `@testing-library/react-native` for utils and hooks
- **Coverage target** — 80% for `src/utils/` and `src/services/`
- **What NOT to test** — Zustand store mutations (trivial set calls), MapLibre rendering (native), Firebase SDK calls (mock at the module level)

### Mocking Firebase
```typescript
// src/__tests__/__mocks__/@react-native-firebase/firestore.ts
jest.mock('@react-native-firebase/firestore', () => ({
  __esModule: true,
  default: () => ({
    collection: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    onSnapshot: jest.fn(),
    add: jest.fn().mockResolvedValue({ id: 'mock-id' }),
  }),
}))
```

### Running tests
```bash
yarn test                    # all tests
yarn test --testPathPattern=geoUtils    # single file
yarn test:coverage           # with Istanbul report
```
