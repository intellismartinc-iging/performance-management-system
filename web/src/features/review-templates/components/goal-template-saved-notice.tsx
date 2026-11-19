import { CircleAlertIcon, CircleCheckIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SAVED = {
  draft: {
    title: "Template saved as a draft",
    description: "Open it from the list to review it. It is not available to cycles yet.",
  },
  published: {
    title: "Template published",
    description: "The version is frozen. New cycles can use it.",
  },
  updated: {
    title: "Template updated",
    description: "A new version is published. Cycles that already use the template keep their version.",
  },
  archived: {
    title: "Template archived",
    description: "It is no longer offered to new cycles.",
  },
} as const;

const PUBLISH_FAILED = {
  title: "Saved as a draft, not published",
  description: "The template was saved, but publishing it failed. It stays a draft.",
} as const;

function isSavedFlag(value: unknown): value is keyof typeof SAVED {
  return typeof value === "string" && value in SAVED;
}

/** What happened to the template the user just saved. `saved` is the `?saved=` flag. */
export function GoalTemplateSavedNotice({
  saved,
}: {
  saved: string | string[] | undefined;
}) {
  if (saved === "publish_failed") {
    return (
      <Alert variant="destructive" role="alert">
        <CircleAlertIcon aria-hidden="true" />
        <AlertTitle>{PUBLISH_FAILED.title}</AlertTitle>
        <AlertDescription>{PUBLISH_FAILED.description}</AlertDescription>
      </Alert>
    );
  }
  if (!isSavedFlag(saved)) return null;

  return (
    <Alert role="status">
      <CircleCheckIcon aria-hidden="true" />
      <AlertTitle>{SAVED[saved].title}</AlertTitle>
      <AlertDescription>{SAVED[saved].description}</AlertDescription>
    </Alert>
  );
}
