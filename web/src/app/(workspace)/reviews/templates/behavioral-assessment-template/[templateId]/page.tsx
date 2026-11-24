import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { DetailPageSkeleton } from "@/components/templates/detail-page-template";
import { BehavioralTemplateDetailsView } from "@/features/review-templates/components/behavioral-template-details-view";
import { GoalTemplateNotice } from "@/features/review-templates/components/goal-template-notice";
import { getBehavioralTemplate } from "@/features/review-templates/services/behavioral-template-reader";

export const metadata: Metadata = { title: "Behavioral Assessment Template Details" };

interface BehavioralTemplatePageProps {
  params: Promise<{ templateId: string }>;
}

async function BehavioralTemplateRecord({ params }: BehavioralTemplatePageProps) {
  const { templateId } = await params;
  const result = await getBehavioralTemplate(templateId);

  if (result.kind === "not_found") notFound();
  if (result.kind !== "ok") {
    return <GoalTemplateNotice kind={result.kind} subject="behavioral assessment templates" />;
  }

  // A new key when the template changes, so the page never keeps the state of an older one.
  return <BehavioralTemplateDetailsView key={result.data.template.updatedAt} tree={result.data} />;
}

export default function BehavioralTemplatePage(props: BehavioralTemplatePageProps) {
  return (
    <Suspense fallback={<DetailPageSkeleton aside={false} actions={0} />}>
      <BehavioralTemplateRecord {...props} />
    </Suspense>
  );
}
