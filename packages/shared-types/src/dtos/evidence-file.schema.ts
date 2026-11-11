import { z } from "zod";
import {
  bigintIdSchema,
  decimalSchema,
  idSchema,
  timestampSchema,
} from "../common.js";

/**
 * No table in schema.sql stores files yet, so this DTO is hand written.
 * Metadata only. The storage key is internal and is not exposed to the client.
 */
export const evidenceFileDtoSchema = z.object({
  id: idSchema,
  companyId: bigintIdSchema,
  uploadedBy: idSchema,
  journalEntryId: idSchema.nullable(),
  filename: z.string(),
  contentType: z.string(),
  byteSize: decimalSchema.pipe(z.number().int().positive()),
  description: z.string(),
  uploadedAt: timestampSchema,
});
export type EvidenceFileDto = z.infer<typeof evidenceFileDtoSchema>;
