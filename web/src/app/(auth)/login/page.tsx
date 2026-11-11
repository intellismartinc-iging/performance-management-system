import type { Metadata } from "next";
import Link from "next/link";
import { CredentialsForm } from "@/features/auth/components/credentials-form";

export const metadata: Metadata = { title: "Log in | HRDotNet Performance" };

export default function LoginPage() {
  return (
    <>
      <div className="grid gap-2 text-center">
        <h1 className="text-pms-page-title">Log in</h1>
        <p className="text-pms-body text-muted-foreground">
          Access your performance workspace.
        </p>
      </div>
      <CredentialsForm mode="login" />
      <div className="grid justify-items-center gap-3 text-center text-pms-table">
        <Link href="/register" className="w-fit underline underline-offset-4">
          Connect your HRDotNet account
        </Link>
        <Link href="/sign-up" className="w-fit underline underline-offset-4">
          Create your login with an employee code
        </Link>
      </div>
    </>
  );
}
