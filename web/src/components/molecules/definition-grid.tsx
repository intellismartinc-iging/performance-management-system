import type { ReactNode } from "react";

export interface DefinitionItem {
  label: string;
  value: ReactNode;
}

interface DefinitionGridProps {
  items: readonly DefinitionItem[];
  columns?: 1 | 2 | 3;
}

const COLUMNS = {
  1: "grid-cols-1",
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
} as const;

/** Read-only label and value pairs for profiles and detail panels. */
export function DefinitionGrid({ items, columns = 2 }: DefinitionGridProps) {
  return (
    <dl className={`grid min-w-0 gap-4 ${COLUMNS[columns]}`}>
      {items.map((item) => (
        <div key={item.label} className="grid min-w-0 gap-1">
          <dt className="text-pms-label text-muted-foreground">{item.label}</dt>
          <dd className="text-pms-table wrap-break-word">
            {item.value ?? "Not set"}
          </dd>
        </div>
      ))}
    </dl>
  );
}
