"use client";

import Link from "next/link";
import { TriangleAlertIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  description?: string;
  /** Next.js error digest. Shown as a reference so support can find the log. */
  reference?: string;
  onRetry: () => void;
  homeHref: string;
  homeLabel: string;
}

/**
 * Runtime error screen. It never prints the error message itself: server
 * errors can contain internal details, so only the digest is shown.
 */
export function ErrorState({
  title = "Something went wrong",
  description = "We could not load this page. Try again, or go back to the dashboard.",
  reference,
  onRetry,
  homeHref,
  homeLabel,
}: ErrorStateProps) {
  return (
    <div className="grid min-h-0 w-full flex-1 place-items-center px-3 py-8">
      <div
        role="alert"
        className="grid max-w-pms-copy justify-items-center gap-4 text-center"
      >
        <span
          aria-hidden="true"
          className="grid size-16 place-items-center rounded-full bg-(--pms-review-alert-surface) text-(--pms-review-alert-accent)"
        >
          <TriangleAlertIcon className="size-8" />
        </span>
        <h1 className="text-pms-page-title text-balance">{title}</h1>
        <p className="text-pms-body text-muted-foreground">{description}</p>
        {reference && (
          <p className="text-pms-label tabular-nums text-muted-foreground">
            Reference: {reference}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            type="button"
            className="min-h-pms-touch rounded-pms-control"
            onClick={onRetry}
          >
            Try again
          </Button>
          <Link
            href={homeHref}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "min-h-pms-touch rounded-pms-control",
            )}
          >
            {homeLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
