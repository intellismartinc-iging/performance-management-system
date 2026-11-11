import type { ReviewTone } from "@/constants/review-tones";

export interface ChartDatum {
  label: string;
  value: number;
  tone: ReviewTone;
}
