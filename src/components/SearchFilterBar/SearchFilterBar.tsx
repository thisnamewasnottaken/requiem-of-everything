import { useTranslation } from "react-i18next";
import { useFilterStore } from "@/stores/useFilterStore";
import { useComparisonStore } from "@/stores/useComparisonStore";
import styles from "./SearchFilterBar.module.css";

interface SearchFilterBarProps {
  filterOpen: boolean;
  onToggleFilters: () => void;
}

export default function SearchFilterBar({
  filterOpen,
  onToggleFilters,
}: SearchFilterBarProps) {
  const { t } = useTranslation();
  const {
    searchQuery,
    setSearchQuery,
    eraFilters,
    nationalityFilters,
    genreFilters,
    showHistoricalEvents,
  } = useFilterStore();

  const activeFilterCount =
    eraFilters.length +
    nationalityFilters.length +
    genreFilters.length +
    (!showHistoricalEvents ? 1 : 0);

  const { isComparisonMode } = useComparisonStore();

  return (
    <div className={styles.searchFilterBar}>
      {!isComparisonMode && (
        <div className={styles.searchWrapper}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder={t("filters.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t("filters.searchAriaLabel")}
          />
          {searchQuery && (
            <button
              className={styles.clearSearch}
              onClick={() => setSearchQuery("")}
              aria-label={t("filters.clearSearchAriaLabel")}
            >
              ×
            </button>
          )}
        </div>
      )}

      <button
        className={`${styles.filterBtn} ${filterOpen ? styles.filterBtnActive : ""} ${activeFilterCount > 0 ? styles.filterBtnHasFilters : ""}`}
        onClick={onToggleFilters}
        aria-label={t("app.filters")}
      >
        ⚙{" "}
        {activeFilterCount > 0
          ? `${t("app.filters")} (${activeFilterCount})`
          : t("app.filters")}
      </button>
    </div>
  );
}
