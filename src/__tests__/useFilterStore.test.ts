import { describe, it, expect, beforeEach } from "vitest";
import { useFilterStore } from "@/stores/useFilterStore";

describe("useFilterStore", () => {
  beforeEach(() => {
    useFilterStore.setState({
      eraFilters: [],
      nationalityFilters: [],
      genreFilters: [],
      showHistoricalEvents: true,
      eventCategoryFilters: [],
      searchQuery: "",
    });
  });

  // --- Era filters ---

  describe("toggleEra", () => {
    it("should add an era when not present", () => {
      useFilterStore.getState().toggleEra("baroque");
      expect(useFilterStore.getState().eraFilters).toContain("baroque");
    });

    it("should remove an era that is already active", () => {
      useFilterStore.setState({ eraFilters: ["baroque"] });
      useFilterStore.getState().toggleEra("baroque");
      expect(useFilterStore.getState().eraFilters).not.toContain("baroque");
    });

    it("should allow multiple eras to be active simultaneously", () => {
      useFilterStore.getState().toggleEra("baroque");
      useFilterStore.getState().toggleEra("classical");
      expect(useFilterStore.getState().eraFilters).toEqual(["baroque", "classical"]);
    });
  });

  // --- Nationality filters ---

  describe("toggleNationality", () => {
    it("should add a nationality when not present", () => {
      useFilterStore.getState().toggleNationality("German");
      expect(useFilterStore.getState().nationalityFilters).toContain("German");
    });

    it("should remove a nationality that is already active", () => {
      useFilterStore.setState({ nationalityFilters: ["German"] });
      useFilterStore.getState().toggleNationality("German");
      expect(useFilterStore.getState().nationalityFilters).not.toContain("German");
    });

    it("should allow multiple nationalities simultaneously", () => {
      useFilterStore.getState().toggleNationality("German");
      useFilterStore.getState().toggleNationality("Austrian");
      expect(useFilterStore.getState().nationalityFilters).toEqual(["German", "Austrian"]);
    });
  });

  // --- Genre filters ---

  describe("toggleGenre", () => {
    it("should add a genre when not present", () => {
      useFilterStore.getState().toggleGenre("symphony");
      expect(useFilterStore.getState().genreFilters).toContain("symphony");
    });

    it("should remove a genre that is already active", () => {
      useFilterStore.setState({ genreFilters: ["symphony"] });
      useFilterStore.getState().toggleGenre("symphony");
      expect(useFilterStore.getState().genreFilters).not.toContain("symphony");
    });
  });

  // --- Historical events ---

  describe("toggleHistoricalEvents", () => {
    it("should toggle showHistoricalEvents from true to false", () => {
      useFilterStore.getState().toggleHistoricalEvents();
      expect(useFilterStore.getState().showHistoricalEvents).toBe(false);
    });

    it("should toggle showHistoricalEvents back to true", () => {
      useFilterStore.setState({ showHistoricalEvents: false });
      useFilterStore.getState().toggleHistoricalEvents();
      expect(useFilterStore.getState().showHistoricalEvents).toBe(true);
    });
  });

  // --- Event category filters ---

  describe("toggleEventCategory", () => {
    it("should add an event category", () => {
      useFilterStore.getState().toggleEventCategory("war");
      expect(useFilterStore.getState().eventCategoryFilters).toContain("war");
    });

    it("should remove an active event category", () => {
      useFilterStore.setState({ eventCategoryFilters: ["war"] });
      useFilterStore.getState().toggleEventCategory("war");
      expect(useFilterStore.getState().eventCategoryFilters).not.toContain("war");
    });
  });

  // --- Search query ---

  describe("setSearchQuery", () => {
    it("should update the search query string", () => {
      useFilterStore.getState().setSearchQuery("bach");
      expect(useFilterStore.getState().searchQuery).toBe("bach");
    });

    it("should accept an empty string", () => {
      useFilterStore.setState({ searchQuery: "bach" });
      useFilterStore.getState().setSearchQuery("");
      expect(useFilterStore.getState().searchQuery).toBe("");
    });
  });

  // --- Clear all ---

  describe("clearAllFilters", () => {
    it("should reset all filters to their defaults", () => {
      useFilterStore.setState({
        eraFilters: ["baroque", "classical"],
        nationalityFilters: ["German"],
        genreFilters: ["symphony"],
        showHistoricalEvents: false,
        eventCategoryFilters: ["war"],
        searchQuery: "bach",
      });

      useFilterStore.getState().clearAllFilters();

      const state = useFilterStore.getState();
      expect(state.eraFilters).toEqual([]);
      expect(state.nationalityFilters).toEqual([]);
      expect(state.genreFilters).toEqual([]);
      expect(state.showHistoricalEvents).toBe(true);
      expect(state.eventCategoryFilters).toEqual([]);
      expect(state.searchQuery).toBe("");
    });

    it("should be a no-op when already at defaults", () => {
      useFilterStore.getState().clearAllFilters();
      expect(useFilterStore.getState().eraFilters).toEqual([]);
    });
  });
});
