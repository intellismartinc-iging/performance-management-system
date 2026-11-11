import { useId } from "react";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormSelectProps<Value extends string> {
  label: string;
  value: Value | null;
  options: readonly { value: Value; label: string }[];
  onChange: (value: Value) => void;
  description?: string;
  /** Inline error message. Also marks the control invalid. */
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function FormSelect<Value extends string>({
  label,
  value,
  options,
  onChange,
  description,
  error,
  required,
  disabled,
}: FormSelectProps<Value>) {
  const id = useId();
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const describedBy =
    [description && descriptionId, error && errorId]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <Field className="min-w-0" data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id} className="text-pms-label">
        {label}
        {required && <span aria-hidden="true">*</span>}
      </FieldLabel>
      <Select<Value>
        value={value}
        disabled={disabled}
        required={required}
        onValueChange={(next) => {
          if (next !== null) onChange(next);
        }}
      >
        <SelectTrigger
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="min-h-pms-touch w-full min-w-0 rounded-pms-control"
        >
          <SelectValue placeholder="Select an option">
            {options.find((option) => option.value === value)?.label}
          </SelectValue>
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && (
        <FieldDescription id={descriptionId}>{description}</FieldDescription>
      )}
      {error && <FieldError id={errorId}>{error}</FieldError>}
    </Field>
  );
}
