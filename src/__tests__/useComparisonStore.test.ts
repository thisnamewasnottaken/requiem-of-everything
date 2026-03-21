import { describe, it, expect, beforeEach } from "vitest";
import { useComparisonStore } from "@/stores/useComparisonStore";

describe("useComparisonStore", () => {
  beforeEach(() => {
    // Reset store state between tests
    useComparisonStore.setState({
      comparisonComposerIds: [],
      isComparisonMode: false,
    });
  });

  describe("toggleComposerInComparison", () => {
    it("should add a composer to comparison", () => {
      useComparisonStore.getState().toggleComposerInComparison("bach");
      expect(useComparisonStore.getState().comparisonComposerIds).toEqual([
        "bach",
      ]);
    });

    it("should remove a composer that is already in comparison", () => {
      useComparisonStore.setState({ comparisonComposerIds: ["bach"] });
      useComparisonStore.getState().toggleComposerInComparison("bach");
      expect(useComparisonStore.getState().comparisonComposerIds).toEqual([]);
    });

    it("should not activate comparison mode with only 1 composer", () => {
      useComparisonStore.getState().toggleComposerInComparison("bach");
      expect(useComparisonStore.getState().isComparisonMode).toBe(false);
    });

    it("should activate comparison mode when 2 or more composers are added", () => {
      useComparisonStore.getState().toggleComposerInComparison("bach");
      useComparisonStore.getState().toggleComposerInComparison("mozart");
      expect(useComparisonStore.getState().isComparisonMode).toBe(true);
      expect(useComparisonStore.getState().comparisonComposerIds).toEqual([
        "bach",
        "mozart",
      ]);
    });

    it("should deactivate comparison mode when dropping below 2 composers", () => {
      useComparisonStore.setState({
        comparisonComposerIds: ["bach", "mozart"],
        isComparisonMode: true,
      });
      useComparisonStore.getState().toggleComposerInComparison("mozart");
      expect(useComparisonStore.getState().isComparisonMode).toBe(false);
    });

    it("should not add more than 5 composers", () => {
      useComparisonStore.setState({
        comparisonComposerIds: ["a", "b", "c", "d", "e"],
        isComparisonMode: true,
      });
      useComparisonStore.getState().toggleComposerInComparison("f");
      expect(
        useComparisonStore.getState().comparisonComposerIds,
      ).toHaveLength(5);
      expect(
        useComparisonStore.getState().comparisonComposerIds,
      ).not.toContain("f");
    });

    it("should not add a duplicate composer", () => {
      useComparisonStore.setState({ comparisonComposerIds: ["bach"] });
      // Toggling bach again should remove it, not duplicate it
      useComparisonStore.getState().toggleComposerInComparison("bach");
      expect(useComparisonStore.getState().comparisonComposerIds).toEqual([]);
    });
  });

  describe("addMultipleToComparison", () => {
    it("should add multiple composers at once", () => {
      useComparisonStore
        .getState()
        .addMultipleToComparison(["bach", "mozart"]);
      expect(useComparisonStore.getState().comparisonComposerIds).toEqual([
        "bach",
        "mozart",
      ]);
      expect(useComparisonStore.getState().isComparisonMode).toBe(true);
    });

    it("should not duplicate composers already in the list", () => {
      useComparisonStore.setState({ comparisonComposerIds: ["bach"] });
      useComparisonStore
        .getState()
        .addMultipleToComparison(["bach", "mozart"]);
      expect(useComparisonStore.getState().comparisonComposerIds).toEqual([
        "bach",
        "mozart",
      ]);
    });

    it("should respect the 5-composer maximum", () => {
      useComparisonStore
        .getState()
        .addMultipleToComparison(["a", "b", "c", "d", "e", "f", "g"]);
      expect(
        useComparisonStore.getState().comparisonComposerIds,
      ).toHaveLength(5);
    });

    it("should activate comparison mode when result has 2+ composers", () => {
      useComparisonStore
        .getState()
        .addMultipleToComparison(["haydn", "mozart"]);
      expect(useComparisonStore.getState().isComparisonMode).toBe(true);
    });

    it("should not activate comparison mode with only 1 composer added", () => {
      useComparisonStore.getState().addMultipleToComparison(["haydn"]);
      expect(useComparisonStore.getState().isComparisonMode).toBe(false);
    });
  });

  describe("removeFromComparison", () => {
    it("should remove a specific composer", () => {
      useComparisonStore.setState({
        comparisonComposerIds: ["bach", "mozart", "haydn"],
        isComparisonMode: true,
      });
      useComparisonStore.getState().removeFromComparison("mozart");
      expect(useComparisonStore.getState().comparisonComposerIds).toEqual([
        "bach",
        "haydn",
      ]);
      expect(useComparisonStore.getState().isComparisonMode).toBe(true);
    });

    it("should deactivate comparison mode when fewer than 2 remain", () => {
      useComparisonStore.setState({
        comparisonComposerIds: ["bach", "mozart"],
        isComparisonMode: true,
      });
      useComparisonStore.getState().removeFromComparison("mozart");
      expect(useComparisonStore.getState().isComparisonMode).toBe(false);
    });
  });

  describe("clearComparison", () => {
    it("should clear all comparison state", () => {
      useComparisonStore.setState({
        comparisonComposerIds: ["bach", "mozart", "haydn"],
        isComparisonMode: true,
      });
      useComparisonStore.getState().clearComparison();
      expect(useComparisonStore.getState().comparisonComposerIds).toEqual([]);
      expect(useComparisonStore.getState().isComparisonMode).toBe(false);
    });
  });
});
