export interface KpiIndicator {
  id: string;
  name: string;
  unit: string;
  target: number;
}

/** An indicator with the value reported against it. */
export interface KpiIndicatorResult extends KpiIndicator {
  actual: number | null;
  remarks: string;
}
