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
- React Native `StyleSheet`

## Key libraries
- `@expo/vector-icons` for icons
- `date-fns` for date handling

## Testing
- Jest + React Native Testing Library

## Rationale
- Local-first matches the domain: historical workouts, progression history, and offline gym use.
- SQLite maps cleanly to the relational domain. The schema separates three independent layers:
  1. **Global exercise library** — movement patterns, exercises, alternatives
  2. **Program templates** — what you plan to do
  3. **Workout sessions** — what you actually did
- This decoupling means deleting a program never destroys workout history, exercises are reusable across programs, and PRs/analytics are global per exercise.
- Expo minimizes native build friction while keeping iOS/Android possible.
- Zustand is minimal; no heavy boilerplate for a single-user app.
- Core progression logic is pure and easily unit-tested.

## Open decisions
- NativeWind vs plain StyleSheet?
- Cloud sync / accounts?
