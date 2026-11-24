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
import { saveBehavioralTemplateEdits } from "@/features/review-templates/services/manage-behavioral-template";
import { toSaveBehavioralTemplateRequest } from "@/features/review-templates/services/template-requests";

type Intent = "draft" | "publish" | "update";

/**
 * Edits a draft (Save as Draft, Publish Template) or a published template
 * (Update Template, which publishes its next version and keeps the old one).
 */
export function BehavioralTemplateEditForm({ tree }: { tree: BehavioralTemplateTreeResponseDto }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState<BehavioralTemplate | null>(null);
  const [isPending, startTransition] = useTransition();
  const { templateId, status, currentVersion } = tree.template;
  const isPublished = status === "published";

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
        // A published template asks first: the update is a new version at once.
        onSave={(template, intent) => (intent === "update" ? setPending(template) : send(template, intent))}
        submitError={message}
        onEdit={() => setMessage("")}
        isPending={isPending}
      />
      <ConfirmationDialog
        open={pending !== null}
        title="Update this template?"
        description={`This publishes version ${currentVersion + 1}. Cycles that already use version ${currentVersion} keep it.`}
        confirmLabel="Update Template"
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (pending) send(pending, "update");
          setPending(null);
        }}
      />
    </>
  );
}
