"use client";

import { useId } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";

const REVIEW_TYPES = {
  "Standard Performance Review":
    "Evaluate performance over a regular review period.",
  "360° Feedback": "Gather feedback from multiple evaluator perspectives.",
  "Probationary Review": "Assess performance during the probation period.",
  "Project-Based Review": "Evaluate contributions to a specific project.",
};

type ReviewType = keyof typeof REVIEW_TYPES;

interface CycleDetails {
  name: string;
  reviewType: ReviewType;
  description: string;
  periodStart: string;
  periodEnd: string;
  assessmentStart: string;
}

interface CycleDetailsFormProps {
  initialValues?: CycleDetails;
  onContinue: (details: CycleDetails) => void;
}

export function CycleDetailsForm({
  initialValues,
  onContinue,
}: CycleDetailsFormProps) {
  const id = useId();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CycleDetails>({
    mode: "onSubmit",
    defaultValues: initialValues ?? {
      name: "",
      reviewType: "Standard Performance Review",
      description: "",
      periodStart: "",
      periodEnd: "",
      assessmentStart: "",
    },
  });

  function renderDateField(
    name: "periodStart" | "periodEnd" | "assessmentStart",
    label: string,
  ) {
    const inputId = `${id}-${name}`;
    const error = errors[name];

    return (
      <Field data-invalid={Boolean(error)}>
        <FieldLabel htmlFor={inputId} className="text-pms-label">
          {label}
        </FieldLabel>
        <Input
          id={inputId}
          type="date"
          required
          className="min-h-pms-touch rounded-pms-control"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...register(name, {
            required: `Enter the ${label.toLowerCase()}.`,
            validate: (value, values) =>
              name !== "periodEnd" ||
              !values.periodStart ||
              value >= values.periodStart ||
              "Evaluation period end must be on or after its start.",
            deps: name === "periodStart" ? "periodEnd" : undefined,
          })}
        />
        <FieldError id={`${inputId}-error`} errors={[error]} />
      </Field>
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit((details) =>
        onContinue({
          ...details,
          name: details.name.trim(),
          description: details.description.trim(),
        }),
      )}
      className="grid min-w-0 gap-pms-section"
    >
      <FieldSet className="min-w-0 gap-4">
        <FieldLegend className="text-pms-section-title">
          Basic information
        </FieldLegend>
        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor={`${id}-name`} className="text-pms-label">
              Cycle name
            </FieldLabel>
            <Input
              id={`${id}-name`}
              required
              maxLength={120}
              className="min-h-pms-touch rounded-pms-control"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? `${id}-name-error` : undefined}
              {...register("name", {
                validate: (value) =>
                  Boolean(value.trim()) || "Enter a cycle name.",
                maxLength: {
                  value: 120,
                  message: "Use 120 characters or fewer.",
                },
              })}
            />
            <FieldError id={`${id}-name-error`} errors={[errors.name]} />
          </Field>
          <Controller
            name="reviewType"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={`${id}-type`} className="text-pms-label">
                  Review type
                </FieldLabel>
                <Select<ReviewType>
                  value={field.value}
                  onValueChange={(value) => {
                    if (value !== null) field.onChange(value);
                  }}
                  required
                >
                  <SelectTrigger
                    id={`${id}-type`}
                    ref={field.ref}
                    onBlur={field.onBlur}
                    aria-describedby={`${id}-type-description`}
                    className="min-h-pms-touch w-full min-w-0 rounded-pms-control"
                  >
                    <SelectValue className="min-w-0">{field.value}</SelectValue>
                  </SelectTrigger>
                  <SelectContent alignItemWithTrigger={false}>
                    {(Object.keys(REVIEW_TYPES) as ReviewType[]).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldDescription id={`${id}-type-description`}>
                  {REVIEW_TYPES[field.value]}
                </FieldDescription>
              </Field>
            )}
          />
          <Field
            className="md:col-span-2"
            data-invalid={Boolean(errors.description)}
          >
            <FieldLabel
              htmlFor={`${id}-description`}
              className="text-pms-label"
            >
              Description (optional)
            </FieldLabel>
            <Textarea
              id={`${id}-description`}
              rows={3}
              maxLength={2000}
              className="rounded-pms-control"
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? `${id}-description-error` : undefined
              }
              {...register("description", {
                maxLength: {
                  value: 2000,
                  message: "Use 2,000 characters or fewer.",
                },
              })}
            />
            <FieldError
              id={`${id}-description-error`}
              errors={[errors.description]}
            />
          </Field>
        </div>
      </FieldSet>

      <FieldSet className="min-w-0 gap-4">
        <FieldLegend className="text-pms-section-title">
          Evaluation period
        </FieldLegend>
        <FieldDescription>
          The period of employee performance being evaluated.
        </FieldDescription>
        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          {renderDateField("periodStart", "Evaluation period start")}
          {renderDateField("periodEnd", "Evaluation period end")}
        </div>
      </FieldSet>

      <FieldSet className="min-w-0 gap-4">
        <FieldLegend className="text-pms-section-title">
          Assessment schedule
        </FieldLegend>
        <FieldDescription>
          The first stage opens on this date. The last stage sets the final
          deadline.
        </FieldDescription>
        <div className="grid min-w-0 gap-4 md:grid-cols-2">
          {renderDateField("assessmentStart", "Assessment start date")}
        </div>
      </FieldSet>

      <Button
        type="submit"
        className="min-h-pms-touch rounded-pms-control justify-self-start"
      >
        Continue
      </Button>
    </form>
  );
}
