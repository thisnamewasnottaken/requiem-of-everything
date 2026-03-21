# Component Spec: CompositionMarker

## Purpose

A small dot marker positioned on the timeline at the year a composition was written. Sits visually above the composer's lifespan bar, providing a quick map of that composer's output. Hoverable for composition details.

## Props / Inputs

| Prop           | Type                              | Description                                    |
| -------------- | --------------------------------- | ---------------------------------------------- |
| `composition`  | `Composition`                     | The composition to render                      |
| `composerName` | `string`                          | Short display name of the composer             |
| `startYear`    | `number`                          | Viewport left bound                            |
| `endYear`      | `number`                          | Viewport right bound                           |
| `width`        | `number`                          | Container pixel width                          |
| `yPosition`    | `number`                          | Vertical pixel position (from Timeline layout) |
| `eraColor`     | `string`                          | Hex color for the composer's era               |
| `isSelected`   | `boolean`                         | Whether this composition's detail is open      |
| `isDimmed`     | `boolean`                         | Whether the dot should be de-emphasised        |
| `onClick`      | `(compositionId: string) => void` | Click handler                                  |

## Visual States

- **Default**: 6px circular dot in era color with a short stem below.
- **Hovered**: Dot expands to 10px; tooltip appears.
- **Selected**: 10px dot with gold border and stronger glow.
- **Dimmed**: 0.15 opacity (non-compared composer in comparison mode, or non-selected in focus mode). Recovers to 0.7 on hover.
- **Tooltip Below**: When `yPosition < 80`, tooltip flips below the dot to avoid viewport clipping.

## Tooltip

Appears on hover. Contains:

- Composition title (display font, bold)
- Composer short name (accent color)
- Year (monospace)
- Genre badge (uppercase, muted background)

## Visibility Gating

Only rendered by Timeline when the detail level is not `"century"` (i.e., viewport range ≤ ~200 years). This prevents dots from cluttering a fully zoomed-out view.

## Layout

- `x = scale(composition.yearComposed)`
- Returns `null` if `x < -10` or `x > width + 10` (off-screen)
- `top = yPosition` (typically `TOP_OFFSET + row * ROW_HEIGHT - 16`, positioning dot above the bar)

## Accessibility

- `role="button"` with `aria-label` = `"{title} by {composerName}, {yearComposed}"`.
- Keyboard-navigable (`tabIndex={0}`); Enter/Space triggers `onClick`.

## Dependencies

- `createTimeScale` from `@/utils/scales`
- `formatYear` from `@/utils/scales`

## Dimming Logic (in Timeline)

In **comparison mode**: dim if composer is not in `comparisonComposerIds`.
In **focus mode** (single composer selected): dim if composer is not in `selectedComposerIds`.

## Test Scenarios

1. Dot appears at correct horizontal position for `yearComposed`.
2. Returns null when outside viewport bounds.
3. Tooltip shows on hover with title, composer, year, and genre.
4. `isSelected` applies gold border and glow.
5. `isDimmed` reduces opacity to 0.15; hover restores to 0.7.
6. Tooltip flips below when `yPosition < 80`.
7. Keyboard Enter/Space triggers `onClick`.
