"use client";

import { useState, useTransition } from "react";

import {
  KpiGoalTemplateEditor,
  type KpiGoalTemplate,
} from "@/features/review-templates/components/kpi-goal-template-editor";
import { GOAL_TEMPLATE_PATH } from "@/constants/goal-template-path";
import { createGoalTemplate } from "@/features/review-templates/services/create-goal-template";
import { toSaveGoalTemplateRequest } from "@/features/review-templates/services/template-requests";

interface GoalTemplateCreateFormProps {
  positions: readonly { value: string; label: string }[];
}

export function GoalTemplateCreateForm({
  positions,
}: GoalTemplateCreateFormProps) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function save(template: KpiGoalTemplate, intent: "draft" | "publish" | "update") {
    const body = toSaveGoalTemplateRequest(template);
    if (!body.success) {
      setMessage(
        body.error.issues[0]?.message ?? "Check the template and try again.",
      );
      return;
    }

    setMessage("");
    startTransition(async () => {
      // A success redirects, so a result here is always a failure message.
      const result = await createGoalTemplate(body.data, intent);
      setMessage(result.message);
    });
  }

  return (
    <KpiGoalTemplateEditor
      positions={positions}
      backHref={GOAL_TEMPLATE_PATH}
      onSave={save}
      submitError={message}
      onEdit={() => setMessage("")}
      isPending={isPending}
    />
  );
}
