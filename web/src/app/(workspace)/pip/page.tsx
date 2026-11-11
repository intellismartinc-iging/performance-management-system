import type { Metadata } from "next";

import { WorkspacePlaceholderTemplate } from "@/components/templates/workspace-placeholder-template";

const title = "PIP";

export const metadata: Metadata = { title };

export default function PipPage() {
  return <WorkspacePlaceholderTemplate title={title} />;
}
