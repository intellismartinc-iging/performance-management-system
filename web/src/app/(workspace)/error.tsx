"use client";

import { ErrorState } from "@/components/organisms/error-state";

/** Keeps the sidebar and header visible when a workspace page fails. */
export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      reference={error.digest}
      onRetry={reset}
      homeHref="/"
      homeLabel="Back to dashboard"
    />
  );
}
