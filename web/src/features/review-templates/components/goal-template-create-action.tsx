import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/services/current-user";
import { GOAL_TEMPLATE_PATH } from "@/constants/goal-template-path";

/**
 * The Create button, for HR administrators. It is a convenience: the backend
 * still refuses the create route and the positions list to anyone else.
 */
export async function GoalTemplateCreateAction() {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") return null;

  return (
    <Link
      href={`${GOAL_TEMPLATE_PATH}/new`}
      className={buttonVariants({ className: "min-h-pms-touch" })}
    >
      <PlusIcon aria-hidden="true" data-icon="inline-start" />
      Create KPI Goal Template
    </Link>
  );
}
