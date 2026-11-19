import { z } from "zod";

/**
 * Source: CHECK on pms.kpi_indicators.scale_bound in packages/database/schema.sql.
 * `minimum`: each row is a minimum actual, inclusive. `maximum`: each row is a
 * maximum actual, inclusive, and the final row has no upper limit.
 */
export const SCALE_BOUNDS = ["minimum", "maximum"] as const;

export const scaleBoundSchema = z.enum(SCALE_BOUNDS);
export type ScaleBound = z.infer<typeof scaleBoundSchema>;
