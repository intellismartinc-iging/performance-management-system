"use client";

import { useState, useTransition } from "react";
import type { GoalTemplateDetailResponseDto } from "@pms/shared-types";

import { ConfirmationDialog } from "@/components/molecules/confirmation-dialog";
import {
  KpiGoalTemplateEditor,
  type KpiGoalTemplate,
} from "@/features/review-templates/components/kpi-goal-template-editor";
import { GOAL_TEMPLATE_PATH } from "@/constants/goal-template-path";
import { fromGoalTemplateDetail } from "@/features/review-templates/services/goal-template-editor-state";
import { PUBLISH_CONFIRMATION } from "@/features/review-templates/services/publish-confirmation";
import { saveGoalTemplateEdits } from "@/features/review-templates/services/manage-goal-template";
import { toSaveGoalTemplateRequest } from "@/features/review-templates/services/template-requests";

interface GoalTemplateEditFormProps {
  detail: GoalTemplateDetailResponseDto;
  positions: readonly { value: string; label: string }[];
}

type Intent = "draft" | "publish" | "update";

/** Edits a draft (Save as Draft, Publish Template) or a published template (Update Template). */
export function GoalTemplateEditForm({ detail, positions }: GoalTemplateEditFormProps) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<{ template: KpiGoalTemplate; intent: Intent } | null>(null);
  const [isPending, startTransition] = useTransition();
  const { templateId, status, currentVersion } = detail.template;
  const isPublished = status === "published";

  function send(template: KpiGoalTemplate, intent: Intent) {
    // Existing indicators keep their ids, so the API can tell which ones are new.
    const body = toSaveGoalTemplateRequest(template, { keepIds: true });
    if (!body.success) {
      setMessage(body.error.issues[0]?.message ?? "Check the template and try again.");
      return;
    }
    setMessage("");
    startTransition(async () => {
      // A success redirects, so a result here is always a failure message.
      const result = await saveGoalTemplateEdits(templateId, body.data, intent);
      setMessage(result.message);
    });
  }

  return (
    <>
      <KpiGoalTemplateEditor
        initialTemplate={fromGoalTemplateDetail(detail)}
        status={isPublished ? "published" : "draft"}
        positions={positions}
        backHref={`${GOAL_TEMPLATE_PATH}/${templateId}`}
        // Publish and update ask first: both freeze a version at once.
        onSave={(template, intent) =>
          intent === "draft" ? send(template, intent) : setPending({ template, intent })
        }
        submitError={message}
        onEdit={() => setMessage("")}
        isPending={isPending}
      />
      <ConfirmationDialog
        open={pending !== null}
        title={pending?.intent === "update" ? "Update this template?" : PUBLISH_CONFIRMATION.title}
        description={
          pending?.intent === "update"
            ? `This publishes version ${(currentVersion ?? 0) + 1}. Cycles that already use version ${currentVersion} keep it.`
            : PUBLISH_CONFIRMATION.description
        }
        confirmLabel={pending?.intent === "update" ? "Update Template" : PUBLISH_CONFIRMATION.confirmLabel}
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (pending) send(pending.template, pending.intent);
          setPending(null);
        }}
      />
    </>
  );
}
