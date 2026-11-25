"use client";

import { useState, useTransition } from "react";

import { ConfirmationDialog } from "@/components/molecules/confirmation-dialog";
import { BEHAVIORAL_TEMPLATE_PATH } from "@/constants/behavioral-template-path";
import {
  BehavioralTemplateEditor,
  type BehavioralTemplate,
} from "@/features/review-templates/components/behavioral-template-editor";
import { PUBLISH_CONFIRMATION } from "@/features/review-templates/services/publish-confirmation";
import { createBehavioralTemplate } from "@/features/review-templates/services/save-behavioral-template";
import { toSaveBehavioralTemplateRequest } from "@/features/review-templates/services/template-requests";

type Intent = "draft" | "publish" | "update";

export function BehavioralTemplateCreateForm() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<BehavioralTemplate | null>(null);
  const [isPending, startTransition] = useTransition();

  /** Checks the template, then saves a draft or asks before it publishes. */
  function save(template: BehavioralTemplate, intent: Intent) {
    // A new template is a draft: the update intent belongs to a published template.
    if (intent === "update") return;
    const body = toSaveBehavioralTemplateRequest(template);
    if (!body.success) {
      setMessage(body.error.issues[0]?.message ?? "Check the template and try again.");
      return;
    }
    setMessage("");
    if (intent === "publish") setPending(template);
    else send(template, intent);
  }

  function send(template: BehavioralTemplate, intent: "draft" | "publish") {
    const body = toSaveBehavioralTemplateRequest(template);
    if (!body.success) return;
    startTransition(async () => {
      // A success redirects, so a result here is always a failure message.
      const result = await createBehavioralTemplate(body.data, intent);
      setMessage(result.message);
    });
  }

  return (
    <>
      <BehavioralTemplateEditor
        backHref={BEHAVIORAL_TEMPLATE_PATH}
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
