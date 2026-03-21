import { create } from "zustand";
import type { MusicalEra, CompositionGenre, EventCategory } from "@/types";

interface FilterStore {
  eraFilters: MusicalEra[];
  nationalityFilters: string[];
  genreFilters: CompositionGenre[];
  showHistoricalEvents: boolean;
  eventCategoryFilters: EventCategory[];
  searchQuery: string;

  toggleEra: (era: MusicalEra) => void;
  toggleNationality: (nationality: string) => void;
  toggleGenre: (genre: CompositionGenre) => void;
  toggleHistoricalEvents: () => void;
  toggleEventCategory: (category: EventCategory) => void;
  setSearchQuery: (query: string) => void;
  clearAllFilters: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  eraFilters: [],
  nationalityFilters: [],
  genreFilters: [],
  showHistoricalEvents: true,
  eventCategoryFilters: [],
  searchQuery: "",

  toggleEra: (era) =>
    set((state) => ({
      eraFilters: state.eraFilters.includes(era)
        ? state.eraFilters.filter((e) => e !== era)
        : [...state.eraFilters, era],
    })),

  toggleNationality: (nationality) =>
    set((state) => ({
      nationalityFilters: state.nationalityFilters.includes(nationality)
        ? state.nationalityFilters.filter((n) => n !== nationality)
        : [...state.nationalityFilters, nationality],
    })),

  toggleGenre: (genre) =>
    set((state) => ({
      genreFilters: state.genreFilters.includes(genre)
        ? state.genreFilters.filter((g) => g !== genre)
        : [...state.genreFilters, genre],
    })),

  toggleHistoricalEvents: () =>
    set((state) => ({ showHistoricalEvents: !state.showHistoricalEvents })),

  toggleEventCategory: (category) =>
    set((state) => ({
      eventCategoryFilters: state.eventCategoryFilters.includes(category)
        ? state.eventCategoryFilters.filter((c) => c !== category)
        : [...state.eventCategoryFilters, category],
    })),

  setSearchQuery: (query) => set({ searchQuery: query }),

  clearAllFilters: () =>
    set({
      eraFilters: [],
      nationalityFilters: [],
      genreFilters: [],
      showHistoricalEvents: true,
      eventCategoryFilters: [],
      searchQuery: "",
    }),
}));
