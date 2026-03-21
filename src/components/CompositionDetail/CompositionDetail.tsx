import React from "react";
import { useTranslation } from "react-i18next";
import { useComposition, useComposer } from "@/hooks/useData";
import { useSelectionStore } from "@/stores/useSelectionStore";
import { formatYear } from "@/utils/scales";
import styles from "./CompositionDetail.module.css";

interface CompositionDetailProps {
  compositionId: string;
}

export default function CompositionDetail({ compositionId }: CompositionDetailProps) {
  const { t } = useTranslation();
  const composition = useComposition(compositionId);
  const { selectComposition, selectComposer } = useSelectionStore();

  const composer = useComposer(composition?.composerId ?? "");

  if (!composition) return null;

  return (
    <div
      className={styles.panel}
      role="complementary"
      aria-label={t('composition.ariaLabel')}
    >
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>{composition.title}</h2>
        <button
          className={styles.closeBtn}
          onClick={() => selectComposition(null)}
          aria-label={t('composition.closeAriaLabel')}
        >
          ×
        </button>
      </div>

      {/* Meta row */}
      <div className={styles.meta}>
        {composer && (
          <button
            className={styles.composerChip}
            onClick={() => {
              selectComposition(null);
              selectComposer(composition.composerId);
            }}
            title={t('composition.openProfile', { name: composer.name })}
          >
            {composer.name}
          </button>
        )}
        <span className={styles.year}>{formatYear(composition.yearComposed)}</span>
        <span className={styles.genreBadge}>
          {composition.genre.replace(/-/g, " ")}
        </span>
      </div>

      {/* Description */}
      <p className={styles.description}>{composition.description}</p>

      {/* Details grid */}
      <dl className={styles.details}>
        <div className={styles.detailRow}>
          <dt className={styles.detailLabel}>{t('composition.instrumentation')}</dt>
          <dd className={styles.detailValue}>{composition.instrumentation}</dd>
        </div>
        {composition.key && (
          <div className={styles.detailRow}>
            <dt className={styles.detailLabel}>{t('composition.key')}</dt>
            <dd className={styles.detailValue}>{composition.key}</dd>
          </div>
        )}
        {composition.catalogueNumber && (
          <div className={styles.detailRow}>
            <dt className={styles.detailLabel}>{t('composition.catalogue')}</dt>
            <dd className={styles.detailValue}>{composition.catalogueNumber}</dd>
          </div>
        )}
      </dl>

      {/* Significance */}
      {composition.significance && (
        <div className={styles.significance}>
          <span className={styles.significanceIcon}>♪</span>
          {composition.significance}
        </div>
      )}

      {/* Wikipedia link */}
      {composition.wikipediaSlug && (
        <a
          href={`https://en.wikipedia.org/wiki/${composition.wikipediaSlug}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.wikiLink}
        >
          <span aria-hidden="true">↗</span> {t('common.readOnWikipedia')}
        </a>
      )}

      {/* Spotify link */}
      {(composition as any).spotifyUrl && (
        <a
          href={(composition as any).spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.spotifyLink}
        >
          <span aria-hidden="true">▶</span> {t('composition.listenOnSpotify')}
        </a>
      )}
    </div>
  );
}
