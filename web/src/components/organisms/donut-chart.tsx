"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { REVIEW_TONE_ACCENT_COLOR } from "@/constants/review-tones";
import type { ChartDatum } from "@/types/chart";

interface DonutChartProps {
  /** Describes the chart, for example "Goal progress". */
  label: string;
  data: readonly ChartDatum[];
  /** Text shown in the center, for example "72%". */
  centerLabel?: string;
  height?: number;
}

export function DonutChart({
  label,
  data,
  centerLabel,
  height = 220,
}: DonutChartProps) {
  const total = data.reduce((sum, datum) => sum + datum.value, 0);

  return (
    <figure className="grid min-w-0 gap-3">
      <div
        role="img"
        aria-label={label}
        style={{ height }}
        className="relative min-w-0"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[...data]}
              dataKey="value"
              nameKey="label"
              innerRadius="62%"
              outerRadius="90%"
              paddingAngle={total > 0 ? 2 : 0}
              stroke="none"
            >
              {data.map((datum) => (
                <Cell key={datum.label} fill={REVIEW_TONE_ACCENT_COLOR[datum.tone]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        {centerLabel && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 grid place-content-center text-pms-metric tabular-nums"
          >
            {centerLabel}
          </span>
        )}
      </div>
      <figcaption>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-pms-label">
          {data.map((datum) => (
            <li key={datum.label} className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className="size-2.5 rounded-full"
                style={{ backgroundColor: REVIEW_TONE_ACCENT_COLOR[datum.tone] }}
              />
              {datum.label}
              <span className="tabular-nums text-muted-foreground">
                {datum.value}
              </span>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}

/**
 * Same figure and height as `DonutChart`. The ring is 90% of the height with a
 * hole of 62/90 of that, matching the chart's outer and inner radius.
 */
export function DonutChartSkeleton({
  height = 220,
  legendItems = 3,
}: {
  height?: number;
  legendItems?: number;
}) {
  const ring = Math.round(height * 0.9);
  return (
    <figure aria-hidden="true" className="grid min-w-0 gap-3">
      <div
        style={{ height }}
        className="relative grid min-w-0 place-items-center"
      >
        <Skeleton
          style={{ width: ring, height: ring }}
          className="rounded-full"
        />
        <span
          style={{ width: ring * (62 / 90), height: ring * (62 / 90) }}
          className="absolute rounded-full bg-card"
        />
      </div>
      <figcaption>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-pms-label">
          {Array.from({ length: legendItems }, (_, index) => (
            <li key={index} className="flex items-center gap-1.5">
              <Skeleton className="size-2.5 rounded-full" />
              <Skeleton className="h-[1lh] w-16" />
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
