# arah-mobile — Product Brief

## What this service is

`arah-mobile` is the React Native consumer application for **Arah**, Malaysia's sovereign, open-data navigation platform. It is the primary way Malaysians interact with the Arah ecosystem: navigating from A to B, receiving community road reports, and contributing their own reports. The app is positioned as a community-owned alternative to Waze, with all infrastructure hosted within Malaysia and all data governed under Malaysian sovereignty.

## Why it exists in the Arah ecosystem

The mobile app is the demand engine that justifies the entire backend infrastructure. Without it, Valhalla routes nobody, Nominatim geocodes nothing, and Firestore accumulates no reports. Every other Arah service (API gateway, routing engine, geocoder, tile server, admin web panel) exists to support this app.

## Goals

- **Turn-by-turn navigation** — provide accurate, voice-guided navigation for Malaysian roads using Valhalla on Malaysia OSM data, with toll cost estimates and highway/toll avoidance preferences
- **Community reporting** — allow users to submit, upvote, and downvote real-time road events (police traps, accidents, floods, potholes, roadblocks, general hazards) that persist in Firestore with type-specific TTLs
- **Live map awareness** — render community reports on the map within the user's viewport using bounding-box Firestore queries, refreshed as the camera moves
- **Bilingual UX** — all user-facing text and voice prompts support Bahasa Malaysia (`ms`) and English (`en`), switchable per user preference
- **Offline-graceful** — the app should degrade gracefully on poor connectivity: cached tiles render, cached routes remain usable, and errors surface clearly rather than crashing

## Non-goals

- The mobile app does **not** serve as an analytics or moderation tool — that is `arah-web`'s responsibility
- The mobile app does **not** manage toll tariff data — that is stored and served by `arah-api`
- The mobile app does **not** run any backend logic; it is purely a consumer of APIs and Firebase
- The mobile app does **not** render a web-based map — it uses the native MapLibre SDK (`@maplibre/maplibre-react-native`) for performance
- No in-app purchases, advertising, or paid features are planned at this stage

## Success metrics

| Metric | Target |
|--------|--------|
| Cold launch to map rendered | < 3 seconds on mid-range Android |
| Route calculation (origin → destination, Malaysia) | < 5 seconds p95 |
| Report submission end-to-end latency | < 2 seconds |
| Community reports visible within viewport | < 1 second after camera stop |
| Crash-free sessions (Firebase Crashlytics) | > 99.5% |
| Voice prompt accuracy (correct instruction, correct timing) | > 95% of turns |
| App size (Android APK, release) | < 60 MB |
