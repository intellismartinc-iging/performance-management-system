"use client";

import { Button } from "@/components/ui/button";

interface CycleLaunchSummaryProps {
  details: readonly { label: string; value: string }[];
  stages: readonly { id: string; name: string; deadline: string }[];
  participantCount: number;
  readyCount: number;
  issues: readonly { id: string; message: string; step: number }[];
  onEditStep: (step: number) => void;
  onSaveDraft: () => void;
  onLaunch: () => void;
}

export function CycleLaunchSummary({
  details,
  stages,
  participantCount,
  readyCount,
  issues,
  onEditStep,
  onSaveDraft,
  onLaunch,
}: CycleLaunchSummaryProps) {
  return (
    <section aria-label="Review and launch" className="grid min-w-0 gap-4">
      <h2 className="text-pms-section-title">Cycle overview</h2>
      <dl className="grid gap-4 md:grid-cols-2">
        {details.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-pms-label text-muted-foreground">{label}</dt>
            <dd className="text-pms-body">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-pms-body">
        {readyCount} of {participantCount} participants ready.
      </p>
      <h3 className="text-pms-section-title">Assessment schedule</h3>
      <ol className="list-decimal space-y-2 ps-5 text-pms-body">
        {stages.map(({ id, name, deadline }) => (
          <li key={id}>
            {name} · {deadline || "No deadline set"}
          </li>
        ))}
      </ol>
      <p className="text-pms-body text-muted-foreground">
        HR releases results manually after finalizing assessments.
      </p>
      {issues.length > 0 && (
        <div className="grid gap-2 rounded-pms-card border border-border bg-card p-4">
          <h3 className="text-pms-section-title">Resolve before launching</h3>
          <ul className="grid gap-2">
            {issues.map(({ id, message, step }) => (
              <li key={id} className="flex flex-wrap items-center gap-2">
                <span className="text-pms-body">{message}</span>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-pms-touch"
                  onClick={() => onEditStep(step)}
                >
                  Edit step {step}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-pms-touch"
          onClick={onSaveDraft}
        >
          Save as draft
        </Button>
        <Button
          type="button"
          className="min-h-pms-touch"
          disabled={
            issues.length > 0 ||
            participantCount === 0 ||
            readyCount !== participantCount ||
            stages.length === 0
          }
          onClick={onLaunch}
        >
          Launch cycle
        </Button>
      </div>
    </section>
  );
}
