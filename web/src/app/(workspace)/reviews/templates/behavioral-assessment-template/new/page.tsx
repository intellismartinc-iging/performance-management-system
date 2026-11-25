import type { Metadata } from "next";

import { BehavioralTemplateCreateForm } from "@/features/review-templates/components/behavioral-template-create-form";

export const metadata: Metadata = { title: "Behavioral Assessment Template Builder" };

export default function NewBehavioralAssessmentTemplatePage() {
  // The builder draws its own back link, header, and actions.
  return <BehavioralTemplateCreateForm />;
}
