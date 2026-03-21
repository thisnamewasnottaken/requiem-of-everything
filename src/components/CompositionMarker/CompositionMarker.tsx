import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Composition, Composer } from "@/types";
import { createTimeScale, formatYear } from "@/utils/scales";
import styles from "./CompositionMarker.module.css";

interface CompositionMarkerProps {
  composition: Composition;
  composerName: string;
  startYear: number;
  endYear: number;
  width: number;
  yPosition: number;
  eraColor: string;
  isSelected: boolean;
  isDimmed?: boolean;
  onClick: (compositionId: string) => void;
}

export default function CompositionMarker({
  composition,
  composerName,
  startYear,
  endYear,
  width,
  yPosition,
  eraColor,
  isSelected,
  isDimmed = false,
  onClick,
}: CompositionMarkerProps) {
  const { t } = useTranslation();
  const scale = useMemo(
    () => createTimeScale(startYear, endYear, width),
    [startYear, endYear, width],
  );

  const x = scale(composition.yearComposed);
  if (x < -10 || x > width + 10) return null;

  // Flip tooltip below when marker is near the top of the viewport
  const tooltipBelow = yPosition < 80;

  return (
    <div
      className={`${styles.marker} ${isSelected ? styles.selected : ""} ${isDimmed ? styles.dimmed : ""} ${tooltipBelow ? styles.tooltipBelow : ""}`}
      style={{ left: x, top: yPosition }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(composition.id);
      }}
      role="button"
      tabIndex={0}
      aria-label={t('compositionMarker.ariaLabel', { title: composition.title, composer: composerName, year: composition.yearComposed })}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(composition.id);
        }
      }}
    >
      <div className={styles.dot} style={{ backgroundColor: eraColor }} />
      <div className={styles.stem} style={{ backgroundColor: eraColor }} />
      <div className={styles.tooltip}>
        <div className={styles.tooltipTitle}>{composition.title}</div>
        <div className={styles.tooltipComposer}>{composerName}</div>
        <div className={styles.tooltipYear}>
          {formatYear(composition.yearComposed)}
        </div>
        <span className={styles.tooltipGenre}>
          {composition.genre.replace(/-/g, " ")}
        </span>
      </div>
    </div>
  );
}
