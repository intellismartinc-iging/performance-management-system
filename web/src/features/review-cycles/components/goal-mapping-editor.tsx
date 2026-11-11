"use client";

import { useId, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { KpiIndicator } from "@/types/kpi-indicator";

interface GoalTemplate {
  id: string;
  label: string;
  indicators: readonly KpiIndicator[];
}

interface EligibleGoal {
  id: string;
  name: string;
  deadline: string;
}

interface GoalMapping {
  indicatorId: string;
  goalId: string | null;
  target: number;
  deadline: string;
}

interface GoalMappingEditorProps {
  employeeName: string;
  position: string;
  periodStart: string;
  periodEnd: string;
  templates: readonly GoalTemplate[];
  eligibleGoals: readonly EligibleGoal[];
  initialAssignment?: { templateId: string; mappings: readonly GoalMapping[] };
  onCancel: () => void;
  onSave: (assignment: { templateId: string; mappings: GoalMapping[] }) => void;
}

export function GoalMappingEditor({
  employeeName,
  position,
  periodStart,
  periodEnd,
  templates,
  eligibleGoals,
  initialAssignment,
  onCancel,
  onSave,
}: GoalMappingEditorProps) {
  const id = useId();
  const [templateId, setTemplateId] = useState(
    initialAssignment?.templateId ?? templates[0]?.id ?? "",
  );
  const [edits, setEdits] = useState(
    () =>
      new Map(
        initialAssignment?.mappings.map((mapping) => [
          mapping.indicatorId,
          { ...mapping, target: String(mapping.target) },
        ]),
      ),
  );
  const [error, setError] = useState("");
  const template = templates.find((item) => item.id === templateId);
  const rows =
    template?.indicators.map((indicator) => ({
      indicator,
      mapping: edits.get(indicator.id) ?? {
        indicatorId: indicator.id,
        goalId: null,
        target: String(indicator.target),
        deadline: periodEnd,
      },
    })) ?? [];

  function save() {
    if (!template || rows.length === 0) return;

    const usedGoals = new Set<string>();
    const mappings: GoalMapping[] = [];
    for (const { indicator, mapping } of rows) {
      const target = Number(mapping.target);
      if (
        mapping.target.trim() === "" ||
        !Number.isFinite(target) ||
        target < 0 ||
        !mapping.deadline ||
        mapping.deadline < periodStart ||
        mapping.deadline > periodEnd
      ) {
        setError(
          `${indicator.name}: enter a valid target and a deadline within the evaluation period.`,
        );
        return;
      }
      if (mapping.goalId !== null) {
        if (!eligibleGoals.some((goal) => goal.id === mapping.goalId)) {
          setError(`${indicator.name}: choose an eligible goal.`);
          return;
        }
        if (usedGoals.has(mapping.goalId)) {
          setError(`${indicator.name}: select each existing goal only once.`);
          return;
        }
        usedGoals.add(mapping.goalId);
      }
      mappings.push({ ...mapping, target });
    }

    onSave({ templateId: template.id, mappings });
  }

  return (
    <form
      aria-labelledby={`${id}-title`}
      className="grid min-w-0 gap-pms-section"
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
    >
      <div className="grid gap-2">
        <h2 id={`${id}-title`} className="text-pms-section-title">
          Assign employee goals
        </h2>
        <p className="text-pms-body text-muted-foreground">
          {employeeName} · {position}
        </p>
      </div>

      <Field className="min-w-0">
        <FieldLabel htmlFor={`${id}-template`} className="text-pms-label">
          KPI goal template
        </FieldLabel>
        <Select
          value={template?.id ?? null}
          disabled={templates.length === 0}
          onValueChange={(value) => {
            setTemplateId(value ?? "");
            setEdits(new Map());
            setError("");
          }}
        >
          <SelectTrigger
            id={`${id}-template`}
            className="min-h-pms-touch w-full min-w-0 rounded-pms-control"
          >
            <SelectValue
              className="min-w-0"
              placeholder="Select a published template"
            >
              {template?.label}
            </SelectValue>
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {templates.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {templates.length === 0 && (
          <FieldDescription>
            No published KPI goal template matches this position.
          </FieldDescription>
        )}
        {template && rows.length === 0 && (
          <FieldDescription>
            This template has no indicators to map.
          </FieldDescription>
        )}
      </Field>

      {rows.map(({ indicator, mapping }, index) => {
        const rowId = `${id}-${index}`;
        const goalValue = mapping.goalId ?? "";

        function updateMapping(changes: Partial<typeof mapping>) {
          setEdits((current) =>
            new Map(current).set(indicator.id, { ...mapping, ...changes }),
          );
          setError("");
        }

        return (
          <FieldSet key={indicator.id} className="min-w-0 gap-4">
            <FieldLegend className="text-pms-section-title">
              {indicator.name}
            </FieldLegend>
            <Field className="min-w-0">
              <FieldLabel htmlFor={`${rowId}-goal`} className="text-pms-label">
                Goal record
              </FieldLabel>
              <Select
                value={goalValue}
                onValueChange={(value) => {
                  const goal = eligibleGoals.find((item) => item.id === value);
                  updateMapping({
                    goalId: goal?.id ?? null,
                    deadline: goal?.deadline ?? periodEnd,
                  });
                }}
              >
                <SelectTrigger
                  id={`${rowId}-goal`}
                  className="min-h-pms-touch w-full min-w-0 rounded-pms-control"
                >
                  <SelectValue className="min-w-0">
                    {goalValue === ""
                      ? "Create a goal from this indicator"
                      : (eligibleGoals.find((goal) => goal.id === goalValue)
                          ?.name ?? "Unavailable goal")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false}>
                  <SelectItem value="">
                    Create a goal from this indicator
                  </SelectItem>
                  {eligibleGoals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      {goal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid min-w-0 gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel
                  htmlFor={`${rowId}-target`}
                  className="text-pms-label"
                >
                  Target ({indicator.unit})
                </FieldLabel>
                <Input
                  id={`${rowId}-target`}
                  className="min-h-pms-touch rounded-pms-control"
                  type="number"
                  min={0}
                  step="any"
                  required
                  value={mapping.target}
                  onChange={(event) =>
                    updateMapping({ target: event.currentTarget.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel
                  htmlFor={`${rowId}-deadline`}
                  className="text-pms-label"
                >
                  Goal deadline
                </FieldLabel>
                <Input
                  id={`${rowId}-deadline`}
                  className="min-h-pms-touch rounded-pms-control"
                  type="date"
                  min={periodStart}
                  max={periodEnd}
                  required
                  value={mapping.deadline}
                  onChange={(event) =>
                    updateMapping({ deadline: event.currentTarget.value })
                  }
                />
              </Field>
            </div>
          </FieldSet>
        );
      })}

      <div className="grid gap-2">
        <FieldError>{error}</FieldError>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-pms-touch rounded-pms-control"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="min-h-pms-touch rounded-pms-control"
            disabled={rows.length === 0}
          >
            Save goal mappings
          </Button>
        </div>
      </div>
    </form>
  );
}
