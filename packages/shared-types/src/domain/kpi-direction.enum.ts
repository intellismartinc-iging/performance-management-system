import { z } from "zod";

/**
 * Source: CHECK on pms.kpi_indicators.direction in packages/database/schema.sql.
 */
export const KPI_DIRECTIONS = ["higher_is_better", "lower_is_better"] as const;

export const kpiDirectionSchema = z.enum(KPI_DIRECTIONS);
export type KpiDirection = z.infer<typeof kpiDirectionSchema>;
