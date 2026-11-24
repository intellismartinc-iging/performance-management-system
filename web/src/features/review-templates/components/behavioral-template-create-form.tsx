"use client";

import { useState, useTransition } from "react";

import { BEHAVIORAL_TEMPLATE_PATH } from "@/constants/behavioral-template-path";
import {
  BehavioralTemplateEditor,
  type BehavioralTemplate,
} from "@/features/review-templates/components/behavioral-template-editor";
import { createBehavioralTemplate } from "@/features/review-templates/services/save-behavioral-template";
import { toSaveBehavioralTemplateRequest } from "@/features/review-templates/services/template-requests";

export function BehavioralTemplateCreateForm() {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function save(template: BehavioralTemplate, intent: "draft" | "publish" | "update") {
    // A new template is a draft: the update intent belongs to a published template.
    if (intent === "update") return;
    const body = toSaveBehavioralTemplateRequest(template);
    if (!body.success) {
      setMessage(body.error.issues[0]?.message ?? "Check the template and try again.");
      return;
    }

    setMessage("");
    startTransition(async () => {
      // A success redirects, so a result here is always a failure message.
      const result = await createBehavioralTemplate(body.data, intent);
      setMessage(result.message);
    });
  }

  return (
    <BehavioralTemplateEditor
      backHref={BEHAVIORAL_TEMPLATE_PATH}
      onSave={save}
      submitError={message}
      onEdit={() => setMessage("")}
      isPending={isPending}
    />
  );
}
