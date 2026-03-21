# Component Spec: TimeRuler

## Purpose

The horizontal axis at the top of the timeline that displays year tick marks and labels. Tick density and label detail adapt automatically to the current zoom level (viewport range) so the ruler is always readable — never overcrowded or sparse.

## Props / Inputs

| Prop        | Type     | Description           |
| ----------- | -------- | --------------------- |
| `startYear` | `number` | Viewport left bound   |
| `endYear`   | `number` | Viewport right bound  |
| `width`     | `number` | Container pixel width |

## Visual States

- **Default**: Horizontal rule line + evenly spaced tick marks with year labels.
- **Major Ticks**: Larger tick line + bolder label at every 2× interval (or when interval ≥ 50 years).
- **Minor Ticks**: Shorter tick line + smaller label at the base interval.

## Tick Interval Logic

Controlled by `getTickInterval(range)` in `src/utils/scales.ts`. Intervals grow as the viewport widens:

| Range       | Interval  |
| ----------- | --------- |
| ≤ 30 years  | 5 years   |
| ≤ 80 years  | 10 years  |
| ≤ 200 years | 25 years  |
| ≤ 500 years | 50 years  |
| > 500 years | 100 years |

Major ticks fire at every `2× interval` or when `interval ≥ 50`.

## Layout

- Full-width `div` positioned at the top of the timeline (below the controls bar, above the era backdrops at `top: 0`).
- Each tick is absolutely positioned at `left: scale(year)`.
- `rulerLine` is a bottom border spanning full width.

## Accessibility

- Year labels are plain text, readable by screen readers.
- The ruler is decorative; it has no interactive role.

## Dependencies

- `createTimeScale` from `@/utils/scales`
- `getTimeTicks` from `@/utils/scales` — array of tick years for the current range
- `getTickInterval` from `@/utils/scales` — interval in years
- `formatYear` from `@/utils/scales` — BCE/CE formatting

## Test Scenarios

1. Renders tick labels at expected year positions for a given range.
2. Major ticks have a visually distinct class.
3. Tick count is appropriate for the viewport range (not overcrowded).
4. BCE years format correctly (e.g., "400 BCE").
