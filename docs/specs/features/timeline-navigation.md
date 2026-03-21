# Feature Spec: Timeline Navigation

## Overview

The core interaction model for the timeline: zooming, panning, and navigating to specific points in time. This defines how users move through 400+ years of music history.

## Viewport Model

The timeline displays a continuous year range. The viewport is defined by:

- `viewStartYear`: leftmost visible year
- `viewEndYear`: rightmost visible year

The full range is approximately 1400–1970, but the default view shows 1580–1970 (Renaissance through Modern).

## Zoom Behavior

### Mouse Wheel Zoom

- Scroll up = zoom in (narrower year range, more detail)
- Scroll down = zoom out (wider year range, less detail)
- Zoom is centered on the cursor's year position
- Minimum range: 10 years
- Maximum range: full timeline (570 years)
- Zoom factor per scroll tick: 1.15x

### Zoom Algorithm

```
cursorYear = xScale.invert(mouseX)
newRange = currentRange / zoomFactor  (zoom in) or * zoomFactor (zoom out)
newStart = cursorYear - (cursorYear - viewStartYear) * (newRange / currentRange)
newEnd = newStart + newRange
clamp(newStart, newEnd) to [1400, 1970]
```

### Keyboard Zoom

- `+` or `=`: Zoom in (centered on viewport center)
- `-`: Zoom out (centered on viewport center)
- `0`: Reset to default view

## Pan Behavior

### Mouse Drag Pan

- Left mouse button + drag horizontally pans the timeline
- Cursor changes to grab/grabbing
- Pan is 1:1 with pixel movement

### Keyboard Pan

- `←` / `→`: Pan left/right by 5% of current range
- `Shift + ←` / `Shift + →`: Pan by 20% of current range
- `Home`: Jump to start of timeline
- `End`: Jump to end of timeline

### Pan Algorithm

```
deltaYears = deltaPixels / pixelsPerYear
newStart = viewStartYear + deltaYears
newEnd = viewEndYear + deltaYears
clamp to [1400, 1970]
```

## Programmatic Navigation

Functions to navigate to specific points of interest:

```typescript
interface TimelineNavigation {
  /** Zoom to fit a specific year range, with optional padding and right-panel inset compensation */
  zoomToRange(
    startYear: number,
    endYear: number,
    padding?: number,
    rightInsetFraction?: number,
  ): void;

  /** Center on a specific year */
  centerOnYear(year: number): void;

  /** Zoom to fit a composer's lifespan */
  zoomToComposer(composerId: string): void;

  /** Zoom to an era */
  zoomToEra(eraId: MusicalEra): void;

  /** Reset to default view */
  resetView(): void;
}
```

## Detail Levels

Different zoom levels reveal different amounts of information:

| Year Range    | Level    | Shows                                        |
| ------------- | -------- | -------------------------------------------- |
| > 200 years   | Overview | Era bands, composer name labels only         |
| 100–200 years | Period   | + composer bars, major composition markers   |
| 50–100 years  | Decade   | + all composition markers, event markers     |
| 20–50 years   | Detail   | + composition titles, event labels           |
| < 20 years    | Close-up | + full text, detailed markers, relationships |

## Performance

- Zoom/pan updates are throttled to 60fps using `requestAnimationFrame`.
- Position recalculations use `useMemo` keyed on viewport bounds.
- Only elements within `[viewStartYear - margin, viewEndYear + margin]` are rendered.

## Test Scenarios

1. Default view shows 1580–1970.
2. Scroll up zooms in, centered on cursor year.
3. Scroll down zooms out, centered on cursor year.
4. Cannot zoom below 10-year range.
5. Cannot zoom beyond full timeline.
6. Click-drag pans the viewport.
7. Cannot pan beyond timeline bounds.
8. Keyboard +/- zooms centered on viewport center.
9. Arrow keys pan by 5% of range.
10. `zoomToComposer` adjusts viewport to show the composer's full lifespan ± 10 years.
11. `zoomToEra` adjusts viewport to show the era's full range.
12. `resetView` returns to default viewport.
