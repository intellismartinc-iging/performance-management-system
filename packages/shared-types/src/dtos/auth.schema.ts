import { z } from "zod";

/**
 * Contracts of backend/src/modules/auth. Field names follow the backend DTO
 * classes. The backend uses a ValidationPipe with forbidNonWhitelisted, so a
 * request with any extra field is rejected: send exactly these fields.
 */

/** LoginDto allows 8 to 16. SignUpDto has no maximum, so it is capped here to keep a new password able to log in. */
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

/** POST auth/sign-up. The employee must already exist in the employee table. */
export const signUpRequestSchema = z
  .object({
    employeeCode: z.string().trim().min(1),
    username: z.string().trim().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type SignUpRequestDto = z.infer<typeof signUpRequestSchema>;

/**
 * POST auth/register (connect an HRDotNet account). The backend RegisterDto also
 * takes `userRoleId` from the caller. That lets anyone choose their own role, so
 * it is left out here until the backend assigns the role itself.
 */
export const registerRequestSchema = z
  .object({
    employeeCode: z.string().trim().min(1),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type RegisterRequestDto = z.infer<typeof registerRequestSchema>;

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

/** Response of auth/sign-up and auth/register. No token: the user logs in next. */
export const accountCreatedResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    code: z.string().nullable(),
    firstName: z.string(),
    lastName: z.string(),
    company: z.string(),
    department: z.string(),
    position: z.string(),
    status: z.string().nullable(),
  }),
});
export type AccountCreatedResponseDto = z.infer<
  typeof accountCreatedResponseSchema
>;

/**
 * GET auth/me. This is the token payload, not the employee: it has no name,
 * department, or role yet.
 */
export const currentUserDtoSchema = z.object({
  userId: z.string(),
  email: z.string().nullable(),
  username: z.string().nullable(),
});
export type CurrentUserDto = z.infer<typeof currentUserDtoSchema>;
