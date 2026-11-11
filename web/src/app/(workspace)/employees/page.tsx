import type { Metadata } from "next";

import { WorkspacePlaceholderTemplate } from "@/components/templates/workspace-placeholder-template";

const title = "Employees";

export const metadata: Metadata = { title };

export default function EmployeesPage() {
  return <WorkspacePlaceholderTemplate title={title} />;
}
