/**
 * Pure helpers for dashboard KPI trends from analytics monthly series.
 * Returns null when there is not enough real data to compute a change.
 */
export function monthOverMonthPercent(
  values: number[],
): number | null {
  if (values.length < 2) return null;

  let currentIndex = -1;
  for (let i = values.length - 1; i >= 0; i -= 1) {
    if (values[i] !== 0 || i === values.length - 1) {
      currentIndex = i;
      break;
    }
  }
  if (currentIndex < 1) return null;

  const current = values[currentIndex];
  const previous = values[currentIndex - 1];
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }
  return ((current - previous) / Math.abs(previous)) * 100;
}
