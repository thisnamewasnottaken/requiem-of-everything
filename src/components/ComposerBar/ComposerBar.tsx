import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { Composer, MusicalEraDefinition } from "@/types";
import { createTimeScale, formatYear } from "@/utils/scales";
import styles from "./ComposerBar.module.css";

interface ComposerBarProps {
  composer: Composer;
  startYear: number;
  endYear: number;
  width: number;
  row: number;
  eraColor: string;
  isSelected: boolean;
  isComparison: boolean;
  isDimmed: boolean;
  isCollapsed: boolean;
  onClick: (composerId: string, event: React.MouseEvent) => void;
  dataTourFirst?: boolean;
}

const ROW_HEIGHT = 34;
const TOP_OFFSET = 84; // After time ruler + event band

export default function ComposerBar({
  composer,
  startYear,
  endYear,
  width,
  row,
  eraColor,
  isSelected,
  isComparison,
  isDimmed,
  isCollapsed,
  onClick,
  dataTourFirst,
}: ComposerBarProps) {
  const { t } = useTranslation();
  const scale = useMemo(
    () => createTimeScale(startYear, endYear, width),
    [startYear, endYear, width],
  );

  const deathYear = composer.deathYear ?? 2025;
  const barLeft = Math.max(0, scale(Math.max(composer.birthYear, startYear)));
  const barRight = Math.min(width, scale(Math.min(deathYear, endYear)));
  const barWidth = barRight - barLeft;

  if (barWidth < 2) return null;

  const top = TOP_OFFSET + row * ROW_HEIGHT;

  // Flip tooltip below when bar is near the top of the viewport
  const tooltipBelow = top < 90;

  const classNames = [
    styles.composerBar,
    isSelected && styles.selected,
    isComparison && styles.comparisonHighlight,
    isDimmed && styles.dimmed,
    isCollapsed && styles.collapsed,
    tooltipBelow && styles.tooltipBelow,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classNames}
      style={{ left: barLeft, width: barWidth, top }}
      onClick={(e) => onClick(composer.id, e)}
      role="button"
      tabIndex={0}
      aria-label={t("composerBar.ariaLabel", {
        name: composer.name,
        birth: composer.birthYear,
        death: composer.deathYear ?? t("common.present"),
      })}
      {...(dataTourFirst ? { "data-tour": "composer-bar-first" } : {})}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(composer.id, e as unknown as React.MouseEvent);
        }
      }}
    >
      <div className={styles.barFill} style={{ backgroundColor: eraColor }} />
      {barWidth > 70 && (
        <span className={styles.barLabel}>{composer.shortName}</span>
      )}
      {barWidth > 140 && (
        <span className={styles.barYears}>
          {formatYear(composer.birthYear)}–{formatYear(deathYear)}
        </span>
      )}
      <div className={styles.tooltip}>
        {composer.portraitUrl && (
          <img
            src={composer.portraitUrl}
            alt={`Portrait of ${composer.name}`}
            className={styles.tooltipPortrait}
            loading="lazy"
          />
        )}
        <div className={styles.tooltipName}>{composer.name}</div>
        <div className={styles.tooltipDetails}>
          {formatYear(composer.birthYear)} –{" "}
          {composer.deathYear
            ? formatYear(composer.deathYear)
            : t("common.present")}
        </div>
        <div className={styles.tooltipDetails}>{composer.birthPlace}</div>
        <span
          className={styles.tooltipEra}
          style={{ backgroundColor: eraColor + "33", color: eraColor }}
        >
          {composer.era.replace("-", " ")}
        </span>
      </div>
    </div>
  );
}
