import { describe, expect, it } from "vitest";
import type { Composer, Composition } from "@/types";
import {
  filterComposers,
  getEraAtYear,
  indexComposerGenres,
  layoutComposers,
} from "@/utils/timelineData";
import type { MusicalEraDefinition } from "@/types";

function composer(
  id: string,
  birthYear: number,
  deathYear: number | null,
  overrides: Partial<Composer> = {},
): Composer {
  return {
    id,
    name: id,
    shortName: id,
    birthYear,
    deathYear,
    birthPlace: "",
    nationality: "German",
    era: "baroque",
    biography: "",
    wikipediaSlug: id,
    compositionIds: [],
    tags: [],
    ...overrides,
  };
}

function composition(
  composerId: string,
  genre: Composition["genre"],
): Composition {
  return {
    id: `${composerId}-${genre}`,
    title: "",
    composerId,
    yearComposed: 1700,
    genre,
    instrumentation: "",
    description: "",
    tags: [],
  };
}

function era(
  id: string,
  startYear: number,
  endYear: number,
): MusicalEraDefinition {
  return {
    id: id as MusicalEraDefinition["id"],
    name: id,
    startYear,
    endYear,
    description: "",
    color: "",
    characteristics: [],
  };
}

describe("getEraAtYear", () => {
  it("chooses the most recently begun era when periods overlap", () => {
    const lateRomantic = era("late-romantic", 1850, 1910);
    const modern = era("modern", 1890, 1970);

    expect(getEraAtYear([lateRomantic, modern], 1900)).toBe(modern);
  });

  it("returns undefined when the year is outside all eras", () => {
    expect(getEraAtYear([era("baroque", 1600, 1750)], 1500)).toBeUndefined();
  });
});

describe("indexComposerGenres", () => {
  it("indexes each composer's distinct genres", () => {
    const index = indexComposerGenres([
      composition("bach", "symphony"),
      composition("bach", "symphony"),
      composition("bach", "concerto"),
      composition("mozart", "opera"),
    ]);

    expect(index.get("bach")).toEqual(new Set(["symphony", "concerto"]));
    expect(index.get("mozart")).toEqual(new Set(["opera"]));
    expect(index.has("unknown")).toBe(false);
  });
});

describe("filterComposers", () => {
  const composers = [
    composer("bach", 1685, 1750, {
      name: "Johann Sebastian Bach",
      shortName: "Bach",
      tags: ["counterpoint"],
    }),
    composer("mozart", 1756, 1791, {
      name: "Wolfgang Amadeus Mozart",
      shortName: "Mozart",
      era: "classical",
    }),
  ];
  const genres = indexComposerGenres([
    composition("bach", "symphony"),
    composition("bach", "concerto"),
    composition("mozart", "opera"),
  ]);

  it("combines filter categories while allowing any selected genre", () => {
    expect(
      filterComposers(
        composers,
        ["baroque"],
        ["German"],
        ["opera", "concerto"],
        "COUNTER",
        genres,
      ),
    ).toEqual([composers[0]]);
  });

  it("returns no composers when a selected filter does not match", () => {
    expect(
      filterComposers(composers, [], [], ["requiem"], "", genres),
    ).toEqual([]);
  });
});

describe("layoutComposers", () => {
  it("reuses the first available row while preserving the two-year gap", () => {
    const rows = layoutComposers(
      [
        composer("first", 1700, 1710),
        composer("second", 1701, 1720),
        composer("third", 1712, 1730),
        composer("fourth", 1713, 1740),
        composer("fifth", 1743, 1750),
      ],
      1600,
      1800,
    );

    expect([...rows]).toEqual([
      ["first", 0],
      ["second", 1],
      ["third", 2],
      ["fourth", 0],
      ["fifth", 0],
    ]);
  });

  it("skips composers outside the viewport and treats an unknown death as 2025", () => {
    const rows = layoutComposers(
      [
        composer("earlier", 1400, 1450),
        composer("in-view", 1900, null),
        composer("later", 2100, 2150),
      ],
      1800,
      2000,
    );

    expect([...rows]).toEqual([["in-view", 0]]);
  });
});
