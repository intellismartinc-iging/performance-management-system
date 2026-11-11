import { z } from "zod";

/**
 * Source: CHECK on pms.pip_plans.origin in packages/database/schema.sql.
 */
export const PIP_ORIGINS = ["automatic", "manual"] as const;

export const pipOriginSchema = z.enum(PIP_ORIGINS);
export type PipOrigin = z.infer<typeof pipOriginSchema>;
