// ============================================================================
// Requiem of Everything — Core Type Definitions
// ============================================================================
// These types are the single source of truth for all data structures.
// They mirror the DATA_SCHEMA.md specification.
// ============================================================================

// --- Musical Eras ---

export type MusicalEra =
  | "renaissance"
  | "baroque"
  | "classical"
  | "early-romantic"
  | "late-romantic"
  | "modern";

export interface MusicalEraDefinition {
  id: MusicalEra;
  name: string;
  startYear: number;
  endYear: number;
  description: string;
  color: string;
  characteristics: string[];
}

// --- Composers ---

export interface Composer {
  id: string;
  name: string;
  shortName: string;
  birthYear: number;
  deathYear: number | null;
  birthPlace: string;
  nationality: string;
  era: MusicalEra;
  secondaryEras?: MusicalEra[];
  biography: string;
  portraitUrl?: string;
  wikipediaSlug: string;
  compositionIds: string[];
  tags: string[];
}

// --- Compositions ---

export type CompositionGenre =
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

export interface Composition {
  id: string;
  title: string;
  catalogueNumber?: string;
  composerId: string;
  yearComposed: number;
  yearCompleted?: number;
  yearPremiere?: number;
  genre: CompositionGenre;
  instrumentation: string;
  key?: string;
  description: string;
  significance?: string;
  wikipediaSlug?: string;
  tags: string[];
  spotifyUrl?: string;
}

// --- Historical Events ---

export type EventCategory =
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

export interface HistoricalEvent {
  id: string;
  title: string;
  year: number;
  endYear?: number;
  category: EventCategory;
  description: string;
  musicalSignificance?: string;
  wikipediaSlug: string;
  region?: string;
}

// --- Timeline State ---

export interface TimelineState {
  viewStartYear: number;
  viewEndYear: number;
  zoomLevel: number;
  selectedComposerIds: string[];
  selectedCompositionId: string | null;
  eraFilters: MusicalEra[];
  nationalityFilters: string[];
  genreFilters: CompositionGenre[];
  showHistoricalEvents: boolean;
  eventCategoryFilters: EventCategory[];
  searchQuery: string;
  comparisonComposerIds: string[];
}

// --- AI Integration (Future) ---

export interface AIQueryRequest {
  query: string;
  context: {
    viewStartYear: number;
    viewEndYear: number;
    selectedComposerIds: string[];
    selectedCompositionId: string | null;
  };
  operation: "query" | "summarize" | "compare" | "enrich" | "suggest";
}

export interface AIQueryResponse {
  narrative?: string;
  actions?: TimelineAction[];
  suggestions?: string[];
  sources?: { title: string; url: string }[];
}

export type TimelineAction =
  | { type: "focus-year"; year: number }
  | { type: "focus-range"; startYear: number; endYear: number }
  | { type: "select-composers"; composerIds: string[] }
  | { type: "select-composition"; compositionId: string }
  | { type: "filter-era"; eras: MusicalEra[] }
  | { type: "highlight-events"; eventIds: string[] }
  | { type: "show-comparison"; composerIds: string[] };

// --- Wikipedia Service ---

export interface WikiSummary {
  title: string;
  extract: string;
  description?: string;
  thumbnailUrl?: string;
  articleUrl: string;
}

// --- Musical Terms / Glossary ---

export type TermCategory =
  | "forms-and-structures"
  | "genres"
  | "techniques"
  | "vocal-and-choral"
  | "dance-and-character"
  | "solo-and-chamber";

export interface MusicalTerm {
  id: string;
  term: string;
  shortDefinition: string;
  longDefinition: string;
  categories: TermCategory[];
  eraOrigin: MusicalEra[];
  exampleCompositionIds: string[];
  wikipediaSlug: string;
}

// --- Orchestral Instruments ---

export type InstrumentFamily =
  | "strings"
  | "woodwinds"
  | "brass"
  | "percussion"
  | "keyboards"
  | "voice";

export interface Instrument {
  id: string;
  name: string;
  family: InstrumentFamily;
  range: string;
  role: string;
  description: string;
  eraProminence: { era: MusicalEra; prominence: "primary" | "secondary" | "rare" }[];
  wikipediaSlug: string;
}
