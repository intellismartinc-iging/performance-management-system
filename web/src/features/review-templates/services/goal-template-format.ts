/** The workspace shows dates in Manila time, as `layouts/workspace-clock.tsx` does. */
const WORKSPACE_TIME_ZONE = "Asia/Manila";

const DATE_FORMAT = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeZone: WORKSPACE_TIME_ZONE,
});

/** An ISO timestamp as a workspace-time date, or "Not set" for null. */
export function formatTemplateDate(value: string | null): string {
  return value ? DATE_FORMAT.format(new Date(value)) : "Not set";
}

/** The position text of a template, or a word for a company-wide template. */
export function formatPosition(position: string | null): string {
  return position ?? "No position";
}

/**
 * Select options for the position names that the API lists. The position a
 * template already has stays in the list, because the API accepts it unchanged
 * even when no employee holds it any more.
 */
export function toPositionOptions(
  names: readonly string[],
  current: string | null = null,
): { value: string; label: string }[] {
  const all = current && !names.includes(current) ? [...names, current] : names;
  return all.map((name) => ({ value: name, label: name }));
}
