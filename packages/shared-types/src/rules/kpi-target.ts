/** A percentage target is a share of the whole: from 0 to 100. */
export const PERCENTAGE_UNIT = "Percentage";
export const PERCENTAGE_TARGET_MAX = 100;
export const PERCENTAGE_TARGET_MESSAGE =
  "A percentage target is from 0 to 100.";

export function targetExceedsUnit(
  unit: string,
  target: number | null,
): boolean {
  return (
    unit === PERCENTAGE_UNIT &&
    target !== null &&
    target > PERCENTAGE_TARGET_MAX
  );
}
