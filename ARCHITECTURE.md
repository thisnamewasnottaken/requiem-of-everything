# Architecture — Requiem of Everything

> Technical architecture decisions and patterns.

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Browser Client                       │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Timeline    │  │  Discovery   │  │  Command      │  │
│  │  Viewport    │  │  Panels      │  │  Palette      │  │
│  │  (D3 + React)│  │  (React)     │  │  (Planned)    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬────────┘  │
│         │                 │                  │           │
│  ┌──────┴─────────────────┴──────────────────┴────────┐  │
│  │              Zustand State Store                    │  │
│  │  (viewport, selections, filters, comparison mode)  │  │
│  └──────┬─────────────────┬──────────────────┬────────┘  │
│         │                 │                  │           │
│  ┌──────┴───────┐  ┌──────┴───────┐  ┌──────┴────────┐  │
│  │  Data Layer  │  │  Wikipedia   │  │  AI Service   │  │
│  │  (Static JSON│  │  Service     │  │  (Future)     │  │
│  │   + hooks)   │  │  (REST API)  │  │               │  │
│  └──────────────┘  └──────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 2. Key Architecture Decisions

### ADR-001: React + TypeScript + Vite

**Decision**: Use React 19 with TypeScript, bundled by Vite.

**Rationale**: React provides the component model needed for composable UI elements (timeline, panels, markers). TypeScript ensures that the data contracts from `DATA_SCHEMA.md` are enforced at compile time. Vite provides instant HMR for a fast development loop.

**Consequences**: Need to manage D3 integration carefully since D3 wants DOM control; we use D3 for math/scales only and let React handle rendering.

---

### ADR-002: D3 for Math, React for Rendering

**Decision**: Use D3.js only for scales, axis calculations, and data transformations. All DOM rendering is done by React.

**Rationale**: Letting D3 and React both manipulate the DOM leads to conflicts. By using D3 as a "math library" — computing pixel positions from year values, generating tick marks — and React for rendering SVG/HTML, we get the best of both worlds.

**Pattern**:

```typescript
// D3 computes the scale
const xScale = d3.scaleLinear()
  .domain([viewStartYear, viewEndYear])
  .range([0, viewportWidth]);

// React renders using the scale
<rect x={xScale(composer.birthYear)} width={xScale(composer.deathYear) - xScale(composer.birthYear)} />
```

---

### ADR-003: Zustand for State Management

**Decision**: Use Zustand for global application state.

**Rationale**: The timeline has significant shared state (viewport bounds, zoom level, selected composers, active filters) that many components need. Zustand is minimal (no Provider wrappers, no reducers), performant (selective subscriptions), and integrates cleanly with React.

**Store Structure**:

- `useTimelineStore` — viewport, zoom, pan
- `useSelectionStore` — selected composers, compositions
- `useFilterStore` — era, nationality, genre, event category filters
- `useComparisonStore` — comparison mode state

---

### ADR-004: Static JSON First, API Later

**Decision**: Ship with bundled JSON data files. Design the data access layer as async hooks so it can be swapped to an API later.

**Rationale**: Starting with static JSON removes backend complexity and lets us iterate on the UI. The data access hooks (`useComposers()`, `useCompositions()`, `useEvents()`) return the same shape regardless of whether data comes from a JSON import or an API call, so migration is seamless.

**Pattern**:

```typescript
// Today: static import
export function useComposers(): Composer[] {
  return composersData;
}

// Tomorrow: API call
export function useComposers(): Composer[] {
  const { data } = useSWR("/api/composers", fetcher);
  return data ?? [];
}
```

---

### ADR-005: Wikipedia Integration via REST API

**Decision**: Use the Wikipedia REST API (`en.wikipedia.org/api/rest_v1/`) for historical event data and composer biographies.

**Rationale**: Wikipedia has comprehensive, freely available data on historical events and composers. The REST API provides clean summaries without needing to parse wikitext.

**Endpoints Used**:

- `/page/summary/{slug}` — Short summary and thumbnail
- `/page/mobile-html/{slug}` — Full article HTML (for detail views)

**Caching**: Responses are cached in `localStorage` with a 24-hour TTL to avoid redundant requests.

---

### ADR-006: AI-Ready Extension Points

**Decision**: Define a clear API contract for AI features now, implement later.

**Rationale**: By designing the AI integration surface upfront — the request/response types, the UI extension points (command palette, "Explore with AI" buttons), and the action system (AI can instruct the UI to navigate/filter) — we can build AI features incrementally without refactoring the core app.

**Contract**: See `docs/api/ai-contract.md`.

**Key Principle**: AI features are _additive_. The core timeline works perfectly without AI. AI enhances discovery but is never required.

---

### ADR-007: Component Specification Pattern

**Decision**: Every UI component has a spec file in `docs/specs/components/` that defines its props, behavior, states, and accessibility requirements before implementation begins.

**Rationale**: This supports the "spec-driven development" approach — the spec is the source of truth, and the implementation can be rebuilt from the spec at any time. Specs also serve as documentation.

**Spec Template**:

```markdown
# Component: [Name]

## Purpose

## Props / Inputs

## Visual States

## Interactions

## Accessibility

## Dependencies

## Test Scenarios
```

---

## 3. Rendering Architecture

### 3.1 Timeline Layers (bottom to top)

```
Layer 5: UI Overlays (tooltips, detail panels)          — HTML/CSS
Layer 4: Historical Event Markers                       — HTML/CSS
Layer 3: Composition Markers                            — HTML/CSS
Layer 2: Composer Lifespan Bars                         — HTML/CSS
Layer 1: Era Backdrop Bands                             — HTML/CSS (div overlays)
Layer 0: Time Ruler & Grid Lines                        — HTML/CSS
```

Each layer is a React component that receives the D3 scale and renders its content. Layers are composable and independently toggleable.

### 3.2 Viewport Management

The timeline viewport is defined by `(viewStartYear, viewEndYear)`. All positioning is derived from a D3 linear scale mapping years to pixels.

**Zoom**: Changes the year range while keeping the center point fixed.
**Pan**: Shifts both start and end years by the same delta.
**Scroll Zoom**: Mouse wheel on the timeline area.
**Pinch Zoom**: Touch gesture (stretch goal).

### 3.3 Performance Strategy

- **Virtualization**: Only render composers/events within the current viewport ± margin.
- **Debounced Updates**: Zoom/pan updates are debounced to prevent re-render storms.
- **Memoization**: Heavy computations (filtering, sorting, position calculations) are memoized with `useMemo`.
- **SVG Optimization**: Group elements by layer, minimize re-renders with React keys.

## 4. Folder Conventions

| Folder                                      | Contains                                   | Naming                     |
| ------------------------------------------- | ------------------------------------------ | -------------------------- |
| `src/components/`                           | React components, one folder per component | `PascalCase/`              |
| `src/components/*/ComponentName.tsx`        | Component entry point                      | `ComponentName.tsx`        |
| `src/components/*/ComponentName.module.css` | Component styles                           | `ComponentName.module.css` |
| `src/hooks/`                                | Custom React hooks                         | `use*.ts`                  |
| `src/stores/`                               | Zustand stores                             | `use*Store.ts`             |
| `src/services/`                             | External API services                      | `*Service.ts`              |
| `src/types/`                                | TypeScript type definitions                | `*.ts`                     |
| `src/data/`                                 | Static JSON data                           | `*.json`                   |
| `src/utils/`                                | Pure utility functions                     | `*.ts`                     |
| `docs/specs/`                               | Feature and component specs                | `*.md`                     |
| `docs/api/`                                 | API contracts                              | `*.md`                     |

## 5. Testing Strategy

| Level       | Tool                     | What                                           |
| ----------- | ------------------------ | ---------------------------------------------- |
| Unit        | Vitest                   | Utility functions, data transformations, hooks |
| Component   | Vitest + Testing Library | Component rendering, interactions              |
| Integration | Vitest                   | Store interactions, data flow                  |
| E2E         | Playwright               | Full user journeys, visual regression          |

**Spec-Test Alignment**: Each spec in `docs/specs/` maps to a test file in `src/__tests__/`. The test file name mirrors the spec file name.

---

_Architecture decisions are numbered (ADR-NNN) and append-only. To change a decision, write a new ADR that supersedes the old one._
