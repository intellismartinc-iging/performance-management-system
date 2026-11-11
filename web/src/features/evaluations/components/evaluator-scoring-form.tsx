"use client";

import { useState } from "react";

import { ConfirmationDialog } from "@/components/molecules/confirmation-dialog";
import { FormSelect } from "@/components/molecules/form-select";
import { DataTable } from "@/components/organisms/data-table";
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
import type { ReviewSection } from "@/types/review-question";

interface EvaluatorScoringFormProps {
  employeeName: string;
  stageName: string;
  sections: readonly ReviewSection[];
  verifiedGoals?: readonly {
    id: string;
    name: string;
    target: number;
    actual: number;
    score: number;
  }[];
  initialAnswers?: Readonly<Record<string, string>>;
  initialFeedback?: string;
  isEditable: boolean;
  onSave: (
    response: { answers: Record<string, string>; feedback: string },
    intent: "draft" | "submit",
  ) => void;
}

const RATINGS = [1, 2, 3, 4, 5].map((value) => ({
  value: String(value),
  label: String(value),
}));

export function EvaluatorScoringForm({
  employeeName,
  stageName,
  sections,
  verifiedGoals = [],
  initialAnswers,
  initialFeedback = "",
  isEditable,
  onSave,
}: EvaluatorScoringFormProps) {
  const [answers, setAnswers] = useState(() => ({ ...initialAnswers }));
  const [feedback, setFeedback] = useState(initialFeedback);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState("");

  function update(id: string, value: string) {
    setAnswers({ ...answers, [id]: value });
    setError("");
  }

  function validate() {
    for (const { questions } of sections) {
      for (const question of questions) {
        const answer = answers[question.id]?.trim() ?? "";
        if (question.required && !answer) return `Answer “${question.title}”.`;
        const options =
          question.type === "rating_scale"
            ? (question.options ?? RATINGS)
            : question.options;
        if (
          answer &&
          (question.type === "rating_scale" || question.type === "multiple_choice") &&
          !options?.some((option) => option.value === answer)
        )
          return `Choose a valid response for “${question.title}”.`;
      }
    }
    return "";
  }

  function save(intent: "draft" | "submit") {
    onSave({ answers, feedback: feedback.trim() }, intent);
  }

  return (
    <form
      noValidate
      className="grid min-w-0 gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!isEditable) return;
        const issue = validate();
        setError(issue);
        if (!issue) setConfirm(true);
      }}
    >
      <div>
        <h2 className="text-pms-section-title">{stageName}</h2>
        <p className="text-pms-body text-muted-foreground">{employeeName}</p>
      </div>
      {verifiedGoals.length > 0 && (
        <DataTable
          caption="Verified goals performance"
          rows={verifiedGoals}
          getRowId={({ id }) => id}
          emptyMessage="No verified goal results."
          columns={[
            { id: "goal", heading: "Goal", renderCell: ({ name }) => name },
            {
              id: "target",
              heading: "Target",
              align: "end",
              renderCell: ({ target }) => target,
            },
            {
              id: "actual",
              heading: "Verified actual",
              align: "end",
              renderCell: ({ actual }) => actual,
            },
            {
              id: "score",
              heading: "Score",
              align: "end",
              renderCell: ({ score }) => score,
            },
          ]}
        />
      )}
      {sections.map((section) => (
        <FieldSet
          key={section.id}
          className="min-w-0 gap-4 rounded-pms-card border border-border bg-card p-4"
        >
          <FieldLegend className="text-pms-section-title">
            {section.name}
          </FieldLegend>
          {section.questions.map((question) => {
            const label = question.required
              ? question.title
              : `${question.title} (optional)`;
            const answer = answers[question.id] ?? "";
            const options =
              question.type === "rating_scale"
                ? (question.options ?? RATINGS)
                : question.options;
            if (!isEditable)
              return (
                <div key={question.id}>
                  <p className="text-pms-label">{question.title}</p>
                  <p className="text-pms-body">
                    {options?.find(({ value }) => value === answer)?.label ??
                      (answer || "No response")}
                  </p>
                </div>
              );
            if (question.type === "rating_scale" || question.type === "multiple_choice")
              return (
                <FormSelect
                  key={question.id}
                  label={label}
                  value={answer || null}
                  options={options ?? []}
                  onChange={(value) => update(question.id, value)}
                />
              );
            const Control = question.type === "short_answer" ? Input : Textarea;
            return (
              <Field key={question.id}>
                <FieldLabel className="w-full flex-col items-stretch text-pms-label">
                  {label}
                  <Control
                    value={answer}
                    required={question.required}
                    className="min-h-pms-touch rounded-pms-control"
                    onChange={(event) =>
                      update(question.id, event.currentTarget.value)
                    }
                  />
                </FieldLabel>
              </Field>
            );
          })}
        </FieldSet>
      ))}
      <Field>
        <FieldLabel className="w-full flex-col items-stretch text-pms-label">
          Evaluator feedback (optional)
          <Textarea
            value={feedback}
            readOnly={!isEditable}
            onChange={(event) => setFeedback(event.currentTarget.value)}
          />
        </FieldLabel>
      </Field>
      <FieldError>{error}</FieldError>
      {isEditable && (
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
            Submit assessment
          </Button>
        </div>
      )}
      <ConfirmationDialog
        open={confirm}
        title="Submit this assessment?"
        description="Your response becomes read-only after submission."
        confirmLabel="Confirm submission"
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          if (isEditable && !validate()) save("submit");
        }}
      />
    </form>
  );
}
