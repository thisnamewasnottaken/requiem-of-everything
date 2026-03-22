import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTerms, useCompositions, useComposers } from "@/hooks/useData";
import { useFilterStore } from "@/stores/useFilterStore";
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

export default function TermExplorer({
  onNavigateToTimeline,
}: TermExplorerProps) {
  const { t } = useTranslation();
  const allTerms = useTerms();
  const compositions = useCompositions();
  const composers = useComposers();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TermCategory | null>(
    null,
  );
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);

  const { eraFilters, searchQuery: globalSearchQuery } = useFilterStore();

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Build lookup maps for compositions and composers
  const compositionMap = useMemo(
    () => new Map(compositions.map((c) => [c.id, c])),
    [compositions],
  );
  const composerMap = useMemo(
    () => new Map(composers.map((c) => [c.id, c])),
    [composers],
  );

  // Filter terms by category, local search, and global filters (era + search)
  const filteredTerms = useMemo(() => {
    const localQuery = searchQuery.toLowerCase().trim();
    const globalQuery = globalSearchQuery.toLowerCase().trim();
    return allTerms.filter((term: MusicalTerm) => {
      // Category tab filter
      if (selectedCategory && !term.categories.includes(selectedCategory)) {
        return false;
      }
      // Global era filters — term must originate in at least one selected era
      if (
        eraFilters.length > 0 &&
        !term.eraOrigin.some((era) => eraFilters.includes(era))
      ) {
        return false;
      }
      // Global search query from FilterPanel
      if (globalQuery) {
        const matchesGlobal =
          term.term.toLowerCase().includes(globalQuery) ||
          term.shortDefinition.toLowerCase().includes(globalQuery) ||
          term.longDefinition.toLowerCase().includes(globalQuery);
        if (!matchesGlobal) return false;
      }
      // Local search input
      if (localQuery) {
        return (
          term.term.toLowerCase().includes(localQuery) ||
          term.shortDefinition.toLowerCase().includes(localQuery) ||
          term.longDefinition.toLowerCase().includes(localQuery)
        );
      }
      return true;
    });
  }, [allTerms, selectedCategory, searchQuery, eraFilters, globalSearchQuery]);

  const selectedTerm = selectedTermId
    ? (allTerms.find((term) => term.id === selectedTermId) ?? null)
    : null;

  // Close modal on Escape
  useEffect(() => {
    if (!selectedTermId) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedTermId(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedTermId]);

  // Auto-focus close button when modal opens
  useEffect(() => {
    if (selectedTermId && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [selectedTermId]);

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

        {filteredTerms.map((term: MusicalTerm) => (
          <div
            key={term.id}
            className={styles.card}
            onClick={() => setSelectedTermId(term.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedTermId(term.id);
              }
            }}
          >
            <h2 className={styles.termName}>{term.term}</h2>
            <p className={styles.definition}>{term.shortDefinition}</p>
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
          </div>
        ))}
      </div>

      {/* Modal overlay */}
      {selectedTerm && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setSelectedTermId(null)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={selectedTerm.term}
          >
            <button
              ref={closeButtonRef}
              className={styles.modalClose}
              onClick={() => setSelectedTermId(null)}
              aria-label="Close"
            >
              ✕
            </button>

            <h2 className={styles.modalTitle}>{selectedTerm.term}</h2>
            <p className={styles.modalShortDef}>
              {selectedTerm.shortDefinition}
            </p>
            <p className={styles.modalLongDef}>{selectedTerm.longDefinition}</p>

            <div className={styles.eraBadges}>
              {selectedTerm.eraOrigin.map((era) => {
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

            {selectedTerm.exampleCompositionIds.length > 0 && (
              <>
                <div className={styles.modalDivider} />
                <p className={styles.examplesTitle}>
                  {t("termExplorer.exampleWorks")}
                </p>
                {selectedTerm.exampleCompositionIds.map((compId) => {
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
              </>
            )}

            {selectedTerm.wikipediaSlug && (
              <a
                href={getWikipediaUrl(selectedTerm.wikipediaSlug)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.wikiLink}
                onClick={(e) => e.stopPropagation()}
              >
                {t("termExplorer.readMore")}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
