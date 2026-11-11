import { reportIndicatorActualsRequestSchema } from "@pms/shared-types";

/**
 * `KpiReportingForm` reports a value and a remark for each indicator. The API
 * stores the values per indicator and one remark for the whole accomplishment
 * (pms.accomplishments.remarks), so the remarks are joined into one text.
 */
export function toReportIndicatorActualsRequest(
  results: readonly { id: string; actual: number | null; remarks: string }[],
  indicatorNames: Readonly<Record<string, string>>,
) {
  const remarks = results
    .filter((result) => result.remarks.trim())
    .map(
      (result) =>
        `${indicatorNames[result.id] ?? result.id}: ${result.remarks.trim()}`,
    )
    .join("\n");
  return reportIndicatorActualsRequestSchema.safeParse({
    actuals: results.map((result) => ({
      indicatorId: result.id,
      actualValue: result.actual,
    })),
    remarks,
  });
}
