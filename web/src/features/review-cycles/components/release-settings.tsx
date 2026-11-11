"use client";

import { useId } from "react";

import { FormSelect } from "@/components/molecules/form-select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export interface ReleasePolicy {
  previousStages: "metadata" | "responses";
  anonymousPeer: boolean;
  anonymousUpward: boolean;
  minimumResponses: string;
}

interface ReleaseSettingsProps {
  policy: ReleasePolicy;
  hasPeerStage: boolean;
  hasUpwardStage: boolean;
  onChange: (policy: ReleasePolicy) => void;
}

const VISIBILITY_OPTIONS = [
  { value: "metadata", label: "Stage status and submission metadata only" },
  { value: "responses", label: "Permitted named responses from prior stages" },
] as const;

export function ReleaseSettings({
  policy,
  hasPeerStage,
  hasUpwardStage,
  onChange,
}: ReleaseSettingsProps) {
  const id = useId();
  return (
    <FieldSet className="min-w-0 gap-4">
      <FieldLegend className="text-pms-section-title">
        Result release
      </FieldLegend>
      <p className="text-pms-body text-muted-foreground">
        HR finalizes completed assessments and releases results manually.
      </p>
      <FormSelect
        label="Previous-stage information for evaluators"
        value={policy.previousStages}
        options={VISIBILITY_OPTIONS}
        onChange={(previousStages) => onChange({ ...policy, previousStages })}
      />
      {(
        [
          {
            visible: hasPeerStage,
            field: "anonymousPeer",
            label: "Protect anonymous peer feedback",
          },
          {
            visible: hasUpwardStage,
            field: "anonymousUpward",
            label: "Protect anonymous upward feedback",
          },
        ] as const
      )
        .filter((item) => item.visible)
        .map(({ field, label }) => (
          <Field
            key={field}
            orientation="horizontal"
            className="min-h-pms-touch"
          >
            <Checkbox
              id={`${id}-${field}`}
              checked={policy[field]}
              onCheckedChange={(checked) =>
                onChange({ ...policy, [field]: checked })
              }
            />
            <FieldLabel
              htmlFor={`${id}-${field}`}
              className="min-h-pms-touch text-pms-label"
            >
              {label}
            </FieldLabel>
          </Field>
        ))}
      {(hasPeerStage || hasUpwardStage) && (
        <Field>
          <FieldLabel className="w-full flex-col items-stretch text-pms-label">
            Minimum anonymous responses
            <Input
              type="number"
              min={2}
              max={10}
              step={1}
              required
              value={policy.minimumResponses}
              className="min-h-pms-touch rounded-pms-control"
              onChange={(event) =>
                onChange({
                  ...policy,
                  minimumResponses: event.currentTarget.value,
                })
              }
            />
          </FieldLabel>
        </Field>
      )}
    </FieldSet>
  );
}
