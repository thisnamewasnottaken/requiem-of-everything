import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  useInstruments,
  useInstrumentsByFamily,
  useCompositions,
  useComposers,
} from "@/hooks/useData";
import { getWikipediaUrl } from "@/utils/wikipedia";
import type { Instrument, InstrumentFamily, MusicalEra } from "@/types";
import styles from "./OrchestraExplorer.module.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrchestraExplorerProps {
  onNavigateToTimeline?: () => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FAMILY_ORDER: InstrumentFamily[] = [
  "percussion",
  "brass",
  "woodwinds",
  "strings",
  "keyboards",
  "voice",
];

const FAMILY_ICONS: Record<InstrumentFamily, string> = {
  strings: "🎻",
  woodwinds: "🎵",
  brass: "🎺",
  percussion: "🥁",
  keyboards: "🎹",
  voice: "🎤",
};

const FAMILY_COLORS: Record<InstrumentFamily, string> = {
  strings: "#C4A035",
  woodwinds: "#27AE60",
  brass: "#E67E22",
  percussion: "#E74C3C",
  keyboards: "#3498DB",
  voice: "#9B59B6",
};

const ERA_COLORS: Record<MusicalEra, string> = {
  renaissance: "var(--era-renaissance)",
  baroque: "var(--era-baroque)",
  classical: "var(--era-classical)",
  "early-romantic": "var(--era-early-romantic)",
  "late-romantic": "var(--era-late-romantic)",
  modern: "var(--era-modern)",
};

const ERA_LABELS: Record<MusicalEra, string> = {
  renaissance: "Ren",
  baroque: "Bar",
  classical: "Cla",
  "early-romantic": "ERom",
  "late-romantic": "LRom",
  modern: "Mod",
};

const ALL_ERAS: MusicalEra[] = [
  "renaissance",
  "baroque",
  "classical",
  "early-romantic",
  "late-romantic",
  "modern",
];

const MAX_FEATURED = 5;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EraDots({
  eraProminence,
}: {
  eraProminence: Instrument["eraProminence"];
}) {
  const prominenceMap = new Map(eraProminence.map((e) => [e.era, e.prominence]));

  return (
    <div className={styles.eraDotsRow}>
      {ALL_ERAS.map((era) => {
        const prominence = prominenceMap.get(era);
        if (!prominence) return null;

        const dotClass = [
          styles.eraDot,
          prominence === "secondary" ? styles.eraDotSecondary : "",
          prominence === "rare" ? styles.eraDotRare : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <span
            key={era}
            className={dotClass}
            style={{
              borderColor: ERA_COLORS[era],
              backgroundColor:
                prominence === "rare" ? "transparent" : ERA_COLORS[era],
            }}
            title={era}
          />
        );
      })}
    </div>
  );
}

function EraTimeline({
  eraProminence,
}: {
  eraProminence: Instrument["eraProminence"];
}) {
  const prominenceMap = new Map(eraProminence.map((e) => [e.era, e.prominence]));

  return (
    <div className={styles.eraTimeline}>
      {ALL_ERAS.map((era) => {
        const prominence = prominenceMap.get(era);
        if (!prominence) return null;

        const barClass = [
          styles.eraBar,
          prominence === "secondary" ? styles.eraBarSecondary : "",
          prominence === "rare" ? styles.eraBarRare : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <span
            key={era}
            className={barClass}
            style={{
              backgroundColor: ERA_COLORS[era],
              flex: 1,
            }}
          >
            {ERA_LABELS[era]}
          </span>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Family Section
// ---------------------------------------------------------------------------

interface FamilySectionProps {
  family: InstrumentFamily;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectInstrument: (id: string) => void;
}

function FamilySection({
  family,
  isExpanded,
  onToggle,
  onSelectInstrument,
}: FamilySectionProps) {
  const { t } = useTranslation();
  const instruments = useInstrumentsByFamily(family);

  return (
    <div className={styles.familySection}>
      <button
        className={styles.familyHeader}
        style={{ borderLeftColor: FAMILY_COLORS[family] }}
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <span className={styles.familyIcon}>{FAMILY_ICONS[family]}</span>
        <span className={styles.familyName}>
          {t(`orchestraExplorer.${family}`)}
        </span>
        <span className={styles.familyCount}>
          {t("orchestraExplorer.instruments", { count: instruments.length })}
        </span>
        <span
          className={`${styles.expandIndicator} ${isExpanded ? styles.expandIndicatorOpen : ""}`}
        >
          ▸
        </span>
      </button>

      {isExpanded && (
        <div className={styles.instrumentList}>
          {instruments.map((inst) => (
            <div
              key={inst.id}
              className={styles.instrumentCard}
              onClick={() => onSelectInstrument(inst.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectInstrument(inst.id);
                }
              }}
            >
              <div className={styles.instrumentName}>{inst.name}</div>
              <div className={styles.instrumentRange}>{inst.range}</div>
              <div className={styles.instrumentRole}>{inst.role}</div>
              <EraDots eraProminence={inst.eraProminence} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail Panel
// ---------------------------------------------------------------------------

interface DetailPanelProps {
  instrument: Instrument;
  onClose: () => void;
}

function DetailPanel({ instrument, onClose }: DetailPanelProps) {
  const { t } = useTranslation();
  const compositions = useCompositions();
  const composers = useComposers();

  const featured = useMemo(() => {
    const name = instrument.name.toLowerCase();
    return compositions
      .filter((c) => c.instrumentation.toLowerCase().includes(name))
      .sort((a, b) => a.yearComposed - b.yearComposed)
      .slice(0, MAX_FEATURED);
  }, [compositions, instrument.name]);

  const composerMap = useMemo(
    () => new Map(composers.map((c) => [c.id, c])),
    [composers],
  );

  return (
    <>
      <div
        className={styles.detailBackdrop}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={styles.detailOverlay}
        role="complementary"
        aria-label={instrument.name}
      >
        <div className={styles.detailHeader}>
          <h2 className={styles.detailName}>{instrument.name}</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t("orchestraExplorer.closeDetail")}
          >
            ✕
          </button>
        </div>

        <span
          className={styles.detailFamily}
          style={{ backgroundColor: FAMILY_COLORS[instrument.family] }}
        >
          {FAMILY_ICONS[instrument.family]}{" "}
          {t(`orchestraExplorer.${instrument.family}`)}
        </span>

        <div className={styles.detailRangeLabel}>
          {t("orchestraExplorer.range")}
        </div>
        <div className={styles.detailRange}>{instrument.range}</div>

        <div className={styles.detailRoleLabel}>
          {t("orchestraExplorer.role")}
        </div>
        <div className={styles.detailRole}>{instrument.role}</div>

        <div className={styles.detailDescription}>{instrument.description}</div>

        <div className={styles.detailEraLabel}>
          {t("orchestraExplorer.eraProminence")}
        </div>
        <EraTimeline eraProminence={instrument.eraProminence} />

        {featured.length > 0 && (
          <>
            <div className={styles.detailFeaturedLabel}>
              {t("orchestraExplorer.featuredIn")}
            </div>
            <div className={styles.compositionList}>
              {featured.map((comp) => {
                const composer = composerMap.get(comp.composerId);
                return (
                  <div key={comp.id} className={styles.compositionItem}>
                    <span className={styles.compositionTitle}>
                      {comp.title}
                    </span>{" "}
                    <span className={styles.compositionComposer}>
                      {composer ? composer.shortName : comp.composerId} (
                      {comp.yearComposed})
                    </span>
                    {comp.spotifyUrl && (
                      <a
                        href={comp.spotifyUrl}
                        className={styles.spotifyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        🎧 Spotify
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        <a
          href={getWikipediaUrl(instrument.wikipediaSlug)}
          className={styles.wikiLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("orchestraExplorer.readMore")}
        </a>
      </aside>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function OrchestraExplorer({
  onNavigateToTimeline,
}: OrchestraExplorerProps) {
  const { t } = useTranslation();
  const instruments = useInstruments();
  const [expandedFamilies, setExpandedFamilies] = useState<
    Set<InstrumentFamily>
  >(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedInstrument = useMemo(
    () => instruments.find((i) => i.id === selectedId) ?? null,
    [instruments, selectedId],
  );

  const toggleFamily = useCallback((family: InstrumentFamily) => {
    setExpandedFamilies((prev) => {
      const next = new Set(prev);
      if (next.has(family)) {
        next.delete(family);
      } else {
        next.add(family);
      }
      return next;
    });
  }, []);

  const handleSelectInstrument = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedId(null);
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>{t("orchestraExplorer.title")}</h1>
        {onNavigateToTimeline && (
          <button className={styles.backBtn} onClick={onNavigateToTimeline}>
            {t("orchestraExplorer.backToTimeline")}
          </button>
        )}
      </header>

      <div className={styles.orchestraGrid}>
        {FAMILY_ORDER.map((family) => (
          <FamilySection
            key={family}
            family={family}
            isExpanded={expandedFamilies.has(family)}
            onToggle={() => toggleFamily(family)}
            onSelectInstrument={handleSelectInstrument}
          />
        ))}
      </div>

      {selectedInstrument && (
        <DetailPanel
          instrument={selectedInstrument}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}
