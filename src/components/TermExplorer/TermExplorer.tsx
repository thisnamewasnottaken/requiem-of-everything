import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTerms, useCompositions, useComposers } from "@/hooks/useData";
import { getWikipediaUrl } from "@/utils/wikipedia";
import type { TermCategory, MusicalTerm } from "@/types";
import styles from "./TermExplorer.module.css";

const ERA_COLORS: Record<string, string> = {
  renaissance: "#8B6914",
  baroque: "#C4A035",
  classical: "#4A90A4",
  "early-romantic": "#A45B8B",
  "late-romantic": "#7B3F8D",
  modern: "#3D6B5E",
};

const CATEGORY_TABS: { key: TermCategory | null; i18nKey: string }[] = [
  { key: null, i18nKey: "termExplorer.allCategories" },
  { key: "forms-and-structures", i18nKey: "termExplorer.formsAndStructures" },
  { key: "genres", i18nKey: "termExplorer.genres" },
  { key: "techniques", i18nKey: "termExplorer.techniques" },
  { key: "vocal-and-choral", i18nKey: "termExplorer.vocalAndChoral" },
  { key: "dance-and-character", i18nKey: "termExplorer.danceAndCharacter" },
  { key: "solo-and-chamber", i18nKey: "termExplorer.soloAndChamber" },
];

interface TermExplorerProps {
  onNavigateToTimeline?: () => void;
}

export default function TermExplorer({ onNavigateToTimeline }: TermExplorerProps) {
  const { t } = useTranslation();
  const allTerms = useTerms();
  const compositions = useCompositions();
  const composers = useComposers();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TermCategory | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Build lookup maps for compositions and composers
  const compositionMap = useMemo(
    () => new Map(compositions.map((c) => [c.id, c])),
    [compositions],
  );
  const composerMap = useMemo(
    () => new Map(composers.map((c) => [c.id, c])),
    [composers],
  );

  // Filter terms by category and search query
  const filteredTerms = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return allTerms.filter((term: MusicalTerm) => {
      if (selectedCategory && !term.categories.includes(selectedCategory)) {
        return false;
      }
      if (query) {
        return (
          term.term.toLowerCase().includes(query) ||
          term.shortDefinition.toLowerCase().includes(query) ||
          term.longDefinition.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [allTerms, selectedCategory, searchQuery]);

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>{t("termExplorer.title")}</h1>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={t("termExplorer.searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label={t("termExplorer.searchPlaceholder")}
        />
        {onNavigateToTimeline && (
          <button className={styles.backBtn} onClick={onNavigateToTimeline}>
            {t("termExplorer.backToTimeline")}
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className={styles.tabs} role="tablist">
        {CATEGORY_TABS.map(({ key, i18nKey }) => (
          <button
            key={i18nKey}
            role="tab"
            aria-selected={selectedCategory === key}
            className={`${styles.tab} ${selectedCategory === key ? styles.tabActive : ""}`}
            onClick={() => setSelectedCategory(key)}
          >
            {t(i18nKey)}
          </button>
        ))}
      </div>

      {/* Card grid */}
      <div className={styles.grid}>
        {filteredTerms.length === 0 && (
          <p className={styles.noResults}>{t("termExplorer.noResults")}</p>
        )}

        {filteredTerms.map((term: MusicalTerm) => {
          const isExpanded = expandedIds.has(term.id);

          return (
            <div
              key={term.id}
              className={styles.card}
              onClick={() => toggleExpanded(term.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleExpanded(term.id);
                }
              }}
              aria-expanded={isExpanded}
            >
              <h2 className={styles.termName}>{term.term}</h2>
              <p className={styles.definition}>{term.shortDefinition}</p>

              {isExpanded && (
                <p className={styles.longDefinition}>{term.longDefinition}</p>
              )}

              {/* Era badges */}
              <div className={styles.eraBadges}>
                {term.eraOrigin.map((era) => {
                  const color = ERA_COLORS[era] || "#666";
                  return (
                    <span
                      key={era}
                      className={styles.eraBadge}
                      style={{
                        backgroundColor: color + "22",
                        color,
                        borderColor: color + "44",
                      }}
                    >
                      {era.replace(/-/g, " ")}
                    </span>
                  );
                })}
              </div>

              {/* Example compositions */}
              {term.exampleCompositionIds.length > 0 && (
                <div className={styles.examples}>
                  <p className={styles.examplesTitle}>
                    {t("termExplorer.exampleWorks")}
                  </p>
                  {term.exampleCompositionIds.map((compId) => {
                    const composition = compositionMap.get(compId);
                    if (!composition) return null;
                    const composer = composerMap.get(composition.composerId);
                    return (
                      <div key={compId} className={styles.exampleItem}>
                        {composition.title}
                        {composer && ` — ${composer.shortName}`}
                        {composition.spotifyUrl && (
                          <span className={styles.spotifyIcon}>♫</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Wikipedia link */}
              {term.wikipediaSlug && (
                <a
                  href={getWikipediaUrl(term.wikipediaSlug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.wikiLink}
                  onClick={(e) => e.stopPropagation()}
                >
                  {t("termExplorer.readMore")}
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
