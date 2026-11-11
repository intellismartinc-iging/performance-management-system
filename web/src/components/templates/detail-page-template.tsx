import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronLeftIcon } from "lucide-react";
import {
  PageHeader,
  PageHeaderSkeleton,
} from "@/components/molecules/page-header";
import { Skeleton } from "@/components/ui/skeleton";

/** Shared with `DetailPageSkeleton` so the two never drift apart. */
const PAGE_CLASS = "grid w-full min-w-0 gap-4 px-3 py-6";
const META_CLASS = "flex min-w-0 flex-wrap items-center gap-2";
const BODY_WITH_ASIDE_CLASS =
  "grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]";
const BODY_CLASS = "grid min-w-0 gap-4";
const PANEL_CLASS =
  "grid min-w-0 gap-4 rounded-pms-card border border-border bg-card p-4 text-card-foreground";

interface DetailPageTemplateProps {
  title: string;
  description?: string;
  backHref: string;
  backLabel: string;
  actions?: ReactNode;
  /** Status badge or key facts shown under the header. */
  meta?: ReactNode;
  /** Tab strip or section nav. */
  tabs?: ReactNode;
  children: ReactNode;
  /** Side panel, for example summary or history. Stacks below on small screens. */
  aside?: ReactNode;
}

export function DetailPageTemplate({
  title,
  description,
  backHref,
  backLabel,
  actions,
  meta,
  tabs,
  children,
  aside,
}: DetailPageTemplateProps) {
  return (
    <div className={PAGE_CLASS}>
      <Link
        href={backHref}
        className="inline-flex min-h-pms-touch w-fit items-center gap-1 rounded-pms-control text-pms-label text-muted-foreground hover:underline"
      >
        <ChevronLeftIcon aria-hidden="true" className="size-4" />
        {backLabel}
      </Link>
      <PageHeader title={title} description={description} actions={actions} />
      {meta && <div className={META_CLASS}>{meta}</div>}
      {tabs}
      <div className={aside ? BODY_WITH_ASIDE_CLASS : BODY_CLASS}>
        <div className={PANEL_CLASS}>{children}</div>
        {aside && <aside className={PANEL_CLASS}>{aside}</aside>}
      </div>
    </div>
  );
}

interface DetailPageSkeletonProps {
  actions?: number;
  meta?: boolean;
  tabs?: boolean;
  aside?: boolean;
}

/** Back link, header, meta badges, tabs, main panel, and optional side panel. */
export function DetailPageSkeleton({
  actions = 1,
  meta = true,
  tabs = false,
  aside = true,
}: DetailPageSkeletonProps) {
  return (
    <div role="status" aria-busy="true" className={PAGE_CLASS}>
      <span className="sr-only">Loading</span>
      <div className="flex min-h-pms-touch w-fit items-center">
        <Skeleton className="h-[1lh] w-32 text-pms-label" />
      </div>
      <PageHeaderSkeleton actions={actions} />
      {meta && (
        <div aria-hidden="true" className={META_CLASS}>
          <Skeleton className="h-6 w-20 rounded-pms-tag" />
          <Skeleton className="h-6 w-28 rounded-pms-tag" />
        </div>
      )}
      {tabs && (
        <div aria-hidden="true" className="flex gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-pms-touch w-24 rounded-pms-control"
            />
          ))}
        </div>
      )}
      <div aria-hidden="true" className={aside ? BODY_WITH_ASIDE_CLASS : BODY_CLASS}>
        <div className={PANEL_CLASS}>
          <Skeleton className="h-[1lh] w-48 text-pms-section-title" />
          <PanelFields />
          <Skeleton className="h-32 w-full" />
        </div>
        {aside && (
          <div className={PANEL_CLASS}>
            <Skeleton className="h-[1lh] w-32 text-pms-section-title" />
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="mt-1.5 size-3 shrink-0 rounded-full" />
                <div className="grid flex-1 gap-1">
                  <Skeleton className="h-[1lh] w-3/4 text-pms-body" />
                  <Skeleton className="h-[1lh] w-1/2 text-pms-label" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Label and value pairs in the same grid as `DefinitionGrid`. */
function PanelFields() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="grid gap-1">
          <Skeleton className="h-[1lh] w-24 text-pms-label" />
          <Skeleton className="h-[1lh] w-40 max-w-full text-pms-table" />
        </div>
      ))}
    </div>
  );
}
