import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { PersonSummary } from "@/types/person";

interface PersonCellProps extends Omit<PersonSummary, "id"> {
  size?: "sm" | "default" | "lg";
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function PersonCell({
  name,
  subtitle,
  avatarUrl,
  size = "default",
}: PersonCellProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Avatar size={size}>
        {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
        <AvatarFallback aria-hidden="true">{initialsOf(name)}</AvatarFallback>
      </Avatar>
      <div className="grid min-w-0">
        <span className="truncate text-pms-table font-medium">{name}</span>
        {subtitle && (
          <span className="truncate text-pms-label text-muted-foreground">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
