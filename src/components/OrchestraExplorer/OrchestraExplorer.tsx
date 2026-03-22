import { useState, useMemo, useCallback, useEffect } from "react";
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

interface SectionDef {
  family: InstrumentFamily;
  innerR: number;
  outerR: number;
  startDeg: number;
  endDeg: number;
  narrow?: boolean;
}

// ---------------------------------------------------------------------------
// SVG Geometry
// ---------------------------------------------------------------------------

const CX = 480;
const CY = 510;
const VIEWBOX = "0 0 960 540";
const RING_RADII = [240, 330, 410];

const SECTIONS: SectionDef[] = [
  { family: "strings",    innerR: 95,  outerR: 235, startDeg: 24,  endDeg: 148 },
  { family: "keyboards",  innerR: 95,  outerR: 320, startDeg: 5,   endDeg: 21,  narrow: true },
  { family: "voice",      innerR: 95,  outerR: 320, startDeg: 151, endDeg: 175, narrow: true },
  { family: "woodwinds",  innerR: 250, outerR: 325, startDeg: 25,  endDeg: 148 },
  { family: "brass",      innerR: 340, outerR: 405, startDeg: 18,  endDeg: 162 },
  { family: "percussion", innerR: 420, outerR: 480, startDeg: 12,  endDeg: 168 },
];

function arcPath(
  cx: number, cy: number,
  innerR: number, outerR: number,
  startDeg: number, endDeg: number,
): string {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const a1 = toRad(180 - startDeg);
  const a2 = toRad(180 - endDeg);
  const x1 = cx + innerR * Math.cos(a1);
  const y1 = cy - innerR * Math.sin(a1);
  const x2 = cx + outerR * Math.cos(a1);
  const y2 = cy - outerR * Math.sin(a1);
  const x3 = cx + outerR * Math.cos(a2);
  const y3 = cy - outerR * Math.sin(a2);
  const x4 = cx + innerR * Math.cos(a2);
  const y4 = cy - innerR * Math.sin(a2);
  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0;
  return [
    `M ${x1} ${y1}`,
    `L ${x2} ${y2}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 0 ${x3} ${y3}`,
    `L ${x4} ${y4}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 1 ${x1} ${y1}`,
    "Z",
  ].join(" ");
}

function arcCenter(
  cx: number, cy: number,
  innerR: number, outerR: number,
  startDeg: number, endDeg: number,
): { x: number; y: number } {
  const midDeg = (startDeg + endDeg) / 2;
  const midR = (innerR + outerR) / 2;
  const rad = ((180 - midDeg) * Math.PI) / 180;
  return {
    x: cx + midR * Math.cos(rad),
    y: cy - midR * Math.sin(rad),
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FAMILY_META: Record<InstrumentFamily, { icon: string; color: string }> = {
  strings:    { icon: "🎻", color: "#C4A035" },
  woodwinds:  { icon: "🎵", color: "#27AE60" },
  brass:      { icon: "🎺", color: "#E67E22" },
  percussion: { icon: "🥁", color: "#E74C3C" },
  keyboards:  { icon: "🎹", color: "#3498DB" },
  voice:      { icon: "🎤", color: "#9B59B6" },
};

const FAMILY_ORDER: InstrumentFamily[] = [
  "strings", "woodwinds", "brass", "percussion", "keyboards", "voice",
];

const FAMILY_DESCRIPTIONS: Record<InstrumentFamily, string> = {
  strings: "The string family forms the foundation of the orchestra, producing sound through vibrating strings. Seated closest to the conductor, they provide the warm, rich core of the orchestral sound. The section typically includes first and second violins, violas, cellos, and double basses, with the harp adding ethereal colour.",
  woodwinds: "Woodwind instruments produce sound by splitting air across an edge or through vibrating reeds. Seated behind the strings, they add colour, agility, and character to the orchestral palette. From the bright flute to the sonorous bassoon, each has a distinctive voice.",
  brass: "The brass family creates sound through buzzing lips into a metal mouthpiece. Capable of tremendous power and brilliant tone, brass instruments provide the orchestra's most heroic and triumphant moments. They sit behind the woodwinds, projecting their sound over the entire ensemble.",
  percussion: "Percussion instruments produce sound when struck, shaken, or scraped. Positioned at the back of the orchestra, they provide rhythmic drive, dramatic accents, and colourful effects. The timpani are the most prominent, but the modern orchestra employs a vast array of pitched and unpitched percussion.",
  keyboards: "Keyboard instruments are played by pressing keys that activate hammers, plectra, or air flow. They add unique textures — from the piano's percussive brilliance to the organ's sustained grandeur and the celesta's bell-like shimmer.",
  voice: "The human voice is the oldest and most expressive instrument. In orchestral music, vocal soloists and choirs join the ensemble for operas, oratorios, masses, and symphonic works with vocal parts. Each voice type — soprano, alto, tenor, and bass — has a distinct range and character.",
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
  "renaissance", "baroque", "classical",
  "early-romantic", "late-romantic", "modern",
];

const MAX_FEATURED = 5;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EraTimeline({ eraProminence }: { eraProminence: Instrument["eraProminence"] }) {
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
        ].filter(Boolean).join(" ");
        return (
          <span key={era} className={cls} style={{ backgroundColor: ERA_COLORS[era], flex: 1 }}>
            {ERA_LABELS[era]}
          </span>
        );
      })}
    </div>
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
  const compositions = useCompositions();
  const composers = useComposers();

  const [selectedFamily, setSelectedFamily] = useState<InstrumentFamily | null>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<Instrument | null>(null);
  const [hoveredSection, setHoveredSection] = useState<InstrumentFamily | null>(null);

  const familyCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const inst of allInstruments) {
      counts[inst.family] = (counts[inst.family] ?? 0) + 1;
    }
    return counts;
  }, [allInstruments]);

  const familyInstruments = useMemo(
    () => selectedFamily ? allInstruments.filter((i) => i.family === selectedFamily) : [],
    [allInstruments, selectedFamily],
  );

  const featured = useMemo(() => {
    if (!selectedInstrument) return [];
    const name = selectedInstrument.name.toLowerCase();
    return compositions
      .filter((c) => c.instrumentation.toLowerCase().includes(name))
      .sort((a, b) => a.yearComposed - b.yearComposed)
      .slice(0, MAX_FEATURED);
  }, [compositions, selectedInstrument]);

  const composerMap = useMemo(
    () => new Map(composers.map((c) => [c.id, c])),
    [composers],
  );

  const handleFamilyClick = useCallback((family: InstrumentFamily) => {
    setSelectedFamily((prev) => (prev === family ? null : family));
    setSelectedInstrument(null);
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedFamily(null);
    setSelectedInstrument(null);
  }, []);

  const handleBackToFamily = useCallback(() => {
    setSelectedInstrument(null);
  }, []);

  const handleNextFamily = useCallback(() => {
    if (!selectedFamily) return;
    const idx = FAMILY_ORDER.indexOf(selectedFamily);
    setSelectedFamily(FAMILY_ORDER[(idx + 1) % FAMILY_ORDER.length]);
    setSelectedInstrument(null);
  }, [selectedFamily]);

  // Close on Escape
  useEffect(() => {
    if (!selectedFamily) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedInstrument) setSelectedInstrument(null);
        else setSelectedFamily(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedFamily, selectedInstrument]);

  // Section fill/stroke helpers
  const sectionFill = (family: InstrumentFamily): string => {
    const c = FAMILY_META[family].color;
    if (selectedFamily === family) return `${c}66`;
    if (selectedFamily !== null) return `${c}0D`;
    if (hoveredSection === family) return `${c}4D`;
    return `${c}26`;
  };

  const sectionStroke = (family: InstrumentFamily): string => {
    const c = FAMILY_META[family].color;
    if (selectedFamily === family) return `${c}CC`;
    if (selectedFamily !== null) return `${c}1A`;
    if (hoveredSection === family) return `${c}99`;
    return `${c}4D`;
  };

  const nextFamilyId = selectedFamily
    ? FAMILY_ORDER[(FAMILY_ORDER.indexOf(selectedFamily) + 1) % FAMILY_ORDER.length]
    : null;

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

      <div className={styles.mainLayout}>
        {/* ── SVG Stage ─────────────────────────────────────────── */}
        <div className={styles.stageWrapper}>
          <svg viewBox={VIEWBOX} className={styles.stageSvg} role="img" aria-label={t("orchestraExplorer.title")}>
            <defs>
              <radialGradient id="oe-spotlight" cx="50%" cy="96%" r="55%">
                <stop offset="0%" stopColor="#d4a857" stopOpacity="0.07" />
                <stop offset="100%" stopColor="transparent" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="oe-conductor" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#d4a857" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#8b6914" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#8b6914" stopOpacity="0" />
              </radialGradient>
              {Object.entries(FAMILY_META).map(([fam, meta]) => (
                <filter key={fam} id={`oe-glow-${fam}`} x="-15%" y="-15%" width="130%" height="130%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur" />
                  <feFlood floodColor={meta.color} floodOpacity="0.3" result="color" />
                  <feComposite in="color" in2="blur" operator="in" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>

            {/* Spotlight wash */}
            <rect x="0" y="0" width="960" height="540" fill="url(#oe-spotlight)" />

            {/* Decorative tier rings */}
            {RING_RADII.map((r) => (
              <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
            ))}

            {/* Section arcs */}
            {SECTIONS.map((sec) => {
              const center = arcCenter(CX, CY, sec.innerR, sec.outerR, sec.startDeg, sec.endDeg);
              const isSelected = selectedFamily === sec.family;
              const isDimmed = selectedFamily !== null && !isSelected;
              const isHovered = hoveredSection === sec.family;
              const meta = FAMILY_META[sec.family];

              return (
                <g
                  key={sec.family}
                  className={styles.sectionGroup}
                  onClick={() => handleFamilyClick(sec.family)}
                  onMouseEnter={() => setHoveredSection(sec.family)}
                  onMouseLeave={() => setHoveredSection(null)}
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                  aria-label={t(`orchestraExplorer.${sec.family}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleFamilyClick(sec.family);
                    }
                  }}
                >
                  <title>{t(`orchestraExplorer.${sec.family}`)}</title>
                  <path
                    d={arcPath(CX, CY, sec.innerR, sec.outerR, sec.startDeg, sec.endDeg)}
                    fill={sectionFill(sec.family)}
                    stroke={sectionStroke(sec.family)}
                    strokeWidth={isSelected ? 2 : 1.5}
                    className={styles.sectionPath}
                    filter={(isSelected || isHovered) && !isDimmed ? `url(#oe-glow-${sec.family})` : undefined}
                    style={{ opacity: isDimmed ? 0.3 : 1 }}
                  />
                  {/* Emoji icon */}
                  <text
                    x={center.x}
                    y={sec.narrow ? center.y : center.y - 8}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={sec.narrow ? 16 : 22}
                    style={{ pointerEvents: "none", opacity: isDimmed ? 0.3 : 1, transition: "opacity 0.3s" }}
                  >
                    {meta.icon}
                  </text>
                  {/* Family label (wide sections only) */}
                  {!sec.narrow && (
                    <>
                      <text
                        x={center.x}
                        y={center.y + 14}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className={styles.sectionLabel}
                        style={{ opacity: isDimmed ? 0.3 : 1, transition: "opacity 0.3s" }}
                      >
                        {t(`orchestraExplorer.${sec.family}`)}
                      </text>
                      <text
                        x={center.x}
                        y={center.y + 28}
                        textAnchor="middle"
                        dominantBaseline="central"
                        className={styles.sectionCount}
                        style={{ opacity: isDimmed ? 0.2 : 0.5, transition: "opacity 0.3s" }}
                      >
                        {familyCounts[sec.family] ?? 0} instruments
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* Conductor */}
            <circle cx={CX} cy={CY + 5} r="12" fill="url(#oe-conductor)" />
            <circle cx={CX} cy={CY + 5} r="4" fill="#d4a857" />
            <text x={CX} y={CY + 28} textAnchor="middle" className={styles.conductorLabel}>
              CONDUCTOR
            </text>
          </svg>

          {!selectedFamily && (
            <p className={styles.prompt}>
              {t("orchestraExplorer.clickPrompt", { defaultValue: "Click a section to explore its instruments" })}
            </p>
          )}
        </div>

        {/* ── Detail Panel (inline, right side) ─────────────────── */}
        {selectedFamily && (
          <div className={styles.detailPanel}>
            {selectedInstrument ? (
              <>
                {/* Instrument detail view */}
                <div className={styles.panelNav}>
                  <button className={styles.backLink} onClick={handleBackToFamily}>
                    ← {t(`orchestraExplorer.${selectedFamily}`)}
                  </button>
                  <button className={styles.closeBtn} onClick={handleClosePanel} aria-label="Close">✕</button>
                </div>

                <h2 className={styles.detailName}>{selectedInstrument.name}</h2>
                <span
                  className={styles.familyBadge}
                  style={{ backgroundColor: FAMILY_META[selectedInstrument.family].color }}
                >
                  {FAMILY_META[selectedInstrument.family].icon}{" "}
                  {t(`orchestraExplorer.${selectedInstrument.family}`)}
                </span>

                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>{t("orchestraExplorer.range")}</div>
                  <div className={styles.detailRange}>{selectedInstrument.range}</div>
                </div>

                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>{t("orchestraExplorer.role")}</div>
                  <div className={styles.detailRole}>{selectedInstrument.role}</div>
                </div>

                <p className={styles.detailDescription}>{selectedInstrument.description}</p>

                <div className={styles.detailSection}>
                  <div className={styles.detailLabel}>{t("orchestraExplorer.eraProminence")}</div>
                  <EraTimeline eraProminence={selectedInstrument.eraProminence} />
                </div>

                {featured.length > 0 && (
                  <div className={styles.detailSection}>
                    <div className={styles.detailLabel}>{t("orchestraExplorer.featuredIn")}</div>
                    <div className={styles.compositionList}>
                      {featured.map((comp) => {
                        const composer = composerMap.get(comp.composerId);
                        return (
                          <div key={comp.id} className={styles.compositionItem}>
                            <span className={styles.compositionTitle}>{comp.title}</span>{" "}
                            <span className={styles.compositionComposer}>
                              {composer ? composer.shortName : comp.composerId} ({comp.yearComposed})
                            </span>
                            {comp.spotifyUrl && (
                              <a href={comp.spotifyUrl} className={styles.spotifyLink} target="_blank" rel="noopener noreferrer">
                                🎧
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <a
                  href={getWikipediaUrl(selectedInstrument.wikipediaSlug)}
                  className={styles.wikiLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📖 {t("orchestraExplorer.readMore")}
                </a>
              </>
            ) : (
              <>
                {/* Family overview */}
                <div className={styles.panelNav}>
                  <div />
                  <button className={styles.closeBtn} onClick={handleClosePanel} aria-label="Close">✕</button>
                </div>

                <h2 className={styles.familyTitle} style={{ color: FAMILY_META[selectedFamily].color }}>
                  {FAMILY_META[selectedFamily].icon} {t(`orchestraExplorer.${selectedFamily}`)}
                </h2>

                <p className={styles.familyDescription}>
                  {FAMILY_DESCRIPTIONS[selectedFamily]}
                </p>

                <div className={styles.divider} />

                <div className={styles.detailLabel} style={{ marginBottom: 12 }}>
                  {t("orchestraExplorer.instruments", { count: familyInstruments.length })}
                </div>

                <div className={styles.instrumentGrid}>
                  {familyInstruments.map((inst) => (
                    <button
                      key={inst.id}
                      className={styles.instrumentCard}
                      style={{ borderTopColor: FAMILY_META[selectedFamily].color }}
                      onClick={() => setSelectedInstrument(inst)}
                    >
                      <div className={styles.instrumentName}>{inst.name}</div>
                      <div className={styles.instrumentRange}>{inst.range}</div>
                    </button>
                  ))}
                </div>

                {nextFamilyId && (
                  <button className={styles.nextFamily} onClick={handleNextFamily}>
                    {t("orchestraExplorer.upNext", { defaultValue: "Up next" })}:{" "}
                    {t(`orchestraExplorer.${nextFamilyId}`)} {FAMILY_META[nextFamilyId].icon} →
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
