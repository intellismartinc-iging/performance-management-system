import { Progress } from "@/components/ui/progress";

interface ProgressCellProps {
  /** 0 to 100. Values outside the range are clamped. */
  value: number;
  /** Accessible name, for example "Goal progress for Sales target". */
  label: string;
}

export function ProgressCell({ value, label }: ProgressCellProps) {
  const percent = Math.min(100, Math.max(0, Math.round(value)));
  return (
    <div className="flex min-w-24 items-center gap-2">
      <Progress value={percent} aria-label={label} className="flex-1" />
      <span className="w-10 text-end text-pms-label tabular-nums">
        {percent}%
      </span>
    </div>
  );
}
