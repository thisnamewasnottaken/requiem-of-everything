import * as d3 from "d3";

/**
 * Creates a D3 linear scale mapping year → pixel x-coordinate.
 */
export function createTimeScale(
  startYear: number,
  endYear: number,
  width: number,
) {
  return d3.scaleLinear().domain([startYear, endYear]).range([0, width]);
}

/**
 * Generate tick values for the time ruler based on zoom level.
 */
export function getTickInterval(rangeYears: number): number {
  if (rangeYears > 300) return 50;
  if (rangeYears > 150) return 25;
  if (rangeYears > 60) return 10;
  if (rangeYears > 30) return 5;
  return 1;
}

/**
 * Compute nice tick values for a year range.
 */
export function getTimeTicks(startYear: number, endYear: number): number[] {
  const range = endYear - startYear;
  const interval = getTickInterval(range);
  const firstTick = Math.ceil(startYear / interval) * interval;
  const ticks: number[] = [];
  for (let year = firstTick; year <= endYear; year += interval) {
    ticks.push(year);
  }
  return ticks;
}

/**
 * Determine detail level from zoom range.
 * - 'century': large overview showing eras and major composers
 * - 'decade': medium view, all composers visible
 * - 'year': close zoom, individual compositions visible
 */
export function getDetailLevel(
  rangeYears: number,
): "century" | "decade" | "year" {
  if (rangeYears > 200) return "century";
  if (rangeYears > 50) return "decade";
  return "year";
}

/**
 * Format a year for display, handling BCE.
 */
export function formatYear(year: number): string {
  if (year < 0) return `${Math.abs(year)} BCE`;
  return `${year}`;
}

/**
 * Get the century label for a year.
 */
export function getCenturyLabel(year: number): string {
  const century = Math.ceil(year / 100);
  const suffix =
    century === 1 ? "st" : century === 2 ? "nd" : century === 3 ? "rd" : "th";
  return `${century}${suffix} Century`;
}
