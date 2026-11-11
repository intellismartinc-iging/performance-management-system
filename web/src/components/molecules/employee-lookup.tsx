"use client";

import { useMemo, useState } from "react";
import { ChevronsUpDownIcon } from "lucide-react";
import { PersonCell } from "@/components/molecules/person-cell";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { PersonSummary } from "@/types/person";

interface EmployeeLookupProps {
  /** Pass the control props from FormField. */
  id: string;
  people: readonly PersonSummary[];
  value: string | null;
  onChange: (personId: string) => void;
  placeholder?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
}

export function EmployeeLookup({
  id,
  people,
  value,
  onChange,
  placeholder = "Select an employee",
  disabled,
  ...aria
}: EmployeeLookupProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selected = people.find((person) => person.id === value);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return people;
    return people.filter((person) =>
      `${person.name} ${person.subtitle ?? ""}`.toLowerCase().includes(needle),
    );
  }, [people, query]);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery("");
      }}
    >
      <PopoverTrigger
        id={id}
        disabled={disabled}
        {...aria}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "min-h-pms-touch w-full min-w-0 justify-between rounded-pms-control font-normal",
          !selected && "text-muted-foreground",
        )}
      >
        <span className="truncate">{selected?.name ?? placeholder}</span>
        <ChevronsUpDownIcon aria-hidden="true" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--anchor-width) min-w-64">
        <Input
          type="search"
          aria-label="Search employees"
          placeholder="Search by name or role"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          className="min-h-pms-touch"
        />
        <ul aria-label="Employees" className="grid max-h-60 gap-1 overflow-auto">
          {matches.length === 0 ? (
            <li className="px-2 py-3 text-center text-pms-table text-muted-foreground">
              No employees found.
            </li>
          ) : (
            matches.map((person) => (
              <li key={person.id}>
                <button
                  type="button"
                  aria-pressed={person.id === value}
                  onClick={() => {
                    onChange(person.id);
                    setOpen(false);
                  }}
                  className="min-h-pms-touch w-full rounded-pms-control px-2 text-start hover:bg-muted focus-visible:bg-muted aria-pressed:bg-muted"
                >
                  <PersonCell
                    name={person.name}
                    subtitle={person.subtitle}
                    avatarUrl={person.avatarUrl}
                    size="sm"
                  />
                </button>
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
