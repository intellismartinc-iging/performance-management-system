import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/features/auth/services/session-cookie";
import { decideRoute } from "@/features/auth/services/session-guard";

export function proxy(request: NextRequest) {
  const decision = decideRoute(
    request.nextUrl.pathname,
    request.cookies.get(SESSION_COOKIE)?.value,
    Math.floor(Date.now() / 1000),
  );

  const response =
    decision.action === "redirect"
      ? NextResponse.redirect(new URL(decision.to, request.url))
      : NextResponse.next();
  if (decision.clearSession) response.cookies.delete(SESSION_COOKIE);
  return response;
}

export const config = {
  // Every page. Not Next internals, files in public/, or any path with a file extension.
  matcher: ["/((?!_next/static|_next/image|assets/|logo/|favicon.ico|.*\\..*).*)"],
};
