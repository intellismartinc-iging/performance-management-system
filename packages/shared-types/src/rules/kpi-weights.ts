export const WEIGHTS_TOTAL_MESSAGE = "Indicator weights must total 100%.";

/** The weights of a published template total 100 percent (Tpl-G-003). Two decimals leave a little room. */
export function weightsTotalHundred(weights: readonly number[]): boolean {
  if (weights.length === 0) return false;
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  return Math.abs(total - 100) <= 0.01;
}
