import { TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/** The reads that stop a page: no data and no way to show it. */
export type GoalTemplateNoticeKind = "signed_out" | "forbidden" | "unavailable";

const NOTICES = {
  signed_out: {
    title: "Session ended",
    description: "Log in again to see KPI goal templates.",
  },
  forbidden: {
    title: "HR access required",
    description:
      "Only HR administrators whose account is linked to a company can open KPI goal templates. If you are HR, ask your administrator to link your account.",
  },
  unavailable: {
    title: "Templates are unavailable",
    description:
      "We could not load KPI goal templates. Reload the page, or try again in a few minutes.",
  },
} as const satisfies Record<
  GoalTemplateNoticeKind,
  { title: string; description: string }
>;

export function GoalTemplateNotice({ kind }: { kind: GoalTemplateNoticeKind }) {
  const { title, description } = NOTICES[kind];
  return (
    <Alert variant="destructive" role="alert">
      <TriangleAlertIcon aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
