# Manual Test Plan — Workout Detail + Reorder Exercises (Issue #34)

Covers `app/(tabs)/programs/[programId]/[workoutId]/index.tsx` and
`app/(tabs)/programs/[programId]/[workoutId]/reorder-exercises.tsx`.

## Setup

1. Run `npm start` and open the app on a simulator/device (iOS or Android,
   per the design doc this is the only supported target — no web).
2. From the Programs tab, open (or create) a program with at least one
   workout. Note: the Exercise Picker (#35) and Add/Edit Exercise (#36)
   are not built yet, so there is currently no in-app way to add exercises
   to a workout. To test the populated states below, seed rows directly:
   - Easiest: temporarily add a `useEffect` one-liner or a debug button
     that calls `createTemplateExercise` from `db/templates.ts`, OR
   - Use `hooks/useWorkout.test.ts` / `db/templates.test.ts` as a reference
     for the exact call shape, and run equivalent calls against the dev
     DB (e.g. via a temporary script using `expo-sqlite`), OR
   - Wait until #35/#36 land and use the real UI.
   Seed at least 2 exercises on one workout so ordering/reorder can be
   verified, and leave a second workout with 0 exercises for the empty
   state.

## 1. Empty state

**Steps**
1. Open a workout that has zero exercises.

**Expect**
- Title: `No exercises yet`
- Description: `Add an exercise to start building this workout.`
- Primary button: `+ Add Exercise`
- No exercise list/section header is shown.
- No reorder icon is shown (nothing to reorder).

## 2. Breadcrumb

**Steps**
1. Open a workout inside a program.
2. Read the breadcrumb at the top.
3. Tap the `Programs` segment.
4. Navigate back into the same program → workout.
5. Tap the program-name segment (middle breadcrumb item).

**Expect**
- Breadcrumb reads `Programs → {Program Name} → {Workout Name}`.
- Both `Programs` and `{Program Name}` are visually distinct pill chips;
  the workout name (last segment) is plain text, not tappable.
- Tapping `Programs` navigates to the Programs list.
- Tapping `{Program Name}` navigates back to Program Detail, and its
  scroll position from before is preserved (scroll the workout list down
  before drilling in, then confirm it's still scrolled after returning).

## 3. Populated exercise list

**Steps**
1. Open a workout with 2+ seeded exercises (see Setup).

**Expect**
- Section header `Exercises` appears above the list, with an add (`+`)
  icon and (if 2+ exercises) a reorder icon.
- Each row shows, left to right:
  - A colored initial badge (background/text color should differ between
    rows with different exercise names — same exercise name always
    produces the same color).
  - `{position}. {Exercise Name}` as the title (e.g. `1. Bench Press`).
  - Metadata line: `{sets} sets · {min}–{max} reps`, e.g. `3 sets · 8–12 reps`.
  - If the exercise has a `rest` value set: metadata extends with
    `· Rest {rest}`, e.g. `3 sets · 8–12 reps · Rest 2-3 min`.
  - If the exercise has `notes` set: metadata extends further with
    `· {notes}`.
  - If both rest and notes are absent, metadata is just the sets/reps
    part — no trailing `·` or empty segments.
  - A chevron on the right.
- No live-timer UI, no set-completion checkboxes, no weight-logging
  controls anywhere on this screen — this is plan data only.
- Pull-to-refresh (drag list down) works without error.

## 4. Row navigation (currently a known gap)

**Steps**
1. Tap an exercise row.

**Expect (current state, pre-#35/#36)**
- Attempts to navigate to `.../[workoutId]/[exerciseId]/edit`, which
  does not exist yet — this will currently error/404 in Expo Router.
  This is expected until #36 (Add/Edit Exercise) lands; not a regression
  to file a bug for, but worth confirming it fails *only* on this specific
  route and doesn't crash the rest of the app (e.g. back navigation still
  works after the error).

## 5. Add Exercise entry point (currently a known gap)

**Steps**
1. From a workout (empty or populated), tap `+ Add Exercise`
   (empty-state CTA or header `+` icon).

**Expect (current state, pre-#35)**
- Attempts to navigate to `.../[workoutId]/add-exercise`, which doesn't
  exist yet — same expected gap as above until #35 (Exercise Picker)
  lands.

## 6. Edit / Delete Workout actions

**Steps**
1. From Workout Detail, tap the edit (pencil) icon in the header.
2. Go back, tap the delete (trash) icon in the header.

**Expect**
- Edit icon → opens Edit Workout (issue #33's screen), pre-filled with
  the current name/description/type.
- Delete icon → opens the Delete Workout confirmation sheet.
- Both route correctly since these screens already exist from #33.

## 7. Reorder Exercises — happy path

**Steps**
1. Open a workout with 2+ exercises.
2. Tap the reorder icon in the section header.
3. On the Reorder screen, press and drag an exercise row's drag handle
   to change its position.
4. Tap `Done`.
5. Return to Workout Detail.

**Expect**
- Reorder screen title: `Reorder Exercises`, subtitle shows the workout
  name.
- Each row shows the colored initial badge + exercise name + a visible
  drag handle icon (no sets/reps/rest metadata needed here).
- Dragging a row reorders the local list live; the actively-dragged row
  gets a highlighted border.
- After `Done`, the new order is persisted — reopening Workout Detail
  (or the app) shows exercises in the new order with updated position
  numbers (`1.`, `2.`, ...).

## 8. Reorder Exercises — cancel path

**Steps**
1. Open Reorder Exercises on a workout with a known order (e.g. A, B, C).
2. Drag to change the order (e.g. to C, A, B).
3. Tap `Cancel` instead of `Done`.
4. Return to Workout Detail.

**Expect**
- Order reverts to the original (A, B, C) — no persistence occurred.
- No error shown; navigation returns cleanly to Workout Detail.

## 9. Reorder affordance with exactly 1 exercise

**Steps**
1. Open a workout with exactly 1 exercise.

**Expect**
- No reorder icon appears in the section header (nothing to reorder).
- The `+ Add Exercise` icon is still present.

## 10. Loading / error / not-found states

**Steps**
1. Navigate to a workout while the DB read is slow/throttled (or check
   briefly on cold start) to observe the loading spinner.
2. Manually navigate to a workout URL with a non-existent `workoutId`
   (e.g. edit the route param or use a stale deep link after deleting
   the workout elsewhere).

**Expect**
- Loading: centered spinner, no flash of empty/error content first.
- Not found: `Workout not found.` message with a `Go Back` button that
  returns to the previous screen.
- If a DB/read error occurs: `Something went wrong. Please try again.`
  (non-blocking, centered).

## 11. Regression check — Program Detail still works

**Steps**
1. From Programs list, open a program, confirm the workout list still
   loads, reorders, and navigates into Workout Detail correctly.

**Expect**
- No regressions to #31/#32/#33 flows caused by the new routes/hook.

---

**Automated coverage**: `hooks/useWorkout.test.ts` covers the data-layer
behavior of the above (empty list, ordered exercises with details,
reorder + persistence, not-found) — run `npm test -- useWorkout` to
re-verify quickly after any related change. Manual testing here is
mainly for visual/navigation/gesture behavior that tests don't cover.
