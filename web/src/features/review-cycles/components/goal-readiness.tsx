"use client";

import { useId } from "react";

import { StatusBadge } from "@/components/atoms/status-badge";
import { DataTable } from "@/components/organisms/data-table";
import { Button } from "@/components/ui/button";
import type { Employee } from "@/types/employee";

interface GoalReadinessParticipant
  extends Pick<Employee, "id" | "name" | "position"> {
  templateName: string | null;
  linkedGoalCount: number;
  issues: readonly string[];
}

interface GoalReadinessProps {
  participants: readonly GoalReadinessParticipant[];
  onConfigureGoals: (employeeId: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

function isReady(participant: GoalReadinessParticipant) {
  return (
    participant.templateName !== null &&
    participant.linkedGoalCount > 0 &&
    participant.issues.length === 0
  );
}

export function GoalReadiness({
  participants,
  onConfigureGoals,
  onBack,
  onContinue,
}: GoalReadinessProps) {
  const headingId = useId();
  const readyCount = participants.filter(isReady).length;
  const canContinue =
    participants.length > 0 && readyCount === participants.length;

  return (
    <section aria-labelledby={headingId} className="grid min-w-0 gap-4">
      <div className="grid gap-2">
        <h2 id={headingId} className="text-pms-section-title">
          KPI goal readiness
        </h2>
        <p className="max-w-pms-copy text-pms-body text-muted-foreground">
          Assign a published KPI goal template and link an eligible goal for
          each required indicator before continuing.
        </p>
      </div>

      <p
        role="status"
        className="text-pms-label tabular-nums text-muted-foreground"
      >
        {readyCount} of {participants.length} employees ready
      </p>

      <DataTable
        caption="KPI goal readiness by employee"
        rows={participants}
        getRowId={(participant) => participant.id}
        emptyMessage="Select employees to check their goal readiness."
        columns={[
          {
            id: "employee",
            heading: "Employee",
            renderCell: (participant) => participant.name,
          },
          {
            id: "template",
            heading: "KPI goal template",
            renderCell: (participant) => (
              <div className="whitespace-normal">
                <span>{participant.templateName ?? "Not assigned"}</span>
                <span className="block text-pms-label text-muted-foreground">
                  {participant.position}
                </span>
              </div>
            ),
          },
          {
            id: "readiness",
            heading: "Readiness",
            renderCell: (participant) => {
              const ready = isReady(participant);

              return (
                <div className="grid justify-items-start gap-2 whitespace-normal">
                  <StatusBadge
                    label={ready ? "Ready" : "Needs attention"}
                    tone={ready ? "complete" : "alert"}
                  />
                  <span className="text-pms-label tabular-nums text-muted-foreground">
                    Linked goals: {participant.linkedGoalCount}
                  </span>
                  {participant.issues.length > 0 && (
                    <ul className="max-w-pms-copy list-disc space-y-1 ps-4 text-pms-label text-muted-foreground">
                      {participant.issues.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            },
          },
          {
            id: "actions",
            heading: "Goal configuration",
            renderCell: (participant) => {
              const action =
                participant.linkedGoalCount > 0
                  ? "Review goals"
                  : "Assign goals";

              return (
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-pms-touch rounded-pms-control"
                  aria-label={`${action} for ${participant.name} (${participant.id})`}
                  onClick={() => onConfigureGoals(participant.id)}
                >
                  {action}
                </Button>
              );
            },
          },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-pms-touch rounded-pms-control"
          onClick={onBack}
        >
          Back
        </Button>
        <Button
          type="button"
          className="min-h-pms-touch rounded-pms-control"
          disabled={!canContinue}
          onClick={onContinue}
        >
          Continue
        </Button>
      </div>
    </section>
  );
}
