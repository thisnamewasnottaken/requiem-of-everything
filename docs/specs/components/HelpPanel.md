# HelpPanel Component Spec

## Purpose

Slide-in panel providing in-app documentation for users. Discoverable via a `?` button in the app header. Covers keyboard shortcuts, timeline navigation, filtering, comparison mode, and general usage tips.

## Trigger

- **Header button**: `?` icon button in the app header toolbar (right side, after Filters).
- **Keyboard shortcut**: `?` key (Shift+/) toggles the panel.
- **Escape**: Closes the panel when open.

## Props

```ts
interface HelpPanelProps {
  onClose: () => void;
}
```

## Layout

Fixed-position panel, slides in from the right side of the viewport (mirrors FilterPanel's left-side slide-in, using opposite edge to avoid overlap). Width: 340px, full viewport height.

### Sections

1. **Keyboard Shortcuts** — Table of key → action mappings:
   | Key | Action |
   |-----|--------|
   | `F` | Toggle filter panel |
   | `R` | Reset timeline view |
   | `?` | Toggle help panel |
   | `Esc` | Close open panels |
   | Scroll wheel | Zoom in/out at cursor |
   | Click + drag | Pan timeline |
   | Ctrl+click | Add/remove composer from comparison |

2. **Navigation** — Prose instructions:
   - Scroll to zoom, drag to pan.
   - Click a composer bar to see details.
   - Use the zoom controls (+/−/↺) in the top-right corner.
   - The year range indicator shows the current viewport.

3. **Filters** — Brief description:
   - Open with the ⚙ Filters button or press `F`.
   - Filter by musical era (Renaissance → Modern).
   - Search composers by name or tag.
   - Toggle historical event markers.

4. **Comparison Mode** — How to use:
   - Ctrl+click (Cmd+click on Mac) composer bars to add/remove from comparison.
   - If a composer detail panel is open, Ctrl+clicking another composer adds both to comparison automatically.
   - When 2 or more composers are selected, non-compared composers dim immediately.
   - After ~3 seconds of inactivity, dimmed composers collapse to 6px height (expand on hover).
   - On collapse, the timeline auto-zooms to frame the compared composers' combined lifespans.
   - Clearing comparison restores the original timeline view.
   - Historical events dim in both focus and comparison modes.
   - Up to 5 composers can be compared at once.
   - The "+ Compare" button in the composer detail panel also works (auto-closes panel).
   - Use the comparison bar in the header to manage or clear comparisons.

## Visual Design

- Background: `--bg-secondary`
- Border-left: `1px solid --border-subtle`
- Section headers: `--font-display`, uppercase, `--text-muted` color
- Key badges: Small rounded rectangles with `--bg-surface` background, `--font-mono` text
- Slide-in animation: 300ms ease from right

## Accessibility

- Panel has `role="dialog"` and `aria-label="Help"`
- Close button has `aria-label="Close help"`
- Keyboard shortcut keys displayed in `<kbd>` elements
- Focus trapped within the panel while open is NOT required (it's informational, not modal)

## States

| State  | Behavior                                 |
| ------ | ---------------------------------------- |
| Closed | Not rendered                             |
| Open   | Slides in from right, scrollable content |

## Test Scenarios

1. Pressing `?` opens the panel; pressing again closes it.
2. Pressing `Esc` while panel is open closes it.
3. All documented keyboard shortcuts are listed.
4. Close button (×) works.
5. Panel does not render when closed.
6. Panel appears on the right side, not overlapping the filter panel.
