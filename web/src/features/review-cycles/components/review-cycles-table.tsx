import { StatusBadge } from "@/components/atoms/status-badge";
import { DataTable } from "@/components/organisms/data-table";
import {
  CYCLE_STATUS_LABELS,
  CYCLE_STATUS_TONES,
} from "@/constants/domain-labels";
import type { CycleStatus } from "@pms/shared-types";

interface ReviewCycleRow {
  id: string;
  name: string;
  reviewType: string;
  periodStart: string;
  periodEnd: string;
  participantCount: number;
  completedCount: number;
  assignmentCount: number;
  submittedCount: number;
  deadline: string;
  status: CycleStatus;
  hasReleasedResults: boolean;
}

const DATE_FORMAT = new Intl.DateTimeFormat("en-PH", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatCycleDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : DATE_FORMAT.format(date);
}

export function ReviewCyclesTable({
  rows,
}: {
  rows: readonly ReviewCycleRow[];
}) {
  return (
    <DataTable
      caption="Review cycle register"
      rows={rows}
      getRowId={(cycle) => cycle.id}
      emptyMessage="No review cycles found."
      columns={[
        {
          id: "name",
          heading: "Cycle name",
          renderCell: (cycle) => (
            <div className="whitespace-normal">
              <span className="font-medium">{cycle.name}</span>
              {cycle.hasReleasedResults && (
                <span className="block text-pms-label text-muted-foreground">
                  Results released
                </span>
              )}
            </div>
          ),
        },
        {
          id: "type",
          heading: "Review type",
          renderCell: (cycle) => cycle.reviewType,
        },
        {
          id: "period",
          heading: "Review period",
          renderCell: (cycle) =>
            `${formatCycleDate(cycle.periodStart)} to ${formatCycleDate(cycle.periodEnd)}`,
        },
        {
          id: "participants",
          heading: "Participants",
          align: "end",
          renderCell: (cycle) => cycle.participantCount,
        },
        {
          id: "progress",
          heading: "Progress",
          align: "end",
          renderCell: (cycle) => (
            <>
              {cycle.completedCount} / {cycle.assignmentCount}
              <span className="block text-pms-label text-muted-foreground">
                {cycle.submittedCount} submitted
              </span>
            </>
          ),
        },
        {
          id: "deadline",
          heading: "Deadline",
          renderCell: (cycle) => formatCycleDate(cycle.deadline),
        },
        {
          id: "status",
          heading: "Status",
          renderCell: (cycle) => (
            <StatusBadge
              label={CYCLE_STATUS_LABELS[cycle.status]}
              tone={CYCLE_STATUS_TONES[cycle.status]}
            />
          ),
        },
      ]}
    />
  );
}
