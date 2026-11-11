"use client";

import { useState } from "react";

import { ConfirmationDialog } from "@/components/molecules/confirmation-dialog";
import { DataTable } from "@/components/organisms/data-table";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import type { VerificationStatus } from "@pms/shared-types";

type VerificationDecision =
  | { status: Extract<VerificationStatus, "verified"> }
  | { status: Extract<VerificationStatus, "returned">; reason: string };

interface KpiVerificationPanelProps {
  employeeName: string;
  indicators: readonly {
    id: string;
    name: string;
    unit: string;
    target: number;
    actual: number | null;
    remarks: string;
  }[];
  canVerify: boolean;
  onDecision: (decision: VerificationDecision) => void;
}

export function KpiVerificationPanel({
  employeeName,
  indicators,
  canVerify,
  onDecision,
}: KpiVerificationPanelProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [decision, setDecision] = useState<VerificationDecision | null>(null);
  const hasCompleteResults =
    indicators.length > 0 &&
    indicators.every(
      ({ actual }) => actual !== null && Number.isFinite(actual) && actual >= 0,
    );

  return (
    <section
      aria-label="Verify KPI accomplishments"
      className="grid min-w-0 gap-4"
    >
      <div>
        <h2 className="text-pms-section-title">Verify KPI accomplishments</h2>
        <p className="text-pms-body text-muted-foreground">{employeeName}</p>
      </div>
      <DataTable
        caption="Submitted KPI results"
        rows={indicators}
        getRowId={({ id }) => id}
        emptyMessage="No submitted KPI results."
        columns={[
          {
            id: "indicator",
            heading: "Indicator",
            renderCell: ({ name }) => name,
          },
          {
            id: "target",
            heading: "Target",
            align: "end",
            renderCell: ({ target, unit }) => `${target} ${unit}`,
          },
          {
            id: "actual",
            heading: "Actual",
            align: "end",
            renderCell: ({ actual, unit }) =>
              actual === null ? "Missing" : `${actual} ${unit}`,
          },
          {
            id: "remarks",
            heading: "Employee remarks",
            renderCell: ({ remarks }) => (
              <span className="whitespace-normal">{remarks || "None"}</span>
            ),
          },
        ]}
      />
      {canVerify && indicators.length > 0 && (
        <>
          <Field>
            <FieldLabel className="w-full flex-col items-stretch text-pms-label">
              Reason for correction (required when returning)
              <Textarea
                value={reason}
                maxLength={2000}
                aria-invalid={Boolean(error)}
                onChange={(event) => {
                  setReason(event.currentTarget.value);
                  setError("");
                }}
              />
            </FieldLabel>
            <FieldError>{error}</FieldError>
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-pms-touch"
              onClick={() => {
                const trimmed = reason.trim();
                if (!trimmed) {
                  setError("Enter a reason for correction.");
                  return;
                }
                setDecision({ status: "returned", reason: trimmed });
              }}
            >
              Return for correction
            </Button>
            <Button
              type="button"
              className="min-h-pms-touch"
              disabled={!hasCompleteResults}
              onClick={() => setDecision({ status: "verified" })}
            >
              Verify accomplishments
            </Button>
          </div>
        </>
      )}
      <ConfirmationDialog
        open={decision !== null}
        title={
          decision?.status === "returned"
            ? "Return for correction?"
            : "Verify accomplishments?"
        }
        description={
          decision?.status === "returned"
            ? "The employee can revise and resubmit the results before the correction deadline."
            : "The submitted results will be marked verified for this review cycle."
        }
        confirmLabel={
          decision?.status === "returned"
            ? "Confirm return"
            : "Confirm verification"
        }
        onClose={() => setDecision(null)}
        onConfirm={() => {
          if (canVerify && decision) onDecision(decision);
          setDecision(null);
        }}
      />
    </section>
  );
}
