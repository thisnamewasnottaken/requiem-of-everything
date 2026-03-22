# Component Spec: EraBackdrop

## Purpose

Renders the musical era bands as semi-transparent colored rectangles behind the timeline content. Each era spans its approximate year range and uses a distinct color, providing visual context for the time period.

## Props / Inputs

| Prop        | Type                     | Description                                 |
| ----------- | ------------------------ | ------------------------------------------- |
| `eras`      | `MusicalEraDefinition[]` | Era definitions with colors and year ranges |
| `startYear` | `number`                 | Visible viewport start year                 |
| `endYear`   | `number`                 | Visible viewport end year                   |
| `width`     | `number`                 | Width of the timeline viewport in pixels    |

The component does **not** receive a D3 scale or height as props. It creates its own scale internally via `createTimeScale(startYear, endYear, width)` using `useMemo`, and stretches to full height via CSS (`position: absolute; top: 0; bottom: 0`).

## Visual States

- **Default**: All eras visible as translucent colour bands. Era labels are rendered by the TimeRuler component (not by EraBackdrop).
- **Filtered**: Non-matching eras are further dimmed.
- **Hover**: Hovering an era band slightly increases fill opacity.

## Rendering

- Each era is rendered as an HTML `<div>` (not SVG) with absolute CSS positioning:
  - `left` = `scale(Math.max(era.startYear, startYear))`, clamped to 0
  - `width` = `right - left`, where `right = Math.min(width, scale(Math.min(era.endYear, endYear)))`
  - Height fills the parent via `position: absolute; top: 0; bottom: 0`
  - Contains a `.eraFill` child `<div>` with `backgroundColor: era.color` at ~6% opacity, and a `.eraBorder` child `<div>` (1px right border at ~15% opacity)
- Eras outside the visible viewport range are filtered out. Eras narrower than 2px are not rendered.
- Era labels are **not** rendered by EraBackdrop — they are rendered by the TimeRuler component.
- Eras may overlap (e.g., Late Romantic and Modern). Overlapping regions show blended colors.
- Hovering an era band increases the fill opacity from ~6% to ~10% (CSS `:hover` transition).

## Accessibility

- Era bands have `pointer-events: none` — they are a purely visual backdrop layer. Accessible era labels are provided by the TimeRuler component.

## Dependencies

- `createTimeScale()` from `src/utils/scales.ts` — creates the D3 linear scale internally

## Test Scenarios

1. Renders one `<div>` per visible era.
2. Div positions match the internal scale output for start/end years.
3. Eras outside the viewport range are filtered out.
4. Eras narrower than 2px are not rendered.
5. Opacity is applied correctly via CSS classes.
6. Era labels are NOT rendered (delegated to TimeRuler).
