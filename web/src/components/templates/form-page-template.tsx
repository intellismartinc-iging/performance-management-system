import type { ReactNode } from "react";
import {
  PageHeader,
  PageHeaderSkeleton,
} from "@/components/molecules/page-header";
import { Skeleton } from "@/components/ui/skeleton";

/** Shared with `FormPageSkeleton` so the two never drift apart. */
const PAGE_CLASS = "grid w-full min-w-0 gap-4 px-3 pt-6";
const ACTIONS_CLASS =
  "sticky bottom-0 z-10 -mx-3 flex min-w-0 flex-wrap items-center justify-end gap-2 border-t border-border bg-background px-3 py-3";

interface FormPageTemplateProps {
  title: string;
  description?: string;
  /** Usually an `ErrorSummary`. */
  summary?: ReactNode;
  /** One or more `FormSection`s. */
  children: ReactNode;
  /** Cancel, save draft, and submit buttons. Pinned to the bottom while scrolling. */
  actions: ReactNode;
}

export function FormPageTemplate({
  title,
  description,
  summary,
  children,
  actions,
}: FormPageTemplateProps) {
  return (
    <div className={PAGE_CLASS}>
      <PageHeader title={title} description={description} />
      {summary}
      <div className="grid min-w-0 gap-4">{children}</div>
      <div data-slot="form-actions" className={ACTIONS_CLASS}>
        {actions}
      </div>
    </div>
  );
}

interface FormPageSkeletonProps {
  /** Number of form sections. */
  sections?: number;
  /** Fields per section. */
  fields?: number;
}

/** Header, sectioned field cards, and the pinned action bar. */
export function FormPageSkeleton({
  sections = 2,
  fields = 3,
}: FormPageSkeletonProps) {
  return (
    <div role="status" aria-busy="true" className={PAGE_CLASS}>
      <span className="sr-only">Loading</span>
      <PageHeaderSkeleton />
      <div aria-hidden="true" className="grid min-w-0 gap-4">
        {Array.from({ length: sections }, (_, sectionIndex) => (
          <div
            key={sectionIndex}
            className="grid min-w-0 gap-4 rounded-pms-card border border-border bg-card p-4"
          >
            <Skeleton className="h-[1lh] w-48 text-pms-section-title" />
            <div className="flex w-full flex-col gap-5">
              {Array.from({ length: fields }, (_, fieldIndex) => (
                <div key={fieldIndex} className="grid gap-2">
                  <Skeleton className="h-[1lh] w-28 text-pms-label" />
                  <Skeleton className="h-pms-touch w-full rounded-pms-control" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div aria-hidden="true" className={ACTIONS_CLASS}>
        <Skeleton className="h-pms-touch w-24 rounded-pms-control" />
        <Skeleton className="h-pms-touch w-32 rounded-pms-control" />
      </div>
    </div>
  );
}
