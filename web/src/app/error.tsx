"use client";

import { ErrorState } from "@/components/organisms/error-state";

export default function RootError({
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
      homeLabel="Go to dashboard"
    />
  );
}
