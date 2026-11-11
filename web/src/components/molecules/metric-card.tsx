import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface MetricCardProps {
  label: string;
  value: string | number;
  description?: string;
  href?: string;
}

export function MetricCard({
  label,
  value,
  description,
  href,
}: MetricCardProps) {
  const card = (
    <Card className="h-full">
      <CardContent className="grid gap-2">
        <dl className="grid gap-2">
          <dt className="text-pms-label text-muted-foreground">{label}</dt>
          <dd className="text-pms-metric tabular-nums wrap-break-word">
            {value}
          </dd>
        </dl>
        {description && (
          <p className="text-pms-table text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return href ? (
    <Link href={href} className="block h-full rounded-pms-card hover:underline">
      {card}
    </Link>
  ) : (
    card
  );
}

/** Same card, label, value, and optional description rows as `MetricCard`. */
export function MetricCardSkeleton({
  description = false,
}: {
  description?: boolean;
}) {
  return (
    <Card aria-hidden="true" className="h-full">
      <CardContent className="grid gap-2">
        <div className="grid gap-2">
          <Skeleton className="h-[1lh] w-24 text-pms-label" />
          <Skeleton className="h-[1lh] w-16 text-pms-metric" />
        </div>
        {description && (
          <Skeleton className="h-[1lh] w-40 max-w-full text-pms-table" />
        )}
      </CardContent>
    </Card>
  );
}
