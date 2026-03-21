import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  useComposers,
  useComposer,
  useCompositions,
  useComposition,
  useCompositionsByComposer,
  useEvents,
  useEras,
  useContemporaries,
  useComposerContemporaries,
  useCompositionsInRange,
  useEventsInRange,
} from "@/hooks/useData";

// All data hooks use React hooks internally (useTranslation, useMemo)
// so they must be called via renderHook.

describe("useComposers", () => {
  it("returns a non-empty array", () => {
    const { result } = renderHook(() => useComposers());
    expect(Array.isArray(result.current)).toBe(true);
    expect(result.current.length).toBeGreaterThan(0);
  });

  it("each composer has the required fields", () => {
    const { result } = renderHook(() => useComposers());
    for (const c of result.current) {
      expect(typeof c.id).toBe("string");
      expect(typeof c.name).toBe("string");
      expect(typeof c.birthYear).toBe("number");
      expect(typeof c.era).toBe("string");
      expect(typeof c.nationality).toBe("string");
      expect(Array.isArray(c.compositionIds)).toBe(true);
    }
  });
});

describe("useComposer", () => {
  it("returns the correct composer by id", () => {
    const { result: allResult } = renderHook(() => useComposers());
    const first = allResult.current[0];
    const { result } = renderHook(() => useComposer(first.id));
    expect(result.current).toBeDefined();
    expect(result.current?.id).toBe(first.id);
  });

  it("returns undefined for an unknown id", () => {
    const { result } = renderHook(() => useComposer("non-existent-id"));
    expect(result.current).toBeUndefined();
  });
});

describe("useCompositions", () => {
  it("returns a non-empty array", () => {
    const { result } = renderHook(() => useCompositions());
    expect(result.current.length).toBeGreaterThan(0);
  });

  it("each composition has the required fields", () => {
    const { result } = renderHook(() => useCompositions());
    for (const c of result.current) {
      expect(typeof c.id).toBe("string");
      expect(typeof c.title).toBe("string");
      expect(typeof c.composerId).toBe("string");
      expect(typeof c.yearComposed).toBe("number");
      expect(typeof c.genre).toBe("string");
      expect(typeof c.instrumentation).toBe("string");
    }
  });
});

describe("useComposition", () => {
  it("returns the correct composition by id", () => {
    const { result: allResult } = renderHook(() => useCompositions());
    const first = allResult.current[0];
    const { result } = renderHook(() => useComposition(first.id));
    expect(result.current).toBeDefined();
    expect(result.current?.id).toBe(first.id);
  });

  it("returns undefined for an unknown id", () => {
    const { result } = renderHook(() => useComposition("non-existent-composition"));
    expect(result.current).toBeUndefined();
  });
});

describe("useCompositionsByComposer", () => {
  it("returns only compositions for the specified composer", () => {
    const { result: allResult } = renderHook(() => useCompositions());
    const composerId = allResult.current[0].composerId;
    const { result } = renderHook(() => useCompositionsByComposer(composerId));
    expect(result.current.every((c) => c.composerId === composerId)).toBe(true);
  });

  it("returns an empty array for an unknown composer id", () => {
    const { result } = renderHook(() => useCompositionsByComposer("non-existent"));
    expect(result.current).toEqual([]);
  });

  it("all compositions link to a real composer", () => {
    const { result: composersResult } = renderHook(() => useComposers());
    const composerIds = new Set(composersResult.current.map((c) => c.id));
    const { result: compositionsResult } = renderHook(() => useCompositions());
    for (const comp of compositionsResult.current) {
      expect(composerIds.has(comp.composerId)).toBe(true);
    }
  });
});

describe("useEvents", () => {
  it("returns a non-empty array of historical events", () => {
    const { result } = renderHook(() => useEvents());
    expect(result.current.length).toBeGreaterThan(0);
  });

  it("each event has id, title, year, and category", () => {
    const { result } = renderHook(() => useEvents());
    for (const e of result.current) {
      expect(typeof e.id).toBe("string");
      expect(typeof e.title).toBe("string");
      expect(typeof e.year).toBe("number");
      expect(typeof e.category).toBe("string");
    }
  });
});

describe("useEras", () => {
  it("returns exactly 6 musical eras", () => {
    const { result } = renderHook(() => useEras());
    expect(result.current).toHaveLength(6);
  });

  it("each era has id, name, startYear, endYear, and color", () => {
    const { result } = renderHook(() => useEras());
    for (const e of result.current) {
      expect(typeof e.id).toBe("string");
      expect(typeof e.name).toBe("string");
      expect(typeof e.startYear).toBe("number");
      expect(typeof e.endYear).toBe("number");
      expect(typeof e.color).toBe("string");
    }
  });
});

describe("useContemporaries", () => {
  it("returns composers alive in 1750", () => {
    const { result } = renderHook(() => useContemporaries(1750));
    for (const c of result.current) {
      expect(c.birthYear).toBeLessThanOrEqual(1750);
      const death = c.deathYear ?? 9999;
      expect(death).toBeGreaterThanOrEqual(1750);
    }
  });

  it("returns an empty array for a year before all composers were born", () => {
    const { result } = renderHook(() => useContemporaries(1000));
    expect(result.current).toEqual([]);
  });
});

describe("useComposerContemporaries", () => {
  it("excludes the composer themselves", () => {
    const { result: composersResult } = renderHook(() => useComposers());
    const id = composersResult.current[0].id;
    const { result } = renderHook(() => useComposerContemporaries(id));
    expect(result.current.every((c) => c.id !== id)).toBe(true);
  });

  it("returns an empty array for an unknown composer id", () => {
    const { result } = renderHook(() => useComposerContemporaries("non-existent"));
    expect(result.current).toEqual([]);
  });
});

describe("useCompositionsInRange", () => {
  it("returns compositions within the given year range", () => {
    const { result } = renderHook(() => useCompositionsInRange(1700, 1800));
    for (const c of result.current) {
      expect(c.yearComposed).toBeGreaterThanOrEqual(1700);
      expect(c.yearComposed).toBeLessThanOrEqual(1800);
    }
  });

  it("returns an empty array for an impossible range", () => {
    const { result } = renderHook(() => useCompositionsInRange(3000, 3100));
    expect(result.current).toEqual([]);
  });
});

describe("useEventsInRange", () => {
  it("returns events that overlap the given year range", () => {
    const { result } = renderHook(() => useEventsInRange(1700, 1800));
    expect(result.current.length).toBeGreaterThan(0);
    for (const e of result.current) {
      const end = e.endYear ?? e.year;
      expect(e.year).toBeLessThanOrEqual(1800);
      expect(end).toBeGreaterThanOrEqual(1700);
    }
  });

  it("returns an empty array for an impossible range", () => {
    const { result } = renderHook(() => useEventsInRange(3000, 3100));
    expect(result.current).toEqual([]);
  });
});

// --- Data integrity ---

describe("data integrity", () => {
  it("each composer's compositionIds resolve to real compositions", () => {
    const { result: compositionsResult } = renderHook(() => useCompositions());
    const compositionIds = new Set(compositionsResult.current.map((c) => c.id));
    const { result: composersResult } = renderHook(() => useComposers());
    for (const composer of composersResult.current) {
      for (const id of composer.compositionIds) {
        expect(compositionIds.has(id)).toBe(true);
      }
    }
  });

  it("has no duplicate composition IDs", () => {
    const { result } = renderHook(() => useCompositions());
    const ids = result.current.map((c) => c.id);
    const unique = new Set(ids);
    expect(ids.length).toBe(unique.size);
  });

  it("has no duplicate composer IDs", () => {
    const { result } = renderHook(() => useComposers());
    const ids = result.current.map((c) => c.id);
    const unique = new Set(ids);
    expect(ids.length).toBe(unique.size);
  });

  it("all composition composerIds reference existing composers", () => {
    const { result: composersResult } = renderHook(() => useComposers());
    const composerIds = new Set(composersResult.current.map((c) => c.id));
    const { result: compositionsResult } = renderHook(() => useCompositions());
    for (const comp of compositionsResult.current) {
      expect(composerIds.has(comp.composerId)).toBe(true);
    }
  });

  it("all composer compositionIds reference existing compositions", () => {
    const { result: compositionsResult } = renderHook(() => useCompositions());
    const compositionIds = new Set(compositionsResult.current.map((c) => c.id));
    const { result: composersResult } = renderHook(() => useComposers());
    for (const composer of composersResult.current) {
      for (const id of composer.compositionIds) {
        expect(compositionIds.has(id)).toBe(true);
      }
    }
  });
});
