"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface ListingTab<Value extends string> {
  value: Value;
  label: string;
  count?: number;
}

interface ListingTabsProps<Value extends string> {
  label: string;
  tabs: readonly ListingTab<Value>[];
  value: Value;
  onChange: (value: Value) => void;
}

/** Tab strip with optional counts. Render the matching content outside. */
export function ListingTabs<Value extends string>({
  label,
  tabs,
  value,
  onChange,
}: ListingTabsProps<Value>) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onChange(next as Value)}
      className="min-w-0"
    >
      <TabsList
        variant="line"
        aria-label={label}
        className="h-auto max-w-full flex-wrap justify-start"
      >
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            className="min-h-pms-touch flex-none px-3 text-pms-label"
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="rounded-pms-tag bg-muted px-1.5 text-pms-label tabular-nums">
                {tab.count}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
