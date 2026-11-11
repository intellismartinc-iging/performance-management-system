import type { Metadata } from "next";

import { WorkspacePlaceholderTemplate } from "@/components/templates/workspace-placeholder-template";

const title = "All Reviews";

export const metadata: Metadata = { title };

export default function ReviewsPage() {
  return <WorkspacePlaceholderTemplate title={title} />;
}
