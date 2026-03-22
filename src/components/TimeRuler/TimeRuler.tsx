import React, { useMemo } from "react";
import {
  createTimeScale,
  getTimeTicks,
  getTickInterval,
  formatYear,
} from "@/utils/scales";
import type { MusicalEraDefinition } from "@/types";
import styles from "./TimeRuler.module.css";

interface TimeRulerProps {
  startYear: number;
  endYear: number;
  width: number;
  eras?: MusicalEraDefinition[];
}

export default function TimeRuler({
  startYear,
  endYear,
  width,
  eras,
}: TimeRulerProps) {
  const scale = useMemo(
    () => createTimeScale(startYear, endYear, width),
    [startYear, endYear, width],
  );
  const ticks = useMemo(
    () => getTimeTicks(startYear, endYear),
    [startYear, endYear],
  );
  const interval = useMemo(
    () => getTickInterval(endYear - startYear),
    [startYear, endYear],
  );

  return (
    <div className={styles.timeRuler} style={{ width }}>
      {/* Era labels */}
      {eras
        ?.filter((era) => era.endYear >= startYear && era.startYear <= endYear)
        .map((era) => {
          const left = Math.max(0, scale(Math.max(era.startYear, startYear)));
          const right = Math.min(width, scale(Math.min(era.endYear, endYear)));
          const eraWidth = right - left;
          if (eraWidth < 60) return null;
          return (
            <span
              key={era.id}
              className={styles.eraLabel}
              style={{
                left: left + eraWidth / 2,
                color: era.color,
              }}
            >
              {era.name}
            </span>
          );
        })}

      {/* Year ticks */}
      {ticks.map((year) => {
        const x = scale(year);
        const isMajor = year % (interval * 2) === 0 || interval >= 50;

        return (
          <div key={year} className={styles.tick} style={{ left: x }}>
            <div
              className={`${styles.tickLine} ${isMajor ? styles.tickLineMajor : ""}`}
            />
            <span
              className={`${styles.tickLabel} ${isMajor ? styles.tickLabelMajor : ""}`}
            >
              {formatYear(year)}
            </span>
          </div>
        );
      })}
      <div className={styles.rulerLine} />
    </div>
  );
}
