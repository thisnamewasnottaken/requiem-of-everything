import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { useInstruments, useCompositions, useComposers } from "@/hooks/useData";
import { getWikipediaUrl } from "@/utils/wikipedia";
import { openSpotify } from "@/utils/spotify";
import type { Instrument, InstrumentFamily, MusicalEra } from "@/types";
import styles from "./OrchestraExplorer.module.css";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface OrchestraExplorerProps {
  onNavigateToTimeline?: () => void;
}

interface WedgeDef {
  r: [number, number];
  a: [number, number];
}

interface FamilyLayout {
  wedges: WedgeDef[];
  labelR: number;
  labelA: number;
}

// ---------------------------------------------------------------------------
// SVG Geometry — Elliptical Top-Down Perspective
// ---------------------------------------------------------------------------

const CX = 750;
const CY = 620;
const TILT = 0.55;
const VIEWBOX = "0 0 1500 700";
const TIER_RINGS = [80, 280, 400, 510, 610];

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
  tilt: number = TILT,
): { x: number; y: number } {
  const rad = ((angleDeg - 180) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad) * tilt,
  };
}

function describeWedge(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startA: number,
  endA: number,
  tilt: number = TILT,
): string {
  const p1 = polarToCartesian(cx, cy, outerR, endA, tilt);
  const p2 = polarToCartesian(cx, cy, outerR, startA, tilt);
  const p3 = polarToCartesian(cx, cy, innerR, startA, tilt);
  const p4 = polarToCartesian(cx, cy, innerR, endA, tilt);
  const largeArc = endA - startA <= 180 ? "0" : "1";
  return [
    "M",
    p1.x,
    p1.y,
    "A",
    outerR,
    outerR * tilt,
    0,
    largeArc,
    0,
    p2.x,
    p2.y,
    "L",
    p3.x,
    p3.y,
    "A",
    innerR,
    innerR * tilt,
    0,
    largeArc,
    1,
    p4.x,
    p4.y,
    "Z",
  ].join(" ");
}

// ---------------------------------------------------------------------------
// Layout Data
// ---------------------------------------------------------------------------

// Layout mirrors real orchestral seating (audience-perspective, looking
// toward the stage).  Angles 0°–180° map left-to-right across a semicircle
// whose flat edge faces the audience at the bottom.
//
//  Tier 1 (front): Strings — full-width arc, closest to conductor
//  Tier 2 (mid-left): Keyboards — left wing near conductor
//  Tier 2 (mid-center): Woodwinds — centred behind strings
//  Tier 3 (back-left): Brass — behind woodwinds, left-centre
//  Tier 3 (back-centre): Percussion — centre-rear, behind brass
//  Tier 4 (very back): Voice / Choir — across the full rear

const FAMILY_LAYOUT: Record<InstrumentFamily, FamilyLayout> = {
  strings: { wedges: [{ r: [80, 270], a: [5, 175] }], labelR: 175, labelA: 90 },
  keyboards: {
    wedges: [{ r: [280, 390], a: [0, 42] }],
    labelR: 335,
    labelA: 21,
  },
  woodwinds: {
    wedges: [{ r: [280, 390], a: [46, 134] }],
    labelR: 335,
    labelA: 90,
  },
  brass: { wedges: [{ r: [400, 500], a: [15, 105] }], labelR: 450, labelA: 60 },
  percussion: {
    wedges: [{ r: [400, 500], a: [109, 165] }],
    labelR: 450,
    labelA: 137,
  },
  voice: { wedges: [{ r: [510, 610], a: [10, 170] }], labelR: 560, labelA: 90 },
};

const FAMILY_META: Record<InstrumentFamily, { color: string; glow: string }> = {
  strings: { color: "#C4A035", glow: "rgba(196, 160, 53, 0.4)" },
  woodwinds: { color: "#27AE60", glow: "rgba(39, 174, 96, 0.4)" },
  brass: { color: "#E67E22", glow: "rgba(230, 126, 34, 0.4)" },
  percussion: { color: "#E74C3C", glow: "rgba(231, 76, 60, 0.4)" },
  keyboards: { color: "#3498DB", glow: "rgba(52, 152, 219, 0.4)" },
  voice: { color: "#9B59B6", glow: "rgba(155, 89, 182, 0.4)" },
};

const FAMILY_ORDER: InstrumentFamily[] = [
  "strings",
  "woodwinds",
  "brass",
  "percussion",
  "keyboards",
  "voice",
];

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
const NODE_RADIUS = 30;

// ---------------------------------------------------------------------------
// Instrument Positioning Algorithm
// ---------------------------------------------------------------------------

function computeInstrumentPositions(
  instruments: Instrument[],
  layout: FamilyLayout,
): { id: string; x: number; y: number }[] {
  const n = instruments.length;
  if (n === 0) return [];

  const wedge = layout.wedges[0];
  const [innerR, outerR] = wedge.r;
  const [startA, endA] = wedge.a;
  const results: { id: string; x: number; y: number }[] = [];

  // Minimum angular spacing (degrees) to prevent overlap given NODE_RADIUS.
  // We estimate the arc-length per degree at the placement radius and derive
  // the minimum angle that keeps two nodes 2.4 * NODE_RADIUS apart.
  const safeSpacingDeg = (radius: number) => {
    const circumference = 2 * Math.PI * radius * TILT; // elliptical approx
    const degPerPx = 360 / circumference;
    return degPerPx * NODE_RADIUS * 2.4;
  };

  if (n <= 5) {
    // Single row at the radial midpoint of the wedge
    const midR = (innerR + outerR) / 2;
    const minGap = safeSpacingDeg(midR);
    const totalNeeded = (n - 1) * minGap;
    const availableArc = endA - startA;
    // Use whichever is wider: even distribution or minimum-gap distribution
    const actualGap =
      n === 1 ? 0 : Math.max(minGap, (availableArc - minGap) / (n - 1));
    const totalSpan = (n - 1) * actualGap;
    const offsetA = startA + (availableArc - totalSpan) / 2;

    for (let i = 0; i < n; i++) {
      const angle = offsetA + i * actualGap;
      const pos = polarToCartesian(CX, CY, midR, angle);
      results.push({ id: instruments[i].id, ...pos });
    }
  } else {
    // Two rows — inner row gets ceil(n/2), outer row gets the rest
    const row1Count = Math.ceil(n / 2);
    const row2Count = n - row1Count;
    const r1 = innerR + (outerR - innerR) * 0.3;
    const r2 = innerR + (outerR - innerR) * 0.75;
    const availableArc = endA - startA;

    const placeRow = (count: number, radius: number, startIdx: number) => {
      const minGap = safeSpacingDeg(radius);
      const actualGap =
        count === 1
          ? 0
          : Math.max(minGap, (availableArc - minGap) / (count - 1));
      const totalSpan = (count - 1) * actualGap;
      const offsetA = startA + (availableArc - totalSpan) / 2;
      for (let i = 0; i < count; i++) {
        const angle = offsetA + i * actualGap;
        const pos = polarToCartesian(CX, CY, radius, angle);
        results.push({ id: instruments[startIdx + i].id, ...pos });
      }
    };

    placeRow(row1Count, r1, 0);
    placeRow(row2Count, r2, row1Count);
  }
  return results;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function EraTimeline({
  eraProminence,
}: {
  eraProminence: Instrument["eraProminence"];
}) {
  const prominenceMap = new Map(
    eraProminence.map((e) => [e.era, e.prominence]),
  );
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

function InstrumentDetailOverlay({
  instrument,
  familyColor,
  familyGlow,
  familyLabel,
  featured,
  composerMap,
  onClose,
  t,
}: {
  instrument: Instrument;
  familyColor: string;
  familyGlow: string;
  familyLabel: string;
  featured: {
    id: string;
    title: string;
    composerId: string;
    yearComposed: number;
    spotifyUrl?: string;
  }[];
  composerMap: Map<string, { shortName: string }>;
  onClose: () => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.detailOverlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ y: 50, scale: 0.9, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: 20, scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={styles.detailCard}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={styles.detailClose}
          aria-label={t("orchestraExplorer.closeDetail")}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Visual Side */}
        <div className={styles.detailVisual}>
          <div
            className={styles.detailVisualGlow}
            style={{
              background: `conic-gradient(from 0deg, transparent, ${familyGlow}, transparent)`,
            }}
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className={styles.detailVisualName}
            style={{ color: familyColor }}
          >
            {instrument.name}
          </motion.div>
        </div>

        {/* Content Side */}
        <div className={styles.detailContent}>
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {/* Kinetic Title */}
            <h2 className={styles.detailName}>
              {instrument.name.split("").map((char, idx) => (
                <motion.span
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.03, type: "spring" }}
                  className={styles.detailNameChar}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </h2>

            {/* Family badge */}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className={styles.familyBadge}
              style={{ backgroundColor: familyColor }}
            >
              {familyLabel}
            </motion.span>

            {/* Range */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className={styles.detailSection}
            >
              <div className={styles.detailLabel}>
                {t("orchestraExplorer.range")}
              </div>
              <div className={styles.detailRange}>{instrument.range}</div>
            </motion.div>

            {/* Role */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className={styles.detailSection}
            >
              <div className={styles.detailLabel}>
                {t("orchestraExplorer.role")}
              </div>
              <div className={styles.detailRole} style={{ color: familyColor }}>
                {instrument.role}
              </div>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className={styles.detailDescription}
            >
              {instrument.description}
            </motion.p>

            {/* Era Timeline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className={styles.detailSection}
            >
              <div className={styles.detailLabel}>
                {t("orchestraExplorer.eraProminence")}
              </div>
              <EraTimeline eraProminence={instrument.eraProminence} />
            </motion.div>

            {/* Featured Compositions */}
            {featured.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
                className={styles.detailSection}
              >
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
                          <button
                            className={styles.spotifyLink}
                            onClick={(e) => {
                              e.stopPropagation();
                              openSpotify(comp.spotifyUrl!);
                            }}
                            aria-label={t('composition.listenOnSpotifyAria', { title: comp.title })}
                          >
                            🎧
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Wikipedia Link */}
            <motion.a
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              href={getWikipediaUrl(instrument.wikipediaSlug)}
              className={styles.wikiLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              📖 {t("orchestraExplorer.readMore")}
            </motion.a>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
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

  const [selectedFamily, setSelectedFamily] = useState<InstrumentFamily | null>(
    null,
  );
  const [selectedInstrument, setSelectedInstrument] =
    useState<Instrument | null>(null);
  const [hoveredFamily, setHoveredFamily] = useState<InstrumentFamily | null>(
    null,
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse-tracking spotlight
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handle = (e: MouseEvent) =>
      setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, []);

  // Group instruments by family
  const instrumentsByFamily = useMemo(() => {
    const map = new Map<InstrumentFamily, Instrument[]>();
    for (const fam of FAMILY_ORDER) map.set(fam, []);
    for (const inst of allInstruments) {
      const list = map.get(inst.family);
      if (list) list.push(inst);
    }
    return map;
  }, [allInstruments]);

  // Memoize instrument positions per family
  const positionsByFamily = useMemo(() => {
    const map = new Map<
      InstrumentFamily,
      Map<string, { x: number; y: number }>
    >();
    for (const fam of FAMILY_ORDER) {
      const instruments = instrumentsByFamily.get(fam) ?? [];
      const layout = FAMILY_LAYOUT[fam];
      const positions = computeInstrumentPositions(instruments, layout);
      const posMap = new Map(positions.map((p) => [p.id, { x: p.x, y: p.y }]));
      map.set(fam, posMap);
    }
    return map;
  }, [instrumentsByFamily]);

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

  // Keyboard: Escape backs up one level
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (selectedInstrument) setSelectedInstrument(null);
        else if (selectedFamily) setSelectedFamily(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedFamily, selectedInstrument]);

  return (
    <div className={styles.container} ref={containerRef} data-tour="orchestra-view">
      {/* ── Ambient Background ──────────────────────────────────── */}
      <div className={styles.ambientBg}>
        <div className={styles.ambientBase} />
        <div className={styles.ambientOrb1} />
        <div className={styles.ambientOrb2} />
        <div className={styles.ambientOrb3} />
        <div
          className={styles.mouseGlow}
          style={{
            transform: `translate(${mousePos.x - 240}px, ${mousePos.y - 240}px)`,
          }}
        />
        <div className={styles.ambientGrid} />
      </div>

      {/* ── SVG Orchestra Stage ─────────────────────────────────── */}
      <main className={styles.stageContainer}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={styles.stageWrap}
        >
          <svg
            viewBox={VIEWBOX}
            className={styles.stageSvg}
            role="img"
            aria-label={t("orchestraExplorer.title")}
          >
            <defs>
              {/* Glow filters per family */}
              <filter id="oe-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="20" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter
                id="oe-node-glow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              {FAMILY_ORDER.map((fam) => (
                <radialGradient
                  key={`grad-${fam}`}
                  id={`oe-grad-${fam}`}
                  cx="50%"
                  cy="100%"
                  r="100%"
                >
                  <stop
                    offset="0%"
                    stopColor={FAMILY_META[fam].color}
                    stopOpacity="0.4"
                  />
                  <stop
                    offset="100%"
                    stopColor={FAMILY_META[fam].color}
                    stopOpacity="0.05"
                  />
                </radialGradient>
              ))}
              {/* Conductor gradient */}
              <radialGradient id="oe-conductor" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#d4a857" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#8b6914" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#8b6914" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Decorative tier rings */}
            {TIER_RINGS.map((r, i) => (
              <path
                key={`ring-${i}`}
                d={`M ${CX - r} ${CY} A ${r} ${r * TILT} 0 0 1 ${CX + r} ${CY}`}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1.5"
              />
            ))}

            {/* Family Wedge Sections */}
            {FAMILY_ORDER.map((fam) => {
              const layout = FAMILY_LAYOUT[fam];
              const meta = FAMILY_META[fam];
              const isSelected = selectedFamily === fam;
              const isHovered = hoveredFamily === fam;
              const isOtherSelected = selectedFamily !== null && !isSelected;
              const isActive = isSelected || isHovered;
              const labelPos = polarToCartesian(
                CX,
                CY,
                layout.labelR,
                layout.labelA,
              );
              const familyInstruments = instrumentsByFamily.get(fam) ?? [];
              const positions = positionsByFamily.get(fam) ?? new Map();

              return (
                <g
                  key={fam}
                  onClick={() => handleFamilyClick(fam)}
                  onMouseEnter={() => setHoveredFamily(fam)}
                  onMouseLeave={() => setHoveredFamily(null)}
                  style={{ cursor: "pointer" }}
                  role="button"
                  tabIndex={0}
                  aria-label={t(`orchestraExplorer.${fam}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleFamilyClick(fam);
                    }
                  }}
                  className={styles.familyGroup}
                >
                  {/* Wedge paths */}
                  {layout.wedges.map((wedge, wi) => (
                    <motion.path
                      key={wi}
                      d={describeWedge(
                        CX,
                        CY,
                        wedge.r[0],
                        wedge.r[1],
                        wedge.a[0],
                        wedge.a[1],
                      )}
                      animate={{
                        fill: isActive
                          ? `url(#oe-grad-${fam})`
                          : "rgba(255,255,255,0.02)",
                        stroke: isActive
                          ? meta.color
                          : "rgba(255,255,255,0.08)",
                        opacity: isOtherSelected ? 0.15 : 1,
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      strokeWidth={isActive ? 2 : 1}
                      style={{ filter: isActive ? "url(#oe-glow)" : "none" }}
                    />
                  ))}

                  {/* Family Label */}
                  <motion.text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    className={styles.familyLabel}
                    style={{ fill: meta.color, pointerEvents: "none" }}
                    animate={{
                      opacity: isSelected
                        ? 0.05
                        : isOtherSelected
                          ? 0.15
                          : isHovered
                            ? 1
                            : 0.7,
                    }}
                    transition={{ duration: 0.4 }}
                  >
                    {t(`orchestraExplorer.${fam}`).toUpperCase()}
                  </motion.text>

                  {/* Instrument Nodes (when family is selected) */}
                  <AnimatePresence>
                    {isSelected &&
                      familyInstruments.map((inst, i) => {
                        const pos = positions.get(inst.id);
                        if (!pos) return null;
                        const nameParts = inst.name.split(" ");
                        return (
                          <motion.g
                            key={inst.id}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{
                              delay: i * 0.06,
                              type: "spring",
                              damping: 15,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInstrument(inst);
                            }}
                            className={styles.instrumentNode}
                            whileHover={{ scale: 1.15 }}
                            style={{ cursor: "pointer" }}
                          >
                            {/* Node background circle */}
                            <circle
                              cx={pos.x}
                              cy={pos.y}
                              r={NODE_RADIUS}
                              fill="rgba(10,10,10,0.9)"
                              stroke={meta.color}
                              strokeWidth="2"
                              filter="url(#oe-node-glow)"
                            />
                            {/* Inner decorative ring */}
                            <circle
                              cx={pos.x}
                              cy={pos.y}
                              r={NODE_RADIUS - 6}
                              fill="none"
                              stroke={meta.color}
                              strokeWidth="1"
                              strokeDasharray="2 4"
                              opacity="0.5"
                              className={styles.nodeRing}
                              style={{
                                transformOrigin: `${pos.x}px ${pos.y}px`,
                              }}
                            />
                            {/* Instrument Name */}
                            <text
                              x={pos.x}
                              y={nameParts.length > 1 ? pos.y - 5 : pos.y}
                              textAnchor="middle"
                              alignmentBaseline="middle"
                              fill="white"
                              fontSize="11"
                              className={styles.nodeName}
                              style={{ pointerEvents: "none" }}
                            >
                              {nameParts[0]}
                            </text>
                            {nameParts.length > 1 && (
                              <text
                                x={pos.x}
                                y={pos.y + 10}
                                textAnchor="middle"
                                alignmentBaseline="middle"
                                fill="rgba(255,255,255,0.6)"
                                fontSize="9"
                                className={styles.nodeNameSub}
                                style={{ pointerEvents: "none" }}
                              >
                                {nameParts.slice(1).join(" ")}
                              </text>
                            )}
                          </motion.g>
                        );
                      })}
                  </AnimatePresence>
                </g>
              );
            })}

            {/* Conductor */}
            <circle cx={CX} cy={CY + 5} r="16" fill="url(#oe-conductor)" />
            <circle cx={CX} cy={CY + 5} r="5" fill="#d4a857" />
            <text
              x={CX}
              y={CY + 35}
              textAnchor="middle"
              className={styles.conductorLabel}
            >
              {t("orchestraExplorer.conductor", {
                defaultValue: "CONDUCTOR",
              }).toUpperCase()}
            </text>
          </svg>
        </motion.div>

        {/* Prompt text */}
        <AnimatePresence>
          {!selectedFamily && (
            <motion.p
              className={styles.prompt}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
            >
              {t("orchestraExplorer.clickPrompt", {
                defaultValue: "Click a section to explore its instruments",
              })}
            </motion.p>
          )}
        </AnimatePresence>
      </main>

      {/* ── Family Info Panel (overlay, top-right) ─────────────── */}
      <AnimatePresence>
        {selectedFamily && !selectedInstrument && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={styles.familyPanel}
          >
            <h2
              className={styles.familyTitle}
              style={{ color: FAMILY_META[selectedFamily].color }}
            >
              {t(`orchestraExplorer.${selectedFamily}`).toUpperCase()}
            </h2>
            <p className={styles.familyDesc}>
              {t(`orchestraExplorer.${selectedFamily}Desc`)}
            </p>
            <div className={styles.familyCount}>
              {t("orchestraExplorer.instruments", {
                count: instrumentsByFamily.get(selectedFamily)?.length ?? 0,
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Instrument Detail Overlay ──────────────────────────── */}
      <AnimatePresence>
        {selectedInstrument && (
          <InstrumentDetailOverlay
            key="instrument-detail"
            instrument={selectedInstrument}
            familyColor={FAMILY_META[selectedInstrument.family].color}
            familyGlow={FAMILY_META[selectedInstrument.family].glow}
            familyLabel={t(`orchestraExplorer.${selectedInstrument.family}`)}
            featured={featured}
            composerMap={composerMap}
            onClose={() => setSelectedInstrument(null)}
            t={t}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
