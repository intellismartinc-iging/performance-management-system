import { Progress } from "@/components/ui/progress";

interface ScoreBarProps {
  score: number;
  /** Top of the scale, for example 5. */
  max: number;
  label: string;
  /** Digits after the decimal point. */
  fractionDigits?: number;
}

export function ScoreBar({
  score,
  max,
  label,
  fractionDigits = 1,
}: ScoreBarProps) {
  const safeMax = max > 0 ? max : 1;
  const clamped = Math.min(safeMax, Math.max(0, score));
  return (
    <div className="flex min-w-24 items-center gap-2">
      <Progress
        value={(clamped / safeMax) * 100}
        aria-label={label}
        className="flex-1"
      />
      <span className="text-pms-label tabular-nums">
        {clamped.toFixed(fractionDigits)} / {safeMax}
      </span>
    </div>
  );
}
