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
import { EVALUATOR_TYPE_LABELS } from "@/constants/domain-labels";
import type { EvaluatorType } from "@pms/shared-types";

import { ReleaseSettings } from "@/features/review-cycles/components/release-settings";
import type { ReleasePolicy } from "@/features/review-cycles/components/release-settings";
import type { Employee } from "@/types/employee";

interface Stage {
  id: string;
  type: EvaluatorType;
  deadline: string;
  evaluatorIds: Readonly<Record<string, string>>;
}

type Participant = Pick<Employee, "id" | "name" | "managerId">;

interface EvaluationWorkflowProps {
  assessmentStart: string;
  participants: readonly Participant[];
  evaluators: readonly { id: string; name: string; isHr: boolean }[];
  initialStages: readonly Stage[];
  initialReleasePolicy: ReleasePolicy;
  requiresManager: boolean;
  authoritativeStage?: Extract<EvaluatorType, "self" | "manager" | "hr">;
  onBack: () => void;
  onContinue: (stages: Stage[], releasePolicy: ReleasePolicy) => void;
}

function isOptional(stage: Stage | undefined) {
  return stage?.type === "peer" || stage?.type === "upward";
}

function getEvaluatorId(stage: Stage, person: Participant) {
  if (stage.type === "self") return person.id;
  if (stage.type === "manager") return person.managerId;
  return stage.evaluatorIds[person.id];
}

export function EvaluationWorkflow({
  assessmentStart,
  participants,
  evaluators,
  initialStages,
  initialReleasePolicy,
  requiresManager,
  authoritativeStage,
  onBack,
  onContinue,
}: EvaluationWorkflowProps) {
  const [stages, setStages] = useState(() => [...initialStages]);
  const [releasePolicy, setReleasePolicy] = useState(initialReleasePolicy);
  const [error, setError] = useState("");

  function update(nextStages: Stage[]) {
    setStages(nextStages);
    setError("");
  }

  function updateStage(id: string, changes: Partial<Stage>) {
    update(
      stages.map((stage) =>
        stage.id === id ? { ...stage, ...changes } : stage,
      ),
    );
  }

  function move(index: number, delta: number) {
    const stage = stages[index];
    const adjacent = stages[index + delta];
    if (!stage || !adjacent || !isOptional(stage) || !isOptional(adjacent))
      return;
    const reordered = [...stages];
    reordered[index] = adjacent;
    reordered[index + delta] = stage;
    update(reordered);
  }

  function getError() {
    if (!stages.length) return "Add at least one assessment stage.";
    if (requiresManager && !stages.some((stage) => stage.type === "manager")) {
      return "Goals Performance requires a Manager stage.";
    }
    if (
      authoritativeStage &&
      !stages.some((stage) => stage.type === authoritativeStage)
    ) {
      return `Add the ${EVALUATOR_TYPE_LABELS[authoritativeStage]} stage required by the behavioral scoring policy.`;
    }
    for (const [index, stage] of stages.entries()) {
      const previous = stages[index - 1];
      if (
        !stage.deadline ||
        stage.deadline < assessmentStart ||
        (previous && stage.deadline <= previous.deadline)
      ) {
        return `Stage ${index + 1}: set a deadline on or after assessment start and after the preceding stage.`;
      }
      const unassigned = participants.find((person) => {
        if (stage.type === "self") return false;
        return !evaluators.some(
          (evaluator) =>
            evaluator.id === getEvaluatorId(stage, person) &&
            evaluator.id !== person.id &&
            (stage.type !== "hr" || evaluator.isHr),
        );
      });
      if (unassigned)
        return `Stage ${index + 1}: assign an eligible evaluator for ${unassigned.name}.`;
    }
    return "";
  }

  return (
    <form
      className="grid min-w-0 gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const issue = getError();
        setError(issue);
        if (!issue) onContinue(stages, releasePolicy);
      }}
    >
      <h2 className="text-pms-section-title">
        Assessment stages and deadlines
      </h2>
      <p className="text-pms-body text-muted-foreground">
        Each stage opens after the preceding assessment is submitted.
      </p>
      {stages.map((stage, index) => (
        <FieldSet
          key={stage.id}
          className="min-w-0 gap-4 rounded-pms-card border border-border bg-card p-4"
        >
          <FieldLegend className="text-pms-section-title">
            Stage {index + 1} · {EVALUATOR_TYPE_LABELS[stage.type]}
          </FieldLegend>
          <Field>
            <FieldLabel className="w-full flex-col items-stretch text-pms-label">
              {EVALUATOR_TYPE_LABELS[stage.type]} deadline
              <Input
                type="date"
                required
                min={assessmentStart}
                value={stage.deadline}
                className="min-h-pms-touch rounded-pms-control"
                onChange={(event) =>
                  updateStage(stage.id, { deadline: event.currentTarget.value })
                }
              />
            </FieldLabel>
          </Field>
          <details className="min-w-0">
            <summary className="cursor-pointer py-2 text-pms-label">
              Evaluator assignments ({participants.length})
            </summary>
            <ul className="grid gap-2 pt-2">
              {participants.map((person) => {
                const assigned = getEvaluatorId(stage, person);
                const options = evaluators
                  .filter(
                    (evaluator) =>
                      evaluator.id !== person.id &&
                      (stage.type !== "hr" || evaluator.isHr),
                  )
                  .map((evaluator) => ({
                    value: evaluator.id,
                    label: evaluator.name,
                  }));
                return (
                  <li key={person.id}>
                    {stage.type === "self" || stage.type === "manager" ? (
                      <p className="text-pms-label">
                        {person.name}:{" "}
                        {stage.type === "self"
                          ? person.name
                          : (options.find((option) => option.value === assigned)
                              ?.label ?? "Manager unavailable")}
                      </p>
                    ) : (
                      <FormSelect
                        label={`Evaluator for ${person.name}`}
                        value={assigned ?? null}
                        options={options}
                        onChange={(value) =>
                          updateStage(stage.id, {
                            evaluatorIds: {
                              ...stage.evaluatorIds,
                              [person.id]: value,
                            },
                          })
                        }
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </details>
          {isOptional(stage) && (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="min-h-pms-touch"
                disabled={!isOptional(stages[index - 1])}
                onClick={() => move(index, -1)}
              >
                Move up
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-pms-touch"
                disabled={!isOptional(stages[index + 1])}
                onClick={() => move(index, 1)}
              >
                Move down
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="min-h-pms-touch"
                onClick={() =>
                  update(stages.filter((item) => item.id !== stage.id))
                }
              >
                Remove stage
              </Button>
            </div>
          )}
        </FieldSet>
      ))}
      <div className="flex flex-wrap gap-2">
        {(["peer", "upward"] as const).map((type) => (
          <Button
            key={type}
            type="button"
            variant="outline"
            className="min-h-pms-touch"
            onClick={() =>
              update([
                ...stages,
                {
                  id: crypto.randomUUID(),
                  type,
                  deadline: "",
                  evaluatorIds: {},
                },
              ])
            }
          >
            Add {EVALUATOR_TYPE_LABELS[type].toLowerCase()} stage
          </Button>
        ))}
      </div>
      <ReleaseSettings
        policy={releasePolicy}
        hasPeerStage={stages.some((stage) => stage.type === "peer")}
        hasUpwardStage={stages.some((stage) => stage.type === "upward")}
        onChange={setReleasePolicy}
      />
      <FieldError>{error}</FieldError>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-pms-touch"
          onClick={onBack}
        >
          Back
        </Button>
        <Button type="submit" className="min-h-pms-touch">
          Continue
        </Button>
      </div>
    </form>
  );
}
