import type { Metadata } from "next";

import { WorkspacePlaceholderTemplate } from "@/components/templates/workspace-placeholder-template";

const title = "Goals";

export const metadata: Metadata = { title };

export default function GoalsPage() {
  return <WorkspacePlaceholderTemplate title={title} />;
}
