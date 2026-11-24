import Link from "next/link";
import type { BehavioralTemplateListResponseDto } from "@pms/shared-types";
import { StatusBadge } from "@/components/atoms/status-badge";
import { DataTable } from "@/components/organisms/data-table";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { BEHAVIORAL_TEMPLATE_PATH } from "@/constants/behavioral-template-path";
import {
  BEHAVIORAL_REVIEW_TYPE_LABELS,
  BEHAVIORAL_TEMPLATE_CATEGORY_LABELS,
  TEMPLATE_VERSION_STATUS_LABELS,
  TEMPLATE_VERSION_STATUS_TONES,
} from "@/constants/domain-labels";
import { formatTemplateDate } from "@/features/review-templates/services/goal-template-format";

type BehavioralTemplateRow = BehavioralTemplateListResponseDto[number];

const TABLE_LAYOUT =
  "@container min-w-0 [&_table]:min-w-xl [&_table]:table-fixed " +
  "[&_thead]:bg-muted [&_thead_tr:hover]:bg-transparent " +
  "[&_th]:px-4 [&_th]:text-pms-label [&_th]:text-muted-foreground " +
  "[&_td]:px-4 [&_td]:py-3 [&_td]:whitespace-normal";

/**
 * A template made before the name column existed has no name: a short id names
 * it, and its missing category and review type read as not set.
 */
export function BehavioralTemplateList({
  templates,
  isLoading = false,
}: {
  templates: BehavioralTemplateListResponseDto;
  isLoading?: boolean;
}) {
  if (!isLoading && templates.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>No behavioral assessment templates yet</EmptyTitle>
          <EmptyDescription>
            A template is a form of sections and questions that evaluators answer.
            Create one to start.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className={TABLE_LAYOUT}>
      <DataTable<BehavioralTemplateRow>
        caption="Behavioral assessment templates"
        rows={templates}
        isLoading={isLoading}
        getRowId={(row) => row.templateId}
        emptyMessage="No behavioral assessment templates yet"
        columns={[
          {
            id: "template",
            heading: "Template",
            renderCell: (row) => (
              <Link
                href={`${BEHAVIORAL_TEMPLATE_PATH}/${row.templateId}`}
                className="group/link inline-grid min-h-pms-touch content-center gap-0.5 rounded-pms-control"
              >
                <span className="font-semibold text-primary group-hover/link:underline group-focus-visible/link:underline">
                  {row.name ?? `Template ${row.templateId.slice(0, 8)}`}
                </span>
                <span className="text-pms-label text-muted-foreground">
                  Version {row.currentVersion}
                </span>
              </Link>
            ),
          },
          {
            id: "category",
            heading: "Category",
            renderCell: (row) =>
              row.category ? BEHAVIORAL_TEMPLATE_CATEGORY_LABELS[row.category] : "Not set",
          },
          {
            id: "review-type",
            heading: "Review type",
            renderCell: (row) =>
              row.reviewType ? BEHAVIORAL_REVIEW_TYPE_LABELS[row.reviewType] : "Not set",
          },
          {
            id: "status",
            heading: "Status",
            renderCell: (row) => (
              <StatusBadge
                label={TEMPLATE_VERSION_STATUS_LABELS[row.status]}
                tone={TEMPLATE_VERSION_STATUS_TONES[row.status]}
              />
            ),
          },
          {
            id: "updated",
            heading: "Last updated",
            align: "end",
            renderCell: (row) => (
              <span className="text-muted-foreground">
                {formatTemplateDate(row.updatedAt)}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
