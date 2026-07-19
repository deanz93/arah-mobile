# CLAUDE.md — arah-mobile

## What This Repo Does
iOS + Android navigation app for the Arah platform. The primary user-facing product: real-time map, turn-by-turn navigation, community hazard reports, Malaysia-specific alerts.

## Tech Stack
- React Native 0.74 + TypeScript (strict mode)
- **NativeWind v4** — Tailwind CSS for React Native (primary styling system)
- React Native Paper v5 — material component library
- MapLibre GL React Native — map rendering
- Zustand — global client state
- TanStack Query v5 — server/async state
- Jest + React Native Testing Library — unit + component tests

## Non-Negotiable: Styling Rules
- **NativeWind only**: use `className="..."` Tailwind classes on all React Native elements
- **Never** use `StyleSheet.create()` for colors, spacing, or layout
- **Never** hardcode hex colors — use Tailwind theme tokens (defined in `tailwind.config.js`)
- Animations: only use `Animated.style` (not className) for animated values — that's the one exception
- Install new design tokens in `tailwind.config.js` under `theme.extend.colors`

## Non-Negotiable: Testing Rules
- Every new component → co-located `__tests__/ComponentName.test.tsx`
- Every new screen → `src/__tests__/screens/ScreenName.smoke.test.tsx` (renders without crash)
- New navigation flows → `src/__tests__/flows/FlowName.test.tsx`
- All tests must pass before opening a PR: `npm test`
- Minimum: test that component renders, test the primary user interaction, test the error/empty state

## Non-Negotiable: Design + UX Rules
- **3-tap rule**: any core action (start navigation, submit report, find POI) ≤ 3 taps from map
- **48dp minimum** touch targets — use `className="min-h-12 min-w-12"` on all Touchable elements
- **Loading states required** on every async action (use skeleton or spinner — never blank screen)
- **Error states must have a retry CTA** — never a dead-end error with no action
- **Offline-first**: every screen must gracefully degrade with no network (show cached data or clear offline message)
- `accessibilityLabel` required on all `TouchableOpacity`, `Pressable`, `TouchableHighlight`
- RTL support must not be broken — test with `I18nManager.isRTL = true` for Jawi users

## Dev Commands
```bash
npm ci
npx react-native run-android     # Android dev build
npx react-native run-ios         # iOS dev build (macOS only)
npm test                          # Jest unit + component tests
npm run test:watch               # Watch mode
npm run lint                      # ESLint
npm run typecheck                 # tsc --noEmit
```

## Branch + Story Format
Stories: `docs/bmad/04-stories.md`. Branch format: `feature/MOB-NNN-short-description`
Commit format: `feat(mobile): [what changed]` (Conventional Commits)
