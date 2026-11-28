# Component Spec: Timeline

## Purpose

The React app's interactive, zoomable, pannable timeline. It composes the era, composer, composition and event layers. The V2 timeline, Variations Through Time, is a [separate implementation](../features/rebuild-v2.md).

## Props / Inputs

No props. Timeline reads localized entities through `src/hooks/useData.ts` and viewport, selection, filtering and comparison state through Zustand stores.

## Visual States

- **Default**: Full timeline visible (~1580–1970), showing era bands and composer bars. Vertical backdrop bands represent musical eras only; historical events are shown as markers/lines.
- **Zoomed**: A narrower year range fills the viewport; more detail visible per composer.
- **Filtered**: Only matching composers/compositions shown; others hidden or dimmed.
- **Focus Mode (single composer)**: Timeline is zoomed to a single composer's lifespan. Non-focused composers and historical events are dimmed; non-focused composers collapse to 6px height after 1.5 seconds (same visual treatment as comparison mode). Composition markers for non-focused composers are also dimmed.
- **Comparison Mode**: Two or more composers highlighted; non-compared composers dim immediately, then collapse to 6px height after 3 seconds. Historical events and composition markers for non-compared composers are dimmed. Timeline auto-zooms to the union of compared composers' lifespans. This deliberately strips away surrounding context to focus on comparing the selected composers.

## Design Philosophy: Focus vs Comparison

- **Focus Mode** (single composer via ComposerCard → "Focus Timeline"): The timeline zooms to show a composer's full lifespan while dimming all other composers, their compositions, and historical events. After 1.5 seconds non-focused composer bars collapse to 6px height — the same visual treatment used in comparison mode. Focus mode is toggled via the ComposerCard button and is automatically cleared when comparison mode activates. This supports *contextual exploration* — the dimmed (but still visible) context lets the user see who else was composing and what events were happening.
- **Comparison Mode** (2+ composers via Ctrl+click): Non-compared elements collapse, events dim, and composition markers for non-compared composers dim, narrowing the view to *only* the selected composers. This supports *analytical comparison* — examining how lifespans, works, and eras overlap between a specific set of composers.

Both modes zoom the timeline to frame the relevant composers, but focus mode preserves context while comparison mode removes it.

## Data Preparation

- Composer genre membership and ID lookup indexes are derived once per data change and reused while filters or the viewport change.
- Composer rows are assigned only to composers overlapping the visible year range. The greedy first-available-row layout preserves its existing ordering and two-year separation while using a min-heap so row assignment scales as O(n log n).
- Selection and comparison membership checks use sets during rendering; visible composition markers resolve their composers through the ID index rather than repeatedly scanning the composer list.

## Visual Direction

- The timeline feels like an illuminated score suspended in a nocturnal concert hall: deep ink and blue-green shadows, engraved time marks, warm metallic era colors, and luminous musical traces behind the data.
- Composer lifespans, compositions, and historical events read as strokes in one evolving visual score; hover and selection bring individual stories forward without hiding context.
- Fine light and score-line animations move slowly enough to create a living atmosphere without distracting from reading or pointer interactions. Decorative layers never intercept input.
- Motion is CSS-only, respects reduced-motion preferences, and does not change timeline navigation, data, or row layout.
- A compact era field note follows the centre of the visible time range, using the existing translated era description and characteristics to connect the timeline's visual periods to musical history.

## Interactions

- **Scroll zoom**: Ctrl/Cmd+wheel (or trackpad pinch reported as Ctrl+wheel) zooms in/out at the pointer's year. The native wheel listener uses `{ passive: false }` so it can prevent browser zoom. Unmodified wheel events are not intercepted.
- **Click-drag pan**: Left mouse drag pans the timeline horizontally.
- **Touch**: One finger pans; two fingers pinch to zoom.
- **Click composer bar**: Selects the composer, opens detail panel.
- **Click composition marker**: Selects the composition, opens detail panel.
- **Hover**: Shows tooltip with name and dates.

## Accessibility

- Keyboard: Use the focusable zoom/reset buttons; `R` resets the view outside text and select fields.
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
6. Only composers overlapping the viewport are assigned a row and rendered.
7. Historical events render as markers/lines and do not render full-height backdrop bands.
8. Activating the zoom buttons modifies the viewport; reset restores the default.
