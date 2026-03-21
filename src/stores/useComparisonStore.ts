import { create } from "zustand";

interface ComparisonStore {
  comparisonComposerIds: string[];
  isComparisonMode: boolean;

  addMultipleToComparison: (ids: string[]) => void;
  toggleComposerInComparison: (id: string) => void;
  removeFromComparison: (id: string) => void;
  clearComparison: () => void;
}

export const useComparisonStore = create<ComparisonStore>((set) => ({
  comparisonComposerIds: [],
  isComparisonMode: false,

  addMultipleToComparison: (ids) =>
    set((state) => {
      const unique = new Set(state.comparisonComposerIds);
      for (const id of ids) {
        if (unique.size >= 5) break;
        unique.add(id);
      }
      const newIds = [...unique];
      return {
        comparisonComposerIds: newIds,
        isComparisonMode: newIds.length >= 2,
      };
    }),

  toggleComposerInComparison: (id) =>
    set((state) => {
      const exists = state.comparisonComposerIds.includes(id);
      if (exists) {
        const newIds = state.comparisonComposerIds.filter((cid) => cid !== id);
        return {
          comparisonComposerIds: newIds,
          isComparisonMode: newIds.length >= 2,
        };
      }
      if (state.comparisonComposerIds.length >= 5) return state; // Max 5 composers
      const newIds = [...state.comparisonComposerIds, id];
      return {
        comparisonComposerIds: newIds,
        isComparisonMode: newIds.length >= 2,
      };
    }),

  removeFromComparison: (id) =>
    set((state) => {
      const newIds = state.comparisonComposerIds.filter((cid) => cid !== id);
      return {
        comparisonComposerIds: newIds,
        isComparisonMode: newIds.length >= 2,
      };
    }),

  clearComparison: () =>
    set({ comparisonComposerIds: [], isComparisonMode: false }),
}));
