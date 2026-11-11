"use client";

import { useState } from "react";
import { FormField } from "@/components/molecules/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface ReasonDialogProps {
  open: boolean;
  title: string;
  description: string;
  reasonLabel?: string;
  confirmLabel: string;
  /** Smallest reason length after trimming. Defaults to 1. */
  minLength?: number;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

/** Confirmation that needs a written reason, for example reopen, exclude, or early closure. */
export function ReasonDialog({
  open,
  title,
  description,
  reasonLabel = "Reason",
  confirmLabel,
  minLength = 1,
  onClose,
  onConfirm,
}: ReasonDialogProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onClose();
      }}
    >
      <DialogContent className="rounded-pms-overlay">
        {/* Remounts on each open, so the draft never leaks between uses. */}
        {open && (
          <ReasonForm
            title={title}
            description={description}
            reasonLabel={reasonLabel}
            confirmLabel={confirmLabel}
            minLength={minLength}
            onClose={onClose}
            onConfirm={onConfirm}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReasonForm({
  title,
  description,
  reasonLabel,
  confirmLabel,
  minLength,
  onClose,
  onConfirm,
}: Omit<ReasonDialogProps, "open"> & {
  reasonLabel: string;
  minLength: number;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string>();

  function submit() {
    const trimmed = reason.trim();
    if (trimmed.length < minLength) {
      setError(
        minLength <= 1
          ? `${reasonLabel} is required.`
          : `${reasonLabel} needs at least ${minLength} characters.`,
      );
      return;
    }
    onConfirm(trimmed);
  }

  return (
    <form
      className="grid gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <FormField label={reasonLabel} required error={error}>
        {(control) => (
          <Textarea
            {...control}
            value={reason}
            onChange={(event) => {
              setReason(event.currentTarget.value);
              setError(undefined);
            }}
          />
        )}
      </FormField>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          className="min-h-pms-touch"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button type="submit" className="min-h-pms-touch">
          {confirmLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}
