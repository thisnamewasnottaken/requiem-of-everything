import { create } from "zustand";
import type { MusicalEra, CompositionGenre, EventCategory } from "@/types";

interface TimelineStore {
  // Viewport
  viewStartYear: number;
  viewEndYear: number;
  zoomLevel: number;

  // Actions
  setViewRange: (start: number, end: number) => void;
  zoomIn: (centerYear?: number) => void;
  zoomOut: (centerYear?: number) => void;
  panBy: (deltaYears: number) => void;
  resetView: () => void;
  zoomToRange: (
    start: number,
    end: number,
    padding?: number,
    rightInsetFraction?: number,
  ) => void;
  centerOnYear: (year: number) => void;
}

const DEFAULT_START = 1580;
const DEFAULT_END = 1970;
const MIN_RANGE = 10;
const MAX_RANGE = 570; // 1400–1970
const ZOOM_FACTOR = 1.15;
const TIMELINE_MIN = 1400;
const TIMELINE_MAX = 1970;

function clampRange(start: number, end: number): [number, number] {
  const range = end - start;
  let s = Math.max(start, TIMELINE_MIN);
  let e = Math.min(end, TIMELINE_MAX);

  if (e - s < MIN_RANGE) {
    const center = (s + e) / 2;
    s = center - MIN_RANGE / 2;
    e = center + MIN_RANGE / 2;
  }

  if (e - s > MAX_RANGE) {
    const center = (s + e) / 2;
    s = center - MAX_RANGE / 2;
    e = center + MAX_RANGE / 2;
  }

  return [Math.max(s, TIMELINE_MIN), Math.min(e, TIMELINE_MAX)];
}

export const useTimelineStore = create<TimelineStore>((set, get) => ({
  viewStartYear: DEFAULT_START,
  viewEndYear: DEFAULT_END,
  zoomLevel: 1,

  setViewRange: (start, end) => {
    const [s, e] = clampRange(start, end);
    set({ viewStartYear: s, viewEndYear: e, zoomLevel: MAX_RANGE / (e - s) });
  },

  zoomIn: (centerYear) => {
    const { viewStartYear, viewEndYear } = get();
    const range = viewEndYear - viewStartYear;
    const center = centerYear ?? (viewStartYear + viewEndYear) / 2;
    const newRange = range / ZOOM_FACTOR;
    const ratio = (center - viewStartYear) / range;
    const newStart = center - newRange * ratio;
    const [s, e] = clampRange(newStart, newStart + newRange);
    set({ viewStartYear: s, viewEndYear: e, zoomLevel: MAX_RANGE / (e - s) });
  },

  zoomOut: (centerYear) => {
    const { viewStartYear, viewEndYear } = get();
    const range = viewEndYear - viewStartYear;
    const center = centerYear ?? (viewStartYear + viewEndYear) / 2;
    const newRange = range * ZOOM_FACTOR;
    const ratio = (center - viewStartYear) / range;
    const newStart = center - newRange * ratio;
    const [s, e] = clampRange(newStart, newStart + newRange);
    set({ viewStartYear: s, viewEndYear: e, zoomLevel: MAX_RANGE / (e - s) });
  },

  panBy: (deltaYears) => {
    const { viewStartYear, viewEndYear } = get();
    const [s, e] = clampRange(
      viewStartYear + deltaYears,
      viewEndYear + deltaYears,
    );
    set({ viewStartYear: s, viewEndYear: e });
  },

  resetView: () => {
    set({
      viewStartYear: DEFAULT_START,
      viewEndYear: DEFAULT_END,
      zoomLevel: 1,
    });
  },

  zoomToRange: (start, end, padding = 10, rightInsetFraction = 0) => {
    // rightInsetFraction: fraction of viewport obscured on the right (e.g. 0.3 for a 30% panel)
    // We expand the end so the content fits in the unobscured area
    const range = end - start + 2 * padding;
    const extraRight =
      rightInsetFraction > 0
        ? range * (rightInsetFraction / (1 - rightInsetFraction))
        : 0;
    const [s, e] = clampRange(start - padding, end + padding + extraRight);
    set({ viewStartYear: s, viewEndYear: e, zoomLevel: MAX_RANGE / (e - s) });
  },

  centerOnYear: (year) => {
    const { viewStartYear, viewEndYear } = get();
    const halfRange = (viewEndYear - viewStartYear) / 2;
    const [s, e] = clampRange(year - halfRange, year + halfRange);
    set({ viewStartYear: s, viewEndYear: e });
  },
}));
