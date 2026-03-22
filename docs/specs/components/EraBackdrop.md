# Component Spec: EraBackdrop

## Purpose

Renders the musical era bands as semi-transparent colored rectangles behind the timeline content. Each era spans its approximate year range and uses a distinct color, providing visual context for the time period.

## Props / Inputs

| Prop     | Type                     | Description                                 |
| -------- | ------------------------ | ------------------------------------------- |
| `eras`   | `MusicalEraDefinition[]` | Era definitions with colors and year ranges |
| `xScale` | `d3.ScaleLinear`         | D3 scale mapping years to pixels            |
| `height` | `number`                 | Full height of the timeline viewport        |

## Visual States

- **Default**: All eras visible as translucent colour bands. Era labels are rendered by the TimeRuler component (not by EraBackdrop).
- **Filtered**: Non-matching eras are further dimmed.
- **Hover**: Hovering an era band slightly increases fill opacity.

## Rendering

- Each era is an SVG `<rect>` with:
  - `x` = `xScale(era.startYear)`
  - `width` = `xScale(era.endYear) - xScale(era.startYear)`
  - `height` = full viewport height
  - `fill` = era color at ~15% opacity
- Era labels are positioned at the top of each band.
- Eras may overlap (e.g., Late Romantic and Modern). Overlapping regions show blended colors.

## Accessibility

- Each era band has `aria-label="[Era name], approximately [start]–[end]"`.
- Era labels are readable text, not purely decorative.

## Dependencies

- D3 `scaleLinear` (passed as prop)

## Test Scenarios

1. Renders one rect per era.
2. Rect positions match the D3 scale output for start/end years.
3. Eras are rendered in chronological order.
4. Opacity is applied correctly.
5. Labels are visible and positioned within the band.
