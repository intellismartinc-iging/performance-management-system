import type { Metadata } from "next";

import { WorkspacePlaceholderTemplate } from "@/components/templates/workspace-placeholder-template";

const title = "202 Files";

export const metadata: Metadata = { title };

export default function EmployeeFilesPage() {
  return <WorkspacePlaceholderTemplate title={title} />;
}
