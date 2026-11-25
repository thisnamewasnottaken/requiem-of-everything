# Component Spec: ComparisonView

> **Implementation note:** There is no separate `ComparisonView` component. Comparison functionality is implemented as a **mode within the `Timeline` component** (`src/components/Timeline/Timeline.tsx`). This avoids duplicating the Timeline's rendering logic (scales, layout, panning, zoom, event/composition layers). The `Timeline` reads `comparisonComposerIds` and `isComparisonMode` from `useComparisonStore` and adjusts its rendering accordingly — dimming/collapsing non-compared composers, auto-zooming to the compared set, and saving/restoring the pre-comparison viewport. The behavioural spec below describes the intended (and actual) behaviour of this mode.

## Purpose

A focused view that puts two or more composers side by side on a shared timeline, making it easy to compare their lives, works, and historical context at a glance.

## Inputs

Comparison mode is driven entirely by store state — there are no dedicated component props:

- `comparisonComposerIds` (`string[]`) from `useComparisonStore` — IDs of composers being compared (2–5)
- `isComparisonMode` (`boolean`) from `useComparisonStore` — derived flag, `true` when 2+ composers are selected

## Visual States

- **Active**: The existing timeline zooms to the combined lifespans after the collapse delay. Composers keep the timeline's usual row layout.
- **Single Composer**: The header displays one chip and a hint to add another; the timeline is not yet in comparison mode.
- **Empty**: No comparison toolbar or comparison mode.

## Layout

```text
Header         [Composer A ×] [Composer B ×] Clear
Time ruler     ──1700──1720──1740──1760──1780──
Dimmed events         ◇            ◇      ◇
Composer A      ━━━━━━━━━━━━━━━━━━━━━
Composer C           ───────────────  (collapsed)
Composer B              ━━━━━━━━━━━━━━━━━━━━━
```

## Design Philosophy

Comparison mode is deliberately different from single-composer focus:

- **Focus mode** (single composer): zooms to a composer's lifespan but _preserves context_ — other composers and events remain visible for exploration.
- **Comparison mode** (2+ composers): zooms to the combined range and _removes context_ — non-compared composers collapse, events dim, and the view narrows to support analytical comparison of the selected set.

This distinction is intentional and should be preserved in future development.

## Interactions

- Ctrl+click (Cmd+click on Mac) composer bars on the main timeline to add/remove from comparison.
- If a composer detail panel is open, Ctrl+clicking another bar transfers both into comparison.
- Click a composer's name to open their detail panel.
- Hover a composition marker to see its title and year.
- Remove composers with their header chips, or clear the full comparison with the header action.
- Historical event markers are dimmed rather than highlighted.
- After ~3 seconds of no comparison changes, non-compared composers collapse to 6px height; hover to expand.
- On collapse, the timeline auto-zooms to the union of compared composers' lifespans (±15 years padding), similar to single-composer "Focus Timeline" behavior.
- After the comparison zoom, leaving comparison mode (fewer than two composers) restores the previous viewport.
- Tooltips on bars and composition markers near the top of the viewport flip below to avoid occlusion.

## Accessibility

- The existing timeline bars remain focusable; Enter or Space selects a focused composer.
- Comparison chips and the clear action are buttons in the header.

## Dependencies

- `useComparisonStore` — `comparisonComposerIds`, `isComparisonMode`, `toggleComposerInComparison`, `addMultipleToComparison`
- `useTimelineStore` — `zoomToRange`, `setViewRange` (for auto-zoom and viewport save/restore)
- `useSelectionStore` — clears `focusedComposerId` when entering comparison mode
- Data hooks (`useComposers`, `useCompositions`, `useEvents`) — for rendering

## Test Scenarios

1. With two or more compared composers, other visible bars dim and then collapse.
2. After the collapse delay, the timeline frames the compared lifespans with 15 years of padding, bounded by the timeline.
3. Leaving comparison mode after auto-zoom restores the previous viewport.
4. One compared composer shows a chip and hint. The toolbar is hidden when the set is empty.
