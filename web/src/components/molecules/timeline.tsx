import type { ReactNode } from "react";
import { StatusBadge } from "@/components/atoms/status-badge";
import {
  REVIEW_TONE_ACCENT_CLASS,
  type ReviewTone,
} from "@/constants/review-tones";

const STATE_STYLES = {
  complete: { tone: "complete", label: "Completed" },
  current: { tone: "active", label: "In progress" },
  upcoming: { tone: "neutral", label: "Upcoming" },
  alert: { tone: "alert", label: "Needs attention" },
} as const satisfies Record<string, { tone: ReviewTone; label: string }>;

export type TimelineState = keyof typeof STATE_STYLES;

export interface TimelineItem {
  id: string;
  title: string;
  state: TimelineState;
  /** Preformatted date or date range. */
  date?: string;
  description?: ReactNode;
}

interface TimelineProps {
  label: string;
  items: readonly TimelineItem[];
}

export function Timeline({ label, items }: TimelineProps) {
  return (
    <ol aria-label={label} className="grid min-w-0 gap-4">
      {items.map((item, index) => {
        const style = STATE_STYLES[item.state];
        const last = index === items.length - 1;
        return (
          <li
            key={item.id}
            aria-current={item.state === "current" ? "step" : undefined}
            className="relative grid min-w-0 grid-cols-[1rem_minmax(0,1fr)] gap-3"
          >
            <span className="relative flex justify-center">
              <span
                aria-hidden="true"
                className={`mt-1.5 size-3 rounded-full ${REVIEW_TONE_ACCENT_CLASS[style.tone]}`}
              />
              {!last && (
                <span
                  aria-hidden="true"
                  className="absolute top-5 -bottom-4 w-px bg-border"
                />
              )}
            </span>
            <div className="grid min-w-0 gap-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <p className="text-pms-body font-medium wrap-break-word">
                  {item.title}
                </p>
                <StatusBadge label={style.label} tone={style.tone} />
              </div>
              {item.date && (
                <p className="text-pms-label tabular-nums text-muted-foreground">
                  {item.date}
                </p>
              )}
              {item.description && (
                <div className="text-pms-table text-muted-foreground">
                  {item.description}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
