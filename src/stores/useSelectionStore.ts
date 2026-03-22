import { create } from "zustand";

interface SelectionStore {
  selectedComposerIds: string[];
  selectedCompositionId: string | null;
  selectedEventId: string | null;
  focusedComposerId: string | null;

  selectComposer: (id: string) => void;
  deselectComposer: (id: string) => void;
  clearComposerSelection: () => void;
  selectComposition: (id: string | null) => void;
  selectEvent: (id: string | null) => void;
  setFocusedComposer: (id: string | null) => void;
}

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  selectedComposerIds: [],
  selectedCompositionId: null,
  selectedEventId: null,
  focusedComposerId: null,

  selectComposer: (id) => {
    set({ selectedComposerIds: [id], selectedCompositionId: null, selectedEventId: null });
  },

  deselectComposer: (id) => {
    set((state) => ({
      selectedComposerIds: state.selectedComposerIds.filter(
        (cid) => cid !== id,
      ),
    }));
  },

  clearComposerSelection: () => {
    set({ selectedComposerIds: [], selectedCompositionId: null, focusedComposerId: null });
  },

  selectComposition: (id) => {
    set({ selectedCompositionId: id, selectedEventId: null });
  },

  selectEvent: (id) => {
    set({ selectedEventId: id, selectedCompositionId: null });
  },

  setFocusedComposer: (id) => set({ focusedComposerId: id }),
}));
