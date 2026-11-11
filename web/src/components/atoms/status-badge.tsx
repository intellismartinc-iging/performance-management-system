import { Badge } from "@/components/ui/badge";
import {
  REVIEW_TONE_SURFACE_CLASS,
  type ReviewTone,
} from "@/constants/review-tones";

interface StatusBadgeProps {
  label: string;
  tone: ReviewTone;
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`h-auto max-w-full shrink rounded-pms-tag border-transparent text-pms-label whitespace-normal text-(color:--pms-ink-on-tint) ${REVIEW_TONE_SURFACE_CLASS[tone]}`}
    >
      {label}
    </Badge>
  );
}
