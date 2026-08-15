# Programs Screen

Implementation reference for the Programs tab. This document defines the
intended behavior behind the approved Programs designs so the UI can be
implemented without reverse-engineering the Figma frames.

## Global behavior

-   Platform: iOS and Android, portrait, light mode only.
-   Hierarchy: `Program → Workout → Exercise`.
-   The Programs tab manages training-plan templates. It is not a live
    workout/session-logging surface.
-   Users may have zero, one, or multiple programs.
-   Most users have one active program, but the list must support
    multiple programs.
-   Primary actions should remain reachable one-handed.
-   The parent context remains visually present during deeper navigation
    through a breadcrumb/path.
-   Where practical, navigation uses a spatial transition: the selected
    parent appears to persist/recede while its children take focus. The
    implementation may use a shared-element/container transition rather
    than a literal page-slide if the platform navigation framework
    requires it.
-   Back navigation returns to the immediate parent level and preserves
    the parent's scroll position/state.
-   Destructive actions require confirmation.
-   Save/create actions validate before committing.
-   Program-management screens must not introduce live-session concepts
    such as timers, completed-set checkmarks, or per-set logging.

## 1. Programs List

### Purpose

Show all programs and provide entry points for creating, opening,
editing, or deleting a program.

### Fields

There are no editable fields on the list screen.

Each program row/card displays:

-   Program name --- text, required at creation.
-   Workout count --- derived number.
-   Exercise count --- derived number.
-   Active status --- derived boolean/status indicator.
-   More/actions control --- opens program actions.

### Empty state

When there are no programs:

-   Title: `No programs yet`
-   Supporting copy: `Create your first program to get started.`
-   Primary action: `Create Program`

The empty state is centered and should not imply an error.

### Copy

-   Screen title: `Programs`
-   Primary action: `Create Program`
-   Empty title: `No programs yet`
-   Empty description: `Create your first program to get started.`

If an action fails because of an unexpected persistence/network error,
show a non-blocking error message:

`Something went wrong. Please try again.`

Do not invent a more specific error when the underlying cause is
unknown.

### Navigation

-   Tap a program → Program Detail.
-   Tap `Create Program` → Add Program.
-   Program action menu → Edit Program or Delete Program.
-   After successfully creating a program → Program Detail for the newly
    created program.
-   After successfully editing a program → return to Program Detail.
-   After deleting a program → return to Programs List.

### Transition

Opening a program should feel spatial: the selected program card becomes
the visual parent/container and expands/recedes into Program Detail. The
breadcrumb changes from `Programs` to `Programs → {Program}`.

Returning uses the inverse transition where supported.

### Interaction rules

-   Program cards are vertically scrollable.
-   Multiple programs are supported.
-   The active program may show an `Active` status chip.
-   Do not require the user to enter an overflow menu merely to open a
    program.
-   Delete is available through the program action menu and always
    requires confirmation.

## 2. Program Detail

### Purpose

Show one program and its ordered workouts.

### Fields

Displayed program properties:

-   Program name --- text, required.
-   Description --- text, optional.
-   Active status --- derived status.
-   Workout list --- ordered collection.

Workout rows display:

-   Workout position --- derived number.
-   Workout name --- text.
-   Exercise count --- derived number.

### Empty state

If the program has no workouts:

-   Title: `No workouts yet`
-   Supporting copy: `Add a workout to start building this program.`
-   Primary action: `+ Add Workout`

### Copy

-   Breadcrumb: `Programs → {Program}`
-   Primary action: `+ Add Workout`
-   Empty title: `No workouts yet`
-   Empty description: `Add a workout to start building this program.`

### Navigation

-   Tap workout → Workout Detail.
-   Tap `+ Add Workout` → Add Workout.
-   Program edit action → Edit Program.
-   Program delete action → Delete Program.
-   Reorder action → Reorder Workouts state/screen.
-   After creating a workout → Workout Detail for the new workout.
-   After editing a workout → return to Workout Detail.
-   After deleting a workout → return to Program Detail.

### Transition

The selected program remains as the parent context while its workout
list takes focus. Workout navigation extends the breadcrumb to:

`Programs → {Program} → {Workout}`

The workout list should feel like it is revealed from the selected
program rather than appearing as an unrelated page.

### Interaction rules

-   Workouts are displayed in explicit order.
-   Each workout row is tappable.
-   Reordering is drag-and-drop using a visible drag handle.
-   Reordering commits the new order when the user taps `Done`.
-   `Cancel` discards unsaved ordering changes and restores the previous
    order.
-   If there is only one workout, reorder affordance may be omitted.

## 3. Add/Edit Program

### Purpose

Create a new program or modify an existing program's metadata.

### Fields

#### Program Name

-   Type: text
-   Required: yes
-   Default when creating: empty
-   Default when editing: current program name
-   Validation: trimmed value must not be empty.
-   Recommended maximum: 60 characters.
-   Leading/trailing whitespace is trimmed before saving.

#### Description

-   Type: multiline text
-   Required: no
-   Default when creating: empty
-   Default when editing: current description
-   Recommended maximum: 200 characters.

### Empty/error states

Validation failure should keep the user on the form, identify the
invalid field, and explain the problem inline.

Exact validation copy:

`Enter a program name.`

For a name exceeding the limit:

`Program name must be 60 characters or less.`

For description exceeding the limit:

`Description must be 200 characters or less.`

### Copy

Create mode:

-   Title: `Add Program`
-   Name label: `Program name`
-   Name placeholder: `e.g. Upper / Lower Split`
-   Description label: `Description (optional)`
-   Description placeholder: `What is the focus of this program?`
-   Primary action: `Create Program`
-   Cancel/close action: `Cancel`

Edit mode:

-   Title: `Edit Program`
-   Primary action: `Save Changes`
-   Delete action: `Delete Program`

### Navigation

-   Successful create → Program Detail for the newly created program.
-   Successful save → Program Detail.
-   Cancel → return to the previous screen without changes.
-   Delete Program → Delete Program confirmation.
-   Validation failure → remain on form.

### Transition

Opening Add Program uses a modal/form presentation from Programs List.

Opening Edit Program preserves the Program context. Saving returns to
the Program Detail state with the updated metadata.

## 4. Delete Program

### Purpose

Confirm irreversible deletion of a program.

### Fields

No editable fields.

### Copy

Confirmation title:

`Delete Program?`

Warning:

`Are you sure you want to delete "{Program Name}"? This action cannot be undone.`

Primary destructive action:

`Delete Program`

Secondary action:

`Cancel`

### Error state

If deletion fails:

`Couldn't delete the program. Please try again.`

Keep the confirmation/action context available so the user can retry or
cancel.

### Navigation

-   `Cancel` → previous screen.
-   `Delete Program` on success → Programs List.
-   The deleted program and its workouts/exercises are no longer
    available through the Programs tab.

### Transition

Present as a confirmation sheet/dialog over the current Program context.
On success, dismiss the confirmation and transition back to Programs
List.

## 5. Workout Detail

### Purpose

Show one workout and its ordered exercises with their planned targets.

### Fields

Each exercise row displays:

-   Exercise position --- derived number.
-   Exercise name --- required reference to an exercise-library item.
-   Target sets --- number.
-   Target reps --- number/range.
-   Optional planned rest --- duration.
-   Optional notes.

### Empty state

If a workout contains no exercises:

-   Title: `No exercises yet`
-   Supporting copy: `Add an exercise to start building this workout.`
-   Primary action: `+ Add Exercise`

### Copy

-   Breadcrumb: `Programs → {Program} → {Workout}`
-   Primary action: `+ Add Exercise`
-   Empty title: `No exercises yet`
-   Empty description: `Add an exercise to start building this workout.`

### Navigation

-   Tap exercise → Edit Exercise.
-   `+ Add Exercise` → Exercise Picker.
-   Edit workout → Edit Workout.
-   Delete workout → Delete Workout.
-   Reorder exercises → Reorder Exercises state/screen.
-   After adding an exercise → return to Workout Detail with the new
    exercise in the selected position.
-   After editing an exercise → return to Workout Detail.
-   After deleting an exercise → return to Workout Detail.

### Transition

The workout remains visually present as the parent while its exercises
take focus. Breadcrumb:

`Programs → {Program} → {Workout}`

Opening an exercise extends it to:

`Programs → {Program} → {Workout} → {Exercise}`

### Interaction rules

-   Exercise order is explicit.
-   Reorder uses drag-and-drop with a visible handle.
-   Reorder changes are committed with `Done`.
-   `Cancel` restores the previous order.
-   Exercise rows use colored initial badges rather than requiring
    photos.
-   Planned rest is a template value, not a live countdown/timer.

## 6. Add/Edit Workout

### Purpose

Create or modify workout metadata.

### Fields

#### Workout Name

-   Type: text
-   Required: yes
-   Default when creating: empty
-   Default when editing: current workout name
-   Recommended maximum: 60 characters.
-   Leading/trailing whitespace is trimmed.

#### Description

-   Type: multiline text
-   Required: no
-   Recommended maximum: 200 characters.

#### Workout Type

-   Type: single-select
-   Required: no
-   Default: none/unspecified
-   Available values: `Push`, `Pull`, `Legs`, `Upper`, `Lower`, `Other`

### Empty/error states

Required-name validation:

`Enter a workout name.`

Name length validation:

`Workout name must be 60 characters or less.`

Description length validation:

`Description must be 200 characters or less.`

### Copy

Create mode:

-   Title: `Add Workout`
-   Name label: `Workout name`
-   Name placeholder: `e.g. Push Day`
-   Description label: `Description (optional)`
-   Description placeholder: `What is the focus of this workout?`
-   Type label: `Workout type (optional)`
-   Primary action: `Create Workout`
-   Cancel action: `Cancel`

Edit mode:

-   Title: `Edit Workout`
-   Primary action: `Save Changes`
-   Delete action: `Delete Workout`

### Navigation

-   Successful create → Workout Detail.
-   Successful edit → Workout Detail.
-   Cancel → previous screen.
-   Delete → Delete Workout confirmation.
-   Validation failure → remain on form.

### Interaction rules

Workout type is single-select: only one type may be selected at a time.

## 7. Delete Workout

### Purpose

Confirm deletion of a workout from its program.

### Fields

No editable fields.

### Copy

Confirmation title:

`Delete Workout?`

Warning:

`Are you sure you want to delete "{Workout Name}"? This action cannot be undone.`

Primary destructive action:

`Delete`

Secondary action:

`Cancel`

### Error state

`Couldn't delete the workout. Please try again.`

### Navigation

-   `Cancel` → previous screen.
-   Successful delete → Program Detail.
-   The workout and its exercises are removed from the program.

### Transition

Use a confirmation sheet/dialog over the current workout context. On
success, dismiss and return to Program Detail.

## 8. Exercise Picker

### Purpose

Find an exercise from the exercise library and add it to the current
workout.

### Fields

#### Search

-   Type: text
-   Required: no
-   Default: empty
-   Placeholder: `Search exercises`
-   Matching: exercise name and searchable library metadata.

#### Filters

-   Type: multi-select chips
-   Required: no
-   Default: no filters selected.
-   Available examples/categories: movement pattern, equipment, muscle
    group.
-   Multiple filters may be active simultaneously.
-   Within a filter category, selection may be one or multiple values as
    supported by the library; across categories, filters combine.

Examples shown in the approved design:

`Push`, `Barbell`, `Chest`

### Empty/error states

No matches:

`No exercises found.`

With active filters:

`No exercises match your filters.`

If the library cannot be loaded:

`Couldn't load exercises. Please try again.`

### Copy

-   Title: `Add Exercise`
-   Search placeholder: `Search exercises`
-   Filter clear action: `Clear`
-   Primary/add action on an exercise: `Add`
-   Optional library action: `Browse Library`
-   No-results title: `No exercises found.`

### Navigation

-   Selecting an exercise adds it to the current workout.
-   After adding, return to Workout Detail with the exercise inserted.
-   If the picker supports selecting multiple exercises before
    confirming, the final confirmation is `Add`; otherwise an individual
    `Add` action immediately commits and returns.
-   The approved interaction favors quick single-exercise addition from
    the picker.

### Transition

Exercise Picker is presented from Workout Detail as a focused selection
surface. After selection, the new exercise appears in the Workout Detail
list using the same row pattern.

### Interaction rules

-   Search and filters can be combined.
-   Filter chips are multi-select.
-   Results remain ordered consistently while filters/search change.
-   Do not require images for identification.
-   Exercise rows use colored initial badges plus name and metadata.

## 9. Add/Edit Exercise

### Purpose

Define the planned exercise prescription inside a workout. This is
plan-time configuration only.

### Fields

#### Exercise

-   Type: exercise-library reference/select
-   Required: yes
-   Default when adding from picker: selected exercise
-   Editable form should not allow an arbitrary free-text exercise that
    bypasses the library unless the product later adds custom exercises.

#### Target Sets

-   Type: integer number
-   Required: yes
-   Default: `3`
-   Validation: positive whole number.
-   Recommended range: 1--20.

Validation copy:

`Enter a valid number of sets.`

#### Target Reps

-   Type: number or range
-   Required: yes
-   Default: `8–12`
-   Validation: positive whole numbers; when a range is used, minimum
    must not exceed maximum.

Validation copy:

`Enter a valid rep target.`

#### Rest

-   Type: duration/select
-   Required: no
-   Label: `Rest (planned)`
-   Default: `2–3 min` when using the approved example; implementation
    may use the product's duration model.
-   This is a planned target only. It must not render as a live timer on
    this tab.

#### Notes

-   Type: multiline text
-   Required: no
-   Label: `Notes (optional)`
-   Recommended maximum: 300 characters.

### Empty/error states

If required prescription fields are invalid, keep the user on the form
and show the error inline.

Notes length validation:

`Notes must be 300 characters or less.`

Unexpected save failure:

`Couldn't save the exercise. Please try again.`

### Copy

Create/edit title:

`Edit Exercise` when editing an existing exercise.

Exercise label:

`Exercise`

Target label:

`Target`

Rest label:

`Rest (planned)`

Notes label:

`Notes (optional)`

Notes placeholder:

`Focus on controlled reps`

Primary action:

`Save Changes`

Delete action:

`Delete Exercise`

Cancel action:

`Cancel`

### Navigation

-   From Exercise Picker → Add Exercise/Edit Exercise context with the
    selected exercise.
-   Successful save → Workout Detail.
-   Cancel → previous screen without changes.
-   Delete → confirmation flow, then Workout Detail on success.

### Transition

The selected exercise row should visually carry into the edit surface
where practical, preserving the exercise name/identity. Breadcrumb
context remains available:

`Programs → {Program} → {Workout} → {Exercise}`

### Interaction rules

-   Exercise identity is selected from the library.
-   Target sets and reps describe the plan, not completed performance.
-   Rest is a planned duration, not a timer.
-   Notes are plan notes, not session logs.
-   No set-completion checkboxes, live countdowns, weight logging, or
    workout-session controls appear here.

## Cross-screen transition model

The Programs tab should feel like one spatial workspace rather than a
sequence of unrelated CRUD pages.

### Program → Workout

The selected Program remains as a receding parent context while its
ordered Workouts take focus.

Path:

`Programs → Program → Workouts`

### Workout → Exercise

The selected Workout remains as the receding parent context while its
ordered Exercises take focus.

Path:

`Programs → Program → Workout → Exercises`

### Back navigation

Back always moves exactly one hierarchy level upward and restores the
previous parent's state/scroll position.

### Editing

Edit surfaces can be presented as focused sheets/forms, but the
underlying parent context should remain clear.

### Creation

Create actions return to the newly created entity's detail screen, not
blindly to the list:

-   Create Program → Program Detail
-   Create Workout → Workout Detail
-   Add Exercise → Workout Detail

### Deletion

Deletion always requires explicit confirmation and returns to the
nearest surviving parent:

-   Delete Program → Programs List
-   Delete Workout → Program Detail
-   Delete Exercise → Workout Detail

## Implementation assumptions

A few implementation details were not explicitly specified in the
original product brief, so the following are deliberate defaults rather
than requirements that were visible in Figma:

-   Character limits are implementation safeguards and can be adjusted
    if the product/database constraints differ.
-   `3` sets and `8–12` reps are example defaults from the approved
    design; they should be treated as product defaults only if confirmed
    by the product owner.
-   The exact exercise-library filter taxonomy should follow the
    backend/library metadata.
-   Accessibility labels, keyboard behavior, focus management, and
    platform-specific animation APIs should be implemented according to
    iOS/Android conventions while preserving the interaction intent
    above.
