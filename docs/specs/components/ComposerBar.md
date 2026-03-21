# Component Spec: ComposerBar

## Purpose

A single horizontal bar representing a composer's lifespan on the timeline. Positioned by birth and death year using the D3 scale. Visually encodes era, selection state, comparison state, and dimming/collapse for focus and comparison modes.

## Props / Inputs

| Prop           | Type                                                    | Description                                            |
| -------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| `composer`     | `Composer`                                              | The composer to render                                 |
| `startYear`    | `number`                                                | Viewport left bound                                    |
| `endYear`      | `number`                                                | Viewport right bound                                   |
| `width`        | `number`                                                | Container pixel width                                  |
| `row`          | `number`                                                | Vertical row index (from greedy packing in Timeline)   |
| `eraColor`     | `string`                                                | Hex color for this composer's era                      |
| `isSelected`   | `boolean`                                               | Whether this composer's detail panel is open           |
| `isComparison` | `boolean`                                               | Whether this composer is in the comparison set         |
| `isDimmed`     | `boolean`                                               | Whether this bar should be visually de-emphasised      |
| `isCollapsed`  | `boolean`                                               | Whether this bar should collapse to thin height        |
| `onClick`      | `(composerId: string, event: React.MouseEvent) => void` | Click handler (regular click = select, Ctrl = compare) |

## Visual States

- **Default**: Full-height bar (28px) with era color fill. Short name label when bar width > 70px; birth–death years when > 140px.
- **Selected**: Highlighted border/glow indicating detail panel is open.
- **Comparison**: Distinct highlight indicating this composer is in the comparison set.
- **Dimmed**: Reduced opacity (0.2) — applied to non-selected composers in focus mode, or non-compared composers in comparison mode.
- **Collapsed**: Bar shrinks to 6px height. Labels hidden via opacity (not removed from DOM — allows hover to restore them).
- **Collapsed + Hover**: Bar re-expands and labels become visible again.
- **Tooltip Below**: When bar is positioned in the top 90px of the timeline, the tooltip flips below the bar to avoid viewport clipping.

## Tooltip

Appears on hover. Contains:

- Portrait image (48px circular, `portraitUrl`, lazy loaded)
- Full composer name
- Birth–death years
- Birth place
- Era badge (era color tinted background)

## Layout

- `top = TOP_OFFSET (56px) + row * ROW_HEIGHT (34px)`
- `left = scale(max(birthYear, viewStart))`
- `width = scale(min(deathYear, viewEnd)) - left`
- Returns `null` if computed width < 2px (off-screen)

## Interactions

- **Click**: Calls `onClick(composerId, event)` — parent (Timeline) determines whether this is a regular select or comparison toggle based on `event.ctrlKey`.
- **Keyboard Enter/Space**: Equivalent to click.
- **Hover**: Reveals tooltip with portrait and details.
- **Hover on collapsed bar**: Temporarily expands bar and shows labels.

## Accessibility

- `role="button"` with `aria-label` = `"{name}, {birthYear}–{deathYear}"`.
- Keyboard-navigable (`tabIndex={0}`).
- Portrait image has descriptive `alt` text.

## Dependencies

- `createTimeScale` from `@/utils/scales` — year-to-pixel mapping
- `formatYear` from `@/utils/scales` — BCE/CE formatting

## Test Scenarios

1. Bar left edge aligns with `scale(birthYear)`.
2. Bar right edge aligns with `scale(deathYear)`.
3. Name label hidden when bar width ≤ 70px.
4. Name label visible when bar width > 70px.
5. Year label visible when bar width > 140px.
6. `isDimmed` applies reduced opacity style.
7. `isCollapsed` shrinks bar height; hovering expands and shows labels.
8. Tooltip appears on hover, disappears on mouse-out.
9. Returns null when bar is entirely outside the viewport.
10. Tooltip flips below when `top < 90`.
