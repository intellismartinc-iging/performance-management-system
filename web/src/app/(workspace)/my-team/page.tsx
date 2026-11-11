import type { Metadata } from "next";

import { WorkspacePlaceholderTemplate } from "@/components/templates/workspace-placeholder-template";

const title = "My Team";

export const metadata: Metadata = { title };

export default function MyTeamPage() {
  return <WorkspacePlaceholderTemplate title={title} />;
}
