"use client";

import { Stepper } from "@/components/molecules/stepper";

const STEPS = [
  "Cycle details",
  "Select participants",
  "Evaluation setup",
  "Assessment workflow",
  "Review and launch",
];

interface CycleSetupStepperProps {
  currentStep: number;
  furthestStep: number;
  onStepChange: (step: number) => void;
}

export function CycleSetupStepper(props: CycleSetupStepperProps) {
  return (
    <Stepper label="Review cycle setup" steps={STEPS} {...props} />
  );
}
