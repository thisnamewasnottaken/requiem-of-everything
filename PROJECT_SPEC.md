# Requiem of Everything — Project Specification

> An interactive timeline of classical music: composers, compositions, and the world that shaped them.

## 1. Vision

**Requiem of Everything** is a richly interactive web application that lets users explore the history of Western classical music through an immersive, zoomable timeline. It connects composers to their contemporaries, their works to the historical events that surrounded them, and musical eras to the broader arc of human civilization.

The goal is _discovery_: a user should be able to land on any point in time and immediately understand who was alive, what was being composed, and what was happening in the world — then follow any thread deeper.

## 2. Core User Stories

### 2.1 Timeline Explorer

- **As a user**, I can see a horizontal timeline spanning roughly 1580–1970 (late Renaissance through early Modern).
- **As a user**, I can zoom in/out and pan across the timeline smoothly.
- **As a user**, I see musical eras (Baroque, Classical, Romantic, Modern, etc.) as color-banded regions behind the timeline.
- **As a user**, I see composer lifespans as horizontal bars, vertically stacked, color-coded by era or nationality.
- **As a user**, I see major compositions as markers on the composer's lifespan bar at the year of composition.
- **As a user**, I see historical events as vertical markers that span the full timeline height, with labels.

### 2.2 Composer Discovery

- **As a user**, I can click on a composer to open a detail panel showing biography, key works, and contemporaries.
- **As a user**, I can see the "world" of a composer: who else was alive, what historical events happened during their life.
- **As a user**, I can compare two or more composers side-by-side on a focused timeline.

### 2.3 Composition Context

- **As a user**, I can click on a composition to see its details: when written, instrumentation, historical context.
- **As a user**, I can see what other composers were writing at the same time (± 5 years).
- **As a user**, I can see which historical events were happening at the time of composition.

### 2.4 Historical Events Layer

- **As a user**, I can toggle historical events on/off.
- **As a user**, I can filter events by category (Wars, Revolutions, Scientific Discoveries, Cultural Milestones, Political Events).
- **As a user**, events are sourced from or linked to Wikipedia for deeper reading.

### 2.5 Search & Filter

- **As a user**, I can search for a composer or composition by name.
- **As a user**, I can filter the timeline by era, nationality, or instrument.
- **As a user**, I can bookmark moments in time or composers for later exploration.

### 2.6 Future: AI-Powered Exploration

- **As a user**, I can ask natural-language questions like "Show me everything composed during the French Revolution" (future).
- **As a user**, I can request AI-generated summaries of a composer's relationship to their historical context (future).
- **As a user**, I can ask the AI to build a custom comparison view from selected composers/time periods (future).

## 3. Musical Eras

| Era            | Period     | Key Characteristics                                  |
| -------------- | ---------- | ---------------------------------------------------- |
| Renaissance    | ~1400–1600 | Polyphony, vocal music, sacred forms                 |
| Baroque        | ~1600–1750 | Ornamentation, basso continuo, opera birth           |
| Classical      | ~1750–1820 | Clarity, symmetry, sonata form                       |
| Early Romantic | ~1820–1850 | Emotional expression, programmatic music             |
| Late Romantic  | ~1850–1910 | Expanded orchestra, nationalism, chromaticism        |
| Modern         | ~1890–1970 | Atonality, serialism, neoclassicism, experimentation |

## 4. Non-Functional Requirements

| Requirement      | Target                                                       |
| ---------------- | ------------------------------------------------------------ |
| Performance      | 60fps timeline scrolling/zooming with 200+ composers loaded  |
| Responsiveness   | Desktop-first, tablet-friendly; mobile as stretch goal       |
| Accessibility    | Keyboard navigation, screen reader labels, contrast ratios   |
| Data Portability | All data in structured JSON; importable/exportable           |
| Extensibility    | Plugin-ready architecture for AI modules                     |
| Offline Capable  | Core experience works offline once loaded (PWA stretch goal) |

## 5. Technology Stack

| Layer                   | Choice                                          | Rationale                                               |
| ----------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| Framework               | React 19 with TypeScript                        | Component model, ecosystem, type safety                 |
| Build                   | Vite                                            | Fast HMR, modern defaults                               |
| Timeline Rendering      | D3.js + Custom React Components                 | Fine-grained control over timeline visualization        |
| State Management        | Zustand                                         | Lightweight, no boilerplate, good for zoom/filter state |
| Styling                 | CSS Modules + CSS Custom Properties             | Scoped styles, theming via variables                    |
| Animations              | Motion (Framer Motion)                          | Spring physics, staggered entry, AnimatePresence        |
| Data Layer              | Static JSON + fetch API                         | Start static, evolve to API                             |
| Internationalisation    | i18next + react-i18next                         | HTTP backend, 3 languages (en-GB, fr-FR, af-ZA)        |
| Wikipedia Integration   | Wikipedia REST API                              | Historical event enrichment                             |
| Testing                 | Vitest + Playwright                             | Unit + E2E, spec-driven                                 |
| AI Integration (future) | REST API contract (OpenAI/Anthropic-compatible) | Pluggable, provider-agnostic                            |

## 6. Development Approach — Spec-Driven

### 6.1 Principle

Every feature begins as a specification (this document + component specs), not as code. Code is an implementation of the spec; if the spec changes, the code is rebuilt to match.

### 6.2 Workflow

1. **Spec** → Write or update the spec for a feature in `docs/specs/`.
2. **Test** → Write failing tests that validate the spec in `src/__tests__/`.
3. **Implement** → Write the minimum code to make tests pass.
4. **Review** → Verify against spec, refine.
5. **Document** → Update `CHANGELOG.md` and component docs.

### 6.3 Rebuilding

Because all behavior is defined by specs and validated by tests, any component can be rebuilt from scratch at any time. The spec is the source of truth, not the current implementation.

## 7. AI Integration Architecture (Future-Ready)

### 7.1 Extension Points

The app is designed with clear seams where AI can be plugged in:

- **`/api/ai/query`** — Natural language → structured timeline filter
- **`/api/ai/summarize`** — Composer/era/event → narrative summary
- **`/api/ai/compare`** — Composer[] → comparison analysis
- **`/api/ai/enrich`** — Sparse data → enriched metadata
- **`/api/ai/suggest`** — Current view → "You might also explore..."

### 7.2 Contract

These endpoints follow a standard request/response contract defined in `docs/api/ai-contract.md`. Any AI provider (OpenAI, Anthropic, local model) can be wired in behind the contract.

### 7.3 UI Integration

- A command palette / search bar that accepts natural language
- An "Explore with AI" button on composer/era/event cards
- A "Build Custom View" dialog that uses AI to assemble filtered timelines

## 8. Data Sources

| Source               | What                               | How                       |
| -------------------- | ---------------------------------- | ------------------------- |
| Curated JSON         | Core composers, compositions, eras | Bundled with app          |
| Wikipedia REST API   | Historical events, composer bios   | Fetched on demand, cached |
| IMSLP (future)       | Score metadata, additional works   | API integration           |
| MusicBrainz (future) | Recording metadata                 | API integration           |

## 9. Project Structure

```
requiem-of-everything/
├── docs/
│   ├── specs/              # Feature specifications
│   ├── api/                # API contracts (including AI)
│   └── architecture/       # Architecture decisions
├── src/
│   ├── components/         # React components
│   │   ├── Timeline/       # Core timeline visualization
│   │   ├── ComposerBar/    # Composer lifespan bar (on timeline)
│   │   ├── ComposerCard/   # Composer detail panel
│   │   ├── CompositionMarker/ # Composition dot on timeline
│   │   ├── EventMarker/    # Historical event marker
│   │   ├── EraBackdrop/    # Era color bands
│   │   ├── TimeRuler/      # Year axis with tick labels
│   │   ├── FilterPanel/    # Search, filter controls
│   │   ├── ComparisonBar/  # Header toolbar for comparison mode
│   │   ├── HelpPanel/      # In-app help / keyboard shortcuts
│   │   └── CommandPalette/ # Search + future AI queries
│   ├── data/               # Static JSON data files
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services (Wikipedia, future AI)
│   ├── stores/             # Zustand state stores
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── styles/             # Global styles, CSS variables, themes
│   └── __tests__/          # Test files
├── scripts/                # Build & utility scripts
├── public/                 # Static assets
├── PROJECT_SPEC.md         # This file
├── ARCHITECTURE.md         # Technical architecture doc
├── DATA_SCHEMA.md          # Data model definitions
└── CHANGELOG.md            # Version history
```

## 10. Milestones

### M1 — Foundation (Current)

- [x] Project specification
- [x] Architecture document
- [x] Data schema definition
- [x] Project scaffolding (Vite + React + TS)
- [x] Seed data: 31 composers with portraits, biographies, and key works
- [x] Seed data: 30+ historical events

### M2 — Core Timeline

- [x] Zoomable, pannable horizontal timeline
- [x] Era backdrop bands
- [x] Composer lifespan bars (with greedy row-packing layout)
- [x] Composition markers (dots on timeline, zoom-level gated)
- [x] Time ruler with era labels

### M3 — Discovery

- [x] Composer detail panel (ComposerCard) with portrait, bio, compositions, contemporaries
- [x] Historical event markers with Wikipedia links
- [x] Search by name or tag
- [x] "Focus Timeline" zoom from ComposerCard (with panel-width inset compensation)

### M4 — Polish & Filters

- [x] Filter by era (checkboxes), search query
- [x] Comparison mode (Ctrl+click multi-select, up to 5 composers)
- [x] ComparisonBar header toolbar (chips + Clear All)
- [x] Comparison focus zoom + viewport restore on exit
- [x] In-app HelpPanel with keyboard shortcuts guide
- [x] Composer portraits (Wikimedia Commons, 120px card / 48px tooltip)
- [x] Event and composition marker dimming in focus/comparison modes
- [x] Keyboard navigation: `F` (filters), `R` (reset), `?` (help), `Esc` (close panels)
- [x] Filter by nationality, instrument, genre
- [x] Composition detail panel
- [x] Responsive / mobile layout

### M5 — AI Integration

- [ HOLD ] AI contract definition
- [ HOLD ] Command palette with natural language input
- [ HOLD ] AI-powered summaries
- [ HOLD ] Custom view builder
- [ HOLD ] "Explore with AI" buttons

### M6 — Internationalization & Expanded Data

- [x] Internationalization support (i18n)
- [x] English (United Kingdom) as default language (NOT English (United States))
- [x] French (France) localization as first target language
- [x] Afrikaans (South Africa) localization as second target language
- [x] Content localisation (composer bios, composition descriptions, event descriptions, era names) via i18next namespaces — en-GB, fr-FR, af-ZA
- [x] Terms and instruments content localisation (fr-FR, af-ZA)
- [x] Expanded composition dataset in addition to notable works (All major works for each composer, with metadata)
- [x] Spotify links for notable works where available
- [x] Expanded composer dataset (next tier of notable composers, with portraits and bios)
- [x] Expanded historical events dataset
- [ HOLD ] Localization of AI-generated content

---

_This spec is the source of truth. Code implements the spec. When requirements change, update the spec first, then rebuild._
