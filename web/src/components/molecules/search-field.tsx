import type { ComponentProps } from "react";
import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type SearchFieldProps = Pick<
  ComponentProps<"input">,
  | "id"
  | "name"
  | "placeholder"
  | "value"
  | "defaultValue"
  | "onChange"
  | "disabled"
> & {
  label: string;
};

export function SearchField({ id, label, ...inputProps }: SearchFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="grid min-w-0 gap-2">
      <Label htmlFor={inputId} className="text-pms-label">
        {label}
      </Label>
      <Input
        {...inputProps}
        id={inputId}
        type="search"
        className="min-h-pms-touch"
      />
    </div>
  );
}
