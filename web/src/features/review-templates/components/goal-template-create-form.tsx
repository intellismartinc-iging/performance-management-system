"use client";

import { useState, useTransition } from "react";

import { ConfirmationDialog } from "@/components/molecules/confirmation-dialog";
import {
  KpiGoalTemplateEditor,
  type KpiGoalTemplate,
} from "@/features/review-templates/components/kpi-goal-template-editor";
import { GOAL_TEMPLATE_PATH } from "@/constants/goal-template-path";
import { createGoalTemplate } from "@/features/review-templates/services/create-goal-template";
import { PUBLISH_CONFIRMATION } from "@/features/review-templates/services/publish-confirmation";
import { toSaveGoalTemplateRequest } from "@/features/review-templates/services/template-requests";

interface GoalTemplateCreateFormProps {
  positions: readonly { value: string; label: string }[];
}

export function GoalTemplateCreateForm({
  positions,
}: GoalTemplateCreateFormProps) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<KpiGoalTemplate | null>(null);
  const [isPending, startTransition] = useTransition();

  /** Checks the template, then saves a draft or asks before it publishes. */
  function save(template: KpiGoalTemplate, intent: "draft" | "publish" | "update") {
    const body = toSaveGoalTemplateRequest(template);
    if (!body.success) {
      setMessage(
        body.error.issues[0]?.message ?? "Check the template and try again.",
      );
      return;
    }

    setMessage("");
    if (intent === "publish") setPending(template);
    else send(template, intent);
  }

  function send(template: KpiGoalTemplate, intent: "draft" | "publish" | "update") {
    const body = toSaveGoalTemplateRequest(template);
    if (!body.success) return;
    startTransition(async () => {
      // A success redirects, so a result here is always a failure message.
      const result = await createGoalTemplate(body.data, intent);
      setMessage(result.message);
    });
  }

  return (
    <>
      <KpiGoalTemplateEditor
        positions={positions}
        backHref={GOAL_TEMPLATE_PATH}
        onSave={save}
        submitError={message}
        onEdit={() => setMessage("")}
        isPending={isPending}
      />
      <ConfirmationDialog
        open={pending !== null}
        title={PUBLISH_CONFIRMATION.title}
        description={PUBLISH_CONFIRMATION.description}
        confirmLabel={PUBLISH_CONFIRMATION.confirmLabel}
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (pending) send(pending, "publish");
          setPending(null);
        }}
      />
    </>
  );
}
