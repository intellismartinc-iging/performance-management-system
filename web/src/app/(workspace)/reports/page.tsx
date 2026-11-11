import type { Metadata } from "next";

import { WorkspacePlaceholderTemplate } from "@/components/templates/workspace-placeholder-template";

const title = "Reports";

export const metadata: Metadata = { title };

export default function ReportsPage() {
  return <WorkspacePlaceholderTemplate title={title} />;
}
