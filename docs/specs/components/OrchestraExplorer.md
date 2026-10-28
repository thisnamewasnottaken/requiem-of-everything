# OrchestraExplorer

## Purpose

An interactive listening journey through the changing orchestra, from Renaissance polyphony to twentieth-century experimentation. Users travel through six musical eras, see the stage recompose around instruments prominent in each period, encounter a representative score, and follow a listening prompt into an existing Spotify search link. The seating map remains a navigable instrument atlas, but serves the larger story: how orchestral colour and musical possibility change over time.

The experience is not an embedded audio player and does not claim that a composition's complete instrumentation is known. It uses the era-prominence data attached to instruments to show historical emphasis, and the composition's own instrumentation field to identify named instruments when possible.

## Props

```ts
interface OrchestraExplorerProps {
  onNavigateToTimeline?: () => void;
}
```

| Prop                   | Type         | Required | Description                           |
| ---------------------- | ------------ | -------- | ------------------------------------- |
| `onNavigateToTimeline` | `() => void` | No       | Callback to navigate back to timeline |

> **Note**: The view title and subtitle are rendered in the **App header** (not in the component body) for consistency with other views. `App.tsx` conditionally shows the orchestra title/subtitle when `activeView === "orchestra"`.

## Data Sources

- `useInstruments()` — all instruments (26 total, 6 families)
- `useCompositions()` — all compositions (for matching featured works)
- `useComposers()` — all composers (for resolving composer names)
- `useEras()` — translated era date ranges, descriptions, colours, and characteristics

## Dependencies

- `motion` — spring-physics animations, `AnimatePresence`, `motion.*` SVG/HTML elements
- `openSpotify()` from `src/utils/spotify.ts` — handles app-first-then-web-fallback navigation for featured composition Spotify actions.

## Visual Architecture

### 2026 Design Direction

- Reimagine the view as a time-traveling listening room, not just a seating chart. The era rail is the primary navigation; selecting a chapter changes the historical context, the score selection, and the orchestra's instrument emphasis together.
- Pair every map with a human-scale story: period description, concise characteristics, a dated composition, its instrumentation, and a direct listening action. Existing composition data is the source; no sample audio or unsupported arrangement detail is invented.
- Preserve the stage as a spatial instrument atlas. Family controls remain available beside the story, and selecting a family reveals its instruments and historical role without hiding the active era.
- Motion is purposeful feedback for focus and selection, not ambient spectacle. Support `prefers-reduced-motion`, use CSS variables for pointer light rather than React state updates on every pointer event, and keep every interactive era, family, and instrument reachable by keyboard.
- This direction reflects 2026 design coverage on immersive spatial interfaces and interactive data storytelling, balanced against recent motion/accessibility guidance: [Figma, Web Design Trends](https://www.figma.com/resource-library/web-design-trends/), [Infogram, Data Visualization Trends](https://infogram.com/blog/10-trends-in-data-visualization-to-watch-in-2026/), and [HIQ, Frontend Trends and Design Patterns to Watch in 2026](https://hiq.se/en/insight/frontend-trends-and-design-patterns-to-watch-in-2026/).

### Ambient Background

Full-viewport dark background with organic, atmospheric effects:

- Base: dark radial gradient (`#18181b` → `#09090b`)
- Three animated orbs: large blurred circles (`blur(120px)`) with slow infinite drift animations (CSS `@keyframes`, 20–30s cycles)
- Mouse-tracking highlight: a large, soft radial glow that follows the cursor (updated via CSS custom properties from `onMouseMove`)
- Subtle grid overlay texture at very low opacity for spatial reference

### Era Journey

- A six-stop, chronological era rail is the primary control and works as a keyboard-operable tab list.
- The selected era comes from the translated `useEras()` data and provides the name, date range, description, and characteristics for the learning panel.
- The score list is derived from compositions whose composer is classified in the selected era and whose composed year falls within the era's displayed date range. Show up to four chronologically early works, the translated title, composer, existing instrumentation and description/significance, and an action that opens the work's existing Spotify URL through `openSpotify()`.
- Era ranges can overlap (notably the transition to Modern music). The composer's primary era classifies the score into a single chapter while the displayed composition year remains unchanged. Do not silently rewrite the project's period definitions to force exclusive dates.
- When a chapter changes, clear the selected instrument family and resolve the score panel to a work in the new chapter. A manually selected score updates the panel and highlights matching named instruments when its instrumentation text permits a match.
- Never imply audio is playing in the app. Spotify actions open the existing external app-first/web-fallback flow.

### Elliptical SVG Stage

Full-width SVG with `viewBox="0 0 1500 700"`, center at `cx=750, cy=620`.

The orchestra is rendered from above with a **0.55 vertical tilt factor**, creating an elliptical perspective. All positioning uses polar coordinates converted to Cartesian via:

```ts
function polarToCartesian(cx, cy, radius, angleDeg, tilt = 0.55) {
  const rad = ((angleDeg - 180) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad) * tilt,
  };
}
```

Wedge paths are generated with `describeWedge()` using inner/outer radii and start/end angles.

### Layout Tiers (from conductor outward)

Based on standard modern orchestral seating (American layout, viewed from above):

```
Tier 0:  Conductor (centre, at CY)
Tier 1:  Strings (r=80–270, a=5°–175°) — full-width front arc (6 instruments: Violin, Viola, Cello, Double Bass, Harp, Viola da Gamba)
Tier 2:  Keyboards (r=280–390, a=0°–42°) left wing near conductor | Woodwinds (r=280–390, a=46°–134°) centred behind strings
Tier 3:  Brass (r=400–500, a=15°–105°) back-left/centre | Percussion (r=400–500, a=109°–165°) centre-right rear
Tier 4:  Voice / Choir (r=510–610, a=10°–170°) — full-width rear arc behind everything
```

Decorative elliptical tier rings at key radii (subtle `rgba(255,255,255,0.05)` strokes).

### Family Colors

| Family     | Color   | Glow (40% alpha)        |
| ---------- | ------- | ----------------------- |
| strings    | #C4A035 | rgba(196, 160, 53, 0.4) |
| woodwinds  | #27AE60 | rgba(39, 174, 96, 0.4)  |
| brass      | #E67E22 | rgba(230, 126, 34, 0.4) |
| percussion | #E74C3C | rgba(231, 76, 60, 0.4)  |
| keyboards  | #3498DB | rgba(52, 152, 219, 0.4) |
| voice      | #9B59B6 | rgba(155, 89, 182, 0.4) |

## Interaction States

### State 1: Choose a historical chapter

- Six chronological era tabs present the full 1400–1970 span.
- A selected chapter introduces its sound world and offers dated works by composers classified in that era.
- The stage shows all family zones; instruments documented for the era remain vivid, while instruments without prominence data recede but remain discoverable.
- The score panel names its composition data source and makes external listening explicit.

### State 2: Explore the orchestra of that era

- Family controls show the number of instruments with primary/secondary prominence in the era and the total family size; rare instruments remain visible but are not counted as prominent.
- Selecting a family from its control or stage zone reveals the instrument nodes and translated family description.
- Instrument prominence for the selected era is conveyed without removing less prominent instruments from the atlas.
- Selecting an instrument opens the existing detailed instrument card.

### State 3: Enter a score

- Selecting a work updates its instrumentation, historical note, and available listening action.
- If an instrument name occurs in the selected work's instrumentation string, that node receives additional emphasis; generic instrumentation does not fabricate a match.
- Spotify opens externally using the existing app-first fallback behavior; no audio is auto-started.

### State 4: Instrument Selected

- Full-screen modal overlay with `backdrop-blur(24px)` and dark tint.
- Centered card with spring animation (scale 0.9→1, y 50→0), two-column visual/content layout, and kinetic title.
- Close button and Escape key dismiss; Escape also backs out from family to era overview.

## Instrument Nodes

When a family is selected, instrument nodes appear within the wedge:

- Positioned algorithmically: instruments distributed evenly in 1–2 rows within the wedge's angular range
- Each node: dark circle (r=38) with family-colored stroke, inner dashed decorative ring
- Instrument name centered inside (split into lines if multi-word)
- Entry animation: `initial={{ opacity: 0, scale: 0 }}`, `animate={{ opacity: 1, scale: 1 }}`, staggered delay (`i * 0.06s`), spring physics (`damping: 15`)
- Hover: scale 1.15
- Click: opens instrument detail overlay

## Instrument Detail Overlay

Full-screen modal with two sections:

### Visual Side (left)

- Dark background with rotating conic gradient in family's glow color
- Instrument name rendered vertically in large bold text, family color, mix-blend-screen

### Content Side (right)

- **Name**: Large display font, each character animates in with spring delay
- **Family badge**: Colored pill with family name
- **Range**: Monospace font
- **Role**: Body text with family color accent
- **Description**: Secondary text, relaxed line-height
- **Era Prominence**: Horizontal bar segments for each era, colored with era CSS variables, opacity by prominence (primary=1.0, secondary=0.55, rare=0.25)
- **Featured Compositions**: Up to 5 compositions where `instrumentation` contains the instrument name, sorted by year
  - **Spotify action**: Each featured composition that has a `spotifyUrl` displays a clickable 🎧 button (not a plain `<a>` link). On click, calls `openSpotify(spotifyUrl)` from `src/utils/spotify.ts` to attempt app-first opening with web fallback after ~1500ms. The button has `aria-label="Listen to {title} on Spotify"`.
- **Wikipedia link**: `getWikipediaUrl(instrument.wikipediaSlug)`, `rel="noopener noreferrer"`
- **Close button**: Top-right, circular, with hover effect

### Composition Matching Logic

```ts
const matchingCompositions = allCompositions.filter((c) =>
  c.instrumentation.toLowerCase().includes(instrument.name.toLowerCase()),
);
```

Display at most 5 matches, sorted by year.

## Family Info Panel

Contextual panel adjacent to the journey and family controls:

- Background: `rgba(0,0,0,0.6)` with `backdrop-filter: blur(24px)`
- Rounded corners (`1.5rem`), subtle border (`rgba(255,255,255,0.1)`)
- Family name in uppercase tracking-wide, family color
- Translated description from `t('orchestraExplorer.{family}Desc')`
- Slide-in animation from right (`motion` x: 20→0)

## Animations (motion library)

| Element            | Entry                                              | Exit                   |
| ------------------ | -------------------------------------------------- | ---------------------- |
| Family wedge hover | Animated fill/stroke/opacity (0.5s ease-out)       | Reverse                |
| Instrument node    | `scale: 0→1, opacity: 0→1` (spring, stagger 60ms)  | `scale→0.8, opacity→0` |
| Family info panel  | `x: 20→0, opacity: 0→1`                            | `x→20, opacity→0`      |
| Detail overlay bg  | `opacity: 0→1`                                     | `opacity→0`            |
| Detail card        | `y: 50→0, scale: 0.9→1` (spring, damping 25)       | `y→20, scale→0.95`     |
| Detail title chars | `y: 10→0, opacity: 0→1` per char (delay 30ms each) | —                      |

## Styling

- CSS Modules (`OrchestraExplorer.module.css`)
- CSS custom properties from `global.css` for colors, fonts, spacing
- Ambient background: CSS `@keyframes` for orb drift (no JS needed)
- Desktop uses a chronological chapter rail above a responsive map-and-story composition; mobile stacks these into a scrollable listening journey.
- SVG filters: `feGaussianBlur` + `feComposite` for glow effects per family
- Radial gradients per family for wedge fills
- Glassmorphism: `backdrop-filter: blur()` + semi-transparent backgrounds

## i18n

All user-visible strings use `useTranslation()`. Keys under `orchestraExplorer.*`:

| Key                          | Example (en-GB)                            |
| ---------------------------- | ------------------------------------------ |
| `title`                      | Orchestra Explorer                         |
| `subtitle`                   | Interactive Orchestral Topography          |
| `backToTimeline`             | ← Timeline                                 |
| `clickPrompt`                | Click a section to explore its instruments |
| `conductor`                  | Conductor                                  |
| `strings` / `woodwinds` etc. | Strings / Woodwinds / ...                  |
| `stringsDesc`                | (Family description paragraph)             |
| `woodwindsDesc`              | (Family description paragraph)             |
| `brassDesc`                  | (Family description paragraph)             |
| `percussionDesc`             | (Family description paragraph)             |
| `keyboardsDesc`              | (Family description paragraph)             |
| `voiceDesc`                  | (Family description paragraph)             |
| `range` / `role`             | Range / Role                               |
| `description`                | Description                                |
| `eraProminence`              | Era Prominence                             |
| `featuredIn`                 | Featured In                                |
| `readMore`                   | Read more →                                |
| `instruments`                | {{count}} instruments                      |
| `closeDetail`                | Close                                      |
| `journeyTitle`               | An orchestra in motion                     |
| `journeyPrompt`              | Choose a chapter, then follow a score      |
| `journeyEraLabel`            | Explore an era                              |
| `journeyScoreLabel`          | A score from this era                       |
| `journeyListenFor`           | Listen for                                  |
| `journeyListenAction`        | Listen on Spotify                           |
| `journeyInstrumentCount`     | {{count}} prominent of {{total}} instruments |
| `journeyNoScores`            | No compositions are recorded for this era   |

## Accessibility

- Era controls use tab semantics, `aria-selected`, visible focus, and arrow-key navigation.
- Family wedge `<g>` elements have `role="button"`, `tabIndex={0}`, and an accessible label.
- Keyboard: Enter/Space activates family or instrument; Escape backs up one level.
- Instrument nodes have `cursor: pointer` and click handlers with `stopPropagation`
- Era tabs, family controls, stage zones, and instrument nodes are keyboard-operable with visible focus indicators.
- Ambient animation stops or simplifies under `prefers-reduced-motion`; pointer tracking does not trigger a React render per movement.
- Detail overlay close button has `aria-label`
- External links use `rel="noopener noreferrer"` and `target="_blank"`
- Focus-visible outlines on interactive elements
- Spotify buttons in featured compositions have `aria-label` describing the action.
- Score changes are announced through a polite live region; era controls identify both period and dates.

## Responsive

- Desktop: era rail spans the page above a two-column stage and listening/story panel.
- Below 820px: the layout becomes a scrollable single column; the era rail and family controls scroll horizontally, and the stage remains full-width.
- On narrow phones the stage is a horizontally pannable canvas at a readable scale rather than shrinking instrument labels to illegibility.
- Detail modal: columns stack vertically, visual side shrinks
- No fixed control obscures the stage or the work panel.

## Test Scenarios

1. Renders the six chronological era controls and all six stage families.
2. Selecting an era updates the period story, date range, representative works, and era prominence counts.
3. Selecting a score updates the instrumentation story and only emphasizes explicitly named instrument matches.
4. Spotify action calls the existing app-first helper with the selected score's URL.
5. Family selection reveals instruments, and clicking again clears the family.
6. Instrument selection opens the detail overlay; Escape returns through instrument, family, and era states.
7. Instrument detail retains name, range, role, description, era bars, matching compositions, and Wikipedia link.
8. Era controls support arrow-key navigation; stage family and instrument controls support Enter/Space.
9. External links use `rel="noopener noreferrer"`.
10. Era stories and controls are translated, and the responsive single-column view does not clip the journey.
11. Reduced-motion preferences remain respected.
