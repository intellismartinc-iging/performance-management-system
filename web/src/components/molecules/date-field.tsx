"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateFieldProps {
  /** Pass the control props from FormField. */
  id: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
}

export function DateField({
  id,
  value,
  onChange,
  placeholder = "Select a date",
  disabled,
  minDate,
  maxDate,
  ...aria
}: DateFieldProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={id}
        disabled={disabled}
        {...aria}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "min-h-pms-touch w-full min-w-0 justify-between rounded-pms-control font-normal",
          !value && "text-muted-foreground",
        )}
      >
        <span className="truncate">
          {value ? format(value, "MMM d, yyyy") : placeholder}
        </span>
        <CalendarIcon aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={value ?? undefined}
          defaultMonth={value ?? undefined}
          disabled={[
            ...(minDate ? [{ before: minDate }] : []),
            ...(maxDate ? [{ after: maxDate }] : []),
          ]}
          onSelect={(next) => {
            onChange(next ?? null);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
