import React, { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { HistoricalEvent } from "@/types";
import { createTimeScale, formatYear } from "@/utils/scales";
import { getWikipediaUrl } from "@/utils/wikipedia";
import styles from "./EventMarker.module.css";

const CATEGORY_COLORS: Record<string, string> = {
  war: "#C0392B",
  revolution: "#E74C3C",
  political: "#8E44AD",
  scientific: "#2980B9",
  cultural: "#27AE60",
  literary: "#F39C12",
  artistic: "#E67E22",
  technological: "#3498DB",
  religious: "#9B59B6",
  "natural-disaster": "#7F8C8D",
};

interface EventMarkerProps {
  event: HistoricalEvent;
  startYear: number;
  endYear: number;
  width: number;
  timelineHeight: number;
  isDimmed?: boolean;
  isSelected?: boolean;
  onClick?: (eventId: string) => void;
}

export default function EventMarker({
  event,
  startYear,
  endYear,
  width,
  timelineHeight,
  isDimmed = false,
  isSelected = false,
  onClick,
}: EventMarkerProps) {
  const { t } = useTranslation();
  const scale = useMemo(
    () => createTimeScale(startYear, endYear, width),
    [startYear, endYear, width],
  );

  const x = scale(event.year);
  if (x < -10 || x > width + 10) return null;

  const color = CATEGORY_COLORS[event.category] || "#7F8C8D";
  const hasRange = event.endYear && event.endYear !== event.year;
  const rangeWidth = hasRange ? scale(event.endYear!) - x : 0;

  const markerRef = useRef<HTMLDivElement>(null);

  // Viewport-aware tooltip positioning
  const tooltipStyle: React.CSSProperties = {};
  if (x < 160) {
    tooltipStyle.left = 0;
    tooltipStyle.transform = "none";
  } else if (x > width - 160) {
    tooltipStyle.left = "auto";
    tooltipStyle.right = 0;
    tooltipStyle.transform = "none";
  }

  const markerClass = [
    styles.marker,
    isDimmed ? styles.dimmed : "",
    isSelected ? styles.selected : "",
  ]
    .filter(Boolean)
    .join(" ");

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.(event.id);
    }
  };

  return (
    <>
      {/* Range highlight (for wars, etc.) */}
      {hasRange && rangeWidth > 0 && (
        <div
          className={styles.eventRange}
          style={{
            left: x,
            width: rangeWidth,
            backgroundColor: color,
          }}
        />
      )}

      {/* Diamond marker — positioned in event band at top */}
      <div
        className={markerClass}
        style={{ left: x, top: 48 }}
        ref={markerRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(event.id);
        }}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label={t("eventMarker.ariaLabel", {
          title: event.title,
          year: event.year,
        })}
      >
        <div className={styles.diamond} style={{ backgroundColor: color }} />
        <div
          className={styles.eventLine}
          style={{ height: timelineHeight - 72, borderColor: color }}
        />
        <div className={styles.tooltip} style={tooltipStyle}>
          <div className={styles.tooltipTitle}>{event.title}</div>
          <div className={styles.tooltipYear}>
            {formatYear(event.year)}
            {hasRange ? ` – ${formatYear(event.endYear!)}` : ""}
          </div>
          <div className={styles.tooltipDescription}>{event.description}</div>
          {event.musicalSignificance && (
            <div className={styles.tooltipSignificance}>
              ♪ {event.musicalSignificance}
            </div>
          )}
          <span
            className={styles.tooltipCategory}
            style={{ backgroundColor: color + "33", color }}
          >
            {event.category.replace(/-/g, " ")}
          </span>
          {event.wikipediaSlug && (
            <a
              href={getWikipediaUrl(event.wikipediaSlug)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.wikiLink}
              onClick={(e) => e.stopPropagation()}
            >
              {t("common.readOnWikipedia")}
            </a>
          )}
        </div>
      </div>
    </>
  );
}
