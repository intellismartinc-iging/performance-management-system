import { z } from "zod";

/**
 * Source: CHECK on pms.kpi_indicators.matrix_kind in packages/database/schema.sql.
 * `none`: no matrix. `table`: a custom reference table that never scores.
 * `scale`: a numeric threshold scale, which may score.
 */
export const MATRIX_KINDS = ["none", "table", "scale"] as const;

export const matrixKindSchema = z.enum(MATRIX_KINDS);
export type MatrixKind = z.infer<typeof matrixKindSchema>;
