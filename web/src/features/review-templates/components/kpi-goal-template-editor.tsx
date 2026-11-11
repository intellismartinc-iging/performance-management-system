"use client";

import { useState } from "react";

import { FormSelect } from "@/components/molecules/form-select";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { KPI_DIRECTION_LABELS } from "@/constants/domain-labels";
import { KPI_DIRECTIONS, type KpiDirection } from "@pms/shared-types";

export interface Indicator {
  id: string;
  name: string;
  description: string;
  unit: string;
  direction: KpiDirection;
  target: string;
  weight: string;
  scoreMet: string;
  scoreBelow: string;
}

export interface KpiGoalTemplate {
  name: string;
  position: string;
  description: string;
  indicators: Indicator[];
}

interface KpiGoalTemplateEditorProps {
  initialTemplate?: KpiGoalTemplate;
  positions: readonly { value: string; label: string }[];
  onSave: (template: KpiGoalTemplate, intent: "draft" | "publish") => void;
}

const NUMBER_FIELDS = [
  { field: "target", label: "Target", min: 0, max: undefined },
  { field: "weight", label: "Weight (%)", min: 0, max: 100 },
  { field: "scoreMet", label: "Score when target is met", min: 1, max: 5 },
  { field: "scoreBelow", label: "Score when target is missed", min: 1, max: 5 },
] as const;

const CONTROL = "min-h-pms-touch rounded-pms-control";

export function KpiGoalTemplateEditor({
  initialTemplate,
  positions,
  onSave,
}: KpiGoalTemplateEditorProps) {
  const [template, setTemplate] = useState<KpiGoalTemplate>(
    initialTemplate ?? {
      name: "",
      position: "",
      description: "",
      indicators: [],
    },
  );
  const [error, setError] = useState("");
  const totalWeight = template.indicators.reduce(
    (sum, item) => sum + Number(item.weight),
    0,
  );

  function update(changes: Partial<KpiGoalTemplate>) {
    setTemplate({ ...template, ...changes });
    setError("");
  }

  function updateIndicator(id: string, changes: Partial<Indicator>) {
    update({
      indicators: template.indicators.map((item) =>
        item.id === id ? { ...item, ...changes } : item,
      ),
    });
  }

  function getError(intent: "draft" | "publish") {
    if (
      !template.name.trim() ||
      !positions.some((position) => position.value === template.position)
    ) {
      return "Enter a template name and choose an applicable position.";
    }
    if (intent === "draft") return "";
    if (!template.indicators.length) return "Add at least one KPI indicator.";
    for (const [index, indicator] of template.indicators.entries()) {
      if (!indicator.name.trim())
        return `Indicator ${index + 1}: enter a name.`;
      for (const { field, label, min, max } of NUMBER_FIELDS) {
        const value = Number(indicator[field]);
        if (
          !indicator[field].trim() ||
          !Number.isFinite(value) ||
          value < min ||
          (max !== undefined && value > max) ||
          (field === "weight" && value === 0)
        ) {
          return `Indicator ${index + 1}: enter a valid ${label.toLowerCase()}.`;
        }
      }
    }
    return Math.abs(totalWeight - 100) > 0.01
      ? "Indicator weights must total 100%."
      : "";
  }

  function save(intent: "draft" | "publish") {
    const issue = getError(intent);
    setError(issue);
    if (!issue) onSave({ ...template, name: template.name.trim() }, intent);
  }

  return (
    <form
      noValidate
      className="grid min-w-0 gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        save("publish");
      }}
    >
      <h2 className="text-pms-section-title">KPI goal template</h2>
      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <Field>
          <FieldLabel className="w-full flex-col items-stretch text-pms-label">
            Template name
            <Input
              required
              value={template.name}
              className={CONTROL}
              onChange={(event) => update({ name: event.currentTarget.value })}
            />
          </FieldLabel>
        </Field>
        <FormSelect
          label="Applicable position"
          value={template.position || null}
          options={positions}
          onChange={(position) => update({ position })}
        />
      </div>
      <Field>
        <FieldLabel className="w-full flex-col items-stretch text-pms-label">
          Description (optional)
          <Textarea
            value={template.description}
            onChange={(event) =>
              update({ description: event.currentTarget.value })
            }
          />
        </FieldLabel>
      </Field>
      {template.indicators.map((indicator, index) => (
        <FieldSet
          key={indicator.id}
          className="min-w-0 gap-4 rounded-pms-card border border-border bg-card p-4"
        >
          <FieldLegend className="text-pms-section-title">
            Indicator {index + 1}
          </FieldLegend>
          <div className="grid min-w-0 gap-4 md:grid-cols-2">
            {(
              [
                ["name", "Indicator name"],
                ["unit", "Unit (optional)"],
              ] as const
            ).map(([field, label]) => (
              <Field key={field}>
                <FieldLabel className="w-full flex-col items-stretch text-pms-label">
                  {label}
                  <Input
                    required={field === "name"}
                    value={indicator[field]}
                    className={CONTROL}
                    onChange={(event) =>
                      updateIndicator(indicator.id, {
                        [field]: event.currentTarget.value,
                      })
                    }
                  />
                </FieldLabel>
              </Field>
            ))}
            <FormSelect
              label="Target direction"
              value={indicator.direction}
              options={KPI_DIRECTIONS.map((value) => ({
                value,
                label: KPI_DIRECTION_LABELS[value],
              }))}
              onChange={(direction) =>
                updateIndicator(indicator.id, { direction })
              }
            />
            {NUMBER_FIELDS.map(({ field, label, min, max }) => (
              <Field key={field}>
                <FieldLabel className="w-full flex-col items-stretch text-pms-label">
                  {label}
                  <Input
                    type="number"
                    min={min}
                    max={max}
                    step="any"
                    required
                    value={indicator[field]}
                    className={CONTROL}
                    onChange={(event) =>
                      updateIndicator(indicator.id, {
                        [field]: event.currentTarget.value,
                      })
                    }
                  />
                </FieldLabel>
              </Field>
            ))}
          </div>
          <Field>
            <FieldLabel className="w-full flex-col items-stretch text-pms-label">
              Indicator description (optional)
              <Textarea
                value={indicator.description}
                onChange={(event) =>
                  updateIndicator(indicator.id, {
                    description: event.currentTarget.value,
                  })
                }
              />
            </FieldLabel>
          </Field>
          <Button
            type="button"
            variant="destructive"
            className="min-h-pms-touch self-start"
            aria-label={`Remove indicator ${index + 1}`}
            onClick={() =>
              update({
                indicators: template.indicators.filter(
                  (item) => item.id !== indicator.id,
                ),
              })
            }
          >
            Remove indicator
          </Button>
        </FieldSet>
      ))}
      <p className="text-pms-label tabular-nums text-muted-foreground">
        Total weight:{" "}
        {Number.isFinite(totalWeight) ? totalWeight.toFixed(2) : "0.00"}%
      </p>
      <Button
        type="button"
        variant="outline"
        className="min-h-pms-touch justify-self-start"
        onClick={() =>
          update({
            indicators: [
              ...template.indicators,
              {
                id: crypto.randomUUID(),
                name: "",
                description: "",
                unit: "",
                direction: "higher_is_better",
                target: "",
                weight: "",
                scoreMet: "",
                scoreBelow: "",
              },
            ],
          })
        }
      >
        Add indicator
      </Button>
      <FieldError>{error}</FieldError>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-pms-touch"
          onClick={() => save("draft")}
        >
          Save draft
        </Button>
        <Button type="submit" className="min-h-pms-touch">
          Publish template
        </Button>
      </div>
    </form>
  );
}
