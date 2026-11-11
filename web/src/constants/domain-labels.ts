import type {
  BehavioralQuestionType,
  CycleStatus,
  EvaluationStatus,
  EvaluatorType,
  GoalStatus,
  KpiDirection,
  NteStatus,
  PipStatus,
  TemplateVersionStatus,
} from "@pms/shared-types";

import type { ReviewTone } from "@/constants/review-tones";

/**
 * Display text and badge tones for the codes in @pms/shared-types. The codes go
 * over the wire and into the database. These maps are the only place a code
 * becomes words. Each map must list every code: `satisfies Record<...>` makes the
 * build fail when a code is added to the package and not here.
 */

export const CYCLE_STATUS_LABELS = {
  draft: "Draft",
  scheduled: "Scheduled",
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
} as const satisfies Record<CycleStatus, string>;

export const CYCLE_STATUS_TONES = {
  draft: "neutral",
  scheduled: "queued",
  active: "active",
  completed: "complete",
  cancelled: "alert",
} as const satisfies Record<CycleStatus, ReviewTone>;

export const EVALUATION_STATUS_LABELS = {
  locked: "Locked",
  not_started: "Not Started",
  in_progress: "In Progress",
  submitted: "Submitted",
  completed: "Completed",
} as const satisfies Record<EvaluationStatus, string>;

export const EVALUATION_STATUS_TONES = {
  locked: "neutral",
  not_started: "neutral",
  in_progress: "active",
  submitted: "queued",
  completed: "complete",
} as const satisfies Record<EvaluationStatus, ReviewTone>;

export const TEMPLATE_VERSION_STATUS_LABELS = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
} as const satisfies Record<TemplateVersionStatus, string>;

export const TEMPLATE_VERSION_STATUS_TONES = {
  draft: "neutral",
  published: "complete",
  archived: "neutral",
} as const satisfies Record<TemplateVersionStatus, ReviewTone>;

export const NTE_STATUS_LABELS = {
  draft: "Draft",
  issued: "Issued",
  responded: "Responded",
  closed: "Closed",
  cancelled: "Cancelled",
} as const satisfies Record<NteStatus, string>;

export const NTE_STATUS_TONES = {
  draft: "neutral",
  issued: "active",
  responded: "queued",
  closed: "complete",
  cancelled: "alert",
} as const satisfies Record<NteStatus, ReviewTone>;

export const PIP_STATUS_LABELS = {
  awaiting_planning: "Awaiting Planning",
  draft: "Draft",
  active: "Active",
  completed: "Completed",
  not_met: "Not Met",
  cancelled: "Cancelled",
} as const satisfies Record<PipStatus, string>;

export const PIP_STATUS_TONES = {
  awaiting_planning: "queued",
  draft: "neutral",
  active: "active",
  completed: "complete",
  not_met: "alert",
  cancelled: "alert",
} as const satisfies Record<PipStatus, ReviewTone>;

export const GOAL_STATUS_LABELS = {
  active: "Active",
  pending_approval: "Pending Approval",
  completed: "Completed",
} as const satisfies Record<GoalStatus, string>;

export const GOAL_STATUS_TONES = {
  active: "active",
  pending_approval: "queued",
  completed: "complete",
} as const satisfies Record<GoalStatus, ReviewTone>;

export const KPI_DIRECTION_LABELS = {
  higher_is_better: "Higher is better",
  lower_is_better: "Lower is better",
} as const satisfies Record<KpiDirection, string>;

export const BEHAVIORAL_QUESTION_TYPE_LABELS = {
  rating_scale: "Rating (1 to 5)",
  multiple_choice: "Multiple choice",
  short_answer: "Short answer",
  paragraph: "Long answer",
} as const satisfies Record<BehavioralQuestionType, string>;

export const EVALUATOR_TYPE_LABELS = {
  self: "Self",
  manager: "Manager",
  hr: "HR",
  peer: "Peer",
  upward: "Upward",
} as const satisfies Record<EvaluatorType, string>;
