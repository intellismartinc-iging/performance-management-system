import { loginRequestSchema } from "@pms/shared-types";

export { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@pms/shared-types";

/** The exact body of POST auth/login, or null when the input is not valid. */
export function parseLogin(input: unknown) {
  const result = loginRequestSchema.safeParse(input);
  return result.success ? result.data : null;
}
