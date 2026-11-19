import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  FormPageSkeleton,
  FormPageTemplate,
} from "@/components/templates/form-page-template";
import { GoalTemplateCreateForm } from "@/features/review-templates/components/goal-template-create-form";
import { GoalTemplateNotice } from "@/features/review-templates/components/goal-template-notice";
import { GOAL_TEMPLATE_PATH } from "@/constants/goal-template-path";
import { getGoalTemplatePositions } from "@/features/review-templates/services/goal-template-reader";

const title = "KPI Goal Template Builder";

export const metadata: Metadata = { title };

async function NewKpiGoalTemplate() {
  const result = await getGoalTemplatePositions();

  // The builder draws its own back link, header, and actions.
  if (result.kind === "ok" && result.data.length > 0) {
    return (
      <GoalTemplateCreateForm
        positions={result.data.map((position) => ({
          value: String(position.positionId),
          label: position.title,
        }))}
      />
    );
  }

  return (
    <FormPageTemplate
      title={title}
      description="Choose the position, then add the indicators, targets, and weights."
      actions={
        <Link
          href={GOAL_TEMPLATE_PATH}
          className={buttonVariants({
            variant: "outline",
            className: "min-h-pms-touch",
          })}
        >
          Cancel
        </Link>
      }
    >
      {result.kind !== "ok" ? (
        <GoalTemplateNotice
          kind={result.kind === "not_found" ? "unavailable" : result.kind}
        />
      ) : (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No positions for your company</EmptyTitle>
            <EmptyDescription>
              A template applies to a position. Add a position for your company,
              then create the template.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </FormPageTemplate>
  );
}

export default function NewKpiGoalTemplatePage() {
  return (
    <Suspense fallback={<FormPageSkeleton />}>
      <NewKpiGoalTemplate />
    </Suspense>
  );
}
