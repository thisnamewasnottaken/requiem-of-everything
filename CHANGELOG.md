# Changelog

All notable changes to Requiem of Everything will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]

### Changed

- **OrchestraExplorer redesign** — completely rebuilt Orchestra Explorer as an immersive, full-viewport interactive orchestral topography. Features an elliptical top-down SVG stage with perspective tilt (0.55 factor), ambient background with animated orbs and mouse-tracking spotlight, spring-physics animations via `motion` library (AnimatePresence, staggered instrument node reveals), glassmorphism info panels with backdrop-blur, kinetic typography on instrument detail titles, a two-column detail modal with rotating conic gradient visual, and comprehensive i18n for family descriptions in all three languages. Spec updated at `docs/specs/components/OrchestraExplorer.md`.
- **OrchestraExplorer header** — moved view title and subtitle from the component body into the App header for consistency with other views.
- **OrchestraExplorer seating layout** — redesigned family positions to match standard modern orchestral seating (strings front, woodwinds centre-mid, keyboards left-wing, brass back-left, percussion back-centre, voice/choir at the very rear). Repositioned SVG centre from bottom-edge to mid-viewport to use available space. Improved instrument-node spacing algorithm with collision-aware minimum angular gaps to prevent overlapping bubbles.
- **TermExplorer global filter integration** — TermExplorer now respects global filters from `useFilterStore`. Era filters restrict terms to those originating in selected eras; the header search query applies as an additional text filter alongside the local search input.
- **View-scoped panel visibility** — ComposerCard and CompositionDetail panels now only render on the Timeline view (preserved when switching away, restored when returning). FilterPanel and SearchFilterBar are visible on Timeline and Terms views but hidden on Orchestra.

### Added

- **View navigation tabs** — header now includes Timeline | Terms | Orchestra tab switcher to navigate between the main timeline, the musical terms glossary, and the orchestra explorer. Fully localised (en-GB, fr-FR, af-ZA).
- **TermExplorer component** — full-page browsable/searchable glossary of 27 musical terms. Features category tab filtering (Forms & Structures, Genres, Techniques, etc.), text search across names and definitions, expandable cards with era-origin badges, example compositions with composer names and Spotify indicators, and locale-aware Wikipedia links. Spec at `docs/specs/components/TermExplorer.md`.
- **OrchestraExplorer component** — interactive orchestra seating map with a bird's-eye-view semicircular stage layout. Instrument families are arranged in their real orchestral positions across concentric tiers (percussion at back, brass, woodwinds, then strings/keyboards/voice at front). Features clickable family sections with hover glow effects, conductor podium with golden glow, instrument cards panel below the stage, and a slide-in detail panel with full description, era timeline, featured compositions, and Wikipedia links. Spec at `docs/specs/components/OrchestraExplorer.md`.
- **Musical terms glossary data** — `src/data/terms.json` with definitions for all 27 `CompositionGenre` values. Each term includes short/long definitions, category assignments, era origins, example composition IDs, and Wikipedia slugs. Types and hooks added.
- **Orchestral instruments data** — `src/data/instruments.json` with 26 instruments across 6 families (strings, woodwinds, brass, percussion, keyboards, voice). Each entry includes range, role, description, era prominence, and Wikipedia slug. Types and hooks added.
- **Focus mode dimming/collapse** — "Focus Timeline" button in ComposerCard now activates full focus mode: non-focused composers are dimmed and collapse after 1.5s, matching comparison mode's visual treatment. Toggleable; auto-clears on comparison mode entry.
- **Auto-zoom on filter change** — applying filters now auto-zooms the timeline to fit filtered composers' combined lifespan. Viewport is saved and restored when filters are cleared. Skipped when comparison mode is active.
- **Inline search bar in header** — replaced the standalone "⚙ Filters" button with a `SearchFilterBar` component containing an inline search input and a filter toggle button. Typing in the search box filters the timeline immediately via `useFilterStore.searchQuery`. The filter button shows an active-filter count badge when sidebar filters are engaged. Spec at `docs/specs/components/SearchFilterBar.md`.
- **Wikipedia link localisation** — all "Read on Wikipedia" links (ComposerCard, CompositionDetail, EventMarker) and the WikipediaService API calls now use the Wikipedia subdomain matching the current i18n language (e.g. `fr.wikipedia.org` when the UI is set to French). Centralised in `src/utils/wikipedia.ts`.

### Changed

- **TermExplorer card modal redesign** — cards now have uniform 180px height with 3-line truncated definitions and era badges pinned to the bottom. Clicking a card opens a centred modal overlay with full definitions, example compositions, and Wikipedia link. Replaces the old inline expand/collapse model. Escape key and backdrop click close the modal. Close button auto-focused for accessibility.
- **OrchestraExplorer SVG seating chart** — complete rewrite from rectangular flexbox tiers to true SVG arc/wedge geometry. Sections are now concentric semicircular arcs computed via `arcPath()` with proper radii and angular positions. Layout: percussion (outermost), brass, woodwinds, strings (innermost), with keyboards and voice as narrow side wedges. Includes SVG glow filters per family, conductor podium with golden gradient, decorative tier rings, and spotlight wash. Detail panel now appears inline on the right (not as a fixed overlay), with family overview → instrument drill-down navigation and "Up next" family cycling.

### Fixed

- **Z-index stacking for overlay panels** — app header now uses `var(--z-overlay)` instead of a hardcoded z-index of 50, so FilterPanel, ComposerCard, HelpPanel, and CompositionDetail panels correctly render above the header.
- **Event tooltip positioning** — tooltip now renders just above the diamond marker (`bottom: 20px` from marker bottom) instead of above the entire marker div including the tall event line. Previously the tooltip opened above the invisible event line top or flipped below the diamond off-screen. Removed vertical flip logic since event markers are always at the timeline bottom.
- **Trackpad pinch zoom** — pinch-to-zoom on trackpads now zooms the timeline instead of the whole browser page. Wheel handler moved to native `addEventListener` with `{ passive: false }`. Added `touch-action: none` to timeline container.

### Changed

- **Dependency upgrades** — major version bumps across the stack: Vite 5→8 (Rolldown bundler), Vitest 2→4, React 18→19, Zustand 4→5, TypeScript 5.6→5.9, @vitejs/plugin-react 4→6. Updated `vite.config.ts` and `vitest.config.ts` (`__dirname` → `import.meta.dirname`, removed Vitest triple-slash directive). Updated `tsconfig.json` target/lib to ES2022.

- **Content localisation** — added 4 i18next namespaces(`composers`, `compositions`, `events`, `eras`) for content data alongside the existing `translation` namespace for UI strings. Data hooks in `src/hooks/useData.ts` now merge base JSON with namespace translations via `useTranslation()` + `useMemo`. Full French (fr-FR) and Afrikaans (af-ZA) content translations for all 51 composers, 196 compositions, 47 events, and 6 eras.
- **Event selection in store** — `selectedEventId` and `selectEvent()` in `useSelectionStore` with mutual exclusion against composition/composer selection.
- **Data integrity tests** — added 4 test cases to `useData.test.ts` verifying no duplicate composition/composer IDs and that all cross-references between composers and compositions are valid.
- **i18n infrastructure** — added `react-i18next` with HTTP backend and browser language detection. Translations load from `public/locales/{lng}/translation.json` with `en-GB` fallback. Supported locales: `en-GB`, `fr-FR`, `af-ZA`. Spec at `docs/specs/features/i18n.md`.
- **i18n string extraction** — extracted all hardcoded UI strings from App.tsx and 9 components into `t()` / `Trans` calls. Populated `public/locales/en-GB/translation.json` with 95 keys in British English (centred, catalogue, programme, etc.). Uses hierarchical dot-notation keys (`app.title`, `composer.biography`, `help.nav.item1`, etc.).
- **French (France) localisation** — complete `fr-FR` translation of all 95 UI strings, musical terminology in standard French (Tonalité, Œuvres majeures, Époque musicale).
- **Afrikaans (South Africa) localisation** — complete `af-ZA` translation of all 95 UI strings with idiomatic Afrikaans phrasing.
- **Language switcher** — added a `<select>` dropdown in the header (before the Filters button) to switch between English, Français, and Afrikaans. Keyboard shortcut handlers now ignore `SELECT` elements to prevent conflicts.
- **Spotify links** — all 196 compositions now include `spotifyUrl` fields using Spotify search format. CompositionDetail renders a styled "Listen on Spotify" link with green pill-shaped badge matching Spotify brand colour (#1DB954).
- **20 new composers** — expanded the composer dataset from 31 to 51 entries covering all eras: Victoria (Renaissance), Telemann, Rameau, D. Scarlatti (Baroque), Gluck (Classical), Paganini, Weber (Early Romantic), Franck, Smetana, Borodin, Saint-Saëns, Mussorgsky, Rimsky-Korsakov, Elgar, Puccini, Sibelius (Late Romantic), Satie, Hindemith, Copland, Britten (Modern). All entries include biographies, portrait URLs, and Wikipedia slugs.
- **109 new compositions** — expanded from 96 to 196 compositions. All 20 new composers now have 4–5 major works each. Under-represented existing composers (Purcell, Berlioz, Vivaldi, Mendelssohn, Schumann, Liszt, Dvořák, Grieg, Schoenberg, Bartók) received additional canonical works.
- **15 new historical events** — expanded from 32 to 47 events, filling coverage gaps in pre-1600, 1600s, 1700s, and post-1950 periods (Spanish Armada, Peace of Westphalia, Seven Years' War, Sputnik, Moon Landing, etc.).
- **Filter by nationality and genre**— FilterPanel now shows nationality chips (derived from composer data) and genre chips (derived from composition data). Selecting any chip filters the timeline to composers matching those values. Genre filter matches composers with ≥1 composition in any selected genre. Active filter count badge shows on the filter toggle button.
- **Composition detail panel (CompositionDetail)** — clicking a composition marker opens a floating bottom-centre panel showing the composition's title, year, genre badge, instrumentation, key, catalogue number, significance, and a Wikipedia link. Clicking the composer chip jumps to the composer detail panel. Esc closes the panel.
- **Responsive / mobile layout** — header, timeline, and overlay components adapt to narrow viewports (≤768px). Touch gestures supported: single-touch to pan, two-finger pinch to zoom.
- **GitHub Actions deploy workflow** (`.github/workflows/deploy.yml`) — automated type-check → test → build → GitHub Pages deploy on pushes to `main`.
- **`useComposition(id)` hook** — synchronous hook in `src/hooks/useData.ts` for looking up a single composition by ID; follows the same interface as `useComposer`.

### Fixed

- **React 19 / Zustand 5 compatibility** — installed missing `@testing-library/dom` peer dependency required by `@testing-library/react` 16.x with `@types/react` 19.x. Audited all stores, components, hooks, and tests for breaking changes (default imports, `React.FC` implicit children, `useRef` mutability, deprecated APIs). No code changes required — codebase was already compatible.

- **EventMarker interaction** — clicking a diamond marker now toggles the event card open (pinned). Pinned cards have `pointer-events: auto` so Wikipedia links are clickable. Cards no longer close immediately on mouse leave.
- **EventMarker viewport clipping** — tooltip repositions near left/right edges to avoid being clipped by `overflow: hidden` on the timeline container.
- **EventMarker keyboard accessibility** — Enter/Space on focused marker toggles the card; Escape closes any pinned event card.
- **ComposerCard portrait** — portrait container is now hidden when the image URL returns a 404 or any other load error, instead of showing a broken image icon.
- **Duplicate composition IDs** — removed 9 duplicate entries from `compositions.json` (e.g. `dvorak-symphony-9`, `bartok-concerto-for-orchestra`). Kept the richer version of each pair and merged missing `wikipediaSlug` fields. Total compositions: 205 → 196.
- **Security: VITE_AI_API_KEY removed from client bundle** — `AIService.ts` no longer reads or sends `VITE_AI_API_KEY`. A comment now documents that API authentication must live in the Vite dev-server proxy or a server-side reverse proxy only.
- **Content Security Policy** — added CSP `<meta>` tag to `index.html` restricting `default-src`, `script-src`, `style-src`, `font-src`, `img-src`, `connect-src`, `frame-ancestors`, `base-uri`, and `form-action`.
- **GitHub Pages base path** — `vite.config.ts` now reads `VITE_BASE_PATH` env var (defaults `/`) so the app deploys correctly to sub-path Pages URLs (e.g. `username.github.io/repo-name/`).
- **Favicon relative path** — changed `/favicon.svg` → `./favicon.svg` in `index.html` to work with any base path.
- **Tooltip occlusion** — tooltips on composer bars and composition markers near the top of the timeline now flip below the element instead of being clipped by the container edge.
- **Focus Timeline occlusion** — "Focus Timeline" in the ComposerCard now accounts for the panel width, adding proportional right-side padding so the composer's full lifespan is visible in the unobscured area.
- **Collapsed bar hover info** — hovering a collapsed composer bar now correctly shows the name and year labels (previously missing due to React conditional preventing render).
- **Portrait URLs** — switched from broken `upload.wikimedia.org/thumb/` format to Wikimedia `Special:FilePath` redirect URLs.

### Changed

- **HelpPanel** — updated filter section to document nationality and genre chips; added composition detail section; added touch navigation tip.
- **FilterPanel accessibility** — era toggle now has `role="switch"` and `aria-pressed`; filter chips have `aria-pressed`; entire panel wrapped in `<nav aria-label="Timeline filters">`.
- **HelpPanel component** — in-app help panel (slide-in right) with keyboard shortcuts, navigation tips, filter and comparison mode guides. Accessible via `?` header button or `Shift+?` keyboard shortcut. Spec at `docs/specs/components/HelpPanel.md`.
- **ComparisonBar component** — header toolbar showing compared composer chips with × remove buttons and a Clear All action. Appears automatically when composers are added to comparison.
- **Comparison mode dimming & collapse** — when comparison mode is active (2+ composers), non-compared composers immediately dim (reduced opacity). After 3 seconds of inactivity, dimmed bars collapse from 28px → 6px height and expand back to full size on hover.
- **Comparison focus zoom** — when comparison collapse kicks in, the timeline auto-zooms to frame the compared composers' combined lifespans. Clearing comparison restores the original viewport.
- **Composer portraits** — all 31 composers now have `portraitUrl` fields pointing to Wikimedia Commons images (via `Special:FilePath` redirect URLs). Portraits appear in the ComposerCard header (120px circular) and in the ComposerBar hover tooltip (48px circular).
- **Event dimming** — historical event markers and composition markers dim during both single-composer focus and comparison mode to reduce visual clutter.
- **Comparison mode UX** — redesigned from single-click-then-button to Ctrl+click (Cmd+click on Mac) multi-select. If a composer detail panel is open, Ctrl+clicking another bar transfers both into comparison automatically. Comparison mode activates when 2+ composers are in the list. The ComposerCard `+ Compare` button remains as a secondary entry point, auto-closes the detail panel so the timeline is unblocked. Adding/removing any composer resets the 3-second collapse timer, keeping bars full-size while actively building the comparison.

## [0.1.0] — 2026-03-21

### Added

- **Project specification** (PROJECT_SPEC.md) — complete feature spec, user stories, milestones
- **Architecture document** (ARCHITECTURE.md) — ADRs for tech stack, rendering, state management
- **Data schema** (DATA_SCHEMA.md) — TypeScript interfaces for all entities
- **Component specs** — Timeline, ComposerCard, EraBackdrop, FilterPanel, CommandPalette, ComparisonView
- **Feature specs** — Timeline navigation, Wikipedia integration
- **AI API contract** (docs/api/ai-contract.md) — future AI integration endpoint definitions
- **Project scaffolding** — Vite + React 18 + TypeScript
- **Seed data** — 30 composers with biographies, 85+ compositions, 30+ historical events, 6 musical eras
- **State management** — Zustand stores for timeline, selection, filters, and comparison
- **Data hooks** — useComposers, useCompositions, useEvents, useEras, useContemporaries, and more
- **Services** — WikipediaService (with caching), AIService (stub for future integration)
- **Global styles** — Dark theme with CSS custom properties, typography system, era colors
