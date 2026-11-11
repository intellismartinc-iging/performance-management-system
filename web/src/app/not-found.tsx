import type { Metadata } from "next";

import { NotFoundState } from "@/components/organisms/not-found-state";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return <NotFoundState actionHref="/" actionLabel="Go to dashboard" />;
}
