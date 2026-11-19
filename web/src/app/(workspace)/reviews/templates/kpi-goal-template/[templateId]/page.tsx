import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DetailPageSkeleton } from "@/components/templates/detail-page-template";
import { GoalTemplateDetailsView } from "@/features/review-templates/components/goal-template-details-view";
import { GoalTemplateNotice } from "@/features/review-templates/components/goal-template-notice";
import { stateKey } from "@/features/review-templates/services/goal-template-editor-state";
import {
  getGoalTemplate,
  getGoalTemplatePositions,
} from "@/features/review-templates/services/goal-template-reader";

export const metadata: Metadata = { title: "KPI Goal Template Details" };

interface KpiGoalTemplatePageProps {
  params: Promise<{ templateId: string }>;
}

async function KpiGoalTemplateRecord({ params }: KpiGoalTemplatePageProps) {
  const { templateId } = await params;
  const [result, positions] = await Promise.all([
    getGoalTemplate(templateId),
    getGoalTemplatePositions(),
  ]);
  if (result.kind === "not_found") notFound();
  if (result.kind !== "ok") return <GoalTemplateNotice kind={result.kind} />;

  // The position list only names the position. Without it the page still shows the template.
  return (
    <GoalTemplateDetailsView
      key={stateKey(result.data)}
      detail={result.data}
      positions={
        positions.kind === "ok"
          ? positions.data.map((position) => ({
              value: String(position.positionId),
              label: position.title,
            }))
          : []
      }
    />
  );
}

export default function KpiGoalTemplateRecordPage(props: KpiGoalTemplatePageProps) {
  return (
    <Suspense fallback={<DetailPageSkeleton aside={false} actions={0} />}>
      <KpiGoalTemplateRecord {...props} />
    </Suspense>
  );
}
