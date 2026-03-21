import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFilterStore } from "@/stores/useFilterStore";
import { useEras, useComposers, useCompositions } from "@/hooks/useData";
import type { MusicalEra, CompositionGenre } from "@/types";
import styles from "./FilterPanel.module.css";

interface FilterPanelProps {
  onClose: () => void;
}

export default function FilterPanel({ onClose }: FilterPanelProps) {
  const { t } = useTranslation();
  const {
    eraFilters,
    nationalityFilters,
    genreFilters,
    showHistoricalEvents,
    searchQuery,
    toggleEra,
    toggleNationality,
    toggleGenre,
    toggleHistoricalEvents,
    setSearchQuery,
    clearAllFilters,
  } = useFilterStore();

  const eras = useEras();
  const allComposers = useComposers();
  const allCompositions = useCompositions();

  // Derive available filter values from data
  const nationalities = useMemo(
    () => [...new Set(allComposers.map((c) => c.nationality))].sort(),
    [allComposers],
  );

  const genres = useMemo(
    () =>
      ([...new Set(allCompositions.map((c) => c.genre))] as CompositionGenre[]).sort(),
    [allCompositions],
  );

  const activeFilterCount =
    eraFilters.length + nationalityFilters.length + genreFilters.length +
    (searchQuery ? 1 : 0) + (!showHistoricalEvents ? 1 : 0);

  return (
    <nav
      className={styles.filterPanel}
      aria-label={t('filters.ariaLabel')}
    >
      <div className={styles.header}>
        <h2 className={styles.title}>
          {t('filters.title')}
          {activeFilterCount > 0 && (
            <span className={styles.filterCount}>{activeFilterCount}</span>
          )}
        </h2>
        <button
          className={styles.closeBtn}
          onClick={onClose}
          aria-label={t('filters.closeAriaLabel')}
        >
          ×
        </button>
      </div>

      <input
        className={styles.searchInput}
        type="text"
        placeholder={t('filters.searchPlaceholder')}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        aria-label={t('filters.searchAriaLabel')}
        autoFocus
      />

      {/* Era filters */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('filters.musicalEra')}</h3>
        <div className={styles.chipGroup} role="group" aria-label={t('filters.filterByEra')}>
          {eras.map((era) => {
            const active = eraFilters.includes(era.id as MusicalEra);
            return (
              <button
                key={era.id}
                className={`${styles.chip} ${styles.eraChip} ${active ? styles.chipActive : ""}`}
                onClick={() => toggleEra(era.id as MusicalEra)}
                aria-pressed={active}
                aria-label={active ? t('filters.removeFilter', { name: era.name }) : t('filters.addFilter', { name: era.name })}
              >
                <span
                  className={styles.eraChipDot}
                  style={{ backgroundColor: era.color }}
                />
                {era.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Nationality filters */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('filters.nationality')}</h3>
        <div className={styles.chipGroup} role="group" aria-label={t('filters.filterByNationality')}>
          {nationalities.map((nat) => {
            const active = nationalityFilters.includes(nat);
            return (
              <button
                key={nat}
                className={`${styles.chip} ${active ? styles.chipActive : ""}`}
                onClick={() => toggleNationality(nat)}
                aria-pressed={active}
                aria-label={active ? t('filters.removeFilter', { name: nat }) : t('filters.addFilter', { name: nat })}
              >
                {nat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Genre filters */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('filters.genre')}</h3>
        <div className={styles.chipGroup} role="group" aria-label={t('filters.filterByGenre')}>
          {genres.map((genre) => {
            const active = genreFilters.includes(genre);
            return (
              <button
                key={genre}
                className={`${styles.chip} ${active ? styles.chipActive : ""}`}
                onClick={() => toggleGenre(genre)}
                aria-pressed={active}
                aria-label={active ? t('filters.removeFilter', { name: genre.replace(/-/g, " ") }) : t('filters.addFilter', { name: genre.replace(/-/g, " ") })}
              >
                {genre.replace(/-/g, " ")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Historical events toggle */}
      <div className={styles.section}>
        <div className={styles.toggleRow}>
          <span className={styles.toggleLabel}>{t('filters.historicalEvents')}</span>
          <button
            className={`${styles.toggle} ${showHistoricalEvents ? styles.toggleOn : ""}`}
            onClick={toggleHistoricalEvents}
            role="switch"
            aria-checked={showHistoricalEvents}
            aria-label={t('filters.toggleEvents')}
          >
            <span className={styles.toggleDot} />
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <button className={styles.clearBtn} onClick={clearAllFilters}>
          {t('filters.clearAll')}
        </button>
      </div>
    </nav>
  );
}
