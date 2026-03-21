import React from "react";
import { useTranslation } from "react-i18next";
import { useComparisonStore } from "@/stores/useComparisonStore";
import { useComposers } from "@/hooks/useData";
import styles from "./ComparisonBar.module.css";

export default function ComparisonBar() {
  const { t } = useTranslation();
  const {
    comparisonComposerIds,
    isComparisonMode,
    removeFromComparison,
    clearComparison,
  } = useComparisonStore();
  const allComposers = useComposers();

  if (comparisonComposerIds.length === 0) return null;

  const composerNameMap = new Map(allComposers.map((c) => [c.id, c.shortName]));

  return (
    <div className={styles.comparisonBar}>
      <span className={styles.label}>
        {isComparisonMode ? t('comparison.comparing') : t('comparison.selected')}
      </span>
      <div className={styles.chips}>
        {comparisonComposerIds.map((id) => (
          <button
            key={id}
            className={styles.chip}
            onClick={() => removeFromComparison(id)}
            title={t('comparison.remove', { name: composerNameMap.get(id) || id })}
          >
            {composerNameMap.get(id) || id}
            <span className={styles.chipRemove}>×</span>
          </button>
        ))}
      </div>
      {!isComparisonMode && (
        <span className={styles.hint}>{t('comparison.ctrlClickHint')}</span>
      )}
      <button
        className={styles.clearBtn}
        onClick={clearComparison}
        title={t('comparison.clearAllTitle')}
      >
        {t('comparison.clear')}
      </button>
    </div>
  );
}
