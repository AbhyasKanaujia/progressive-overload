# Progressive Overload

## Terminology

1. **Program**: The complete plan. E.g. 12 Week Muscle Building Program
2. **Split**: How workouts are distributed during the week. E.g. Full body Mon, Wed, Fri. Mon Upper, Tue Lower, Thu Upper, Fri Lower. Push Pull Leg.
3. **Workout Template**: The planned exercises, sets, and rep ranges for a given day. E.g. "Push Day A" = Bench Press, Overhead Press, Lateral Raises, Triceps Pushdown.
4. **Workout Session**: A single performed instance of a workout template. E.g. "Monday July 28, 2026 — Push Day A".
5. **Exercise**: One movement. Bench press, squat, dumbbell curl.
6. **Set**: Group of repetitions. Set 1: 8 reps, rest, set 2: 8 reps, rest, set 3: 8 reps.
7. **Rep**: One complete movement. Bench press: down, up => 1 rep.
8. **Volume**: Total work performed. Volume = weight × reps × sets. This is the biggest driver of muscle growth.

## Progressive Overload

Doing 8 reps of same weight and set forever gives no reason to the muscle to grow. The body adapts only when it experiences a challenge slightly beyond what it's already adapted to.

This is progressive overload.

Methods: increase weight, reps, sets, technique, quality, range of motion, control, training frequency.

## Double Progression

Progress with a fixed weight (60kg): 8 8 8 -> 9 8 8 -> 9 9 8 -> 9 9 9 -> 10 9 9 -> until -> 12 12 12
Then increase weight 62.5kg

Two variables change: reps and weight.

```pseudocode
function progressWorkout(exercise):
    if allSetsAtMaxReps(exercise):
        increaseWeight(exercise)
        resetReps(exercise, MIN_REPS)
    else:
        increaseRepsOnLowestSet(exercise)
```

Weight increase rule:

- Compound Lift: 2.5kg or 5%
- Isolation lifts: 1–2kg

It's not necessary to increase reps every session. A plateau is when you genuinely stop improving despite recovery being good.

Order of operations:

1. Check sleep.
2. Check protein and calories.
3. Ensure you're training close to failure (about 1–3 reps in reserve).
4. Reduce fatigue with a deload if needed.
5. Only then consider changing the exercise.

Changing exercises should not be your first response.

## Exercise Progression Isn't a DAG

This is a common misconception.

Exercises are usually **alternatives**, not prerequisites.

For example:

```
Flat Bench Press
├── Dumbbell Bench
├── Machine Chest Press
├── Smith Bench
└── Weighted Push-up
```

These all train the same primary movement pattern (horizontal push). You don't "unlock" one by mastering another.

A better mental model is a graph of equivalent or similar movements.

```
Horizontal Push
├── Bench Press
├── Machine Press
├── DB Press
└── Push-up
```

Each node is interchangeable, though some are better for certain goals.

## Movement Pattern Hierarchy

Instead of grouping by muscle only, group exercises by movement.

```
Push
├── Horizontal Push
│   ├── Bench Press
│   └── Machine Press
└── Vertical Push
    └── Overhead Press
    └── Machine Shoulder Press
Pull
├── Horizontal Pull
│   └── Rows
└── Vertical Pull
    ├── Pull-ups
    └── Lat Pulldown
Legs
├── Squat
│   ├── Leg Press
│   └── Hack Squat
├── Hinge
│   ├── Romanian Deadlift
│   └── Hip Thrust
├── Knee Flexion
│   └── Leg Curl
├── Calf
│   └── Standing Raise
└── Core
    ├── Crunch
    └── Plank
```

This makes exercise substitution much easier.

---

## Data Model

The app separates three independent layers: a **global exercise library**, **program templates** for planning, and **workout sessions** for history.

### Global Exercise Library

Exercises exist independently of any program. They are referenced by templates and tracked across all sessions.

```
movement_patterns
├── id (PRIMARY KEY)
├── name                -- e.g. "Horizontal Push"
├── parent_id (FK)     -- e.g. "Push" is parent of "Horizontal Push"
└── category            -- e.g. "Push", "Pull", "Legs", "Core"

exercises
├── id (PRIMARY KEY)
├── name                -- e.g. "Bench Press"
├── movement_pattern_id (FK)
├── muscle_groups       -- e.g. "Chest, Triceps, Front Delts"
├── equipment           -- e.g. "Barbell", "Dumbbell", "Machine", "Bodyweight"
└── difficulty          -- e.g. "Beginner", "Intermediate", "Advanced"

exercise_alternatives
├── exercise_id (FK)
└── alternative_exercise_id (FK)
   -- Junction table linking equivalent movements (Bench Press ↔ DB Bench ↔ Machine Press)
```

### Program Templates

Templates describe what you plan to do. They do not contain history.

```
programs
├── id (PRIMARY KEY)
├── name                -- e.g. "12 Week Muscle Building"
├── description
└── created_at

workout_templates
├── id (PRIMARY KEY)
├── program_id (FK)
├── name                -- e.g. "Push Day A", "Upper Body"
└── order_index

template_exercises
├── id (PRIMARY KEY)
├── workout_template_id (FK)
├── exercise_id (FK)   -- references the global library
├── order_index
├── target_sets         -- default 3
├── target_reps_min     -- default 8
└── target_reps_max     -- default 12
```

### Workout Sessions

Sessions capture what you actually did. They are independent of templates: deleting a program does not delete history.

```
workout_sessions
├── id (PRIMARY KEY)
├── workout_template_id (FK, nullable)  -- which template was followed, if any
├── program_id (FK, nullable)           -- which program was active, if any
├── performed_at        -- timestamp of the session
├── notes
└── completed

session_exercises
├── id (PRIMARY KEY)
├── workout_session_id (FK)
├── exercise_id (FK)    -- references the global library directly
└── order_index

set_logs
├── id (PRIMARY KEY)
├── session_exercise_id (FK)
├── set_number
├── target_weight
├── target_reps
├── performed_weight
├── performed_reps
├── rir                 -- reps in reserve (1–3)
├── completed           -- boolean
└── created_at
```

### Why this separation matters

- **Exercise history is global**: Dumbbell Curl history exists across all programs. PRs are per-exercise, not per-program.
- **Templates are disposable**: Delete a program and its templates are gone, but every `workout_session` and `set_log` remains.
- **Alternatives work naturally**: Any exercise in the library can reference equivalents via `exercise_alternatives`.
- **Analytics are clean**: Volume, PRs, and progression graphs query `set_logs → session_exercises → exercises` without dragging in program hierarchies.

---

## A Simple Progression Algorithm

For each exercise:

1. Perform all planned sets.
2. Record reps for each set.
3. Did every set reach the top of the target range?
   - **Yes** → Increase weight next session.
   - **No** → Keep the same weight.
4. Next session: Try to improve by at least one total rep across all sets.

For example:

- Week 1: 8, 8, 8 = 24 total reps
- Week 2: 9, 8, 8 = 25 total reps
- Week 3: 9, 9, 8 = 26 total reps
- Week 4: 10, 9, 8 = 27 total reps

This "add one rep somewhere" approach is easier than forcing every set to increase at once and naturally leads to reaching 12, 12, 12 over time.

For the app, the domain is modeled around **movement patterns**, **double progression**, and **historical performance** rather than around fixed exercise chains. That mirrors how experienced coaches think: they track progress on a movement, and they swap to an equivalent exercise only when there's a good reason, while preserving the user's progression history. This design is both simpler and more flexible than trying to encode a strict dependency graph between exercises.
