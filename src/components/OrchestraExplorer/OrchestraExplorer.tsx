import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  useInstruments,
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

interface FamilyMeta {
  id: InstrumentFamily;
  icon: string;
  color: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FAMILY_META: Record<InstrumentFamily, FamilyMeta> = {
  strings: { id: "strings", icon: "🎻", color: "#C4A035" },
  woodwinds: { id: "woodwinds", icon: "🎵", color: "#27AE60" },
  brass: { id: "brass", icon: "🎺", color: "#E67E22" },
  percussion: { id: "percussion", icon: "🥁", color: "#E74C3C" },
  keyboards: { id: "keyboards", icon: "🎹", color: "#3498DB" },
  voice: { id: "voice", icon: "🎤", color: "#9B59B6" },
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
// Helper — inline CSS variable for family color
// ---------------------------------------------------------------------------

function familyStyle(
  color: string,
  selected: boolean,
  dimmed: boolean,
): React.CSSProperties {
  if (dimmed) {
    return {
      "--fc": color,
      background: `rgba(255,255,255,0.02)`,
      borderColor: `rgba(255,255,255,0.04)`,
      opacity: 0.3,
    } as React.CSSProperties;
  }
  if (selected) {
    return {
      "--fc": color,
      background: `${color}28`,
      borderColor: `${color}99`,
      boxShadow: `0 0 30px ${color}33`,
    } as React.CSSProperties;
  }
  return {
    "--fc": color,
    background: `${color}14`,
    borderColor: `${color}26`,
  } as React.CSSProperties;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Era prominence dots shown on instrument cards */
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
        const cls = [
          styles.eraDot,
          prominence === "secondary" ? styles.eraDotSecondary : "",
          prominence === "rare" ? styles.eraDotRare : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <span
            key={era}
            className={cls}
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

/** Era prominence bar chart in the detail panel */
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
        const cls = [
          styles.eraBar,
          prominence === "secondary" ? styles.eraBarSecondary : "",
          prominence === "rare" ? styles.eraBarRare : "",
        ]
          .filter(Boolean)
          .join(" ");
        return (
          <span
            key={era}
            className={cls}
            style={{ backgroundColor: ERA_COLORS[era], flex: 1 }}
          >
            {ERA_LABELS[era]}
          </span>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stage Section — a clickable region on the seating map
// ---------------------------------------------------------------------------

interface StageSectionProps {
  family: InstrumentFamily;
  count: number;
  isSelected: boolean;
  isDimmed: boolean;
  className: string;
  onClick: () => void;
}

function StageSection({
  family,
  count,
  isSelected,
  isDimmed,
  className,
  onClick,
}: StageSectionProps) {
  const { t } = useTranslation();
  const meta = FAMILY_META[family];

  return (
    <button
      className={`${styles.familySection} ${className} ${isSelected ? styles.familySectionSelected : ""}`}
      style={familyStyle(meta.color, isSelected, isDimmed)}
      onClick={onClick}
      aria-pressed={isSelected}
      aria-label={t(`orchestraExplorer.${family}`)}
    >
      <span className={styles.sectionIcon}>{meta.icon}</span>
      <span className={styles.sectionName}>
        {t(`orchestraExplorer.${family}`)}
      </span>
      <span className={styles.sectionCount}>
        {t("orchestraExplorer.instruments", { count })}
      </span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Instrument Panel — cards shown below the stage
// ---------------------------------------------------------------------------

interface InstrumentPanelProps {
  instruments: Instrument[];
  family: InstrumentFamily;
  onSelect: (inst: Instrument) => void;
}

function InstrumentPanel({ instruments, family, onSelect }: InstrumentPanelProps) {
  const meta = FAMILY_META[family];

  return (
    <div className={styles.instrumentPanel}>
      <div className={styles.instrumentGrid}>
        {instruments.map((inst) => (
          <div
            key={inst.id}
            className={styles.instrumentCard}
            style={{ borderTopColor: meta.color }}
            onClick={() => onSelect(inst)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(inst);
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
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail Panel — slide-in from right
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

  const meta = FAMILY_META[instrument.family];

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
          style={{ backgroundColor: meta.color }}
        >
          {meta.icon} {t(`orchestraExplorer.${instrument.family}`)}
        </span>

        <div className={styles.detailLabel}>
          {t("orchestraExplorer.range")}
        </div>
        <div className={styles.detailRange}>{instrument.range}</div>

        <div className={styles.detailLabel}>
          {t("orchestraExplorer.role")}
        </div>
        <div className={styles.detailRole}>{instrument.role}</div>

        <div className={styles.detailDescription}>{instrument.description}</div>

        <div className={styles.detailLabel}>
          {t("orchestraExplorer.eraProminence")}
        </div>
        <EraTimeline eraProminence={instrument.eraProminence} />

        {featured.length > 0 && (
          <>
            <div className={styles.detailLabel}>
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
  const allInstruments = useInstruments();
  const [selectedFamily, setSelectedFamily] = useState<InstrumentFamily | null>(
    null,
  );
  const [selectedInstrument, setSelectedInstrument] =
    useState<Instrument | null>(null);

  // Pre-compute instrument counts per family
  const familyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const inst of allInstruments) {
      counts[inst.family] = (counts[inst.family] ?? 0) + 1;
    }
    return counts;
  }, [allInstruments]);

  // Instruments for the selected family
  const familyInstruments = useMemo(
    () =>
      selectedFamily
        ? allInstruments.filter((i) => i.family === selectedFamily)
        : [],
    [allInstruments, selectedFamily],
  );

  const handleFamilyClick = useCallback(
    (family: InstrumentFamily) => {
      setSelectedFamily((prev) => (prev === family ? null : family));
      setSelectedInstrument(null);
    },
    [],
  );

  const handleInstrumentSelect = useCallback((inst: Instrument) => {
    setSelectedInstrument(inst);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedInstrument(null);
  }, []);

  // Helper: is a section dimmed?
  const isDimmed = (family: InstrumentFamily) =>
    selectedFamily !== null && selectedFamily !== family;

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <h1 className={styles.title}>{t("orchestraExplorer.title")}</h1>
        {onNavigateToTimeline && (
          <button className={styles.backBtn} onClick={onNavigateToTimeline}>
            {t("orchestraExplorer.backToTimeline")}
          </button>
        )}
      </header>

      {/* Orchestra Stage — bird's-eye seating chart */}
      <div className={styles.stage}>
        {/* Subtle stage floor rings for realism */}
        <div className={styles.stageRing} aria-hidden="true" />
        <div className={styles.stageRingInner} aria-hidden="true" />

        {/* Tier 1 — back: Percussion */}
        <div className={`${styles.tier} ${styles.tier1}`}>
          <StageSection
            family="percussion"
            count={familyCounts["percussion"] ?? 0}
            isSelected={selectedFamily === "percussion"}
            isDimmed={isDimmed("percussion")}
            className={styles.sectionPercussion}
            onClick={() => handleFamilyClick("percussion")}
          />
        </div>

        {/* Tier 2 — Brass */}
        <div className={`${styles.tier} ${styles.tier2}`}>
          <StageSection
            family="brass"
            count={familyCounts["brass"] ?? 0}
            isSelected={selectedFamily === "brass"}
            isDimmed={isDimmed("brass")}
            className={styles.sectionBrass}
            onClick={() => handleFamilyClick("brass")}
          />
        </div>

        {/* Tier 3 — Woodwinds */}
        <div className={`${styles.tier} ${styles.tier3}`}>
          <StageSection
            family="woodwinds"
            count={familyCounts["woodwinds"] ?? 0}
            isSelected={selectedFamily === "woodwinds"}
            isDimmed={isDimmed("woodwinds")}
            className={styles.sectionWoodwinds}
            onClick={() => handleFamilyClick("woodwinds")}
          />
        </div>

        {/* Tier 4 — front: Keyboards | Strings | Voice */}
        <div className={`${styles.tier} ${styles.tier4}`}>
          <StageSection
            family="keyboards"
            count={familyCounts["keyboards"] ?? 0}
            isSelected={selectedFamily === "keyboards"}
            isDimmed={isDimmed("keyboards")}
            className={styles.sectionSide}
            onClick={() => handleFamilyClick("keyboards")}
          />
          <StageSection
            family="strings"
            count={familyCounts["strings"] ?? 0}
            isSelected={selectedFamily === "strings"}
            isDimmed={isDimmed("strings")}
            className={styles.sectionStrings}
            onClick={() => handleFamilyClick("strings")}
          />
          <StageSection
            family="voice"
            count={familyCounts["voice"] ?? 0}
            isSelected={selectedFamily === "voice"}
            isDimmed={isDimmed("voice")}
            className={styles.sectionSide}
            onClick={() => handleFamilyClick("voice")}
          />
        </div>

        {/* Conductor podium */}
        <div className={styles.conductor} aria-hidden="true">
          <div className={styles.conductorDot} />
          <span className={styles.conductorLabel}>Conductor</span>
        </div>
      </div>

      {/* Prompt or instrument cards below the stage */}
      {selectedFamily === null && (
        <p className={styles.prompt}>{t("orchestraExplorer.clickPrompt", { defaultValue: "Click a section to explore instruments" })}</p>
      )}

      {selectedFamily !== null && (
        <InstrumentPanel
          instruments={familyInstruments}
          family={selectedFamily}
          onSelect={handleInstrumentSelect}
        />
      )}

      {/* Detail Panel */}
      {selectedInstrument && (
        <DetailPanel
          instrument={selectedInstrument}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
}
