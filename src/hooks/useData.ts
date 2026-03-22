import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type {
  Composer,
  Composition,
  HistoricalEvent,
  Instrument,
  InstrumentFamily,
  MusicalEraDefinition,
  MusicalTerm,
  TermCategory,
} from "@/types";

import composersData from "@/data/composers.json";
import compositionsData from "@/data/compositions.json";
import eventsData from "@/data/events.json";
import erasData from "@/data/eras.json";
import termsData from "@/data/terms.json";
import instrumentsData from "@/data/instruments.json";

// ---------------------------------------------------------------------------
// Internal helpers — compute full translated arrays, memoised per language
// ---------------------------------------------------------------------------

function useTranslatedComposers(): Composer[] {
  const { t } = useTranslation("composers");
  return useMemo(
    () =>
      (composersData as Composer[]).map((c) => ({
        ...c,
        name: t(`${c.id}.name`, { defaultValue: c.name }),
        shortName: t(`${c.id}.shortName`, { defaultValue: c.shortName }),
        biography: t(`${c.id}.biography`, { defaultValue: c.biography }),
        birthPlace: t(`${c.id}.birthPlace`, { defaultValue: c.birthPlace }),
        nationality: t(`${c.id}.nationality`, {
          defaultValue: c.nationality,
        }),
      })),
    [t],
  );
}

function useTranslatedCompositions(): Composition[] {
  const { t } = useTranslation("compositions");
  return useMemo(
    () =>
      (compositionsData as Composition[]).map((c) => ({
        ...c,
        title: t(`${c.id}.title`, { defaultValue: c.title }),
        description: t(`${c.id}.description`, {
          defaultValue: c.description,
        }),
        significance: t(`${c.id}.significance`, {
          defaultValue: c.significance ?? "",
        }) || undefined,
        instrumentation: t(`${c.id}.instrumentation`, {
          defaultValue: c.instrumentation,
        }),
      })),
    [t],
  );
}

function useTranslatedEvents(): HistoricalEvent[] {
  const { t } = useTranslation("events");
  return useMemo(
    () =>
      (eventsData as HistoricalEvent[]).map((e) => ({
        ...e,
        title: t(`${e.id}.title`, { defaultValue: e.title }),
        description: t(`${e.id}.description`, {
          defaultValue: e.description,
        }),
        musicalSignificance: t(`${e.id}.musicalSignificance`, {
          defaultValue: e.musicalSignificance ?? "",
        }) || undefined,
        region: t(`${e.id}.region`, {
          defaultValue: e.region ?? "",
        }) || undefined,
      })),
    [t],
  );
}

function useTranslatedEras(): MusicalEraDefinition[] {
  const { t } = useTranslation("eras");
  return useMemo(
    () =>
      (erasData as MusicalEraDefinition[]).map((e) => ({
        ...e,
        name: t(`${e.id}.name`, { defaultValue: e.name }),
        description: t(`${e.id}.description`, {
          defaultValue: e.description,
        }),
        characteristics: (
          t(`${e.id}.characteristics`, {
            returnObjects: true,
            defaultValue: e.characteristics,
          }) as string[]
        ),
      })),
    [t],
  );
}

// ---------------------------------------------------------------------------
// Public hooks
// ---------------------------------------------------------------------------

/**
 * Returns a single composition by ID (with translated fields).
 */
export function useComposition(id: string): Composition | undefined {
  const compositions = useTranslatedCompositions();
  return useMemo(() => compositions.find((c) => c.id === id), [compositions, id]);
}

/**
 * Returns all composers (with translated fields).
 * Today: static JSON import merged with i18n namespace.
 * Tomorrow: could be an async API call via useSWR/React Query.
 */
export function useComposers(): Composer[] {
  return useTranslatedComposers();
}

/**
 * Returns a single composer by ID (with translated fields).
 */
export function useComposer(id: string): Composer | undefined {
  const composers = useTranslatedComposers();
  return useMemo(() => composers.find((c) => c.id === id), [composers, id]);
}

/**
 * Returns all compositions (with translated fields).
 */
export function useCompositions(): Composition[] {
  return useTranslatedCompositions();
}

/**
 * Returns compositions for a specific composer (with translated fields).
 */
export function useCompositionsByComposer(composerId: string): Composition[] {
  const compositions = useTranslatedCompositions();
  return useMemo(
    () => compositions.filter((c) => c.composerId === composerId),
    [compositions, composerId],
  );
}

/**
 * Returns all historical events (with translated fields).
 */
export function useEvents(): HistoricalEvent[] {
  return useTranslatedEvents();
}

/**
 * Returns all musical era definitions (with translated fields).
 */
export function useEras(): MusicalEraDefinition[] {
  return useTranslatedEras();
}

/**
 * Returns composers who were alive during a given year (with translated fields).
 */
export function useContemporaries(year: number): Composer[] {
  const composers = useTranslatedComposers();
  return useMemo(
    () =>
      composers.filter(
        (c) =>
          c.birthYear <= year &&
          (c.deathYear === null || c.deathYear >= year),
      ),
    [composers, year],
  );
}

/**
 * Returns composers whose lifespans overlap with a given composer (with translated fields).
 */
export function useComposerContemporaries(composerId: string): Composer[] {
  const composers = useTranslatedComposers();
  return useMemo(() => {
    const composer = composers.find((c) => c.id === composerId);
    if (!composer) return [];

    return composers.filter((c) => {
      if (c.id === composerId) return false;
      const deathYear = composer.deathYear ?? 2025;
      const otherDeathYear = c.deathYear ?? 2025;
      return c.birthYear < deathYear && otherDeathYear > composer.birthYear;
    });
  }, [composers, composerId]);
}

/**
 * Returns compositions written within a given year range (with translated fields).
 */
export function useCompositionsInRange(
  startYear: number,
  endYear: number,
): Composition[] {
  const compositions = useTranslatedCompositions();
  return useMemo(
    () =>
      compositions.filter(
        (c) => c.yearComposed >= startYear && c.yearComposed <= endYear,
      ),
    [compositions, startYear, endYear],
  );
}

/**
 * Returns events occurring within a given year range (with translated fields).
 */
export function useEventsInRange(
  startYear: number,
  endYear: number,
): HistoricalEvent[] {
  const events = useTranslatedEvents();
  return useMemo(
    () =>
      events.filter(
        (e) => e.year <= endYear && (e.endYear ?? e.year) >= startYear,
      ),
    [events, startYear, endYear],
  );
}

// ---------------------------------------------------------------------------
// Musical Terms / Glossary hooks
// ---------------------------------------------------------------------------

/**
 * Returns all musical term definitions.
 */
export function useTerms(): MusicalTerm[] {
  return termsData as MusicalTerm[];
}

/**
 * Returns a single musical term by ID.
 */
export function useTerm(id: string): MusicalTerm | undefined {
  return (termsData as MusicalTerm[]).find((t) => t.id === id);
}

/**
 * Returns musical terms filtered by category.
 */
export function useTermsByCategory(category: TermCategory): MusicalTerm[] {
  return (termsData as MusicalTerm[]).filter((t) =>
    t.categories.includes(category),
  );
}

// ---------------------------------------------------------------------------
// Instrument hooks
// ---------------------------------------------------------------------------

/**
 * Returns all orchestral instruments.
 */
export function useInstruments(): Instrument[] {
  return instrumentsData as Instrument[];
}

/**
 * Returns a single instrument by ID.
 */
export function useInstrument(id: string): Instrument | undefined {
  return (instrumentsData as Instrument[]).find((i) => i.id === id);
}

/**
 * Returns instruments belonging to a specific family.
 */
export function useInstrumentsByFamily(family: InstrumentFamily): Instrument[] {
  return (instrumentsData as Instrument[]).filter((i) => i.family === family);
}
