import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { BEHAVIORAL_TEMPLATE_PATH } from "@/constants/behavioral-template-path";
import { getCurrentUser } from "@/features/auth/services/current-user";

/**
 * The Create button, for HR administrators. It is a convenience: the backend
 * still refuses every behavioral template route to anyone else.
 */
export async function BehavioralTemplateCreateAction() {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN") return null;

  return (
    <Link
      href={`${BEHAVIORAL_TEMPLATE_PATH}/new`}
      className={buttonVariants({ className: "min-h-pms-touch" })}
    >
      <PlusIcon aria-hidden="true" data-icon="inline-start" />
      Create Behavioral Assessment Template
    </Link>
  );
}
