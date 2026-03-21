import React, { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSelectionStore } from "@/stores/useSelectionStore";
import { useComparisonStore } from "@/stores/useComparisonStore";
import { useTimelineStore } from "@/stores/useTimelineStore";
import {
  useComposer,
  useCompositionsByComposer,
  useComposerContemporaries,
} from "@/hooks/useData";
import { formatYear } from "@/utils/scales";
import styles from "./ComposerCard.module.css";

const ERA_COLORS: Record<string, string> = {
  renaissance: "#8B6914",
  baroque: "#C4A035",
  classical: "#4A90A4",
  "early-romantic": "#A45B8B",
  "late-romantic": "#7B3F8D",
  modern: "#3D6B5E",
};

interface ComposerCardProps {
  composerId: string;
}

export default function ComposerCard({ composerId }: ComposerCardProps) {
  const { t } = useTranslation();
  const [portraitError, setPortraitError] = useState(false);
  useEffect(() => {
    setPortraitError(false);
  }, [composerId]);
  const composer = useComposer(composerId);
  const compositions = useCompositionsByComposer(composerId);
  const contemporaries = useComposerContemporaries(composerId);
  const { clearComposerSelection, selectComposer, selectComposition } =
    useSelectionStore();
  const { toggleComposerInComparison, comparisonComposerIds } =
    useComparisonStore();
  const { zoomToRange } = useTimelineStore();

  if (!composer) return null;

  const eraColor = ERA_COLORS[composer.era] || "#666";
  const deathYear = composer.deathYear ?? 2025;
  const sortedCompositions = [...compositions].sort(
    (a, b) => a.yearComposed - b.yearComposed,
  );
  const isInComparison = comparisonComposerIds.includes(composerId);

  return (
    <div className={styles.panel}>
      {/* Header */}
      <div className={styles.header}>
        <button
          className={styles.closeBtn}
          onClick={clearComposerSelection}
          aria-label={t("common.close")}
        >
          ×
        </button>
        {composer.portraitUrl && !portraitError && (
          <div className={styles.portraitContainer}>
            <img
              src={composer.portraitUrl}
              alt={`Portrait of ${composer.name}`}
              className={styles.portrait}
              loading="lazy"
              onError={() => setPortraitError(true)}
            />
          </div>
        )}
        <h2 className={styles.name}>{composer.name}</h2>
        <div className={styles.dates}>
          {formatYear(composer.birthYear)} –{" "}
          {composer.deathYear
            ? formatYear(composer.deathYear)
            : t("common.present")}
        </div>
        <div className={styles.birthPlace}>{composer.birthPlace}</div>
        <span
          className={styles.eraBadge}
          style={{
            backgroundColor: eraColor + "22",
            color: eraColor,
            border: `1px solid ${eraColor}44`,
          }}
        >
          {composer.era.replace(/-/g, " ")}
        </span>

        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${styles.focusBtn}`}
            onClick={() => {
              // Panel is 420px; approximate fraction of viewport it covers
              const panelFraction = 420 / Math.max(window.innerWidth, 800);
              zoomToRange(composer.birthYear, deathYear, 15, panelFraction);
            }}
          >
            {t("composer.focusTimeline")}
          </button>
          <button
            className={`${styles.actionBtn} ${styles.compareBtn}`}
            onClick={() => {
              toggleComposerInComparison(composerId);
              clearComposerSelection();
            }}
            disabled={!isInComparison && comparisonComposerIds.length >= 5}
          >
            {isInComparison ? t("composer.comparing") : t("composer.compare")}
          </button>
        </div>
      </div>

      {/* Biography */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t("composer.biography")}</h3>
        <p className={styles.biography}>{composer.biography}</p>
        <a
          href={`https://en.wikipedia.org/wiki/${composer.wikipediaSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.wikiLink}
        >
          <span>↗</span> {t("common.readOnWikipedia")}
        </a>
      </div>

      {/* Compositions */}
      {sortedCompositions.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            {t("composer.notableWorks")} ({sortedCompositions.length})
          </h3>
          <ul className={styles.compositionList}>
            {sortedCompositions.map((comp) => (
              <li
                key={comp.id}
                className={styles.compositionItem}
                onClick={() => selectComposition(comp.id)}
              >
                <span className={styles.compositionYear}>
                  {comp.yearComposed}
                </span>
                <span className={styles.compositionTitle}>{comp.title}</span>
                <span className={styles.compositionGenre}>
                  {comp.genre.replace(/-/g, " ")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Contemporaries */}
      {contemporaries.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            {t("composer.contemporaries")}
          </h3>
          <div className={styles.contemporaryList}>
            {contemporaries.slice(0, 15).map((c) => (
              <button
                key={c.id}
                className={styles.contemporaryChip}
                onClick={() => selectComposer(c.id)}
              >
                {c.shortName}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
