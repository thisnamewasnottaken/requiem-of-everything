import type { Composer, Composition, MusicalEraDefinition } from "@/types";

class MinHeap<T> {
  private items: T[] = [];

  constructor(private readonly compare: (left: T, right: T) => number) {}

  get size() {
    return this.items.length;
  }

  peek() {
    return this.items[0];
  }

  push(value: T) {
    this.items.push(value);
    let index = this.items.length - 1;

    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.compare(this.items[index], this.items[parent]) >= 0) break;
      [this.items[index], this.items[parent]] = [
        this.items[parent],
        this.items[index],
      ];
      index = parent;
    }
  }

  pop(): T | undefined {
    if (this.items.length === 0) return undefined;
    const first = this.items[0];
    const last = this.items.pop()!;

    if (this.items.length > 0) {
      this.items[0] = last;
      let index = 0;
      while (true) {
        const left = index * 2 + 1;
        const right = left + 1;
        let smallest = index;

        if (
          left < this.items.length &&
          this.compare(this.items[left], this.items[smallest]) < 0
        ) {
          smallest = left;
        }
        if (
          right < this.items.length &&
          this.compare(this.items[right], this.items[smallest]) < 0
        ) {
          smallest = right;
        }
        if (smallest === index) break;
        [this.items[index], this.items[smallest]] = [
          this.items[smallest],
          this.items[index],
        ];
        index = smallest;
      }
    }

    return first;
  }
}

export function indexComposerGenres(compositions: Composition[]) {
  const genresByComposer = new Map<string, Set<string>>();

  for (const composition of compositions) {
    let genres = genresByComposer.get(composition.composerId);
    if (!genres) {
      genres = new Set();
      genresByComposer.set(composition.composerId, genres);
    }
    genres.add(composition.genre);
  }

  return genresByComposer;
}

export function getEraAtYear(
  eras: MusicalEraDefinition[],
  year: number,
): MusicalEraDefinition | undefined {
  return eras
    .filter((era) => era.startYear <= year && era.endYear >= year)
    .sort((left, right) => right.startYear - left.startYear)[0];
}

export function filterComposers(
  composers: Composer[],
  eraFilters: string[],
  nationalityFilters: string[],
  genreFilters: string[],
  searchQuery: string,
  genresByComposer: Map<string, Set<string>>,
) {
  const query = searchQuery.toLowerCase();

  return composers.filter((composer) => {
    if (eraFilters.length > 0 && !eraFilters.includes(composer.era)) {
      return false;
    }
    if (
      nationalityFilters.length > 0 &&
      !nationalityFilters.includes(composer.nationality)
    ) {
      return false;
    }
    if (genreFilters.length > 0) {
      const genres = genresByComposer.get(composer.id);
      if (!genres || !genreFilters.some((genre) => genres.has(genre))) {
        return false;
      }
    }
    return (
      !query ||
      composer.name.toLowerCase().includes(query) ||
      composer.shortName.toLowerCase().includes(query) ||
      composer.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });
}

type ActiveRow = { endYear: number; row: number };

export function layoutComposers(
  composers: Composer[],
  startYear: number,
  endYear: number,
): Map<string, number> {
  const sorted = [...composers].sort((a, b) => a.birthYear - b.birthYear);
  const activeRows = new MinHeap<ActiveRow>(
    (left, right) => left.endYear - right.endYear || left.row - right.row,
  );
  const availableRows = new MinHeap<number>((left, right) => left - right);
  const result = new Map<string, number>();
  let nextRow = 0;

  for (const composer of sorted) {
    const deathYear = composer.deathYear ?? 2025;
    if (deathYear < startYear || composer.birthYear > endYear) continue;

    while (
      activeRows.size > 0 &&
      activeRows.peek()!.endYear < composer.birthYear - 2
    ) {
      availableRows.push(activeRows.pop()!.row);
    }

    const row = availableRows.pop() ?? nextRow++;
    result.set(composer.id, row);
    activeRows.push({ endYear: deathYear, row });
  }

  return result;
}
