"use client";

import { useEffect, useRef } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export interface ErrorSummaryItem {
  /** Id of the invalid control, so the link can focus it. */
  fieldId: string;
  message: string;
}

interface ErrorSummaryProps {
  errors: readonly ErrorSummaryItem[];
  title?: string;
}

/** Lists every form error and moves focus to itself when errors appear. */
export function ErrorSummary({
  errors,
  title = "Fix the following before continuing",
}: ErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null);
  const hasErrors = errors.length > 0;

  useEffect(() => {
    if (hasErrors) ref.current?.focus();
  }, [hasErrors, errors]);

  if (!hasErrors) return null;

  return (
    <div ref={ref} tabIndex={-1} className="outline-none">
      <Alert variant="destructive">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          <ul className="grid gap-1">
            {errors.map((error) => (
              <li key={`${error.fieldId}-${error.message}`}>
                <a
                  href={`#${error.fieldId}`}
                  className="underline underline-offset-4"
                  onClick={(event) => {
                    event.preventDefault();
                    document.getElementById(error.fieldId)?.focus();
                  }}
                >
                  {error.message}
                </a>
              </li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
