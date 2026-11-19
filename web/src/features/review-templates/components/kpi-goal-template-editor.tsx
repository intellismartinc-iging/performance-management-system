"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "lucide-react";
import {
  KPI_DIRECTIONS,
  PERCENTAGE_TARGET_MAX,
  PERCENTAGE_UNIT,
  hasAtMostTwoDecimals,
  indicatorMatrixErrors,
  type KpiDirection,
} from "@pms/shared-types";

import {
  ErrorSummary,
  type ErrorSummaryItem,
} from "@/components/molecules/error-summary";
import { FormSection } from "@/components/molecules/form-section";
import { FormSelect } from "@/components/molecules/form-select";
import { FormPageTemplate } from "@/components/templates/form-page-template";
import { DefinitionGrid } from "@/components/molecules/definition-grid";
import { UnsavedChangesDialog } from "@/components/molecules/unsaved-changes-dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Textarea } from "@/components/ui/textarea";
import { KPI_DIRECTION_LABELS } from "@/constants/domain-labels";
import { IndicatorMatrixEditor } from "@/features/review-templates/components/indicator-matrix-editor";
import {
  noMatrix,
  toMatrixInput,
  type IndicatorMatrix,
} from "@/features/review-templates/services/indicator-matrix";
import { useUnsavedChangesWarning } from "@/hooks/use-unsaved-changes-warning";

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
  matrix: IndicatorMatrix;
}

export interface KpiGoalTemplate {
  name: string;
  position: string;
  description: string;
  indicators: Indicator[];
}

/** What a save asks for. "update" is a published template: it publishes the next version. */
export type SaveIntent = "draft" | "publish" | "update";

interface KpiGoalTemplateEditorProps {
  initialTemplate?: KpiGoalTemplate;
  /**
   * The state of the template being edited. A published template shows Update
   * Template, and its saved indicators keep their measurement unit and
   * achievement direction. Left out, the template is new.
   */
  status?: "draft" | "published";
  /** The details page: the same layout, read-only, with these header actions. */
  readOnly?: boolean;
  headerActions?: ReactNode;
  /** The state and version of a saved template, beside the back link. */
  statusLine?: ReactNode;
  positions: readonly { value: string; label: string }[];
  /** Where the back link goes: the list. */
  backHref: string;
  onSave: (template: KpiGoalTemplate, intent: SaveIntent) => void;
  /** An error from saving, shown in the summary at the top. */
  submitError?: string;
  /** Called when the user edits, so the caller can clear its save error. */
  onEdit?: () => void;
  isPending?: boolean;
}

/** The units of the legacy builder. The API stores the unit as text. */
const MEASUREMENT_UNITS = [
  "Percentage",
  "Count",
  "Days",
  "Hours",
  "Currency",
] as const;

const UNIT_OPTIONS = MEASUREMENT_UNITS.map((value) => ({
  value,
  label: value,
}));
const DIRECTION_OPTIONS = KPI_DIRECTIONS.map((value) => ({
  value,
  label: KPI_DIRECTION_LABELS[value],
}));

const NUMBER_FIELDS = [
  {
    field: "target",
    label: "Target Value",
    min: 0,
    max: undefined,
    rule: "0 or more",
  },
  {
    field: "weight",
    label: "Weight (%)",
    min: 0,
    max: 100,
    rule: "more than 0 and up to 100",
  },
  {
    field: "scoreMet",
    label: "Score When Target Is Met",
    suffix: " (1–5)",
    min: 1,
    max: 5,
    rule: "from 1 to 5, with up to two decimal places",
  },
  {
    field: "scoreBelow",
    label: "Score When Target Is Missed",
    suffix: " (1–5)",
    min: 1,
    max: 5,
    rule: "from 1 to 5, with up to two decimal places",
  },
] as const;

type NumberFieldSpec = (typeof NUMBER_FIELDS)[number];
const [TARGET, WEIGHT, SCORE_MET, SCORE_BELOW] = NUMBER_FIELDS;


/** The most a field accepts for this indicator: a percentage target stops at 100. */
function maxOf(field: NumberFieldSpec["field"], indicator: Indicator): number | undefined {
  if (field === "target" && indicator.unit === PERCENTAGE_UNIT) return PERCENTAGE_TARGET_MAX;
  return NUMBER_FIELDS.find((spec) => spec.field === field)?.max;
}

/** A typed number above the maximum becomes the maximum. */
function clampToMax(value: string, max: number | undefined): string {
  return max !== undefined && Number(value) > max ? String(max) : value;
}

const FORM_ID = "kpi-goal-template-form";
const POSITION_ID = "template-position";
const ADD_INDICATOR_ID = "add-indicator";
const CONTROL = "min-h-pms-touch rounded-pms-control";

/** The legacy defaults for a new indicator. */
function newIndicator(id: string): Indicator {
  return {
    id,
    name: "",
    description: "",
    unit: "Percentage",
    direction: "higher_is_better",
    target: "100",
    weight: "25",
    scoreMet: "5",
    scoreBelow: "2",
    matrix: noMatrix(),
  };
}

function scoringHint(indicator: Indicator) {
  // A scale that scores replaces the target-met and below-target scores, as in the legacy builder.
  if (indicator.matrix.kind === "scale" && indicator.matrix.scoring) {
    return "Numeric matrix thresholds determine this indicator’s score. The target remains an achievement reference.";
  }
  const isLower = indicator.direction === "lower_is_better";
  return `${isLower ? "At or below" : "At or above"} the target earns ${indicator.scoreMet}/5; otherwise ${indicator.scoreBelow}/5. ${
    isLower
      ? "Lower is better; no inverse division is used."
      : "Achievement = actual ÷ target × 100; a zero target uses Target Met."
  }`;
}

/**
 * The KPI Goal Template builder, as the legacy one: a back link, a header with
 * Preview, Save as Draft and Publish Template, a Basic Information panel, and
 * one panel per indicator. Preview shows the same form read-only.
 */
export function KpiGoalTemplateEditor({
  initialTemplate,
  status,
  readOnly = false,
  headerActions,
  statusLine,
  positions,
  backHref,
  onSave,
  submitError = "",
  onEdit,
  isPending = false,
}: KpiGoalTemplateEditorProps) {
  const router = useRouter();
  // The template the page opened with, kept so the page can start over from it.
  const [startingTemplate] = useState<KpiGoalTemplate>(
    () =>
      initialTemplate ?? {
        name: "",
        position: "",
        description: "",
        indicators: [newIndicator("indicator-1")],
      },
  );
  const [template, setTemplate] = useState<KpiGoalTemplate>(startingTemplate);
  const [validationIntent, setValidationIntent] = useState<SaveIntent | null>(
    null,
  );
  const [isPreviewing, setIsPreviewing] = useState(false);
  const isPreview = readOnly || isPreviewing;
  const setIsPreview = setIsPreviewing;
  const isPublished = status === "published";
  // The indicators a published template already has: their unit and direction are fixed.
  const [lockedIds] = useState(
    () =>
      new Set(
        isPublished
          ? (initialTemplate?.indicators ?? []).map((item) => item.id)
          : [],
      ),
  );
  const [isDirty, setIsDirty] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  // Ids are counted, not random, so the server and the browser render the same ones.
  const nextIndicator = useRef(template.indicators.length + 1);
  useUnsavedChangesWarning(isDirty);

  // Next keeps the state of a page you leave, and shows it again when you return.
  // Start again from the saved template (or a blank one) whenever the user leaves.
  const startOver = useCallback(() => {
    setTemplate(startingTemplate);
    nextIndicator.current = startingTemplate.indicators.length + 1;
    setValidationIntent(null);
    setIsPreviewing(false);
    setIsDirty(false);
    setIsLeaving(false);
  }, [startingTemplate]);
  useEffect(() => startOver, [startOver]);

  const totalWeight = template.indicators.reduce(
    (sum, item) => sum + Number(item.weight),
    0,
  );
  // Stable between renders, so the summary takes focus once per error, not per keystroke.
  const errors = useMemo<ErrorSummaryItem[]>(
    () => [
      ...(submitError ? [{ fieldId: FORM_ID, message: submitError }] : []),
    ],
    [submitError],
  );

  function update(changes: Partial<KpiGoalTemplate>) {
    setTemplate({ ...template, ...changes });
    setIsDirty(true);
    onEdit?.();
  }

  function updateIndicator(id: string, changes: Partial<Indicator>) {
    update({
      indicators: template.indicators.map((item) =>
        item.id === id ? { ...item, ...changes } : item,
      ),
    });
  }

  function fieldErrors(intent: SaveIntent) {
    const messages: Record<string, string> = {};
    // In page order, so the first message is the first control to focus.
    if (!template.name.trim()) {
      messages["template-name"] = "Enter a template name.";
    }
    if (!positions.some((position) => position.value === template.position)) {
      messages[POSITION_ID] = "Choose an applicable position.";
    }
    // The API checks every indicator on a draft too, so the form does as well.
    if (!template.indicators.length) {
      messages[ADD_INDICATOR_ID] = "Add at least one KPI indicator.";
    }
    for (const [index, indicator] of template.indicators.entries()) {
      const label = `Indicator ${index + 1}`;
      if (!indicator.name.trim()) {
        messages[`${indicator.id}-name`] = `${label}: enter a name.`;
      }
      // A saved indicator of a published template cannot change its unit, so it cannot fix a blank one.
      if (!indicator.unit.trim() && !lockedIds.has(indicator.id)) {
        messages[`${indicator.id}-unit`] = `${label}: enter a unit.`;
      }
      // The matrix rules are the API's, so a matrix the form accepts is one the API accepts.
      const [matrixProblem] = indicatorMatrixErrors(toMatrixInput(indicator));
      if (matrixProblem) {
        messages[`${indicator.id}-matrix-kind`] = `${label}: ${matrixProblem}`;
      }
      for (const {
        field,
        label: fieldLabel,
        min,
        rule,
      } of NUMBER_FIELDS) {
        const value = Number(indicator[field]);
        const limit = maxOf(field, indicator);
        if (
          !indicator[field].trim() ||
          !Number.isFinite(value) ||
          value < min ||
          (limit !== undefined && value > limit) ||
          (field === "weight" && value === 0) ||
          // A score is numeric(3,2): one to five, at most two decimals.
          ((field === "scoreMet" || field === "scoreBelow") &&
            !hasAtMostTwoDecimals(value))
        ) {
          messages[`${indicator.id}-${field}`] =
            field === "target" && limit !== undefined
              ? `${label}: ${fieldLabel} must be from 0 to ${limit} when the unit is ${PERCENTAGE_UNIT}.`
              : `${label}: ${fieldLabel} must be ${rule}.`;
        }
      }
    }
    if (
      template.indicators.length > 0 &&
      intent !== "draft" &&
      Math.abs(totalWeight - 100) > 0.01 &&
      !template.indicators.some((item) => messages[item.id + "-weight"])
    ) {
      const difference = Number(Math.abs(100 - totalWeight).toFixed(2));
      messages["total-weight"] =
        totalWeight < 100
          ? `Allocate the remaining ${difference}% before publishing.`
          : `Reduce the total by ${difference}% before publishing.`;
    }
    return messages;
  }

  const messages =
    validationIntent && !isPreview ? fieldErrors(validationIntent) : {};
  function invalidProps(id: string) {
    return {
      "aria-invalid": messages[id] ? true : undefined,
      "aria-describedby": messages[id] ? id + "-error" : undefined,
    } as const;
  }
  function inlineError(id: string) {
    return (
      messages[id] && <FieldError id={id + "-error"}>{messages[id]}</FieldError>
    );
  }

  function save(intent: SaveIntent) {
    setValidationIntent(intent);
    const [first] = Object.keys(fieldErrors(intent));
    if (first) {
      document.getElementById(first)?.focus();
      return;
    }
    onSave({ ...template, name: template.name.trim() }, intent);
  }

  function addIndicator() {
    const id = `indicator-${nextIndicator.current++}`;
    update({ indicators: [...template.indicators, newIndicator(id)] });
  }

  const addButton = (
    <Button
      id={ADD_INDICATOR_ID}
      {...invalidProps(ADD_INDICATOR_ID)}
      type="button"
      variant="outline"
      className="min-h-pms-touch justify-self-start"
      onClick={addIndicator}
    >
      Add indicator
    </Button>
  );

  return (
    <div className="mx-auto grid w-full min-w-0 max-w-pms-form gap-2 pt-4">
      <div className="mx-3 flex flex-wrap items-center justify-between gap-2">
        <Link
          href={backHref}
          className="inline-flex min-h-pms-touch w-fit items-center gap-1 rounded-pms-control text-pms-label text-muted-foreground hover:underline"
          onClick={(event) => {
            if (!isDirty) return;
            event.preventDefault();
            setIsLeaving(true);
          }}
        >
          <ChevronLeftIcon aria-hidden="true" className="size-4" />
          {status && !readOnly
            ? "Back to Template Details"
            : "Back to KPI Goal Templates"}
        </Link>
        {statusLine}
      </div>
      <FormPageTemplate
        title={
          readOnly
            ? "KPI Goal Template Details"
            : isPreview
              ? "KPI Goal Template Preview"
              : status
                ? "Edit KPI Goal Template"
                : "KPI Goal Template Builder"
        }
        description={
          readOnly
            ? "Configure measurable performance outcomes and explicit scoring criteria."
            : isPreview
              ? "Preview the quantitative assessment indicators."
              : "Choose the position this template applies to and define how performance is measured."
        }
        actions={
          readOnly ? (
            headerActions
          ) : isPreview ? (
            <Button
              type="button"
              variant="outline"
              className="min-h-pms-touch"
              onClick={() => setIsPreview(false)}
            >
              Back to Builder
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                className="min-h-pms-touch"
                onClick={() => setIsPreview(true)}
              >
                Preview
              </Button>
              {!isPublished && (
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-pms-touch"
                  disabled={isPending}
                  onClick={() => save("draft")}
                >
                  Save as Draft
                </Button>
              )}
              <Button
                type="button"
                className="min-h-pms-touch"
                disabled={isPending}
                onClick={() => save(isPublished ? "update" : "publish")}
              >
                {isPublished ? "Update Template" : "Publish Template"}
              </Button>
            </>
          )
        }
        summary={<ErrorSummary errors={errors} />}
      >
        <form
          id={FORM_ID}
          noValidate
          className="grid min-w-0 gap-pms-section"
          onSubmit={(event) => event.preventDefault()}
        >
          {isPreview ? (
            <section
              aria-labelledby="basic-information-heading"
              className="grid min-w-0 gap-3"
            >
              <h2
                id="basic-information-heading"
                className="text-pms-section-title"
              >
                Basic Information
              </h2>
              <DefinitionGrid
                columns={1}
                items={[
                  { label: "Template Name", value: template.name || null },
                  {
                    label: "Description",
                    value: template.description || null,
                  },
                  {
                    label: "Applicable Position / Role",
                    value: positions.find(
                      (item) => item.value === template.position,
                    )?.label,
                  },
                ]}
              />
            </section>
          ) : (
            <FormSection title="Basic Information">
              <Field>
                <FieldLabel htmlFor="template-name" className="text-pms-label">
                  Template Name <span aria-hidden="true">*</span>
                </FieldLabel>
                <Input
                  id="template-name"
                  {...invalidProps("template-name")}
                  required
                  maxLength={120}
                  value={template.name}
                  className={CONTROL}
                  onChange={(event) =>
                    update({ name: event.currentTarget.value })
                  }
                />
                {inlineError("template-name")}
              </Field>
              <Field>
                <FieldLabel
                  htmlFor="template-description"
                  className="text-pms-label"
                >
                  Description
                </FieldLabel>
                <Textarea
                  id="template-description"
                  maxLength={2000}
                  value={template.description}
                  onChange={(event) =>
                    update({ description: event.currentTarget.value })
                  }
                />
              </Field>
              <FormSelect
                id={POSITION_ID}
                error={messages[POSITION_ID]}
                label="Applicable Position / Role"
                required
                value={template.position || null}
                options={positions}
                onChange={(position) => update({ position })}
              />
            </FormSection>
          )}
          <section
            aria-labelledby="indicators-heading"
            className="grid min-w-0 gap-5 border-t border-border pt-5"
          >
            <div className="grid gap-1">
              <h2 id="indicators-heading" className="text-pms-section-title">
                Performance Indicators
              </h2>

              <p className="text-pms-body text-muted-foreground">
                Weights total 100%. Each indicator defines its direction and
                scoring criteria on a five-point scale.
              </p>
            </div>
            {template.indicators.map((indicator, index) => (
              <FieldSet
                key={indicator.id}
                aria-labelledby={`${indicator.id}-heading`}
                className="@container min-w-0 gap-5 rounded-pms-card border border-border bg-card p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3
                    id={`${indicator.id}-heading`}
                    className="text-pms-body font-semibold"
                  >
                    Indicator {index + 1}
                  </h3>
                  {!isPreview && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="min-h-pms-touch"
                      aria-label={`Remove indicator ${index + 1}`}
                      onClick={() =>
                        update({
                          indicators: template.indicators.filter(
                            (item) => item.id !== indicator.id,
                          ),
                        })
                      }
                    >
                      Remove
                    </Button>
                  )}
                </div>

                {isPreview ? (
                  <>
                    <DefinitionGrid
                      columns={1}
                      items={[
                        {
                          label: "Indicator Name",
                          value: indicator.name || null,
                        },
                        {
                          label: "Description",
                          value: (
                            <span className="whitespace-pre-wrap">
                              {indicator.description || "Not set"}
                            </span>
                          ),
                        },
                      ]}
                    />
                    <DefinitionGrid
                      columns={3}
                      items={[
                        {
                          label: "Measurement Unit",
                          value: indicator.unit || null,
                        },
                        {
                          label: TARGET.label,
                          value: indicator.target || null,
                        },
                        {
                          label: WEIGHT.label,
                          value: indicator.weight || null,
                        },
                      ]}
                    />
                  </>
                ) : (
                  <>
                    <div className="grid min-w-0 gap-4">
                      <Field>
                        <FieldLabel
                          htmlFor={`${indicator.id}-name`}
                          className="text-pms-label"
                        >
                          Indicator Name
                        </FieldLabel>
                        <Input
                          id={`${indicator.id}-name`}
                          {...invalidProps(`${indicator.id}-name`)}
                          required
                          maxLength={300}
                          value={indicator.name}
                          className={CONTROL}
                          onChange={(event) =>
                            updateIndicator(indicator.id, {
                              name: event.currentTarget.value,
                            })
                          }
                        />
                        {inlineError(`${indicator.id}-name`)}
                      </Field>
                      <Field>
                        <FieldLabel
                          htmlFor={`${indicator.id}-description`}
                          className="text-pms-label"
                        >
                          Description
                        </FieldLabel>
                        <Textarea
                          id={`${indicator.id}-description`}
                          maxLength={2000}
                          value={indicator.description}
                          className={CONTROL}
                          onChange={(event) =>
                            updateIndicator(indicator.id, {
                              description: event.currentTarget.value,
                            })
                          }
                        />
                      </Field>
                    </div>
                    <div className="grid min-w-0 gap-4 @lg:grid-cols-3">
                      <FormSelect
                        id={`${indicator.id}-unit`}
                        error={messages[indicator.id + "-unit"]}
                        label="Measurement Unit"
                        disabled={lockedIds.has(indicator.id)}
                        value={indicator.unit || null}
                        options={UNIT_OPTIONS}
                        onChange={(unit) =>
                          updateIndicator(indicator.id, {
                            unit,
                            target: clampToMax(indicator.target, maxOf("target", { ...indicator, unit })),
                          })
                        }
                      />
                      {[TARGET, WEIGHT].map((spec) =>
                        numberField(indicator, spec),
                      )}
                    </div>
                  </>
                )}
                <section
                  aria-labelledby={indicator.id + "-scoring"}
                  className="grid min-w-0 gap-3 border-t border-border pt-4"
                >
                  <h4
                    id={indicator.id + "-scoring"}
                    className="text-pms-label font-semibold"
                  >
                    Scoring rules
                  </h4>
                  {isPreview ? (
                    <DefinitionGrid
                      columns={3}
                      items={[
                        {
                          label: "Achievement Direction",
                          value: KPI_DIRECTION_LABELS[indicator.direction],
                        },
                        {
                          label: SCORE_MET.label,
                          value: indicator.scoreMet || null,
                        },
                        {
                          label: SCORE_BELOW.label,
                          value: indicator.scoreBelow || null,
                        },
                      ]}
                    />
                  ) : (
                    <div className="grid min-w-0 gap-4 @lg:grid-cols-3">
                      <FormSelect
                        id={`${indicator.id}-direction`}
                        label="Achievement Direction"
                        disabled={lockedIds.has(indicator.id)}
                        value={indicator.direction}
                        options={DIRECTION_OPTIONS}
                        onChange={(direction) =>
                          updateIndicator(indicator.id, { direction })
                        }
                      />
                      {[SCORE_MET, SCORE_BELOW].map((spec) =>
                        numberField(indicator, spec),
                      )}
                    </div>
                  )}
                  <FieldDescription>{scoringHint(indicator)}</FieldDescription>
                </section>
                <IndicatorMatrixEditor
                  indicator={indicator}
                  isPreview={isPreview}
                  error={messages[`${indicator.id}-matrix-kind`]}
                  onChange={(matrix) =>
                    updateIndicator(indicator.id, { matrix })
                  }
                />
              </FieldSet>
            ))}
            {template.indicators.length === 0 ? (
              <Empty className="border">
                <EmptyHeader>
                  <EmptyTitle>No indicators yet</EmptyTitle>
                  <EmptyDescription>
                    Each indicator defines a measurable outcome, its target, and
                    its share of the total weight.
                  </EmptyDescription>
                </EmptyHeader>
                {!isPreview && (
                  <EmptyContent>
                    {inlineError(ADD_INDICATOR_ID)}
                    {addButton}
                  </EmptyContent>
                )}
              </Empty>
            ) : null}
            <div className="flex flex-wrap items-start justify-between gap-3 border-t border-border pt-4">
              {!isPreview && template.indicators.length > 0 && addButton}
              <div className="grid gap-1">
                <p
                  id="total-weight"
                  tabIndex={-1}
                  aria-describedby={
                    messages["total-weight"] ? "total-weight-error" : undefined
                  }
                  className="text-pms-label tabular-nums"
                >
                  Total weight:{" "}
                  {Number.isFinite(totalWeight)
                    ? Number(totalWeight.toFixed(2))
                    : "—"}
                  % of 100%
                </p>
                {inlineError("total-weight")}
              </div>
            </div>
          </section>
        </form>
      </FormPageTemplate>
      <UnsavedChangesDialog
        open={isLeaving}
        onStay={() => setIsLeaving(false)}
        onLeave={() => {
          startOver();
          router.push(backHref);
        }}
      />
    </div>
  );

  function numberField(indicator: Indicator, spec: NumberFieldSpec) {
    const id = `${indicator.id}-${spec.field}`;
    return (
      <Field key={spec.field}>
        <FieldLabel htmlFor={id} className="text-pms-label">
          {spec.label}
          {"suffix" in spec ? spec.suffix : ""}
        </FieldLabel>
        <Input
          id={id}
          type="number"
          {...invalidProps(id)}
          min={spec.min}
          max={maxOf(spec.field, indicator)}
          step="any"
          required
          value={indicator[spec.field]}
          disabled={isPreview}
          className={CONTROL}
          onChange={(event) =>
            updateIndicator(indicator.id, {
              [spec.field]: clampToMax(
                event.currentTarget.value,
                maxOf(spec.field, indicator),
              ),
            })
          }
        />
        {inlineError(id)}
      </Field>
    );
  }

}
