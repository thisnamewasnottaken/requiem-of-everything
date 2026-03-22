# Component Spec: Timeline

## Purpose

The root timeline component. Renders the full interactive, zoomable, pannable timeline of classical music. Composes all visual layers (eras, composers, compositions, events) and manages the viewport.

## Props / Inputs

| Prop           | Type                     | Description                 |
| -------------- | ------------------------ | --------------------------- |
| `composers`    | `Composer[]`             | All composers to display    |
| `compositions` | `Composition[]`          | All compositions to display |
| `events`       | `HistoricalEvent[]`      | All historical events       |
| `eras`         | `MusicalEraDefinition[]` | Musical era definitions     |

## Visual States

- **Default**: Full timeline visible (~1580–1970), showing era bands and composer bars.
- **Zoomed**: A narrower year range fills the viewport; more detail visible per composer.
- **Filtered**: Only matching composers/compositions shown; others hidden or dimmed.
- **Focus Mode (single composer)**: Timeline is zoomed to a single composer's lifespan. Non-focused composers and historical events are dimmed; non-focused composers collapse to 6px height after 1.5 seconds (same visual treatment as comparison mode). Composition markers for non-focused composers are also dimmed.
- **Comparison Mode**: Two or more composers highlighted; non-compared composers dim immediately, then collapse to 6px height after 3 seconds. Historical events and composition markers for non-compared composers are dimmed. Timeline auto-zooms to the union of compared composers' lifespans. This deliberately strips away surrounding context to focus on comparing the selected composers.
- **Loading**: Skeleton or shimmer state while data loads.

## Design Philosophy: Focus vs Comparison

- **Focus Mode** (single composer via ComposerCard → "Focus Timeline"): The timeline zooms to show a composer's full lifespan while dimming all other composers, their compositions, and historical events. After 1.5 seconds non-focused composer bars collapse to 6px height — the same visual treatment used in comparison mode. Focus mode is toggled via the ComposerCard button and is automatically cleared when comparison mode activates. This supports *contextual exploration* — the dimmed (but still visible) context lets the user see who else was composing and what events were happening.
- **Comparison Mode** (2+ composers via Ctrl+click): Non-compared elements collapse, events dim, and composition markers for non-compared composers dim, narrowing the view to *only* the selected composers. This supports *analytical comparison* — examining how lifespans, works, and eras overlap between a specific set of composers.

Both modes zoom the timeline to frame the relevant composers, but focus mode preserves context while comparison mode removes it.

## Interactions

- **Scroll zoom**: Ctrl+wheel (or trackpad pinch, which the browser reports as Ctrl+wheel) zooms in/out, centered on cursor position. The wheel listener is attached natively with `{ passive: false }` so `preventDefault()` stops the browser's built-in page zoom. Plain (non-Ctrl) wheel events are not intercepted.
- **Click-drag pan**: Left mouse drag pans the timeline horizontally.
- **Click composer bar**: Selects the composer, opens detail panel.
- **Click composition marker**: Selects the composition, opens detail panel.
- **Hover**: Shows tooltip with name and dates.

## Accessibility

- Timeline is presented as an application region with `role="application"`.
- Keyboard: Arrow keys for panning, +/- for zoom.
- Each composer bar and marker has `aria-label` with the name and year.
- Focus ring visible on keyboard navigation.

## Dependencies

- `EraBackdrop` — renders era bands
- `ComposerBar` — renders individual composer lifespans
- `CompositionMarker` — renders composition dots
- `EventMarker` — renders historical events
- `TimeRuler` — renders the axis with year labels
- `useTimelineStore` — viewport state
- D3 `scaleLinear` — year-to-pixel mapping

## Test Scenarios

1. Renders all eras as color bands spanning the correct year range.
2. Renders composer bars at correct horizontal positions.
3. Zooming changes the viewport range and re-positions elements.
4. Panning shifts the viewport and re-positions elements.
5. Clicking a composer bar dispatches selection.
6. Only composers within the viewport (± margin) are rendered (virtualization).
7. Keyboard navigation (arrows, +/-) modifies the viewport.
