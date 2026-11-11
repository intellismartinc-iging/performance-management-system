"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  accountCreatedResponseSchema,
  authTokenResponseSchema,
  nestErrorSchema,
} from "@pms/shared-types";

import { apiClient } from "@/api/api-client";
import {
  parseLogin,
  parseSignUp,
} from "@/features/auth/services/auth-credentials";
import { SESSION_COOKIE } from "@/features/auth/services/session-cookie";

const AUTH_ENDPOINTS = {
  login: "auth/login",
  "sign-up": "auth/sign-up",
} as const;

const NOT_CONFIGURED = "The authentication service is not configured.";
const COULD_NOT_COMPLETE = "Authentication could not be completed. Try again.";

type SubmitResult = { message: string; isSuccess?: boolean };

/** The first validation message the backend sent, when there is one. */
function backendMessage(data: unknown) {
  const parsed = nestErrorSchema.safeParse(data);
  if (!parsed.success) return null;
  const { message } = parsed.data;
  return Array.isArray(message) ? (message[0] ?? null) : message;
}

export async function submitCredentials(
  mode: unknown,
  input: unknown,
): Promise<SubmitResult> {
  if (mode !== "login" && mode !== "sign-up") {
    return { message: "Check your details and try again." };
  }
  const body = mode === "login" ? parseLogin(input) : parseSignUp(input);
  if (!body) {
    return { message: "Check your details and try again." };
  }

  const baseUrl = process.env.PMS_API_BASE_URL;
  if (!baseUrl) {
    return { message: NOT_CONFIGURED };
  }

  let status: number;
  let data: unknown;
  try {
    const url = new URL(AUTH_ENDPOINTS[mode], baseUrl.replace(/\/?$/, "/"));
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return { message: NOT_CONFIGURED };
    }
    const response = await apiClient.post<unknown>(url.href, body, {
      responseType: "json",
      transitional: { silentJSONParsing: false },
      signal: AbortSignal.timeout(10_000),
      validateStatus: (code) => code < 300 || code >= 400,
    });
    status = response.status;
    data = response.data;
  } catch {
    return { message: "The authentication service is unavailable. Try again." };
  }

  if (mode === "login") {
    if (status === 401) {
      return { message: "Email, username, or password is incorrect." };
    }
    if (status < 200 || status >= 300) {
      return { message: COULD_NOT_COMPLETE };
    }
    const token = authTokenResponseSchema.safeParse(data);
    if (!token.success) {
      return {
        message: "The authentication service returned an invalid response.",
      };
    }
    (await cookies()).set(SESSION_COOKIE, token.data.accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: Math.min(token.data.expiresIn, 3600),
    });
    redirect("/");
  }

  // sign-up: the backend creates the account but returns no token.
  if (status === 409) {
    return { message: "This employee already has an account. Log in instead." };
  }
  if (status === 400) {
    return { message: backendMessage(data) ?? COULD_NOT_COMPLETE };
  }
  if (status < 200 || status >= 300) {
    return { message: COULD_NOT_COMPLETE };
  }
  const created = accountCreatedResponseSchema.safeParse(data);
  if (!created.success) {
    return {
      message: "The authentication service returned an invalid response.",
    };
  }
  return {
    message: "Your account is ready. Log in to continue.",
    isSuccess: true,
  };
}
