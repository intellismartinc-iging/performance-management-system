"use client";

import { useState, useTransition } from "react";
import type { BehavioralTemplateTreeResponseDto } from "@pms/shared-types";

import { ConfirmationDialog } from "@/components/molecules/confirmation-dialog";
import { BEHAVIORAL_TEMPLATE_PATH } from "@/constants/behavioral-template-path";
import {
  BehavioralTemplateEditor,
  type BehavioralTemplate,
} from "@/features/review-templates/components/behavioral-template-editor";
import { fromBehavioralTemplateTree } from "@/features/review-templates/services/behavioral-template-editor-state";
import { PUBLISH_CONFIRMATION } from "@/features/review-templates/services/publish-confirmation";
import { saveBehavioralTemplateEdits } from "@/features/review-templates/services/manage-behavioral-template";
import { toSaveBehavioralTemplateRequest } from "@/features/review-templates/services/template-requests";

type Intent = "draft" | "publish" | "update";

/**
 * Edits a draft (Save as Draft, Publish Template) or a published template
 * (Update Template, which publishes its next version and keeps the old one).
 */
export function BehavioralTemplateEditForm({ tree }: { tree: BehavioralTemplateTreeResponseDto }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<{ template: BehavioralTemplate; intent: Intent } | null>(null);
  const [isPending, startTransition] = useTransition();
  const { templateId, status, currentVersion } = tree.template;
  const isPublished = status === "published";

  // Check the template first, so a dialog never opens for a template the API would refuse.
  function ask(template: BehavioralTemplate, intent: Intent) {
    const body = toSaveBehavioralTemplateRequest(template);
    if (!body.success) {
      setMessage(body.error.issues[0]?.message ?? "Check the template and try again.");
      return;
    }
    setMessage("");
    setPending({ template, intent });
  }

  function send(template: BehavioralTemplate, intent: Intent) {
    const body = toSaveBehavioralTemplateRequest(template);
    if (!body.success) {
      setMessage(body.error.issues[0]?.message ?? "Check the template and try again.");
      return;
    }
    setMessage("");
    startTransition(async () => {
      // A success redirects, so a result here is always a failure message.
      const result = await saveBehavioralTemplateEdits(templateId, body.data, intent);
      setMessage(result.message);
    });
  }

  return (
    <>
      <BehavioralTemplateEditor
        mode="edit"
        status={isPublished ? "published" : "draft"}
        initialTemplate={fromBehavioralTemplateTree(tree)}
        backHref={`${BEHAVIORAL_TEMPLATE_PATH}/${templateId}`}
        // Publish and update ask first: both freeze a version at once.
        onSave={(template, intent) => (intent === "draft" ? send(template, intent) : ask(template, intent))}
        submitError={message}
        onEdit={() => setMessage("")}
        isPending={isPending}
      />
      <ConfirmationDialog
        open={pending !== null}
        title={pending?.intent === "update" ? "Update this template?" : PUBLISH_CONFIRMATION.title}
        description={
          pending?.intent === "update"
            ? `This publishes version ${currentVersion + 1}. Cycles that already use version ${currentVersion} keep it.`
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
