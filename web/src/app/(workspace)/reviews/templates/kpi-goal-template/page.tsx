import type { Metadata } from "next";

import { WorkspacePlaceholderTemplate } from "@/components/templates/workspace-placeholder-template";

const title = "KPI Goal Template";

export const metadata: Metadata = { title };

export default function KpiGoalTemplatePage() {
  return <WorkspacePlaceholderTemplate title={title} />;
}
