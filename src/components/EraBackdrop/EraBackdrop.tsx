import React, { useMemo } from "react";
import type { MusicalEraDefinition } from "@/types";
import { createTimeScale } from "@/utils/scales";
import styles from "./EraBackdrop.module.css";

interface EraBackdropProps {
  eras: MusicalEraDefinition[];
  startYear: number;
  endYear: number;
  width: number;
}

export default function EraBackdrop({
  eras,
  startYear,
  endYear,
  width,
}: EraBackdropProps) {
  const scale = useMemo(
    () => createTimeScale(startYear, endYear, width),
    [startYear, endYear, width],
  );

  return (
    <>
      {eras
        .filter((era) => era.endYear >= startYear && era.startYear <= endYear)
        .map((era) => {
          const left = Math.max(0, scale(Math.max(era.startYear, startYear)));
          const right = Math.min(width, scale(Math.min(era.endYear, endYear)));
          const eraWidth = right - left;

          if (eraWidth < 2) return null;

          return (
            <div
              key={era.id}
              className={styles.eraBackdrop}
              style={{ left, width: eraWidth }}
            >
              <div
                className={styles.eraFill}
                style={{ backgroundColor: era.color }}
              />
              {eraWidth > 60 && (
                <span className={styles.eraLabel} style={{ color: era.color }}>
                  {era.name}
                </span>
              )}
              <div
                className={styles.eraBorder}
                style={{ backgroundColor: era.color }}
              />
            </div>
          );
        })}
    </>
  );
}
