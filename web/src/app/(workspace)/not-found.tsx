import type { Metadata } from "next";
import { NotFoundState } from "@/components/organisms/not-found-state";

export const metadata: Metadata = { title: "Page not found" };

/** Shown inside the sidebar layout when a workspace page calls `notFound()`. */
export default function WorkspaceNotFound() {
  return (
    <NotFoundState
      description="We could not find that record. It may have been removed, or you may not have access to it."
      actionHref="/"
      actionLabel="Back to dashboard"
    />
  );
}
