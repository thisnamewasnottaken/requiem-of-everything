# OrchestraExplorer

## Purpose

An immersive, full-viewport interactive orchestral topography — a bird's-eye-view semicircular stage rendered as an elliptical SVG with perspective tilt, showing instrument families arranged in their real orchestral positions. Uses `motion` (framer-motion) for spring-physics animations, `AnimatePresence` for mount/unmount transitions, and ambient background effects to create a cinematic, organic experience. Users click family wedge sections to reveal instrument nodes with staggered spring animations, then click instruments for a full-screen detail overlay with kinetic typography.

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

- `useInstruments()` — all instruments (28 total, 6 families)
- `useCompositions()` — all compositions (for matching featured works)
- `useComposers()` — all composers (for resolving composer names)

## Dependencies

- `motion` — spring-physics animations, `AnimatePresence`, `motion.*` SVG/HTML elements

## Visual Architecture

### Ambient Background

Full-viewport dark background with organic, atmospheric effects:

- Base: dark radial gradient (`#18181b` → `#09090b`)
- Three animated orbs: large blurred circles (`blur(120px)`) with slow infinite drift animations (CSS `@keyframes`, 20–30s cycles)
- Mouse-tracking highlight: a large, soft radial glow that follows the cursor (updated via CSS custom properties from `onMouseMove`)
- Subtle grid overlay texture at very low opacity for spatial reference

### Elliptical SVG Stage

Full-width SVG with `viewBox="0 0 1500 800"`, center at `cx=750, cy=780`.

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

```
Tier 0:  Conductor (r=0–80, a=0°–180°)
Tier 1:  Strings (r=90–330, a=5°–175°) — large front arc
Tier 2:  Keyboards (r=340–490, a=0°–38°), Woodwinds (r=340–490, a=42°–138°), Voice (r=340–490, a=142°–180°)
Tier 3:  Brass (r=500–670, a=0°–112°), Percussion (r=500–670, a=116°–180°)
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

### State 1: Overview (default)

- All family wedges visible with subtle fill (`rgba(255,255,255,0.02)`) and thin strokes
- Family labels positioned at polar-center of each wedge, uppercase tracking-wide, in family color
- Hover: wedge fills with radial gradient in family color, stroke thickens, glow SVG filter activates, label brightens
- Prompt text below SVG: italic, muted, "Click a section to explore its instruments"
- Conductor marker at center-bottom (small golden circle)

### State 2: Family Selected

- Selected wedge: full gradient fill with glow filter
- Other wedges: dim to opacity 0.15
- Family label fades to near-invisible on selected wedge (replaced by instrument nodes)
- **Instrument nodes** appear inside the selected wedge with staggered spring animations
- Family info panel slides in (top-right, glassmorphism overlay)

### State 3: Instrument Selected

- Full-screen modal overlay with `backdrop-blur(24px)` and dark tint
- Centered card with spring animation (scale 0.9→1, y 50→0)
- Two-column layout: visual side (abstract gradient + vertical name) + content side (details)
- Kinetic typography: title characters animate in sequentially
- Close button and Escape key dismiss

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

Glassmorphism overlay panel (top-right of viewport, `position: absolute`):

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

## Accessibility

- Family wedge `<g>` elements have `role="button"`, `tabIndex={0}`, `aria-label`
- Keyboard: Enter/Space activates family, Escape backs up one level
- Instrument nodes have `cursor: pointer` and click handlers with `stopPropagation`
- Detail overlay close button has `aria-label`
- External links use `rel="noopener noreferrer"` and `target="_blank"`
- Focus-visible outlines on interactive elements

## Responsive

- Below 768px: SVG scales naturally (full width), panels become full-width
- Detail modal: columns stack vertically, visual side shrinks
- Family info panel: full width at bottom instead of top-right

## Test Scenarios

1. Renders SVG stage with all 6 instrument family wedges
2. Each family wedge displays its label in the correct color
3. Hovering a family wedge shows glow effect
4. Clicking a family highlights it and dims other wedges
5. Clicking the selected family again deselects (returns to overview)
6. Instrument nodes appear with staggered animation when family selected
7. Clicking an instrument node opens detail overlay
8. Detail overlay shows name, range, role, description, era bars, compositions
9. Detail overlay uses kinetic typography for title
10. Wikipedia link uses correct URL via `getWikipediaUrl`
11. Escape key navigates back (instrument→family→overview)
12. Back-to-timeline button calls `onNavigateToTimeline`
13. Conductor marker renders at center-bottom
14. Family descriptions are translated via i18n
15. Responsive layout works at mobile breakpoint
