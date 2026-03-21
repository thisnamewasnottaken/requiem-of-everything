# Component Spec: EventMarker

## Purpose

A vertical marker representing a historical event on the timeline. Rendered at the event's year with a full-height dashed line and a diamond icon at the bottom. Range events (e.g. wars) also show a translucent band spanning the duration. Hoverable for event preview; clickable to pin the card open for interaction.

## Props / Inputs

| Prop             | Type                                   | Description                                        |
| ---------------- | -------------------------------------- | -------------------------------------------------- |
| `event`          | `HistoricalEvent`                      | The event to render                                |
| `startYear`      | `number`                               | Viewport left bound                                |
| `endYear`        | `number`                               | Viewport right bound                               |
| `width`          | `number`                               | Container pixel width                              |
| `timelineHeight` | `number`                               | Full pixel height of the timeline container        |
| `isDimmed`       | `boolean` (optional)                   | Whether to reduce visual salience                  |
| `onClick`        | `(eventId: string) => void` (optional) | Click handler (toggles pinned card)                |
| `isSelected`     | `boolean` (optional)                   | Whether this event's card is pinned open           |

## Visual States

- **Default**: Full-height dashed vertical line in category color + diamond at bottom + tooltip on hover (preview only, `pointer-events: none`).
- **Selected (pinned)**: Diamond is enlarged, event line is more opaque, tooltip stays visible with `pointer-events: auto` so links are clickable. z-index elevated above other markers.
- **Range event**: Translucent band (`backgroundColor: color + "1A"`) behind the line, spanning `year` to `endYear`.
- **Dimmed**: Marker at 0.15 opacity, event line at 0.08 opacity. Recovers to 0.7 opacity on hover. Applied during focus mode (single composer selected) and comparison mode.
- **Returns null**: When event x-position is outside `[-10, width + 10]`.

## Interaction

- **Hover**: Shows tooltip as a non-interactive preview (pointer-events: none, opacity transition).
- **Click diamond**: Toggles the card between pinned (selected) and unpinned. When pinned, pointer-events are enabled on the tooltip so users can click links inside it.
- **Escape key**: Closes any pinned event card (handled at App level via `selectEvent(null)`).
- **Keyboard**: Enter/Space on focused marker triggers onClick for accessibility.

## Category Colors

| Category         | Color   |
| ---------------- | ------- |
| war              | #C0392B |
| revolution       | #E74C3C |
| political        | #8E44AD |
| scientific       | #2980B9 |
| cultural         | #27AE60 |
| literary         | #F39C12 |
| artistic         | #E67E22 |
| technological    | #3498DB |
| religious        | #9B59B6 |
| natural-disaster | #7F8C8D |

## Tooltip

Appears on hover (preview) or when pinned (interactive). Contains:

- Event title
- Year (or year range if `endYear` present)
- Description
- Musical significance (prefixed with ♪, if present)
- Category badge (category color tinted)
- Wikipedia link (when `wikipediaSlug` present) — only clickable when card is pinned

### Viewport-aware positioning

The tooltip repositions to avoid clipping by the timeline container's `overflow: hidden`:

- **Near left edge** (x < 160): tooltip aligns left (`left: 0; transform: none`)
- **Near right edge** (x > width − 160): tooltip aligns right (`right: 0; left: auto; transform: none`)
- **Default**: centred via `left: 50%; transform: translateX(-50%)`

## Layout

- `x = scale(event.year)` — horizontal position
- Line height: `timelineHeight - 60px`
- Diamond and tooltip anchored at the bottom (`bottom: 8px`)
- Range band: `left: x`, `width: scale(endYear) - x`

## Selection Store Integration

- `selectedEventId` in `useSelectionStore` tracks the pinned event.
- Selecting an event clears `selectedCompositionId` (mutual exclusion).
- Selecting a composition or composer clears `selectedEventId`.

## Accessibility

- `role="button"` with `aria-label` = `"Historical event: {title}, {year}"`.
- Keyboard-navigable (`tabIndex={0}`).
- `onKeyDown` handles Enter and Space to trigger onClick.
- Category communicated via text in tooltip, not color alone.

## Dependencies

- `createTimeScale` from `@/utils/scales`
- `formatYear` from `@/utils/scales`

## Test Scenarios

1. Marker appears at correct horizontal position.
2. Range events render a translucent band of correct width.
3. Tooltip appears on hover with title, year, and description.
4. `isDimmed` reduces opacity; hover temporarily restores it.
5. Musical significance line shown only when present.
6. Returns null when off-screen.
7. Click toggles `isSelected` state; selected marker shows tooltip with `pointer-events: auto`.
8. Wikipedia link renders when `wikipediaSlug` present, with `rel="noopener noreferrer"` and `target="_blank"`.
9. Escape key closes pinned card (App-level handler).
10. Tooltip repositions near viewport edges to avoid clipping.
