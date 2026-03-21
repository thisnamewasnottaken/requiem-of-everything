# Data Schema — Requiem of Everything

> Type definitions and data models for all entities in the system.

All runtime data is stored as typed JSON. These schemas are the contract between the data files, the UI components, and future API integrations.

---

## 1. Composer

```typescript
interface Composer {
  /** Unique identifier (kebab-case: "johann-sebastian-bach") */
  id: string;

  /** Full display name */
  name: string;

  /** Short name for compact displays */
  shortName: string;

  /** Birth year (integer, e.g., 1685) */
  birthYear: number;

  /** Death year (integer, null if still living) */
  deathYear: number | null;

  /** Birth location */
  birthPlace: string;

  /** Country/region of primary activity */
  nationality: string;

  /** Primary musical era */
  era: MusicalEra;

  /** Secondary eras if they span transitions */
  secondaryEras?: MusicalEra[];

  /** One-paragraph biography */
  biography: string;

  /** URL to portrait image */
  portraitUrl?: string;

  /** Wikipedia article slug for deep linking */
  wikipediaSlug: string;

  /** Notable compositions (references by ID) */
  compositionIds: string[];

  /** Tags for filtering (e.g., ["pianist", "german", "fugue"]) */
  tags: string[];
}
```

## 2. Composition

```typescript
interface Composition {
  /** Unique identifier (kebab-case: "bach-well-tempered-clavier-book-1") */
  id: string;

  /** Full title */
  title: string;

  /** Catalogue number if applicable (e.g., "BWV 846–869", "Op. 27 No. 2") */
  catalogueNumber?: string;

  /** Composer ID (foreign key) */
  composerId: string;

  /** Year of composition (or start year if composed over time) */
  yearComposed: number;

  /** End year if composed over a span */
  yearCompleted?: number;

  /** Year of first public performance, if known */
  yearPremiere?: number;

  /** Musical form/genre */
  genre: CompositionGenre;

  /** Instrumentation or performing forces */
  instrumentation: string;

  /** Key signature if applicable */
  key?: string;

  /** One-paragraph description */
  description: string;

  /** Why this piece matters — historical/musical significance */
  significance?: string;

  /** Wikipedia article slug */
  wikipediaSlug?: string;

  /** Tags for filtering */
  tags: string[];

  /** Spotify URL for listening (search or direct link) */
  spotifyUrl?: string;
}
```

## 3. Historical Event

```typescript
interface HistoricalEvent {
  /** Unique identifier */
  id: string;

  /** Event title */
  title: string;

  /** Year the event started */
  year: number;

  /** End year for spanning events (wars, etc.) */
  endYear?: number;

  /** Event category */
  category: EventCategory;

  /** One-paragraph description */
  description: string;

  /** Why this matters for music history */
  musicalSignificance?: string;

  /** Wikipedia article slug */
  wikipediaSlug: string;

  /** Geographic region */
  region?: string;
}
```

## 4. Musical Era

```typescript
interface MusicalEraDefinition {
  /** Era identifier */
  id: MusicalEra;

  /** Display name */
  name: string;

  /** Approximate start year */
  startYear: number;

  /** Approximate end year */
  endYear: number;

  /** One-paragraph description */
  description: string;

  /** Primary CSS color (used for era bands) */
  color: string;

  /** Key characteristics */
  characteristics: string[];
}

type MusicalEra =
  | "renaissance"
  | "baroque"
  | "classical"
  | "early-romantic"
  | "late-romantic"
  | "modern";
```

## 5. Enums

```typescript
type CompositionGenre =
  | "symphony"
  | "concerto"
  | "sonata"
  | "opera"
  | "oratorio"
  | "mass"
  | "requiem"
  | "chamber-music"
  | "string-quartet"
  | "piano-solo"
  | "choral"
  | "art-song"
  | "ballet"
  | "overture"
  | "suite"
  | "prelude"
  | "fugue"
  | "etude"
  | "nocturne"
  | "waltz"
  | "mazurka"
  | "polonaise"
  | "rhapsody"
  | "tone-poem"
  | "variation"
  | "cantata"
  | "motet"
  | "other";

type EventCategory =
  | "war"
  | "revolution"
  | "political"
  | "scientific"
  | "cultural"
  | "literary"
  | "artistic"
  | "technological"
  | "religious"
  | "natural-disaster";
```

## 6. Timeline View State

These types represent the current state of the timeline UI and are managed by Zustand:

```typescript
interface TimelineState {
  /** Current viewport: start year */
  viewStartYear: number;

  /** Current viewport: end year */
  viewEndYear: number;

  /** Zoom level (1 = show all, higher = more zoomed) */
  zoomLevel: number;

  /** Currently selected composer IDs (for highlighting) */
  selectedComposerIds: string[];

  /** Currently selected composition ID (for detail panel) */
  selectedCompositionId: string | null;

  /** Active era filters (empty = show all) */
  eraFilters: MusicalEra[];

  /** Active nationality filters */
  nationalityFilters: string[];

  /** Active genre filters */
  genreFilters: CompositionGenre[];

  /** Whether historical events layer is visible */
  showHistoricalEvents: boolean;

  /** Active event category filters */
  eventCategoryFilters: EventCategory[];

  /** Search query */
  searchQuery: string;

  /** Comparison mode: which composers to compare */
  comparisonComposerIds: string[];
}
```

## 7. AI Integration Types (Future)

```typescript
/** Request to the AI service */
interface AIQueryRequest {
  /** Natural language query from the user */
  query: string;

  /** Current timeline context (what the user is looking at) */
  context: {
    viewStartYear: number;
    viewEndYear: number;
    selectedComposerIds: string[];
    selectedCompositionId: string | null;
  };

  /** Type of AI operation */
  operation: "query" | "summarize" | "compare" | "enrich" | "suggest";
}

/** Response from the AI service */
interface AIQueryResponse {
  /** Narrative text response */
  narrative?: string;

  /** Structured actions to apply to the timeline */
  actions?: TimelineAction[];

  /** Suggested follow-up queries */
  suggestions?: string[];

  /** Sources cited */
  sources?: { title: string; url: string }[];
}

/** An action the AI can tell the UI to perform */
type TimelineAction =
  | { type: "focus-year"; year: number }
  | { type: "focus-range"; startYear: number; endYear: number }
  | { type: "select-composers"; composerIds: string[] }
  | { type: "select-composition"; compositionId: string }
  | { type: "filter-era"; eras: MusicalEra[] }
  | { type: "highlight-events"; eventIds: string[] }
  | { type: "show-comparison"; composerIds: string[] };
```

## 8. Data File Conventions

- All data lives in `src/data/`
- One file per entity type: `composers.json`, `compositions.json`, `events.json`, `eras.json`
- IDs are kebab-case and globally unique within their type
- Years are integers (negative for BCE if ever needed)
- All text fields support Markdown
- Wikipedia slugs are the article path segment (e.g., `"Johann_Sebastian_Bach"`)

---

_This schema is versioned with the project. Changes to the schema must be reflected in the TypeScript types in `src/types/` and validated by tests._
