# UX Design System

Concise reference for the Progressive Overload mobile app. This is the
baseline established in the Programs tab and should be reused across
Home, Progress, More, and future surfaces.

## Colors

### Brand & semantic colors

  -----------------------------------------------------------------------
  Token                   Hex                     Usage
  ----------------------- ----------------------- -----------------------
  Primary                 `#3157D5`               Primary actions,
                                                  navigation, selected
                                                  controls, links

  Primary Dark            `#2546B5`               Pressed/active primary
                                                  states and stronger
                                                  emphasis

  Accent                  `#B7E36A`               Brand personality,
                                                  active emphasis,
                                                  highlights; not a
                                                  semantic success color

  Success                 `#168A5B`               Confirmed, completed,
                                                  or positive states

  Danger                  `#D64545`               Destructive actions and
                                                  destructive feedback
                                                  only
  -----------------------------------------------------------------------

### Neutral scale

  Token         Hex         Usage
  ------------- ----------- -----------------------------
  Neutral 900   `#17191C`   Primary text
  Neutral 700   `#475467`   Strong secondary text
  Neutral 500   `#667085`   Secondary/body-muted text
  Neutral 300   `#D0D5DD`   Borders and dividers
  Neutral 200   `#E4E7EC`   Subtle borders and controls
  Neutral 100   `#F1F3F5`   Secondary surfaces
  Neutral 50    `#F8FAFC`   Soft backgrounds

The app is light-mode only. Prefer neutral surfaces and typography for
hierarchy; use brand colors deliberately rather than filling large areas
with color.

## Typography

Use **Inter** throughout the product.

  ------------------------------------------------------------------------
  Style               Size / Line height Weight           Usage
  ---------------- --------------------- ---------------- ----------------
  Display                        32 / 36 Bold (700)       Major page or
                                                          feature headings

  Title                          20 / 28 SemiBold (600)   Screen titles
                                                          and prominent
                                                          section headings

  Subtitle                       16 / 24 SemiBold (600)   Supporting
                                                          headings and
                                                          important labels

  Body                           16 / 24 Regular (400)    Primary
                                                          interface
                                                          content

  Caption                        12 / 16 Regular (400)    Metadata, helper
                                                          text, secondary
                                                          information
  ------------------------------------------------------------------------

Keep typography-led hierarchy strong. Avoid relying on color alone to
distinguish information.

## Spacing

Use a **4pt base grid**.

Core values:

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64`

Use 4pt increments for padding, gaps, component spacing, and layout
alignment. Prefer the smallest spacing that preserves clear grouping and
one-handed readability.

## Core Components

### Buttons

**Primary** - Filled with Primary. - White label. - Used for the main
action on a screen, e.g. Create Program, Add Workout, Save Changes. -
One clear primary action per context where possible.

**Secondary** - Neutral/white surface with a visible border. - Used for
supporting or alternative actions. - Should never visually compete with
the primary action.

**Tertiary** - Text-only action using Primary. - Used for low-emphasis
actions such as navigation or secondary options.

**Icon button** - Compact control containing an icon without a text
label. - Use only when the icon's meaning is unambiguous. - Provide an
accessible label in implementation.

### Card

A rounded surface used to group a meaningful object or hierarchy level,
such as a Program or Workout.

-   White surface on the light background.
-   Subtle neutral border.
-   Rounded corners.
-   Clear title + supporting metadata.
-   Optional status chip and trailing action/navigation affordance.

Cards should provide grouping and hierarchy, not become containers
around every individual piece of content.

### Chip / Tag

A compact label used for metadata, filters, or categorical information.

Examples: - Push - Barbell - Chest

Use low-emphasis backgrounds for most metadata. Selected/filter states
may use Primary styling. Do not use the Accent color as a substitute for
semantic Success.

### List Row

The default pattern for ordered collections such as exercises.

-   Clear title.
-   Supporting metadata beneath the title where useful.
-   Optional leading identity badge/icon.
-   Optional trailing navigation or reorder affordance.
-   Consistent vertical rhythm for scanning.

For exercises without images, use a colored initial/identity badge so
adjacent rows remain visually distinguishable at a glance.

### Breadcrumb

A lightweight, tappable path showing the user's current position in the
hierarchy.

Example:

`Programs → Upper / Lower Split → Push Day`

The breadcrumb should preserve context while navigating deeper into
Program → Workout → Exercise. Keep it visually subordinate to the
current screen title while ensuring every relevant ancestor remains
identifiable and tappable.

## Interaction Principles

-   Keep primary editing actions visible and easy to reach one-handed.
-   Preserve hierarchy and context when moving between Program, Workout,
    and Exercise levels.
-   Reordering should use a clear drag/reorder affordance rather than
    hiding the action in an overflow menu.
-   Destructive actions use Danger consistently.
-   Program management is distinct from live workout/session logging.
    Planned sets, reps, rest, and notes belong here; timers and
    set-completion states do not.
