import type { ReactNode } from "react";

import { WORKSPACE_CONFIG } from "@/constants/workspace-config";
import { WorkspaceLayout } from "@/layouts/workspace-layout";

export default function WorkspaceRouteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <WorkspaceLayout {...WORKSPACE_CONFIG}>{children}</WorkspaceLayout>
  );
}
