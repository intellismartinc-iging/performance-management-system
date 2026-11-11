import type { Metadata } from "next";

import { WorkspacePlaceholderTemplate } from "@/components/templates/workspace-placeholder-template";

const title = "Behavioral Assessment Template";

export const metadata: Metadata = { title };

export default function BehavioralAssessmentTemplatePage() {
  return <WorkspacePlaceholderTemplate title={title} />;
}
