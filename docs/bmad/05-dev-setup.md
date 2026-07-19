# arah-mobile — Developer Setup

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 20 LTS | Use `nvm` or `fnm` |
| Yarn | 1.22+ | `npm install -g yarn` |
| React Native CLI | latest | `npm install -g react-native-cli` |
| Android Studio | Hedgehog (2023.1.1+) | Required for Android SDK and emulator |
| Xcode | 15+ | macOS only; required for iOS build |
| JDK | 17 | Android build requires JDK 17 |
| CocoaPods | 1.15+ | iOS dependency manager: `sudo gem install cocoapods` |
| Docker | 24+ | For local backend services |
| Git | 2.40+ | Version control |

---

## Step 1: Clone and install dependencies

```bash
git clone https://github.com/deanz93/arah-mobile.git
cd arah-mobile
yarn install
```

---

## Step 2: Configure environment

```bash
cp .env.example .env
```

The `.env.example` values target the Android emulator (`10.0.2.2` = host loopback). No changes needed for Android emulator. For iOS Simulator, replace `10.0.2.2` with `localhost`. For a physical device on the same Wi-Fi, use your machine's LAN IP (e.g. `192.168.1.x`).

```
ARAH_API_URL=http://10.0.2.2:3001
ARAH_TILE_URL=http://10.0.2.2:8080
ARAH_SOCKET_URL=ws://10.0.2.2:3002
VALHALLA_URL=http://10.0.2.2:8002
NOMINATIM_URL=http://10.0.2.2:7070
```

---

## Step 3: Firebase configuration

1. Go to the [Firebase Console](https://console.firebase.google.com) → select project `arah-app`
2. Download `google-services.json` and place it at `android/app/google-services.json`
3. Download `GoogleService-Info.plist` and place it at `ios/arah/GoogleService-Info.plist`
4. For Google Sign-In on Android: add your debug SHA-1 fingerprint to Firebase
   ```bash
   cd android && ./gradlew signingReport
   # Copy the SHA1 from "Variant: debugAndroidTest"
   ```
5. For Google Sign-In on iOS: add the `REVERSED_CLIENT_ID` from `GoogleService-Info.plist` as a URL scheme in Xcode under Info → URL Types

---

## Step 4: Start local backend services

The mobile app requires `arah-api`, `arah-routing` (Valhalla), `arah-geocoding` (Nominatim), and `arah-tile-server` (PMTiles). These are managed via `docker-compose` in the companion repos.

```bash
# Option A: use arah-infra (recommended — starts all services)
git clone https://github.com/deanz93/arah-infra.git
cd arah-infra
docker-compose -f docker-compose.local.yml up -d

# Option B: start services individually
# arah-api
git clone https://github.com/deanz93/arah-api.git
cd arah-api && cp .env.example .env && docker-compose up -d

# arah-routing (Valhalla — heavy, ~2GB Malaysia OSM graph)
git clone https://github.com/deanz93/arah-routing.git
cd arah-routing && docker-compose up -d  # downloads Malaysia OSM on first run (~10min)

# arah-geocoding (Nominatim — heavy, ~3GB Malaysia data)
git clone https://github.com/deanz93/arah-geocoding.git
cd arah-geocoding && docker-compose up -d  # imports Malaysia OSM on first run (~20min)

# arah-tile-server (PMTiles)
git clone https://github.com/deanz93/arah-tile-server.git
cd arah-tile-server && docker-compose up -d
```

Verify services are running:
```bash
curl http://localhost:3001/health      # arah-api → {"status":"ok"}
curl http://localhost:8002/status      # Valhalla → {"version":"..."}
curl http://localhost:7070/status      # Nominatim → "Nominatim ready"
curl http://localhost:8080/health      # PMTiles server → 200 OK
```

---

## Step 5: Run on Android

```bash
# Start an Android emulator (API 33+) in Android Studio first, then:
yarn android

# Or on a physical device (USB debugging enabled):
adb devices  # verify device is listed
yarn android --deviceId <device-id>
```

---

## Step 6: Run on iOS (macOS only)

```bash
cd ios && pod install && cd ..
yarn ios

# Specify a simulator:
yarn ios --simulator "iPhone 15 Pro"
```

---

## Step 7: Start Metro bundler standalone (if needed)

```bash
yarn start
# With cache reset:
yarn start --reset-cache
```

---

## Test commands

```bash
# All unit tests
yarn test

# Watch mode
yarn test:watch

# Coverage report (opens in browser)
yarn test:coverage

# Type-checking (no emit)
yarn typecheck

# Lint
yarn lint

# Lint with auto-fix
yarn lint --fix
```

---

## Malaysian test coordinates for GPS simulation

Use these coordinates in the Android emulator's Extended Controls → Location tab:

| Location | Latitude | Longitude | Notes |
|----------|----------|-----------|-------|
| KL City Centre (default) | 3.1390 | 101.6869 | KLCC area |
| Masjid Negara | 3.1428 | 101.6867 | Near federal offices |
| Petaling Jaya | 3.1073 | 101.6067 | Suburban test |
| Bukit Bintang | 3.1466 | 101.7101 | Dense urban |
| KL International Airport | 2.7456 | 101.7099 | Long-distance route test |
| Penang Bridge | 5.3670 | 100.4011 | Inter-state route |
| Johor Bahru | 1.4927 | 103.7414 | Southern Malaysia |

To simulate movement during navigation testing, use the Android emulator's route playback feature (Extended Controls → Location → Routes tab) or `adb emu geo fix <lng> <lat>`.

---

## Common issues and fixes

### "Google Sign-In failed: DEVELOPER_ERROR"
Your debug SHA-1 is not registered in Firebase. Run `cd android && ./gradlew signingReport` and add the SHA-1 to Firebase Console → Project Settings → Android app.

### Metro cannot connect to emulator
```bash
adb reverse tcp:8081 tcp:8081  # forward Metro port
adb reverse tcp:3001 tcp:3001  # forward arah-api port
```

### MapLibre tiles not loading
1. Check `ARAH_TILE_URL` in `.env` — ensure the tile server is running on port 8080
2. Verify `tiles.arah.my/style.json` responds: `curl http://localhost:8080/style.json`
3. Android: ensure `android/app/src/main/res/xml/network_security_config.xml` permits cleartext traffic to `10.0.2.2`

### Valhalla returns 404 or empty routes
The Malaysia OSM graph may not be loaded. Check:
```bash
docker logs arah-routing-valhalla-1
# Should show "Valhalla is running" with route tile count
```

### iOS pod install fails with "target overrides the `FRAMEWORK_SEARCH_PATHS`"
```bash
cd ios && pod deintegrate && pod install
```

### `react-native-config` variables are undefined
You must rebuild the native app after changing `.env`. Restart Metro with `--reset-cache` AND rebuild the native app (`yarn android` / `yarn ios`).

### Firestore permissions denied
Your Firebase security rules may be blocking reads. For local testing, use rules that allow authenticated reads/writes:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reports/{doc} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### TypeScript errors on Firebase v20 modules
Ensure `@types/react-native` version matches the `react-native` version. Run `yarn typecheck` and fix import types — never use `@ts-ignore`.

---

## CI/CD pipeline

The repo uses GitHub Actions (`.github/workflows/ci.yml`). On every PR to `main`:
1. `yarn lint`
2. `yarn typecheck`
3. `yarn test`

Release builds (`.github/workflows/release.yml`) trigger on version tags and build signed APKs via Fastlane or Gradle.
