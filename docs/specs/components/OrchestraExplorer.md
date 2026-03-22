# OrchestraExplorer

## Purpose

An interactive visual explorer for orchestral instruments, organized by instrument family. Displays a grid layout suggesting orchestra seating arrangement, with expandable family sections showing individual instruments and a slide-in detail panel for selected instruments.

## Props

```ts
interface OrchestraExplorerProps {
  onNavigateToTimeline?: () => void;
}
```

| Prop                  | Type         | Required | Description                             |
| --------------------- | ------------ | -------- | --------------------------------------- |
| `onNavigateToTimeline`| `() => void` | No       | Callback to navigate back to timeline   |

## Data Sources

- `useInstruments()` — all instruments
- `useInstrumentsByFamily(family)` — instruments filtered by family
- `useCompositions()` — all compositions (for matching featured works)
- `useComposers()` — all composers (for resolving composer names)

## Layout

### Orchestra Grid

A CSS grid arrangement suggesting orchestra seating:

```
                [Percussion]
          [Brass]          [Brass]
      [Woodwinds]      [Woodwinds]
   [Strings]    [Keyboards]   [Strings]
                 [Voice]
```

Implementation: `grid-template-columns: repeat(auto-fill, minmax(340px, 1fr))` with family sections ordered to suggest the layout. Families are displayed in order: percussion, brass, woodwinds, strings, keyboards, voice.

### Sections

1. **Header**: Title "Orchestra Explorer" with back-to-timeline button (calls `onNavigateToTimeline`)
2. **Orchestra Grid**: Family section cards in responsive grid
3. **Instrument Detail Panel**: Slide-in panel from right when instrument selected

## Family Section Card

- Colored left border matching family color
- Family emoji icon: 🎻 Strings, 🎵 Woodwinds, 🎺 Brass, 🥁 Percussion, 🎹 Keyboards, 🎤 Voice
- Family name as header
- Instrument count badge
- Click to expand/collapse instrument list within the section

### Family Colors

| Family     | Color   |
| ---------- | ------- |
| strings    | #C4A035 |
| woodwinds  | #27AE60 |
| brass      | #E67E22 |
| percussion | #E74C3C |
| keyboards  | #3498DB |
| voice      | #9B59B6 |

## Expanded Family View

Shows instrument cards within the family section:

- Instrument name (bold, primary text)
- Range in monospace font
- Short role description
- Era prominence dots: colored dots for each era in `eraProminence`, using era CSS variables
  - `primary` → filled circle
  - `secondary` → half-opacity filled circle
  - `rare` → outline only (transparent background)
- Click instrument card to open detail panel

## Instrument Detail Panel

Fixed-position slide-in panel from right side (width: 420px, max-width: 90vw):

- **Name** — large, accent color, display font
- **Family** — badge with family color
- **Range** — monospace font
- **Role** — body text
- **Description** — secondary text, 1.6 line-height
- **Era Prominence** — visual bar segments for each era, colored with era CSS variables, sized by prominence level
- **Featured Compositions** — up to 5 compositions where `instrumentation` field contains the instrument name (case-insensitive). Shows title, composer name (resolved from `composerId`), and Spotify link if `spotifyUrl` exists
- **Wikipedia link** — `getWikipediaUrl(instrument.wikipediaSlug)`
- **Close button** — top-right corner

### Composition Matching Logic

```ts
const matchingCompositions = allCompositions.filter(c =>
  c.instrumentation.toLowerCase().includes(instrument.name.toLowerCase())
);
```

Display at most 5 matches, sorted by year.

## Styling

- Dark theme using CSS custom properties from `global.css`
- `--font-display` for headers, `--font-body` for text, `--font-mono` for ranges
- `--bg-surface` for cards, `--bg-elevated` for hover/inner cards
- Responsive: single column on narrow screens via `auto-fill` grid
- Detail panel: `z-index: 200`, `box-shadow: var(--shadow-lg)`

## i18n

All user-visible strings use `useTranslation()` with keys under `orchestraExplorer.*` namespace.

## Accessibility

- Family sections use `<button>` elements for expand/collapse
- Detail panel has `role="complementary"` with `aria-label`
- Close button has `aria-label` from `t("orchestraExplorer.closeDetail")`
- External links use `rel="noopener noreferrer"` and `target="_blank"`

## Test Scenarios

1. Renders all 6 instrument families with correct names and counts
2. Clicking a family header expands to show instruments
3. Clicking an expanded family header collapses it
4. Clicking an instrument card opens detail panel with correct data
5. Detail panel shows matching compositions from `useCompositions()`
6. Wikipedia link uses localized URL via `getWikipediaUrl`
7. Back-to-timeline button calls `onNavigateToTimeline`
8. Close button dismisses detail panel
9. Era dots render correct colors and prominence levels
10. Responsive grid stacks to single column at narrow widths
