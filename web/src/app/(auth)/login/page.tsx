import type { Metadata } from "next";

import { CredentialsForm } from "@/features/auth/components/credentials-form";

export const metadata: Metadata = { title: "Log in | HRDotNet Performance" };

export default function LoginPage() {
  return (
    <>
      <div className="grid gap-1">
        <h1 className="text-pms-page-title">Log in</h1>
        <p className="text-pms-body text-muted-foreground">
          Use your email or username to access your workspace.
        </p>
      </div>
      <CredentialsForm />
    </>
  );
}
