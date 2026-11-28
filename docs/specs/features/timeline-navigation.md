# Feature Spec: Timeline Navigation

## Overview

The React timeline's viewport controls. V2's Variations Through Time has [its own navigation](rebuild-v2.md#navigation).

## Viewport Model

The timeline displays a continuous year range. The viewport is defined by:

- `viewStartYear`: leftmost visible year
- `viewEndYear`: rightmost visible year

The full range is approximately 1400–1970, but the default view shows 1580–1970 (Renaissance through Modern).

## Zoom Behavior

### Wheel and Trackpad Zoom

- Ctrl/Cmd + wheel up zooms in; Ctrl/Cmd + wheel down zooms out.
- Trackpad pinch is handled through the modified wheel event. Plain wheel events do not zoom.
- Zoom is centered on the cursor's year position
- Target minimum range: 10 years, subject to timeline bounds
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

### Zoom and Reset Controls

- The `+` and `−` buttons zoom about the viewport center. The reset button or `R` restores the default view.
- On a touchscreen, use two fingers to pinch-zoom.

## Pan Behavior

### Mouse Drag Pan

- Left mouse button + drag horizontally pans the timeline
- Cursor changes to grab/grabbing
- Pan is 1:1 with pixel movement

On a touchscreen, drag horizontally with one finger to pan.

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

  /** Reset to default view */
  resetView(): void;
}
```

## Detail Levels

The ruler adapts its tick interval to the year range. Era bands and composer bars appear in the overview. Composition markers are hidden when the visible span exceeds 200 years; otherwise, works in range can appear on their composer's row. Historical event markers are controlled separately by the historical events toggle.

## Performance

- Timeline scales, ticks and visible entities are memoized with their relevant inputs.
- Composer rows and historical event markers are limited to entities overlapping the viewport; works are limited to years within it.

## Test Scenarios

1. Default view shows 1580–1970.
2. Ctrl/Cmd + scroll up zooms in around the pointer's year.
3. Ctrl/Cmd + scroll down zooms out around that year.
4. Zooming in stops at the 10-year minimum away from the timeline bounds.
5. Cannot zoom beyond full timeline.
6. Click-drag pans the viewport.
7. Cannot pan beyond timeline bounds.
8. The zoom buttons zoom around the viewport center.
9. Focus Timeline calls `zoomToRange` with lifespan bounds, 15 years of padding and a right inset for the composer card.
10. `resetView` returns to the default viewport.
