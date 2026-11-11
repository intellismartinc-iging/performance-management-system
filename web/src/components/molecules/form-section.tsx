import type { ReactNode } from "react";
import {
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <FieldSet className="min-w-0 rounded-pms-card border border-border bg-card p-4">
      <FieldLegend className="text-pms-section-title">{title}</FieldLegend>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldGroup>{children}</FieldGroup>
    </FieldSet>
  );
}
