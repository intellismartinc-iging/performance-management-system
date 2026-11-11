"use client";

import {
  Bar,
  BarChart as RechartsBarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { REVIEW_TONE_ACCENT_COLOR } from "@/constants/review-tones";
import type { ChartDatum } from "@/types/chart";

interface BarChartProps {
  /** Describes the chart, for example "Reviews by status". */
  label: string;
  data: readonly ChartDatum[];
  height?: number;
}

export function BarChart({ label, data, height = 240 }: BarChartProps) {
  return (
    <figure className="grid min-w-0 gap-2">
      <div role="img" aria-label={label} style={{ height }} className="min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart
            data={[...data]}
            margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
          >
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <Tooltip cursor={{ fill: "var(--muted)" }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((datum) => (
                <Cell key={datum.label} fill={REVIEW_TONE_ACCENT_COLOR[datum.tone]} />
              ))}
            </Bar>
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">
        {label}:{" "}
        {data.map((datum) => `${datum.label} ${datum.value}`).join(", ")}
      </figcaption>
    </figure>
  );
}

const BAR_HEIGHTS = ["55%", "85%", "40%", "70%", "30%"] as const;

/** Same figure, height, and axis margin as `BarChart`, with five bars of varied height. */
export function BarChartSkeleton({ height = 240 }: { height?: number }) {
  return (
    <figure aria-hidden="true" className="grid min-w-0 gap-2">
      <div
        style={{ height }}
        className="flex min-w-0 items-end gap-3 border-b border-border px-2 pt-2"
      >
        {BAR_HEIGHTS.map((barHeight, index) => (
          <Skeleton
            key={index}
            style={{ height: barHeight }}
            className="flex-1 rounded-b-none rounded-t-[4px]"
          />
        ))}
      </div>
    </figure>
  );
}
