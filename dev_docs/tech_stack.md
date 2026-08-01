# Tech Stack

## Runtime
- Expo (managed workflow), React Native 0.81.5, React 19.1.0
- **Mobile only:** iOS and Android. Web is not supported because `expo-sqlite` is a native module with no web backend.

## Language
- TypeScript

## Navigation
- Expo Router (file-based)

## State
- Zustand for app/UI state

## Persistence
- `expo-sqlite` for local relational storage

## Styling
- React Native `StyleSheet` (or NativeWind if decided later)

## Key libraries
- `@expo/vector-icons` for icons
- `date-fns` for date handling

## Testing
- Jest + React Native Testing Library

## Rationale
- Local-first matches the domain: historical workouts, progression history, and offline gym use.
- SQLite maps cleanly to the `Program → Split → Workout → Exercise → Set` hierarchy.
- Expo minimizes native build friction while keeping web/iOS/Android possible.
- Zustand is minimal; no heavy boilerplate for a single-user app.
- Core progression logic is pure and easily unit-tested.

## Open decisions
- Web target?
- NativeWind vs plain StyleSheet?
- Cloud sync / accounts?
