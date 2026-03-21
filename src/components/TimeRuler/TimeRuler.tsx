import React, { useMemo } from "react";
import {
  createTimeScale,
  getTimeTicks,
  getTickInterval,
  formatYear,
} from "@/utils/scales";
import styles from "./TimeRuler.module.css";

interface TimeRulerProps {
  startYear: number;
  endYear: number;
  width: number;
}

export default function TimeRuler({
  startYear,
  endYear,
  width,
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
