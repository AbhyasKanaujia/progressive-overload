# Progressive Overload

## Terminology

1. Program: The complete plan. E.g. 12 Week Muscle Building Program
2. Spit: How workouts are distributed during the week. E.g. Full body Mon, Wed, Fri. Mon Upper, Tue Lower, Thu Upper, Fri Lower. Push Pull Leg.
3. Workout: Everything done in one gym visit. E.g. Monday: Bench Press, Rows, Squats and Lateral Raises
4. Exercise: One movement.
5. Set: Group of repetitions. set 1: 8 reps, rest, set 2: 8 reps, rest, set 3: 8 reps.
6. Rep: One complete movement. bench press: down, up => 1 rep.
7. Volume: Total work performed. Volume = weight _ reps _ sets. This is the biggest driver of muscle growth.

## Progressive overload

Doing 8 reps of same weight and set forever gives no reason to the muscle to grow. THe body adapts only when it experience a challenge slightly beyond what its already adapted to.

This is progressive overload.

Methods: increase: weight, reps, sets, technique, quality, range of motion, control, training frequency.

## Double Progression

Progress with a fixed wight(60kg): 8 8 8 -> 9 8 8 -> 9 9 8 -> 9 9 9 -> 10 9 9 -> unti -> 12 12 12
Then increase weight 62.5kg

Two variable change: reps and weight.

```pseudocode
function progressWorkout(exercise):
    if allSetsAtMaxReps(exercise):
        increaseWeight(exercise)
        resetReps(exercise, MIN_REPS)
    else:
        increaseRepsOnLowestSet(exercise)
```

Weight increase rule:

Compund Lift: 2.5kg or 5%
Isolation lifts: 1-2kg

Its not necessary to increase reps every session. A plateau is when you genuinely stop improving despite recovery being good.

Order of operations:

1. Check sleep.
2. Check protein and calories.
3. Ensure you're training close to failure (about 1–3 reps in reserve).
4. Reduce fatigue with a deload if needed.
5. Only then consider changing the exercise.

Changing exercises should not be your first response.

# Exercise Progression Isn't a DAG

This is a common misconception.

Exercises are usually **alternatives**, not prerequisites.

For example:
Flat Bench Press
├── Dumbbell Bench
├── Machine Chest Press
├── Smith Bench
└── Weighted Push-up

These all train the same primary movement pattern (horizontal push). You don't "unlock" one by mastering another.

A better mental model is a graph of equivalent or similar movements.
Horizontal Push
Bench Press
Machine Press
DB Press
Push-up

Each node is interchangeable, though some are better for certain goals.

# Movement Pattern Hierarchy

Instead of grouping by muscle only, group exercises by movement.
Push
Horizontal Push
Bench Press
Machine Press
Vertical Push
Overhead Press
Machine Shoulder Press
Pull
Horizontal Pull
Rows
Vertical Pull
Pull-ups
Lat Pulldown
Legs
Squat
Leg Press
Hack Squat
Hinge
Romanian Deadlift
Hip Thrust
Knee Flexion
Leg Curl
Calf
Standing Raise
Core
Crunch
Plank

This makes exercise substitution much easier.

---

This makes exercise substitution much easier.

---

# Data Model for Your App

One possible hierarchy is:
Program
├── Split
│ ├── Workout
│ │ ├── Exercise
│ │ │ ├── Sets
│ │ │ │ ├── Weight
│ │ │ │ ├── Reps
│ │ │ │ ├── RIR
│ │ │ │ ├── Rest Time
│ │ │ │ └── Completed

Each exercise should also store:
Exercise
Name
Muscle Groups
Movement Pattern
Equipment
Difficulty
Progression Rule
Replacement Exercises

---

# A Simple Progression Algorithm

For each exercise:
Perform all planned sets.
↓
Record reps for each set.
↓
Did every set reach the top of the target range?
Yes
Increase weight next session.
No
Keep the same weight.
↓
Next session:
Try to improve by at least one total rep across all sets.

For example:
Week 1
8, 8, 8 = 24 total reps
Week 2a
9, 8, 8 = 25 total reps
Week 3
9, 9, 8 = 26 total reps
Week 4
10, 9, 8 = 27 total reps

This "add one rep somewhere" approach is easier than forcing every set to increase at once and naturally leads to reaching 12,12,12 over time.

For your app, I'd recommend modeling the domain around **movement patterns**, **double progression**, and **historical performance** rather than around fixed exercise chains. That mirrors how experienced coaches think: they track progress on a movement, and they swap to an equivalent exercise only when there's a good reason, while preserving the user's progression history. This design is both simpler and more flexible than trying to encode a strict dependency graph between exercises.
