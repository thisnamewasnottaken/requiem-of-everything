import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { useTranslation } from "react-i18next";
import { useTimelineStore } from "@/stores/useTimelineStore";
import { useSelectionStore } from "@/stores/useSelectionStore";
import { useComparisonStore } from "@/stores/useComparisonStore";
import { useFilterStore } from "@/stores/useFilterStore";
import {
  useComposers,
  useCompositions,
  useEvents,
  useEras,
} from "@/hooks/useData";
import {
  createTimeScale,
  getTimeTicks,
  getDetailLevel,
  formatYear,
} from "@/utils/scales";
import type {
  Composer,
  Composition,
  HistoricalEvent,
  MusicalEraDefinition,
} from "@/types";

import TimeRuler from "@/components/TimeRuler/TimeRuler";
import EraBackdrop from "@/components/EraBackdrop/EraBackdrop";
import ComposerBar from "@/components/ComposerBar/ComposerBar";
import CompositionMarker from "@/components/CompositionMarker/CompositionMarker";
import EventMarker from "@/components/EventMarker/EventMarker";
import styles from "./Timeline.module.css";

const ERA_COLORS: Record<string, string> = {
  renaissance: "#8B6914",
  baroque: "#C4A035",
  classical: "#4A90A4",
  "early-romantic": "#A45B8B",
  "late-romantic": "#7B3F8D",
  modern: "#3D6B5E",
};

function eraColorForComposer(c: Composer): string {
  return ERA_COLORS[c.era] || "#666";
}

/**
 * Assigns vertical rows to composers, avoiding overlaps.
 * Returns Map<composerId, rowIndex>.
 */
function layoutComposers(
  composers: Composer[],
  startYear: number,
  endYear: number,
): Map<string, number> {
  const sorted = [...composers].sort((a, b) => a.birthYear - b.birthYear);
  const rows: { endYear: number }[] = [];
  const result = new Map<string, number>();

  for (const c of sorted) {
    const death = c.deathYear ?? 2025;
    // skip if completely outside view
    if (death < startYear || c.birthYear > endYear) continue;

    let placed = false;
    for (let i = 0; i < rows.length; i++) {
      if (c.birthYear > rows[i].endYear + 2) {
        rows[i].endYear = death;
        result.set(c.id, i);
        placed = true;
        break;
      }
    }
    if (!placed) {
      result.set(c.id, rows.length);
      rows.push({ endYear: death });
    }
  }

  return result;
}

export default function Timeline() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{
    x: number;
    startYear: number;
    endYear: number;
  } | null>(null);
  const touchStart = useRef<{
    x: number;
    startYear: number;
    endYear: number;
    pinchDist?: number;
  } | null>(null);

  const {
    viewStartYear,
    viewEndYear,
    zoomIn,
    zoomOut,
    panBy,
    setViewRange,
    resetView,
    zoomToRange,
  } = useTimelineStore();
  const {
    selectedComposerIds,
    selectComposer,
    clearComposerSelection,
    selectComposition,
    selectedCompositionId,
    selectedEventId,
    selectEvent,
    focusedComposerId,
  } = useSelectionStore();
  const {
    comparisonComposerIds,
    isComparisonMode,
    toggleComposerInComparison,
    addMultipleToComparison,
  } = useComparisonStore();

  const isFocusMode = focusedComposerId !== null;
  const {
    eraFilters,
    nationalityFilters,
    genreFilters,
    showHistoricalEvents,
    searchQuery,
  } = useFilterStore();

  const allComposers = useComposers();
  const allCompositions = useCompositions();
  const allEvents = useEvents();
  const eras = useEras();

  // Responsive width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Filtered composers
  const filteredComposers = useMemo(() => {
    let list = allComposers;
    if (eraFilters.length > 0) {
      list = list.filter((c) => eraFilters.includes(c.era));
    }
    if (nationalityFilters.length > 0) {
      list = list.filter((c) => nationalityFilters.includes(c.nationality));
    }
    if (genreFilters.length > 0) {
      const composerGenres = new Map<string, Set<string>>();
      allCompositions.forEach((comp) => {
        if (!composerGenres.has(comp.composerId)) {
          composerGenres.set(comp.composerId, new Set());
        }
        composerGenres.get(comp.composerId)!.add(comp.genre);
      });
      list = list.filter((c) => {
        const genres = composerGenres.get(c.id);
        return genres ? genreFilters.some((g) => genres.has(g)) : false;
      });
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.shortName.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [
    allComposers,
    allCompositions,
    eraFilters,
    nationalityFilters,
    genreFilters,
    searchQuery,
  ]);

  // Auto-zoom to fit filtered composers when filters change
  const hasActiveFilters =
    eraFilters.length > 0 ||
    nationalityFilters.length > 0 ||
    genreFilters.length > 0 ||
    searchQuery.length > 0;
  const preFilterViewRef = useRef<{
    startYear: number;
    endYear: number;
  } | null>(null);
  const prevHadFiltersRef = useRef(false);

  useEffect(() => {
    // Skip if comparison mode is active (comparison zoom takes priority)
    if (isComparisonMode) return;

    // When filters are applied and we have results (but not showing all composers), zoom to fit
    if (
      hasActiveFilters &&
      filteredComposers.length > 0 &&
      filteredComposers.length < allComposers.length
    ) {
      // Save viewport on first filter application
      if (!preFilterViewRef.current) {
        const { viewStartYear: curStart, viewEndYear: curEnd } =
          useTimelineStore.getState();
        preFilterViewRef.current = { startYear: curStart, endYear: curEnd };
      }

      const minBirth = Math.min(...filteredComposers.map((c) => c.birthYear));
      const maxDeath = Math.max(
        ...filteredComposers.map((c) => c.deathYear ?? 2025),
      );
      zoomToRange(minBirth, maxDeath, 15);
    }

    // Restore viewport when all filters are cleared
    if (!hasActiveFilters && prevHadFiltersRef.current) {
      if (preFilterViewRef.current) {
        setViewRange(
          preFilterViewRef.current.startYear,
          preFilterViewRef.current.endYear,
        );
        preFilterViewRef.current = null;
      }
    }

    prevHadFiltersRef.current = hasActiveFilters;
  }, [
    filteredComposers,
    hasActiveFilters,
    zoomToRange,
    setViewRange,
    isComparisonMode,
    allComposers.length,
  ]);

  // Composer row layout
  const composerRows = useMemo(
    () => layoutComposers(filteredComposers, viewStartYear, viewEndYear),
    [filteredComposers, viewStartYear, viewEndYear],
  );

  const maxRow = useMemo(() => {
    let max = 0;
    composerRows.forEach((r) => {
      if (r > max) max = r;
    });
    return max;
  }, [composerRows]);

  // Compositions in view
  const detailLevel = getDetailLevel(viewEndYear - viewStartYear);
  const visibleCompositions = useMemo(() => {
    if (detailLevel === "century") return []; // Too zoomed out
    return allCompositions.filter(
      (c) => c.yearComposed >= viewStartYear && c.yearComposed <= viewEndYear,
    );
  }, [allCompositions, viewStartYear, viewEndYear, detailLevel]);

  // Events in view
  const visibleEvents = useMemo(() => {
    if (!showHistoricalEvents) return [];
    return allEvents.filter(
      (e) => e.year <= viewEndYear && (e.endYear ?? e.year) >= viewStartYear,
    );
  }, [allEvents, viewStartYear, viewEndYear, showHistoricalEvents]);

  // Grid lines
  const gridTicks = useMemo(
    () => getTimeTicks(viewStartYear, viewEndYear),
    [viewStartYear, viewEndYear],
  );
  const scale = useMemo(
    () => createTimeScale(viewStartYear, viewEndYear, containerWidth),
    [viewStartYear, viewEndYear, containerWidth],
  );

  // Timeline height
  const ROW_HEIGHT = 34;
  const TOP_OFFSET = 84;
  const timelineHeight = Math.max(
    500,
    TOP_OFFSET + (maxRow + 1) * ROW_HEIGHT + 100,
  );

  // Hover year
  const hoverYear = hoverX !== null ? scale.invert(hoverX) : null;

  // Composer name map
  const composerNameMap = useMemo(() => {
    const map = new Map<string, string>();
    allComposers.forEach((c) => map.set(c.id, c.shortName));
    return map;
  }, [allComposers]);

  // Delayed collapse: after 3s of no comparison changes, collapse dimmed bars
  // and zoom to the compared composers' combined lifespan
  const [isCollapsed, setIsCollapsed] = useState(false);
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preComparisonViewRef = useRef<{
    startYear: number;
    endYear: number;
  } | null>(null);
  const prevComparisonModeRef = useRef(false);

  useEffect(() => {
    // Reset collapse on any comparison change
    setIsCollapsed(false);

    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }

    // Only start collapse timer when comparison mode is active
    if (isComparisonMode) {
      collapseTimerRef.current = setTimeout(() => {
        setIsCollapsed(true);

        // Save the current viewport before zooming (only on first collapse)
        if (!preComparisonViewRef.current) {
          const { viewStartYear: curStart, viewEndYear: curEnd } =
            useTimelineStore.getState();
          preComparisonViewRef.current = {
            startYear: curStart,
            endYear: curEnd,
          };
        }

        // Zoom to the union of compared composers' lifespans
        const comparedComposers = allComposers.filter((c) =>
          comparisonComposerIds.includes(c.id),
        );
        if (comparedComposers.length >= 2) {
          const minBirth = Math.min(
            ...comparedComposers.map((c) => c.birthYear),
          );
          const maxDeath = Math.max(
            ...comparedComposers.map((c) => c.deathYear ?? 2025),
          );
          zoomToRange(minBirth, maxDeath, 15);
        }
      }, 3000);
    }

    return () => {
      if (collapseTimerRef.current) {
        clearTimeout(collapseTimerRef.current);
      }
    };
  }, [comparisonComposerIds, isComparisonMode, allComposers, zoomToRange]);

  // Restore the pre-comparison viewport when comparison mode exits
  useEffect(() => {
    if (prevComparisonModeRef.current && !isComparisonMode) {
      if (preComparisonViewRef.current) {
        setViewRange(
          preComparisonViewRef.current.startYear,
          preComparisonViewRef.current.endYear,
        );
        preComparisonViewRef.current = null;
      }
    }
    prevComparisonModeRef.current = isComparisonMode;
  }, [isComparisonMode, setViewRange]);

  // Focus mode collapse: after 1.5s, collapse non-focused composers
  useEffect(() => {
    if (!isFocusMode) return;

    setIsCollapsed(false);
    const timer = setTimeout(() => {
      setIsCollapsed(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [focusedComposerId, isFocusMode]);

  // Clear focus when entering comparison mode
  useEffect(() => {
    if (isComparisonMode && focusedComposerId) {
      useSelectionStore.getState().setFocusedComposer(null);
    }
  }, [isComparisonMode, focusedComposerId]);

  // --- Interaction handlers ---

  // Native wheel listener for non-passive preventDefault support
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Only handle zoom gestures (Ctrl+wheel or trackpad pinch)
      if (!e.ctrlKey && !e.metaKey) return;

      e.preventDefault();

      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const centerYear = scale.invert(mouseX);

      if (e.deltaY < 0) {
        zoomIn(centerYear);
      } else {
        zoomOut(centerYear);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [scale, zoomIn, zoomOut]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsPanning(true);
      panStart.current = {
        x: e.clientX,
        startYear: viewStartYear,
        endYear: viewEndYear,
      };
    },
    [viewStartYear, viewEndYear],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setHoverX(e.clientX - rect.left);
      }

      if (!isPanning || !panStart.current) return;

      const dx = e.clientX - panStart.current.x;
      const yearRange = panStart.current.endYear - panStart.current.startYear;
      const yearDelta = -(dx / containerWidth) * yearRange;

      setViewRange(
        panStart.current.startYear + yearDelta,
        panStart.current.endYear + yearDelta,
      );
    },
    [isPanning, containerWidth, setViewRange],
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    panStart.current = null;
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoverX(null);
    setIsPanning(false);
    panStart.current = null;
  }, []);

  // Click on empty space -> deselect
  const handleBackgroundClick = useCallback(
    (e: React.MouseEvent) => {
      if (
        e.target === e.currentTarget ||
        (e.target as HTMLElement).dataset.layer === "viewport"
      ) {
        clearComposerSelection();
        selectEvent(null);
      }
    },
    [clearComposerSelection, selectEvent],
  );

  // Event marker click: toggle selection
  const handleEventClick = useCallback(
    (eventId: string) => {
      selectEvent(selectedEventId === eventId ? null : eventId);
    },
    [selectedEventId, selectEvent],
  );

  // --- Touch handlers (mobile pan + pinch zoom) ---

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        touchStart.current = {
          x: e.touches[0].clientX,
          startYear: viewStartYear,
          endYear: viewEndYear,
        };
      } else if (e.touches.length === 2) {
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        touchStart.current = {
          x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          startYear: viewStartYear,
          endYear: viewEndYear,
          pinchDist: Math.hypot(dx, dy),
        };
      }
    },
    [viewStartYear, viewEndYear],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();
      if (!touchStart.current) return;

      if (
        e.touches.length === 1 &&
        touchStart.current.pinchDist === undefined
      ) {
        const dx = e.touches[0].clientX - touchStart.current.x;
        const yearRange =
          touchStart.current.endYear - touchStart.current.startYear;
        const yearDelta = -(dx / containerWidth) * yearRange;
        setViewRange(
          touchStart.current.startYear + yearDelta,
          touchStart.current.endYear + yearDelta,
        );
      } else if (
        e.touches.length === 2 &&
        touchStart.current.pinchDist !== undefined
      ) {
        const dx = e.touches[1].clientX - e.touches[0].clientX;
        const dy = e.touches[1].clientY - e.touches[0].clientY;
        const newDist = Math.hypot(dx, dy);
        const ratio = touchStart.current.pinchDist / newDist;
        const centerYear =
          (touchStart.current.startYear + touchStart.current.endYear) / 2;
        const halfRange =
          ((touchStart.current.endYear - touchStart.current.startYear) / 2) *
          ratio;
        setViewRange(centerYear - halfRange, centerYear + halfRange);
      }
    },
    [containerWidth, setViewRange],
  );

  const handleTouchEnd = useCallback(() => {
    touchStart.current = null;
  }, []);

  // Composer bar click: Ctrl/Cmd = toggle comparison, regular = select
  const handleComposerClick = useCallback(
    (composerId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      if (event.ctrlKey || event.metaKey) {
        // Transfer any currently-selected composer into comparison first
        const currentlySelected = selectedComposerIds.filter(
          (id) => !comparisonComposerIds.includes(id),
        );
        if (currentlySelected.length > 0) {
          addMultipleToComparison([...currentlySelected, composerId]);
        } else {
          toggleComposerInComparison(composerId);
        }
        clearComposerSelection();
      } else {
        selectComposer(composerId);
      }
    },
    [
      selectComposer,
      clearComposerSelection,
      toggleComposerInComparison,
      addMultipleToComparison,
      selectedComposerIds,
      comparisonComposerIds,
    ],
  );

  return (
    <div
      ref={containerRef}
      className={styles.timelineContainer}
      data-tour="timeline-viewport"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onClick={handleBackgroundClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Range indicator */}
      <div className={styles.rangeIndicator}>
        {formatYear(Math.round(viewStartYear))} —{" "}
        {formatYear(Math.round(viewEndYear))}
      </div>

      {/* Zoom controls */}
      <div className={styles.controls}>
        <button
          className={styles.controlBtn}
          onClick={() => zoomIn()}
          title={t("timeline.zoomIn")}
        >
          +
        </button>
        <button
          className={styles.controlBtn}
          onClick={() => zoomOut()}
          title={t("timeline.zoomOut")}
        >
          −
        </button>
        <button
          className={styles.controlBtn}
          onClick={resetView}
          title={t("timeline.resetView")}
          style={{ fontSize: "14px" }}
        >
          ↺
        </button>
      </div>

      {/* Viewport */}
      <div
        className={styles.timelineViewport}
        style={{ height: timelineHeight, width: containerWidth }}
        data-layer="viewport"
      >
        {/* Grid lines */}
        {gridTicks.map((year) => (
          <div
            key={`grid-${year}`}
            className={styles.gridLine}
            style={{ left: scale(year) }}
          />
        ))}

        {/* Era backdrops */}
        <EraBackdrop
          eras={eras as any}
          startYear={viewStartYear}
          endYear={viewEndYear}
          width={containerWidth}
        />

        {/* Time ruler */}
        <TimeRuler
          startYear={viewStartYear}
          endYear={viewEndYear}
          width={containerWidth}
          eras={eras as MusicalEraDefinition[]}
        />

        {/* Composer bars */}
        {filteredComposers.map((composer, index) => {
          const row = composerRows.get(composer.id);
          if (row === undefined) return null;
          const inComparison = comparisonComposerIds.includes(composer.id);
          return (
            <ComposerBar
              key={composer.id}
              composer={composer}
              startYear={viewStartYear}
              endYear={viewEndYear}
              width={containerWidth}
              row={row}
              eraColor={eraColorForComposer(composer)}
              isSelected={selectedComposerIds.includes(composer.id)}
              isComparison={inComparison}
              isDimmed={
                (isComparisonMode && !inComparison) ||
                (isFocusMode && composer.id !== focusedComposerId)
              }
              isCollapsed={
                isCollapsed &&
                ((isComparisonMode && !inComparison) ||
                  (isFocusMode && composer.id !== focusedComposerId))
              }
              onClick={handleComposerClick}
              dataTourFirst={index === 0}
            />
          );
        })}

        {/* Composition markers (only when zoomed in enough) */}
        {detailLevel !== "century" &&
          visibleCompositions.map((comp) => {
            const composerRow = composerRows.get(comp.composerId);
            if (composerRow === undefined) return null;
            const yPos = TOP_OFFSET + composerRow * ROW_HEIGHT - 16;
            const composer = allComposers.find((c) => c.id === comp.composerId);
            return (
              <CompositionMarker
                key={comp.id}
                composition={comp}
                composerName={composerNameMap.get(comp.composerId) || ""}
                startYear={viewStartYear}
                endYear={viewEndYear}
                width={containerWidth}
                yPosition={yPos}
                eraColor={composer ? eraColorForComposer(composer) : "#666"}
                isSelected={selectedCompositionId === comp.id}
                isDimmed={
                  isComparisonMode
                    ? !comparisonComposerIds.includes(comp.composerId)
                    : isFocusMode
                      ? comp.composerId !== focusedComposerId
                      : selectedComposerIds.length > 0 &&
                        !selectedComposerIds.includes(comp.composerId)
                }
                onClick={selectComposition}
              />
            );
          })}

        {/* Event markers */}
        {visibleEvents.map((event) => (
          <EventMarker
            key={event.id}
            event={event}
            startYear={viewStartYear}
            endYear={viewEndYear}
            width={containerWidth}
            timelineHeight={timelineHeight}
            isDimmed={
              isComparisonMode || isFocusMode || selectedComposerIds.length > 0
            }
            isSelected={selectedEventId === event.id}
            onClick={handleEventClick}
          />
        ))}

        {/* Year hover line */}
        {hoverX !== null && hoverYear !== null && !isPanning && (
          <>
            <div className={styles.yearHover} style={{ left: hoverX }} />
            <div className={styles.yearHoverLabel} style={{ left: hoverX }}>
              {formatYear(Math.round(hoverYear))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
