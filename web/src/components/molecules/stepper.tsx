"use client";

import { Button } from "@/components/ui/button";

interface StepperProps {
  /** Accessible name of the navigation, for example "Review cycle setup". */
  label: string;
  steps: readonly string[];
  /** 1-based. */
  currentStep: number;
  /** Highest step the user may jump to, 1-based. */
  furthestStep: number;
  onStepChange: (step: number) => void;
}

export function Stepper({
  label,
  steps,
  currentStep,
  furthestStep,
  onStepChange,
}: StepperProps) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap gap-2">
        {steps.map((stepLabel, index) => {
          const step = index + 1;
          const current = step === currentStep;
          return (
            <li key={stepLabel}>
              <Button
                type="button"
                variant={current ? "secondary" : "outline"}
                className="min-h-pms-touch"
                aria-current={current ? "step" : undefined}
                disabled={step > furthestStep}
                onClick={() => onStepChange(step)}
              >
                <span aria-hidden="true" className="tabular-nums">
                  {step}.
                </span>
                {stepLabel}
                {step < furthestStep && !current && (
                  <span className="sr-only"> (completed)</span>
                )}
              </Button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
