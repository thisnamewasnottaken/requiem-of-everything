# Component Spec: ComparisonView

## Purpose

A focused view that puts two or more composers side by side on a shared timeline, making it easy to compare their lives, works, and historical context at a glance.

## Props / Inputs

| Prop          | Type       | Description                       |
| ------------- | ---------- | --------------------------------- |
| `composerIds` | `string[]` | IDs of composers to compare (2–5) |

## Visual States

- **Default**: Shared timeline zoomed to the union of all selected composers' lifespans, with each composer on a separate row.
- **Single Composer**: If only one selected, shows a message to add more.
- **Empty**: No composers selected; shows guidance text.

## Layout

```
┌─────────────────────────────────────────────┐
│  Composer A  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   │
│              ● ●   ●  ●●  ●   ●  ●        │
│─────────────────────────────────────────────│
│  Composer B     ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓     │
│                 ●  ●  ● ●   ●●  ●         │
│─────────────────────────────────────────────│
│  Events     |   |      |    |       |      │
│  ──────────┬─────┬──────┬────┬───────┬──── │
│           1700  1720   1740  1760   1780    │
└─────────────────────────────────────────────┘
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
- Click "Add composer" to add more to the comparison.
- Click "×" on a composer row to remove them.
- Shared events between the composers' lifespans are highlighted.
- After ~3 seconds of no comparison changes, non-compared composers collapse to 6px height; hover to expand.
- On collapse, the timeline auto-zooms to the union of compared composers' lifespans (±15 years padding), similar to single-composer "Focus Timeline" behavior.
- The pre-comparison viewport is saved and restored when comparison mode is exited (clearing all compared composers).
- Tooltips on bars and composition markers near the top of the viewport flip below to avoid occlusion.

## Accessibility

- Comparison view has `role="region"` with `aria-label="Composer comparison"`.
- Each row is labeled with the composer's name.
- Keyboard: Tab between rows, Enter to select a composer.

## Dependencies

- `useComparisonStore` — compared composer IDs
- `useComposers()`, `useCompositions()`, `useEvents()` — data
- D3 `scaleLinear` — shared x-axis

## Test Scenarios

1. Renders one row per selected composer.
2. Timeline is zoomed to the union of all lifespans ± 10 years.
3. Compositions are shown as markers on each row.
4. Events spanning the shared range are shown.
5. Adding a composer adds a row and adjusts the timeline range.
6. Removing a composer removes the row.
7. Empty/single state shows guidance.
