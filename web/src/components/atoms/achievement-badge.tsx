import { StatusBadge } from "@/components/atoms/status-badge";

interface AchievementBadgeProps {
  /** Achievement percent against target. */
  percent: number;
  /** Minimum percent for the "complete" tone. Defaults to 100. */
  metAt?: number;
  /** Minimum percent for the "active" tone. Defaults to 70. */
  nearAt?: number;
}

/** Percent against target, toned by thresholds. Confirm thresholds with the product rules. */
export function AchievementBadge({
  percent,
  metAt = 100,
  nearAt = 70,
}: AchievementBadgeProps) {
  const rounded = Math.round(percent);
  const tone =
    rounded >= metAt ? "complete" : rounded >= nearAt ? "active" : "alert";
  return <StatusBadge label={`${rounded}%`} tone={tone} />;
}
