"use client";

import type { ReactNode } from "react";
import { MoreHorizontalIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface RowAction {
  id: string;
  label: string;
  icon?: ReactNode;
  destructive?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

interface RowActionsMenuProps {
  /** Accessible name, for example "Actions for Q1 2026 Review". */
  label: string;
  actions: readonly RowAction[];
}

export function RowActionsMenu({ label, actions }: RowActionsMenuProps) {
  if (actions.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={label}
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "min-h-pms-touch min-w-pms-touch rounded-pms-control",
        )}
      >
        <MoreHorizontalIcon aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            variant={action.destructive ? "destructive" : "default"}
            disabled={action.disabled}
            onClick={action.onSelect}
          >
            {action.icon}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
