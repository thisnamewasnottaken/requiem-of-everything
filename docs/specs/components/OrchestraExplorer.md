# OrchestraExplorer

## Purpose

An interactive, visually stunning orchestra seating map — a bird's-eye-view semicircular stage showing instrument families arranged in their real orchestral positions. Inspired by Carnegie Hall's Orchestra Map. Users click family sections on the stage to explore individual instruments, with a detail panel for deep dives.

## Props

```ts
interface OrchestraExplorerProps {
  onNavigateToTimeline?: () => void;
}
```

| Prop                   | Type         | Required | Description                           |
| ---------------------- | ------------ | -------- | ------------------------------------- |
| `onNavigateToTimeline` | `() => void` | No       | Callback to navigate back to timeline |

## Data Sources

- `useInstruments()` — all instruments
- `useCompositions()` — all compositions (for matching featured works)
- `useComposers()` — all composers (for resolving composer names)

## Layout

### Semicircular Stage (Seating Map)

A dome-shaped stage viewed from above, with instrument families arranged in concentric tiers from back (furthest from audience) to front:

```
                          STAGE (view from above)

                    ┌─────────────────────────────────┐
                    │         🥁 PERCUSSION            │  ← Tier 1 (back, 50% width)
                    ├─────────────────────────────────┤
                    │         🎺 BRASS                 │  ← Tier 2 (65% width)
                    ├─────────────────────────────────┤
                    │         🎵 WOODWINDS              │  ← Tier 3 (80% width)
                    ├──────┬───────────────────┬──────┤
                    │ 🎹   │    🎻 STRINGS      │ 🎤   │  ← Tier 4 (100% width)
                    │ Keys │                   │Voice │
                    └──────┴─────────┬─────────┴──────┘
                                     ● Conductor
```

Each tier is wider than the one above, creating a natural fan shape within the `border-radius: 50% 50% 4% 4%` dome.

### Visual Design

**Stage container:**
- Semicircular dome shape: `border-radius: 50% 50% 4% 4%`
- Dark gradient background: `radial-gradient(ellipse at 50% 120%, #1a1a2e 0%, #0d0d1a 100%)`
- Subtle border: `1px solid rgba(255, 255, 255, 0.08)`
- Internal shadow for depth
- Max-width: 900px, centered
- Decorative concentric ring elements for stage-floor realism

**Conductor podium:**
- Small golden circle at bottom-center of stage
- Radial gradient with glow effect
- "Conductor" label in small uppercase text

### Sections

1. **Header**: Title with back-to-timeline button
2. **Stage**: Semicircular seating chart with clickable family sections
3. **Instrument Panel**: Cards below the stage (visible when a family is selected)
4. **Detail Panel**: Slide-in panel from right (visible when an instrument is selected)

## Interaction States

### State 1: Overview (default)
- All family sections visible on stage at normal opacity
- Each section displays: emoji icon + family name + instrument count
- Hover: subtle glow in family color, slight scale-up (1.03)
- Below stage: italic prompt "Click a section to explore instruments"

### State 2: Family Selected
- Clicked section highlights (brighter background, glow, border)
- Other sections dim (opacity: 0.3)
- Clicking the same family again deselects it
- Below stage: instrument cards appear with slide-up animation

### State 3: Instrument Selected
- Detail panel slides in from right with `translateX` animation
- Semi-transparent backdrop behind
- Shows full instrument details

## Family Section Styling

Each family section is a `<button>` with inline styles computed from its color. Colors at ~8% opacity for background, brighter on hover/selected.

### Family Colors

| Family     | Color   |
| ---------- | ------- |
| strings    | #C4A035 |
| woodwinds  | #27AE60 |
| brass      | #E67E22 |
| percussion | #E74C3C |
| keyboards  | #3498DB |
| voice      | #9B59B6 |

### Family Icons

🎻 Strings, 🎵 Woodwinds, 🎺 Brass, 🥁 Percussion, 🎹 Keyboards, 🎤 Voice

## Instrument Cards (below stage)

Shown when a family is selected. Flex-wrap grid of cards (200–280px each):

- Colored top border matching family color (3px)
- Instrument name (bold)
- Range in monospace font
- Short role description
- Era prominence dots
- Hover: lift effect (translateY -3px), shadow, accent border
- Slide-up animation on appearance

## Instrument Detail Panel

Fixed-position slide-in from right (width: 420px, max-width: 90vw):

- **Name** — large, accent color, display font
- **Family** — badge pill with family color background
- **Range** — monospace font
- **Role** — body text
- **Description** — secondary text, 1.6 line-height
- **Era Prominence** — horizontal bar segments for each era, colored with era CSS variables, opacity by prominence level (primary=1.0, secondary=0.55, rare=0.25)
- **Featured Compositions** — up to 5 compositions where `instrumentation` field contains the instrument name (case-insensitive), sorted by year. Shows title, composer shortName, year, and Spotify link if available
- **Wikipedia link** — `getWikipediaUrl(instrument.wikipediaSlug)`
- **Close button** — top-right corner

### Composition Matching Logic

```ts
const matchingCompositions = allCompositions.filter(c =>
  c.instrumentation.toLowerCase().includes(instrument.name.toLowerCase())
);
```

Display at most 5 matches, sorted by year.

## Animations

- Family hover/select: `transition: all 0.3s ease`
- Non-selected dimming: inline opacity style
- Instrument panel: `@keyframes fadeSlideUp` (opacity + translateY)
- Detail panel: `@keyframes slideInRight` (translateX 100% → 0)
- Backdrop: `@keyframes fadeIn`

## Styling

- Dark theme using CSS custom properties from `global.css`
- `--font-display` for headers, `--font-body` for text, `--font-mono` for ranges
- `--bg-surface` for cards, `--bg-elevated` for hover states
- Stage uses its own dark gradient (not CSS variables) for the dome effect
- Detail panel: `z-index: 200`, `box-shadow: var(--shadow-lg)`

## i18n

All user-visible strings use `useTranslation()` with keys under `orchestraExplorer.*` namespace. The prompt text uses `orchestraExplorer.clickPrompt` with a default value fallback.

## Accessibility

- Family sections are `<button>` elements with `aria-pressed` and `aria-label`
- Instrument cards have `role="button"`, `tabIndex={0}`, and keyboard handlers (Enter/Space)
- Detail panel has `role="complementary"` with `aria-label`
- Close button has `aria-label` from `t("orchestraExplorer.closeDetail")`
- External links use `rel="noopener noreferrer"` and `target="_blank"`
- Focus-visible outline on instrument cards

## Responsive

- Below 740px: stage dome becomes a rounded rectangle, tiers go full width
- Front tier (strings/keyboards/voice) wraps
- Instrument cards go full width
- Detail panel becomes full-screen overlay

## Test Scenarios

1. Renders semicircular stage with all 6 instrument families
2. Each family section shows correct icon, name, and count
3. Clicking a family section highlights it and dims others
4. Clicking the selected family again deselects it (returns to overview)
5. Instrument cards appear below stage when family is selected
6. Clicking an instrument card opens detail panel with correct data
7. Detail panel shows matching compositions from `useCompositions()`
8. Wikipedia link uses localized URL via `getWikipediaUrl`
9. Back-to-timeline button calls `onNavigateToTimeline`
10. Close button dismisses detail panel
11. Era dots render correct colors and prominence levels
12. Conductor podium renders at bottom center of stage
13. Responsive layout adjusts at 740px breakpoint
