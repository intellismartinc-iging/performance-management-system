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
import { BEHAVIORAL_QUESTION_TYPE_LABELS } from "@/constants/domain-labels";
import {
  BEHAVIORAL_QUESTION_TYPES,
  type BehavioralQuestionType,
} from "@pms/shared-types";

export interface Question {
  id: string;
  title: string;
  type: BehavioralQuestionType;
  choices: string;
  required: boolean;
}

export interface Section {
  id: string;
  name: string;
  questions: Question[];
}

export interface BehavioralTemplate {
  name: string;
  description: string;
  sections: Section[];
}

interface BehavioralTemplateEditorProps {
  initialTemplate?: BehavioralTemplate;
  onSave: (template: BehavioralTemplate, intent: "draft" | "publish") => void;
}

const QUESTION_TYPES = BEHAVIORAL_QUESTION_TYPES.map((value) => ({
  value,
  label: BEHAVIORAL_QUESTION_TYPE_LABELS[value],
}));

export function BehavioralTemplateEditor({
  initialTemplate,
  onSave,
}: BehavioralTemplateEditorProps) {
  const [template, setTemplate] = useState<BehavioralTemplate>(
    initialTemplate ?? {
      name: "",
      description: "",
      sections: [],
    },
  );
  const [error, setError] = useState("");

  function update(changes: Partial<BehavioralTemplate>) {
    setTemplate({ ...template, ...changes });
    setError("");
  }

  function updateSection(id: string, changes: Partial<Section>) {
    update({
      sections: template.sections.map((section) =>
        section.id === id ? { ...section, ...changes } : section,
      ),
    });
  }

  function getError(intent: "draft" | "publish") {
    if (!template.name.trim()) return "Enter a template name.";
    if (intent === "draft") return "";
    if (!template.sections.length)
      return "Add a section and at least one question.";
    for (const [index, section] of template.sections.entries()) {
      if (!section.name.trim()) return `Section ${index + 1}: enter a name.`;
      if (!section.questions.length)
        return `Add at least one question to ${section.name}.`;
      for (const question of section.questions) {
        if (!question.title.trim())
          return `Enter a title for every question in ${section.name}.`;
        if (question.type === "multiple_choice") {
          const choices = question.choices
            .trim()
            .split(/\r?\n/)
            .map((choice) => choice.trim().toLowerCase());
          if (
            choices.length < 2 ||
            choices.some((choice) => !choice) ||
            new Set(choices).size !== choices.length
          ) {
            return `${question.title}: enter at least two distinct options, one per line.`;
          }
        }
      }
    }
    return "";
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
      <h2 className="text-pms-section-title">Behavioral assessment template</h2>
      <Field>
        <FieldLabel className="w-full flex-col items-stretch text-pms-label">
          Template name
          <Input
            required
            value={template.name}
            className="min-h-pms-touch rounded-pms-control"
            onChange={(event) => update({ name: event.currentTarget.value })}
          />
        </FieldLabel>
      </Field>
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
      {template.sections.map((section, index) => (
        <FieldSet
          key={section.id}
          className="min-w-0 gap-4 rounded-pms-card border border-border bg-card p-4"
        >
          <FieldLegend className="text-pms-section-title">
            Section {index + 1}
          </FieldLegend>
          <Field>
            <FieldLabel className="w-full flex-col items-stretch text-pms-label">
              Section name
              <Input
                required
                value={section.name}
                className="min-h-pms-touch rounded-pms-control"
                onChange={(event) =>
                  updateSection(section.id, { name: event.currentTarget.value })
                }
              />
            </FieldLabel>
          </Field>
          {section.questions.map((question, questionIndex) => {
            function updateQuestion(changes: Partial<Question>) {
              updateSection(section.id, {
                questions: section.questions.map((item) =>
                  item.id === question.id ? { ...item, ...changes } : item,
                ),
              });
            }

            return (
              <FieldSet
                key={question.id}
                className="min-w-0 gap-4 rounded-pms-card border border-border p-4"
              >
                <FieldLegend>Question {questionIndex + 1}</FieldLegend>
                <Field>
                  <FieldLabel className="w-full flex-col items-stretch text-pms-label">
                    Question title
                    <Input
                      required
                      value={question.title}
                      className="min-h-pms-touch rounded-pms-control"
                      onChange={(event) =>
                        updateQuestion({ title: event.currentTarget.value })
                      }
                    />
                  </FieldLabel>
                </Field>
                <FormSelect
                  label="Response type"
                  value={question.type}
                  options={QUESTION_TYPES}
                  onChange={(type) => updateQuestion({ type })}
                />
                {question.type === "multiple_choice" && (
                  <Field>
                    <FieldLabel className="w-full flex-col items-stretch text-pms-label">
                      Options (one per line)
                      <Textarea
                        value={question.choices}
                        onChange={(event) =>
                          updateQuestion({ choices: event.currentTarget.value })
                        }
                      />
                    </FieldLabel>
                  </Field>
                )}
                <FormSelect
                  label="Answer requirement"
                  value={question.required ? "required" : "optional"}
                  options={[
                    { value: "required", label: "Required" },
                    { value: "optional", label: "Optional" },
                  ]}
                  onChange={(value) =>
                    updateQuestion({ required: value === "required" })
                  }
                />
                <Button
                  type="button"
                  variant="destructive"
                  className="min-h-pms-touch self-start"
                  aria-label={`Remove question ${questionIndex + 1} from section ${index + 1}`}
                  onClick={() =>
                    updateSection(section.id, {
                      questions: section.questions.filter(
                        (item) => item.id !== question.id,
                      ),
                    })
                  }
                >
                  Remove question
                </Button>
              </FieldSet>
            );
          })}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-pms-touch"
              onClick={() =>
                updateSection(section.id, {
                  questions: [
                    ...section.questions,
                    {
                      id: crypto.randomUUID(),
                      title: "",
                      type: "rating_scale",
                      choices: "",
                      required: true,
                    },
                  ],
                })
              }
            >
              Add question
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="min-h-pms-touch"
              aria-label={`Remove section ${index + 1}`}
              onClick={() =>
                update({
                  sections: template.sections.filter(
                    (item) => item.id !== section.id,
                  ),
                })
              }
            >
              Remove section
            </Button>
          </div>
        </FieldSet>
      ))}
      <Button
        type="button"
        variant="outline"
        className="min-h-pms-touch justify-self-start"
        onClick={() =>
          update({
            sections: [
              ...template.sections,
              { id: crypto.randomUUID(), name: "", questions: [] },
            ],
          })
        }
      >
        Add section
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
