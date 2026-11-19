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

/** The API sends a position id only. No position catalog is wired yet. */
export function formatPosition(positionId: number | null): string {
  return positionId === null ? "No position" : `Position ${positionId}`;
}
