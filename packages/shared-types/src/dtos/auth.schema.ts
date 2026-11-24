import { z } from "zod";
import { roleCodeSchema } from "../domain/role-code.enum.js";

/**
 * Contracts of backend/src/modules/auth. Field names follow the backend DTO
 * classes. The backend uses a ValidationPipe with forbidNonWhitelisted, so a
 * request with any extra field is rejected: send exactly these fields.
 */

/** Password length limits for login. */
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 16;

const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH)
  .max(MAX_PASSWORD_LENGTH);

/** POST auth/login. `identifier` is an email or a username. */
export const loginRequestSchema = z.object({
  identifier: z.string().trim().min(1).max(254),
  password: passwordSchema,
});
export type LoginRequestDto = z.infer<typeof loginRequestSchema>;

/** POST auth/refresh-token. Works only while the access token has not expired. */
export const refreshTokenRequestSchema = z.object({
  accessToken: z.string().min(1).max(4096),
});
export type RefreshTokenRequestDto = z.infer<typeof refreshTokenRequestSchema>;

/** Response of auth/login and auth/refresh-token. `expiresIn` is in seconds. */
export const authTokenResponseSchema = z.object({
  accessToken: z.string().min(1),
  expiresIn: z.number().int().positive(),
});
export type AuthTokenResponseDto = z.infer<typeof authTokenResponseSchema>;

/**
 * GET auth/me. The account, its role, and the name of its employee record.
 * `employeeCode`, `firstName`, and `lastName` are null for an account with no
 * employee record.
 */
export const currentUserDtoSchema = z.object({
  userId: z.string(),
  email: z.string().nullable(),
  username: z.string().nullable(),
  role: roleCodeSchema,
  employeeCode: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
});
export type CurrentUserDto = z.infer<typeof currentUserDtoSchema>;
