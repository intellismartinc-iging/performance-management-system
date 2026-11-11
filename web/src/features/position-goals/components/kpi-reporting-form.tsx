"use client";

import { useState } from "react";

import { ConfirmationDialog } from "@/components/molecules/confirmation-dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { KpiIndicatorResult } from "@/types/kpi-indicator";

interface KpiReportingFormProps {
  indicators: readonly KpiIndicatorResult[];
  canSubmit: boolean;
  correctionReason?: string;
  onSave: (
    results: { id: string; actual: number | null; remarks: string }[],
    intent: "draft" | "submit",
  ) => void;
}

export function KpiReportingForm({
  indicators,
  canSubmit,
  correctionReason,
  onSave,
}: KpiReportingFormProps) {
  const [draft, setDraft] = useState(() =>
    indicators.map((indicator) => ({
      ...indicator,
      actual: indicator.actual === null ? "" : String(indicator.actual),
    })),
  );
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");

  function update(id: string, changes: { actual?: string; remarks?: string }) {
    setDraft(
      draft.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );
    setError("");
  }

  function validate(intent: "draft" | "submit") {
    const invalid = draft.find(
      ({ actual, remarks }) =>
        (actual === ""
          ? intent === "submit"
          : !Number.isFinite(Number(actual)) || Number(actual) < 0) ||
        remarks.length > 2000,
    );
    const issue = invalid
      ? `${invalid.name}: check the actual result and remarks.`
      : "";
    setError(issue);
    return !issue && draft.length > 0;
  }

  function save(intent: "draft" | "submit") {
    onSave(
      draft.map(({ id, actual, remarks }) => ({
        id,
        actual: actual === "" ? null : Number(actual),
        remarks: remarks.trim(),
      })),
      intent,
    );
  }

  return (
    <form
      noValidate
      className="grid min-w-0 gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSubmit && validate("submit")) setConfirm(true);
      }}
    >
      <h2 className="text-pms-section-title">Report KPI accomplishments</h2>
      {correctionReason && (
        <p className="text-pms-body">
          <strong>Correction requested:</strong> {correctionReason}
        </p>
      )}
      {!draft.length && (
        <p className="text-pms-body text-muted-foreground">
          No KPI indicators are assigned.
        </p>
      )}
      {draft.map((indicator) => (
        <FieldSet
          key={indicator.id}
          className="min-w-0 gap-4 rounded-pms-card border border-border bg-card p-4"
        >
          <FieldLegend className="text-pms-section-title">
            {indicator.name}
          </FieldLegend>
          <FieldDescription>
            Target: {indicator.target} {indicator.unit}
          </FieldDescription>
          <Field>
            <FieldLabel className="w-full flex-col items-stretch text-pms-label">
              Actual result
              <Input
                type="number"
                min={0}
                step="any"
                required
                value={indicator.actual}
                className="min-h-pms-touch rounded-pms-control"
                onChange={(event) =>
                  update(indicator.id, { actual: event.currentTarget.value })
                }
              />
            </FieldLabel>
          </Field>
          <Field>
            <FieldLabel className="w-full flex-col items-stretch text-pms-label">
              Remarks (optional)
              <Textarea
                maxLength={2000}
                value={indicator.remarks}
                onChange={(event) =>
                  update(indicator.id, { remarks: event.currentTarget.value })
                }
              />
            </FieldLabel>
          </Field>
        </FieldSet>
      ))}
      {!canSubmit && (
        <p className="text-pms-label text-muted-foreground">
          Submission is currently unavailable. You can save a draft.
        </p>
      )}
      <FieldError>{error}</FieldError>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-pms-touch"
          disabled={!draft.length}
          onClick={() => {
            if (validate("draft")) save("draft");
          }}
        >
          Save draft
        </Button>
        <Button
          type="submit"
          className="min-h-pms-touch"
          disabled={!canSubmit || !draft.length}
        >
          Submit accomplishments
        </Button>
      </div>
      <ConfirmationDialog
        open={confirm}
        title="Submit accomplishments?"
        description="Submitted results are locked unless your manager returns them for correction."
        confirmLabel="Confirm submission"
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          if (canSubmit && validate("submit")) save("submit");
        }}
      />
    </form>
  );
}
