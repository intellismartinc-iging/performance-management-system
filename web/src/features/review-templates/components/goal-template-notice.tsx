import { TriangleAlertIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

/** The reads that stop a page: no data and no way to show it. */
export type GoalTemplateNoticeKind = "signed_out" | "forbidden" | "unavailable";

const NOTICES = {
  signed_out: (subject: string) => ({
    title: "Session ended",
    description: `Log in again to see ${subject}.`,
  }),
  forbidden: (subject: string) => ({
    title: "HR access required",
    description: `Only HR administrators whose account is linked to a company can open ${subject}. If you are HR, ask your administrator to link your account.`,
  }),
  unavailable: (subject: string) => ({
    title: "Templates are unavailable",
    description: `We could not load ${subject}. Reload the page, or try again in a few minutes.`,
  }),
} as const satisfies Record<
  GoalTemplateNoticeKind,
  (subject: string) => { title: string; description: string }
>;

/** `subject` names the templates in the text: the same notice serves KPI goal and behavioral templates. */
export function GoalTemplateNotice({
  kind,
  subject = "KPI goal templates",
}: {
  kind: GoalTemplateNoticeKind;
  subject?: string;
}) {
  const { title, description } = NOTICES[kind](subject);
  return (
    <Alert variant="destructive" role="alert">
      <TriangleAlertIcon aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}
